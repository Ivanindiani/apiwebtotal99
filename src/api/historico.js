const { validParams, validMethod } = require("./validations/_middleware");
const db = require('../../models');

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'GET'
    });
    if(filters.error) return res.status(405).json(filters);

    const dataReq = req.query;
    console.log(dataReq);

    filters = validParams(dataReq, ['cedula_user']);
    if(filters.error) return res.status(403).json(filters);

    try {
        let comprasEscaneo = await db.PagosEscaneo.findAll({
            attributes: ['sesion_id', 'centro_codigo', 'total', 'total_bs', 'igtf', 'cantidad', 'descuento_global_bs', 'metodo_pago', 'estado', 'descripcion_ms', 'creado', 'actualizado'],
            include: {
                model: db.Centros,
                attributes: ['nombre', 'descripcion', 'direccion', 'ciudad']
            },
            where: {
                cedula_user: dataReq.cedula_user,
            },
            offset: dataReq.limit[0] || undefined,
            limit: dataReq.limit[1] || undefined,
            //group: ['sesion_id', 'total', 'total_bs', 'igtf', 'cantidad', 'descuento_global_bs', 'metodo_pago', 'descripcion_ms', db.Sequelize.col('PagosEscaneo.estado'), 'Centro.codigo'],
            order: [['creado', 'DESC']]
        });


        if(!comprasEscaneo.length) {
            return res.status(404).json({
                error: true,
                text: 'No tienes compras realizadas aún',
                data: comprasEscaneo
            });
        }

        return res.status(200).json({
            error: false,
            text: 'Consulta realizada con éxito',
            data: comprasEscaneo,
            extra: await db.PagosEscaneo.count({
                where: {
                    cedula_user: dataReq.cedula_user,
                }
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            text: error.message
        });
    }
}