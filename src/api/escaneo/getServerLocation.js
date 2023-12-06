const { validParams, validMethod } = require("../validations/_middleware");
const db = require('../../../models');
const config = require('../../../config');

/*const tiendasLATLONG = [{
    tienda: 'Mundo Total Sabana Grande',
    numTienda: 14,
    lat: 10.494979225020316,
    lng: -66.87767953926895,
    serverIP: '172.16.10.79',
    wifi: false
},{
    tienda: 'Mundo Total Chacaito',
    numTienda: 26,
    lat: 10.491513827736712, 
    lng: -66.8717812999809,
    serverIP: '172.16.10.78',
    wifi: false
},{
    tienda: 'Mundo Total Catia 2',
    numTienda: 19,
    lat: 10.515081103108605, 
    lng: -66.94451890865754,
    serverIP: '172.16.10.78',
    wifi: false,
    direccion: 'ubicada  en el Boulevard  de Catia entre  calle Panamérica   y Segunda   Avenida,   Edificio Habana,  Local  Planta Baja, Distrito Capital'
},{
    tienda: 'Mundo Total Catia 3',
    numTienda: 3,
    lat: 10.513865656812348, 
    lng: -66.9467971979927,
    serverIP: '172.16.10.78',
    wifi: false,
    direccion: 'ubicada  en el Boulevard  de Catia entre  calle Panamérica   y Segunda   Avenida,   Edificio Habana,  Local  Planta Baja, Distrito Capital'
},{
    tienda: 'Mundo Total Catia 1',
    numTienda: 22,
    lat: 10.513447628423052, 
    lng: -66.94545698360287,
    serverIP: '172.16.10.78',
    wifi: false,
    direccion: 'ubicada  en el Boulevard  de Catia entre  calle Panamérica   y Segunda   Avenida,   Edificio Habana,  Local  Planta Baja, Distrito Capital'
},{
    tienda: 'Mundo Total Maracaibo',
    numTienda: 24,
    lat: 10.555710904078301,
    lng: -71.61883213190205,
    serverIP: '172.16.10.78',
    wifi: false
},{
    tienda: 'Mundo Total La Trinidad',
    numTienda: 20,
    lat: 10.436471580082234, 
    lng: -66.86466765539734,
    serverIP: '172.16.10.78',
    wifi: false
}]*/

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'GET'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.query;
    console.log(dataReq);

    filters = validParams(dataReq, ['lat', 'lng', 'accuracy']);
    if(filters.error) return res.status(403).json(filters);

    try {
        let masCercana = {}, temp = [];
        let tiendas = await db.Centros.findAll({
            where: {
                status: 'HABILITADO'
            }
        });
        if(!tiendas.length) {
            return res.status(404).json({
                error: true,
                text: 'Tenemos problemas para encontrar tiendas disponibles para el público',
                data: tiendas
            });
        }

        tiendasLATLONG = JSON.parse(JSON.stringify(tiendas));

        for(const tienda of tiendasLATLONG) {
            const dist = calcDistance({
                latitude: dataReq.lat,
                longitude: dataReq.lng
            },{
                latitude: tienda.lat,
                longitude: tienda.long
            });
            if(typeof(dist) !== 'number') continue;

            tienda.numTienda = tienda.codigo-1000;
            tienda.serverIP = '192.168.'+tienda.numTienda+'.2';
            tienda.tienda = 'Mundo Total '+tienda.nombre;
            tienda.radio_mts = tienda.radio_mts || 1500;

            if(masCercana.distancia) {
                tienda.distancia = dist;
                temp.push(tienda)
                if(masCercana.distancia > dist) {
                    masCercana = tienda;
                }
            } else {
                tienda.distancia = dist;
                temp.push(tienda)
                masCercana = tienda;
            }
        }

        console.log(temp);

        if(masCercana.numTienda) {
            return res.status(200).json({
                error: false,
                data: masCercana
            });
        }
        return res.status(200).json(dataReq);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}

function degreesToRadians(degrees) {
    var radians = (degrees * Math.PI)/180;
    return radians;
}

// Function takes two objects, that contain coordinates to a starting and destination location.
function calcDistance (startingCoords, destinationCoords){
    let startingLat = degreesToRadians(startingCoords.latitude);
    let startingLong = degreesToRadians(startingCoords.longitude);
    let destinationLat = degreesToRadians(destinationCoords.latitude);
    let destinationLong = degreesToRadians(destinationCoords.longitude);
  
    // Radius of the Earth in kilometers
    let radius = 6571;
  
    // Haversine equation
    let distanceInKilometers = Math.acos(Math.sin(startingLat) * Math.sin(destinationLat) +
                                Math.cos(startingLat) * Math.cos(destinationLat) *
                                Math.cos(startingLong - destinationLong)) * radius;
                                
    return distanceInKilometers*1000;
}