const config = require("../../../config");

const authorization = (req, res, resolve) => {
    switch(req.path) {
        case '/auth': {
            if(!req.headers.authorization || config[config.NODE_ENV].AUTHORIZATION !== req.headers.authorization) {
                return resolve(false, 'Error de autorización')
            }
            resolve(true);
            break;
        }
        case '/ping': {
            resolve(true);
            break;
        }
        default: {
            if(!req.headers.authorization || config[config.NODE_ENV].AUTHORIZATION !== req.headers.authorization) {
                return resolve(false, 'Error de autorización')
            }
            resolve(true);
        }
    }
}

const validMethod = (req, validates) => {
    if(req.method !== validates.method) return { error: true, text: 'Método inválido'};
    return { error: false };
} 

const validParams = (params = {}, paramsRequired = []) => {
    for(let pkey in paramsRequired) {
        if(typeof(paramsRequired[pkey]) === 'object') {
            if(!params[paramsRequired[pkey].name]) {
                return {
                    error: true,
                    text: 'Parámetro '+paramsRequired[pkey].name+' es requerido'
                }
            }
            if(typeof(params[paramsRequired[pkey].name]) !== typeof(paramsRequired[pkey].requireType)) {
                return {
                    error: true,
                    text: 'Parámetro '+paramsRequired[pkey].name+' tipo: '+typeof(params[paramsRequired[pkey].name])+' no es válido, se requiere tipo: '+typeof(paramsRequired[pkey].requireType)
                }
            }
        } else {
            if(!params[paramsRequired[pkey]]) {
                return {
                    error: true,
                    text: 'Parámetro '+paramsRequired[pkey]+' es requerido'
                }
            }
        }
    }
    return { error: false };
}

/*async function userAuthorized(req, res){
    let token = req.headers.authorization;
    
    //console.log(req.headers);
    if(!token) {
        res.status(401).json({
            error: true,
            text: 'Error de autorización'
        });
        return -1;
    }
				
	let result = await req.redis.hGet(req.redisKey('tokens'), token);
	if(!result) {
	    res.status(401).json({
            error: true,
            text: 'Error de autorización'
        });
        return -1;
    }
	result = JSON.parse(result);
	
	if(new Date().getTime() >= result.expireIn) {
		await req.redis.hDel(req.redisKey('tokens'), token);
        if(result.userId)
		    await req.redis.hDel(req.redisKey('users'), result.userId.toString());
            
	    res.status(401).json({
            error: true,
            text: 'Error autorización vencida vuelva a iniciar sesión'
        });
        return -1;
	} else {
        const hour = config[config.NODE_ENV].timeSesion;
        let currentTime = new Date().getTime();
        let expireTime = new Date(currentTime + (hour * 60 * 60 * 1000));

        await req.redis.hSet(req.redisKey('tokens'), token, JSON.stringify({userId: result.userId, scopes: result.scopes, expireIn: expireTime.getTime()}));
        
        res.setHeader('expireIn', expireTime.getTime());
        return {
            id: result.userId,
            scopes: result.scopes
        }
	}
}*/


module.exports = { validMethod, validParams, authorization };