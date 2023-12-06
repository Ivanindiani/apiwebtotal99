const { getIpVplsFromWifi } = require("./_ipVpls");
const { validParams } = require("../validations/_middleware");
const config = require("../../../config");

const timeout = config[config.NODE_ENV].TIMEOUT_TIENDAS;

module.exports = async function handler(req, res) {
    
    const dataReq = req.method === 'GET' ? req.query:req.body;

    const filters = validParams(dataReq, ['serverIP']);
    if(filters.error) return res.status(403).json(filters);

    try {
        let status = 500;
        let resHeaders = {};
        
        let noResponder = false;
        let timersito = setTimeout(function(){
            noResponder = true;
            console.log("Tiempo agotado");
            throw {error: {message: "Tiempo de espera agotado"}};
        },timeout);

        console.log("Antes del fetch", req.baseUrl)

        console.log(dataReq)

        fetch(getIpVplsFromWifi(dataReq.serverIP)+req.originalUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                authorization: config[config.NODE_ENV].AUTHORIZATION_TIENDAS
            },
            timeout: timeout,
            body: req.method === 'GET' ? undefined:JSON.stringify(dataReq),
            compress: true
        })
        .then((response) => {
            if(noResponder) return;
            clearTimeout(timersito);
            status = response.status;
            for(let head of response.headers.entries()){
                resHeaders[head[0]] = head[1];
            }
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
            console.log("Respuesta Tienda", data);
            return res.status(status).json(data);
        })
        .catch(error => {
            if(noResponder) return;
            clearTimeout(timersito);
            console.log("Respuesta Tienda", error);
            return res.status(status).json(error);
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}