const xml2js = require('xml2js');
const {parseStringPromise}  = require('xml2js');
const https = require('https');
const fs = require('fs');
const config = require("../../../../config");

const builder = new xml2js.Builder();

const httpsAgent = new https.Agent({
   	cert: fs.readFileSync('./src/api/escaneo/megasoft/mi_certificado.crt'),
   	key: fs.readFileSync('./src/api/escaneo/megasoft/mi_certificado.key'),
    rejectUnauthorized: false,
});

const headers = {
	'Content-Type': 'text/xml;charset=utf-8',
	'Authorization': config[config.NODE_ENV].MEGASOFT.AUTHORIZATION
}

const defaultTimeout = config[config.NODE_ENV].MEGASOFT.TIMEOUT_MEGASOFT;
const urlMegasoft = config[config.NODE_ENV].MEGASOFT.URL_MEGASOFT;

function requestsMegasoft(endpoint, params, method, datos = {}, timeout=defaultTimeout) {
	return new Promise((resolve, reject) => {
        function jocker(intentos=0) {
	        const timeStart = new Date().getTime();
            console.log(`Consultando ${endpoint}`);

            let timersito = setTimeout(function(){
                console.log("Tiempo agotado");
                timersito = null;

                if(intentos < 3) {
                    console.log(`Reintento ${intentos+1}/3, ${endpoint}`);
                    return jocker(intentos+1);
                } else {
                    const timeStop = new Date().getTime();
                    console.log(`Response ${endpoint} in ${timeStop-timeStart}ms`);
                    reject({error: {message: "Tiempo de espera agotado"}});
                }
            },timeout-100);

            const xml = builder.buildObject(datos);

            console.log(xml);

            let status = null, resHeaders = [];

            fetch(urlMegasoft+endpoint+(params?.length ? "?"+params:''), {
                method: method,
                body: method !== 'GET' ? xml:undefined,
                headers: headers,
                agent: httpsAgent,
                timeout: timeout
            })
            .then(async (response) => {
                if(timersito) {
                    clearTimeout(timersito);
                } else return;

                status = response.status;
                let iso = 'utf-8';
                for(let head of response.headers.entries()){
                    resHeaders[head[0]] = head[1];
                    if(head[0].toLowerCase() === 'content-type') {
                        iso = head[1].split('=')[1];
                    }
                }
                console.log(iso);
                if(iso !== 'utf-8') {
                    const decoder = new TextDecoder(iso);
                    const text = decoder.decode(await response.arrayBuffer());
                    return text;
                }
                return response.text();
            })
            .then(async data => {
                if(status === 200) {
                    const jsonFinal = await parseStringPromise(data, {explicitArray: false});
                    resolve({status, data: jsonFinal.response, headers: resHeaders});
                } else {
                    reject({status, error: data, headers: resHeaders});
                }
            })
            .catch(error => {
                if(timersito)
                    clearTimeout(timersito);
                if(intentos < 3) {
                    console.log(`Reintento ${intentos+1}/3, ${endpoint}`);
                    return jocker(intentos+1);
                } else {
                    reject({error: error.stack});
                }
            })
            .finally(() => {
                const timeStop = new Date().getTime();
                console.log(`Response ${endpoint} in ${timeStop-timeStart}ms`);
            })
        }
        jocker();
	});
}

function preRegistro() {
	return new Promise((resolve, reject) => {
        const jsonSend = {
            request: {
                cod_afiliacion: config[config.NODE_ENV].MEGASOFT.COD_AFILIACION
            }
        }
        
        requestsMegasoft('/v2-preregistro', null, 'POST', jsonSend, defaultTimeout/2)
        .then((result) => {
            const nControl = result.data.control;
    
            if(result.data.codigo !== '00') throw result.data.descripcion;
    
            console.log(result);
            console.log("Consultando QueryStatus nControl: "+nControl);

            resolve(nControl)
        }).catch((error) => {
            console.log(error);
            reject(error)
        })
    });
}

module.exports = { requestsMegasoft, preRegistro };