const { validMethod } = require("./validations/_middleware");
//const db = require('../../models');

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'POST'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.body;

    try {
        /*let where = {
            MANDT: '400'
        };

        if(dataReq.categorias) {
            where['MAKTG'] = {
                [db.Sequelize.Op.or]: [db.Sequelize.literal("[MAKTG] LIKE '%"+dataReq.categorias[0].toUpperCase()+"%'"), db.Sequelize.literal("[MAKTG] LIKE '%"+dataReq.categorias[1].toUpperCase()+"%'")]
            }
        }

        const prod = await db.Productos.findAll({
            where: where,
            //bind: dataReq.categorias?.length ? ['400', dataReq.categorias[0].toUpperCase(), dataReq.categorias[1].toUpperCase()]:['400'],
            offset: dataReq.limit[0],
            limit: dataReq.limit[1],
            order: [['MAKTG', 'ASC']]
        })

        const count = await db.Productos.count({
            where: where
        })

        const productos = JSON.parse(JSON.stringify(prod));

        if(!productos.length) {
            return res.status(404).json({
                error: true,
                text: 'No hay productos con esa búsqueda'
            })
        }*/

        /*return res.status(200).json({
            error: false,
            text: 'Productos encontrados correctamente',
            data: productos,
            extra: count
        })*/

        return res.status(200).json({
            error: false,
            text: 'Productos encontrados correctamente',
            data: [],
            extra: 0
        });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}