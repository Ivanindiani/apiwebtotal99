const { validParams, validMethod } = require("./validations/_middleware");
const db = require('../../models');
const config = require("../../config");

const crypto = require("node:crypto");

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'POST'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.body;
    console.log(dataReq);

    filters = validParams(dataReq, ['email', 'site']);
    if(filters.error) return res.status(403).json(filters);

    try {
        filters = validParams(dataReq, [dataReq.site]);
        if(filters.error) return res.status(403).json(filters);
        const dUser = await db.Usuarios.findOne({
            attributes: {
                exclude: ['clave']
            },
            where: {
                email: dataReq.email,
            }
        });


        if(!dUser?.id) { // Creamos el usuario
            const nUser = await db.Usuarios.create({...dataReq, clave: '4/0AfJohXlDK', estatus: 'ACTIVADO', site: undefined});
            const nuevoUser = JSON.parse(JSON.stringify(nUser));
            return res.status(200).json({
                error: false,
                data: nuevoUser,
                token: await saveSesion(req.redis, req.redisKey, nUser),
                registro: true
            });
        } else {
            const uUser = await db.Usuarios.update({
                token_google: null,
                token_facebook: null,
                token_x: null,
                [dataReq.site]: dataReq[dataReq.site]
            }, {
                where: {
                    email: dataReq.email
                }
            })

            console.log(uUser);
        }

        return res.status(200).json({
            error: false,
            data: JSON.parse(JSON.stringify(dUser)),
            token: await saveSesion(req.redis, req.redisKey, dUser),
            registro: false
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
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