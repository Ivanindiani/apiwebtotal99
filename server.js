const config = require('./config.js');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = config[config.NODE_ENV].PORT || 3000;

const fs = require('fs');
const path = require('path');
const { authorization } = require('./src/api/validations/_middleware.js');

// Custom calls redis server
const { createClient } = require("redis");

const endpointsTiendas = [
    '/tiendas/carrito',
    '/tiendas/categorias',
    '/tiendas/escanear',
	'/tiendas/procesar_pago',
	'/tiendas/articulos_carrito'
]

async function initRoutes() {
	const redisConection = await createClient(config[config.NODE_ENV].REDIS);
	await redisConection.connect();

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	// middleware that is specific to this router
	app.use((req, res, next) => {
		authorization(req, res, (result, msg) => {
			req["redis"] = redisConection;
			req["redisKey"] = redisKey;
			if(result)
				return next();
			
			return res.status(400).json({
				error: true,
				message: msg || 'Error de inicialización'
			})
		})
	});

	const basename = path.basename(__filename);
    fs
	.readdirSync('./src/api/')
	.filter(file => {
		//console.log(file)
		return (
			file.indexOf('.') !== 0 &&
			file !== basename &&
			file.slice(-3) === '.js' &&
			file.slice(1) !== '_' &&
			file !== 'index.js' &&
			file.indexOf('.test.js') === -1
		);
	})
	.forEach(file => {
		console.log("[/]: "+file);
		const ruta = require('./src/api/'+file);
        app.use('/'+file.replace('.js',''), ruta);
	});

	// Escaneo
    fs
	.readdirSync('./src/api/escaneo')
	.filter(file => {
		//console.log(file)
		return (
			file.indexOf('.') !== 0 &&
			file !== basename &&
			file.slice(-3) === '.js' &&
			file.slice(1) !== '_' &&
			file !== 'index.js' &&
			file.indexOf('.test.js') === -1
		);
	})
	.forEach(file => {
		console.log("[Escaneo]: "+file);
		const ruta = require('./src/api/escaneo/'+file);
        app.use('/escaneo/'+file.replace('.js',''), ruta);
	});
		// Panel administrativo 
    /*fs
	.readdirSync('./src/api/administrative')
	.filter(file => {
		//console.log(file)
		return (
			file.indexOf('.') !== 0 &&
			file !== basename &&
			file.slice(-3) === '.js' &&
			file.slice(1) !== '_' &&
			file !== 'index.js' &&
			file.indexOf('.test.js') === -1
		);
	})
	.forEach(file => {
		console.log("[Administrative]: "+file);
		const ruta = require('./src/api/administrative/'+file);
        app.use('/administrative/'+file.replace('.js',''), ruta);
	});*/

    const redirections = require('./src/api/tools/_redirections.js');

    for(let i=0;i < endpointsTiendas.length; i++) {
        app.use(endpointsTiendas[i], redirections);
        console.log("[Redirecciones a Tiendas] "+endpointsTiendas[i]);
    }

	app.use((req, res, next) => { // 404
		return res.status(404).json({
			error: true,
			message: 'Endpoint not found'
		})
	});

	console.log("MODE EXECUTE: "+config.NODE_ENV)
}

app.listen(port, () => {
    console.log(` Server started in port: ${port}`)
})

initRoutes();

const redisKey = (key) => {
    return config[config.NODE_ENV].defaultRedisKey+"_"+key;
}

