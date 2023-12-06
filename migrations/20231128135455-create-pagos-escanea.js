'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PagosEscaneo', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      sesion_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      centro_codigo: {
        allowNull: false,
        type: Sequelize.STRING(4),
        references: {
          model: 'Centros',
          key: 'codigo'
        }
      },
      cedula_user: {
        allowNull: false,
        type: Sequelize.STRING(11)
      },
      monto: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      monto_bs: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      tasa: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,4)
      },
      iva: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      iva_bs: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      total: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      total_bs: {
        allowNull: false,
        type: Sequelize.DECIMAL(11,2)
      },
      descuento_global_bs: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DECIMAL(11,2)
      },
      igtf: {
        type: Sequelize.DECIMAL(11,2)
      },
      cantidad: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER
      },
      metodo_pago: {
        type: Sequelize.STRING(16)
      },
      referencia: {
        type: Sequelize.STRING(32)
      },
      banco: {
        type: Sequelize.STRING(4)
      },
      tlf: {
        type: Sequelize.STRING(11)
      },
      identificacion: {
        type: Sequelize.STRING(11)
      },
      estado: {
        allowNull: false,
        defaultValue: 'CREADO',
        type: Sequelize.ENUM('CREADO', 'ESPERAMEGASOFT', 'FALLIDO', 'CANCELADO', 'ANULADO', 'PAGARENCAJA', 'PROCESADO')
      },
      numero_control: {
        type: Sequelize.STRING(100)
      },
      codigo_ms: {
        type: Sequelize.STRING(2)
      },
      descripcion_ms: {
        type: Sequelize.STRING(255)
      },
      respuesta_ms: {
        type: Sequelize.TEXT
      },
      creado: {
        allowNull: false,
        type: Sequelize.DATE
      },
      actualizado: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    await queryInterface.addConstraint('PagosEscaneo', {
      fields: ['id', 'sesion_id'],
      type: 'unique',
      name: 'pagosescaneo_id_sesion_id_unqx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PagosEscaneo');
  }
};