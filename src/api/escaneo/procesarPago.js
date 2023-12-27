const { validParams, validMethod } = require("../validations/_middleware");
const db = require('../../../models');
const config = require('../../../config');
const { preRegistro, requestsMegasoft } = require("./megasoft/_fetch");

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'POST'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.body;

    console.log(dataReq);
    
    filters = validParams(dataReq, ['sesion_id', {
        name: 'infoPay',
        requireType: {}
    },  {
        name: 'paymentData',
        requireType: ''
    }, 'tasa', 'numTienda']);
    if(filters.error) return res.status(403).json(filters);

    try {
        const checkPay = await db.PagosEscaneo.findAll({
            where: {
                sesion_id: dataReq.sesion_id,
                estado: {
                    [db.Sequelize.Op.in]: ['CREADO', 'ESPERAMEGASOFT', 'PROCESADO', 'PAGARENCAJA']
                }
            },
            order: [['estado', 'DESC']]
        });

        const pagosCheckeo = JSON.parse(JSON.stringify(checkPay));

        let soloChequea = -1;
        let cancela = -1;
        if(pagosCheckeo.length) {
            for(let i=0; i < pagosCheckeo.length;i++) {
                if(pagosCheckeo[i].estado === 'PROCESADO') {
                    return res.status(200).json({
                        error: false,
                        data: JSON.parse(pagosCheckeo[i].respuesta_ms),
                        text: pagosCheckeo[i].descripcion_ms,
                        estado: 'PROCESADO'
                    })
                } 
                if(pagosCheckeo[i].estado === 'ESPERAMEGASOFT') {
                    soloChequea = i;
                    break;
                }
                if(pagosCheckeo[i].estado === 'CREADO' || pagosCheckeo[i].estado === 'PAGARENCAJA') { 
                    cancela = i;
                    break;
                }
            }
        }
        let payment_aux = JSON.parse(atob(dataReq.paymentData));
        /*let condiciones = {};
        if(payment_aux.metodoPago === 'transferencia') {
            condic
        }*/
        if(payment_aux.metodoPago !== 'pagomovilc2p' && payment_aux.metodoPago !== 'tarjeta') {
            const checkDuplicados = await db.PagosEscaneo.count({
                where: {
                    metodo_pago: payment_aux.metodoPago,
                    total_bs: dataReq.infoPay.total_bs,
                    igtf: dataReq.infoPay.igtf,
                    estado: 'PROCESADO',
                    referencia: {
                        [db.Sequelize.Op.and]: [
                            payment_aux[payment_aux.metodoPago].referencia?.replaceAll(' ', '').toLowerCase(),
                            {
                                [db.Sequelize.Op.not]: null
                            }
                        ]
                    }
                }
            });

            if(checkDuplicados > 0) {
                return res.status(402).json({
                    error: false,
                    data: {},
                    text: "Este pago ya fue registrado anteriormente",
                    estado: 'FALLIDO'
                })
            }
        }

        if(cancela !== -1) {
            const cancel = await db.PagosEscaneo.update({
                estado: 'CANCELADO'
            }, {
                where: {
                    id: pagosCheckeo[cancela].id
                }
            });

            console.log("Cancelamos un pago viejo sin respuesta: ", cancel);
        }

        if(soloChequea !== -1) {
            const jsonSend = {
                request: {
                    cod_afiliacion: config[config.NODE_ENV].MEGASOFT.COD_AFILIACION,
                    control: pagosCheckeo[soloChequea].numero_control,
                    version: 3,
                    tipotrx: typeTRX(pagosCheckeo[soloChequea].metodo_pago)
                }
            }
            requestsMegasoft('/v2-querystatus', null, 'POST', jsonSend)
            .then(async (result) => {
                console.log(result);
                if(result.data.codigo === '00') { // APROBADO
                    const updatePay = await db.PagosEscaneo.update({
                        estado: 'PROCESADO',
                        descripcion_ms: result.data.descripcion,
                        respuesta_ms: JSON.stringify(result.data)
                    }, {
                        where: {
                            id: pagosCheckeo[soloChequea].id
                        }
                    });
                    console.log("Actualizamos en BD", updatePay)
                    return res.status(200).json({
                        error: false,
                        data: result.data,
                        text: result.data.descripcion,
                        estado: 'PROCESADO'
                    })
                } else if(result.data.codigo === '09' || result.data.codigo === '99') { // EL PAGO NUNCA LLEGÓ A MEGASOFT LO REENVIAMOS
                    
                    let jsonSend = {
                        request: {
                            cod_afiliacion: config[config.NODE_ENV].MEGASOFT.COD_AFILIACION,
                            control: pagosCheckeo[soloChequea].numero_control,
                            amount: payment_aux.moneda === 'dolar' ? (parseFloat(pagosCheckeo[soloChequea].total_bs)+parseFloat(pagosCheckeo[soloChequea].igtf)).toFixed(2):pagosCheckeo[soloChequea].total_bs
                        }
                    }; // Añadir los otros campos automatico y encriptar y desencriptar la data
                    jsonSend.request = { ...jsonSend.request, ...payment_aux[payment_aux.metodoPago]};
                    
                    if(payment_aux.metodoPago === 'zelle') {
                        jsonSend.request = {
                            ...jsonSend.request,
                            codigobancoComercio: 'BOFA'
                        }
                    } else if(payment_aux.metodoPago === 'pagomovil') {
                        jsonSend.request = {
                            ...jsonSend.request,
                            telefonoComercio: '04125555555',
                            codigobancoComercio: '0105',
                            tipoPago: '10'
                        }
                    } else if(payment_aux.metodoPago === 'transferencia') {
                        jsonSend.request = {
                            ...jsonSend.request,
                            cuentaDestino: '01051234567894568975'
                        }
                    }
                    console.log("Enviamos a megasoft", jsonSend);
                    requestsMegasoft(endpointByMethod(pagosCheckeo[soloChequea].metodo_pago), null, 'POST', jsonSend)
                    .then(async (result) => {
                        console.log(result);
                        if(result.data.codigo === '00') { // APROBADO
                            const updatePay = await db.PagosEscaneo.update({
                                estado: 'PROCESADO',
                                descripcion_ms: result.data.descripcion,
                                respuesta_ms: JSON.stringify(result.data)
                            }, {
                                where: {
                                    id: pagosCheckeo[soloChequea].id
                                }
                            });
                            console.log("Actualizamos en BD", updatePay)
                            return res.status(200).json({
                                error: false,
                                data: result.data,
                                text: result.data.descripcion,
                                estado: 'PROCESADO'
                            })
                        } else {
                            const updatePay = await db.PagosEscaneo.update({
                                estado: 'FALLIDO',
                                descripcion_ms: result.data.descripcion,
                                respuesta_ms: JSON.stringify(result.data)
                            }, {
                                where: {
                                    id: pagosCheckeo[soloChequea].id
                                }
                            });
                            console.log("Actualizamos en BD", updatePay)
                            return res.status(402).json({
                                error: false,
                                data: result.data,
                                text: result.data.descripcion,
                                estado: 'FALLIDO'
                            })
                        }
                    }).catch((error) => {
                        return res.status(500).json({
                            error: true,
                            text: error.message,
                            estado: 'ESPERAMEGASOFT'
                        });
                    })
                } else { // FALLIDO
                    const updatePay = await db.PagosEscaneo.update({
                        estado: 'FALLIDO',
                        descripcion_ms: result.data.descripcion,
                        respuesta_ms: JSON.stringify(result.data)
                    }, {
                        where: {
                            id: pagosCheckeo[soloChequea].id
                        }
                    });
                    console.log("Actualizamos en BD", updatePay)
                    return res.status(402).json({
                        error: false,
                        data: result.data,
                        text: result.data.descripcion,
                        estado: 'FALLIDO'
                    })
                }
            }).catch((error) => {
                console.log("Es aca papi", error);
                return res.status(500).json({
                    status: false,
                    text: 'Error procesando el pago con la pasaerla'
                });
            })

        } else { // Procesamos el pago

            dataReq.infoPay.centro_codigo = (dataReq.numTienda+1000).toString();
            const insertPay = await db.PagosEscaneo.create(dataReq.infoPay);

            const nuevoPago = JSON.parse(JSON.stringify(insertPay));
            if(!insertPay) {
                return res.status(500).json({
                    error: true,
                    text: 'Error al procesar el pago intenta de nuevo',
                    data: nuevoPago
                });
            }
            console.log(nuevoPago);

            preRegistro()
            .then(async (nControl) => {
                const updatePay = await db.PagosEscaneo.update({
                    estado: 'ESPERAMEGASOFT',
                    numero_control: nControl,
                }, {
                    where: {
                        id: nuevoPago.id
                    }
                });
                console.log("Actualizamos numero control y esperamegasoft", updatePay);

                let jsonSend = {
                    request: {
                        cod_afiliacion: config[config.NODE_ENV].MEGASOFT.COD_AFILIACION,
                        control: nControl,
                        amount: payment_aux.moneda === 'dolar' ? (parseFloat(nuevoPago.total_bs)+parseFloat(nuevoPago.igtf)).toFixed(2):nuevoPago.total_bs
                    }
                }; // Añadir los otros campos automatico y encriptar y desencriptar la data
                
                jsonSend.request = { ...jsonSend.request, ...payment_aux[payment_aux.metodoPago]};

                if(payment_aux.metodoPago === 'zelle') {
                    jsonSend.request = {
                        ...jsonSend.request,
                        codigobancoComercio: 'BOFA'
                    }
                } else if(payment_aux.metodoPago === 'pagomovil') {
                    jsonSend.request = {
                        ...jsonSend.request,
                        telefonoComercio: '04125555555',
                        codigobancoComercio: '0105',
                        tipoPago: '10'
                    }
                } else if(payment_aux.metodoPago === 'transferencia') {
                    jsonSend.request = {
                        ...jsonSend.request,
                        cuentaDestino: '01051234567894568975'
                    }
                } else if(payment_aux.metodoPago === 'tarjeta') {
                    jsonSend.request = {
                        ...jsonSend.request,
                        transcode: '0141',
                        mode: '4'
                    };
                    jsonSend.request.pan = ASCIItoString(jsonSend.request.pan.split(" "));
                    jsonSend.request.cvv2 = ASCIItoString(jsonSend.request.cvv2.split(" "));
                    jsonSend.request.cid = ASCIItoString(jsonSend.request.cid.split(" "));
                    jsonSend.request.expdate = ASCIItoString(jsonSend.request.expdate.split(" "));
                    jsonSend.request.client = ASCIItoString(jsonSend.request.client.split(" "));
                }
                console.log("Enviamos a megasoft", jsonSend);
                requestsMegasoft(endpointByMethod(nuevoPago.metodo_pago), null, 'POST', jsonSend)
                .then(async (result) => {
                    console.log(result);
                    if(result.data.codigo === '00') { // APROBADO
                        const updatePay = await db.PagosEscaneo.update({
                            estado: 'PROCESADO',
                            descripcion_ms: result.data.descripcion,
                            respuesta_ms: JSON.stringify(result.data)
                        }, {
                            where: {
                                id: nuevoPago.id
                            }
                        });
                        console.log("Actualizamos en BD", updatePay)
                        return res.status(200).json({
                            error: false,
                            data: result.data,
                            text: result.data.descripcion,
                            estado: 'PROCESADO'
                        })
                    } else {
                        const updatePay = await db.PagosEscaneo.update({
                            estado: 'FALLIDO',
                            descripcion_ms: result.data.descripcion,
                            respuesta_ms: JSON.stringify(result.data)
                        }, {
                            where: {
                                id: nuevoPago.id
                            }
                        });
                        console.log("Actualizamos en BD", updatePay)
                        return res.status(402).json({
                            error: false,
                            data: result.data,
                            text: result.data.descripcion,
                            estado: 'FALLIDO'
                        })
                    }
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).json({
                        error: true,
                        text: error.message,
                        estado: 'ESPERAMEGASOFT'
                    });
                })
                
            }).catch((error) => {
                console.log("Error preregistro", error)
                return res.status(500).json(error?.error || error);
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}


function typeTRX(method) {
    switch(method) {
        case 'pagomovil':
            return 'P2C';
        case 'pagomovilc2p':
            return 'C2P';
        case 'transferencia':
            return 'CREDITO_INMEDIATO';
        case 'zelle':
            return 'ZELLE';
        default:
            return 'CREDITO';
    }
}

function endpointByMethod(method) { 
    switch(method) {
        case 'pagomovil':
            return '/v2-procesar-compra-p2c';
        case 'pagomovilc2p':
            return '/v2-procesar-compra-c2p';
        case 'transferencia':
            return '/v2-procesar-compra-creditoinmediato';
        case 'zelle':
            return '/v2-procesar-compra-zelle';
        default:
            return '/v2-procesar-compra';
    }
}

function ASCIItoString(codes = []) {
    if(!codes.length) return null;
    let final = "";
    for(let i=0;i < codes.length;i++) {
        final += String.fromCharCode(codes[i]);
    }
    return final;
}