const { validParams, validMethod } = require("./validations/_middleware");
const db = require('../../models');
const config = require("../../config");

const crypto = require("node:crypto");
const mailer = require("./tools/_mails");
const correos = require("../../correos");

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'POST'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.body;
    console.log(dataReq);

    filters = validParams(dataReq, ['email', 'recaptcha', 'type']);
    if(filters.error) return res.status(403).json(filters);

    if(dataReq.type === 'reset') {
        filters = validParams(dataReq, ['password', 'code']);
        if(filters.error) return res.status(403).json(filters);
    }

    try {
        let respGoogle = await verificarCaptcha(dataReq.recaptcha);
        if(!respGoogle || !respGoogle.success) {
            return res.status(400).json({
                error: true,
                text: 'No hemos podido verificar que ¡No eres un Robot!'
            });
        }

        const gUser = await db.Usuarios.findOne({
            attributes: ['codigo', 'actualizado'],
            where: {
                email: dataReq.email
            },
        });
        const ggUser = JSON.parse(JSON.stringify(gUser));

        if(!ggUser) {
            return res.status(400).json({
                error: true,
                text: 'No reconocemos el correo electrónico'
            });
        }
        let diffTime = (new Date().getTime()-(new Date(ggUser.actualizado).getTime()))/1000/60;

        if(dataReq.type === 'lost') {
            let codeRandom = ggUser.codigo;
            if(!ggUser.codigo || diffTime > config[config.NODE_ENV].timeCodeAuth) {
                codeRandom = getRandomInt(100000, 999999);
                const uUser = await db.Usuarios.update({
                    codigo: codeRandom
                }, {
                    where: {
                        email: dataReq.email
                    }
                });
            }
            const correosend = await mailer.sendMail('es', dataReq.email, 
                correos.enviarCodigoLostTitulo, 
                correos.enviarCodigoLostCuerpo(codeRandom, config[config.NODE_ENV].timeCodeAuth)
            );
            
            if(correosend.response.indexOf("OK") === -1) {
                return res.status(500).json({
                    error: false,
                    text: 'Error, no hemos podido enviarte el correo por favor solicitalo nuevamente',
                    data: correosend
                });
            }

            return res.status(200).json({
                error: false,
                data: {},
                text: 'Código de reseteo de clave enviado a tu correo'
            });
        } else {
            console.log(diffTime)
            if(dataReq.code !== ggUser.codigo) {
                return res.status(400).json({
                    error: true,
                    text: 'El código de verificación de correo es inválido'
                });
            }
            if(diffTime > config[config.NODE_ENV].timeCodeAuth) {
                return res.status(400).json({
                    error: true,
                    text: 'El código de verificación de correo está vencido por favor solicite otro'
                });
            }
            const nUser = await db.Usuarios.update({
                codigo: null,
                clave: db.Sequelize.fn('PGP_SYM_ENCRYPT', dataReq.password, config[config.NODE_ENV].PASSWORD_PG_ENCRYPT)
            }, {
                where: {
                    email: dataReq.email
                }
            });

            if(!nUser[0]) {
                return res.status(500).json({
                    error: false,
                    text: 'Error, no hemos podido actualizar tu contraseña, por favor intenta de nuevo',
                    data: nUser
                });
            }
            return res.status(200).json({
                error: false,
                data: {},
                text: 'Tu contraseña ha sido actualizada con éxito'
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}


function verificarCaptcha(token, timeout=config[config.NODE_ENV].googleCaptchaTimeout) {
    return new Promise((resolve) => {
        let status = 500;
        
        let noResponder = false;
        let timersito = setTimeout(function(){
            noResponder = true;
            console.log("Tiempo agotado");
            resolve(false)
        },timeout);

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    
        var datos = new URLSearchParams();
        datos.append('secret', config[config.NODE_ENV].googleCaptchaSecret);
        datos.append('response', token);

        fetch(config[config.NODE_ENV].googleCaptchaUrl, {
            method: 'POST',
            headers: myHeaders,
            timeout: timeout,
            body: datos
        })
        .then((response) => {
            if(noResponder) return;
            clearTimeout(timersito);
            status = response.status;
            return response.text();
        })
        .then((text) => {
            try {
                text = JSON.parse(text);
            } catch {
                // text plane
            }
            return text;
        })
        .then(data => {
            console.log("Respuesta Google", data);
            resolve(data);
        })
        .catch(error => {
            if(noResponder) return;
            clearTimeout(timersito);
            console.log("Respuesta Google", error);
            resolve(error);
        })
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}