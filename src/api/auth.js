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

    if(dataReq.type === 'registro') {
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
            attributes: {
                exclude: ['clave', 'token_facebook', 'token_google', 'token_x']
            },
            where: {
                email: dataReq.email
            },
        });

        const ggUser = JSON.parse(JSON.stringify(gUser));

        console.log(ggUser);
        if(ggUser?.id && dataReq.type !== 'login') {
            if(ggUser.estatus !== 'VALIDAR') {
                return res.status(400).json({
                    error: true,
                    text: 'Este usuario ya está registrado por favor intenta iniciar sesión'
                });
            }
            let diffTime = (new Date().getTime()-(new Date(ggUser.actualizado).getTime()))/1000/60;

            if(dataReq.type === 'registro') {
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
                    estatus: 'ACTIVADO',
                    clave: db.Sequelize.fn('PGP_SYM_ENCRYPT', dataReq.password, config[config.NODE_ENV].PASSWORD_PG_ENCRYPT)
                }, {
                    where: {
                        email: dataReq.email
                    }
                });
                let nuevoUser = JSON.parse(JSON.stringify(gUser));
                nuevoUser.estatus = 'ACTIVADO';

                const correosend = await mailer.sendMail('es', dataReq.email, 
                    correos.notificarRegistroTitulo, 
                    correos.notificarRegistro()
                );
            

                return res.status(200).json({
                    error: false,
                    data: nuevoUser,
                    text: 'Registro éxitoso',
                    token: await saveSesion(req.redis, req.redisKey, nuevoUser)
                });
            } else {
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
                const correosend = await mailer.sendMail('es', ggUser.email, 
                    correos.enviarCodigoTitulo, 
                    correos.enviarCodigoCuerpo(codeRandom)
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
                    text: 'Código enviado al correo correctamente'
                });
            }
        }
        if(!ggUser && dataReq.type !== 'login') {
            if(dataReq.type === 'registro') {
                return res.status(400).json({
                    error: true,
                    text: 'Aún no has verificado tu correo'
                });
            } else {
                console.log("Hola");
                const codeRandom = getRandomInt(100000, 999999);
                const nUser = await db.Usuarios.create({
                    email: dataReq.email,
                    clave: ' ',
                    codigo: codeRandom,
                    estatus: 'VALIDAR'
                });

                const correosend = await mailer.sendMail('es', dataReq.email, 
                    correos.enviarCodigoTitulo, 
                    correos.enviarCodigoCuerpo(codeRandom)
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
                    text: 'Código enviado al correo correctamente'
                });
            }
        }

        const dUser = await db.Usuarios.findOne({
            attributes: {
                exclude: ['clave', 'token_facebook', 'token_google', 'token_x']
            },
            where: {
                email: dataReq.email,
                "": db.Sequelize.literal(`pgp_sym_decrypt(clave, $2) = $1`)
            },
            bind: [dataReq.password, config[config.NODE_ENV].PASSWORD_PG_ENCRYPT]
        });


        if(!dUser?.id) { // Invalid login
            return res.status(404).json({
                error: true,
                text: 'Datos ínvalidos!'
            });
        }

        if(dUser.estatus !== 'ACTIVADO') {
            return res.status(400).json({
                error: true,
                text: 'Este usuario no está habilitado para entrar'
            });
        }

        return res.status(200).json({
            error: false,
            text: 'Inicio de sesión correcto',
            data: JSON.parse(JSON.stringify(dUser)),
            token: await saveSesion(req.redis, req.redisKey, dUser)
        });

    } catch (error) {
        console.log(error);
        return res.status(404).json({
            error: true,
            text: 'Datos ínvalidos!'
        });
        /*return res.status(500).json({
            error: true,
            text: error.message
        });*/
    }
}

function newToken() {
    const dias = config[config.NODE_ENV].timeSesion;
    let currentTime = new Date().getTime();
    let expireTime = new Date(currentTime + (dias * 24 * 60 * 60 * 1000));
    
    let createToken = crypto.randomBytes(30).toString('hex');
    let token = {
        token: createToken,
        expireIn: expireTime.getTime()
    };
    
    return token;
}

async function saveSesion(redis, redisKey, datos) {
    const createToken = newToken();

    let saveRedis = {
        token: createToken.token,
        dataUser: datos
    };
    let tokenViejo = await redis.hGet(redisKey('users'), datos.id.toString());

    if(tokenViejo) {
        tokenViejo = JSON.parse(tokenViejo).token;
        await redis.hDel(redisKey('tokens'), tokenViejo);
    }
    
    await redis.hSet(redisKey('tokens'), createToken.token, JSON.stringify({userId: datos.id, expireIn: createToken.expireIn}));
    await redis.hSet(redisKey('users'), datos.id.toString(), JSON.stringify(saveRedis));

    return createToken;
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