'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sucursales', {
      codigo: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(4)
      },
      centro_codigo: {
        allowNull: false,
        type: Sequelize.STRING(4),
        references: {
          model: 'Centros',
          key: 'codigo'
        }
      },
      nombre: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      descripcion: {
        type: Sequelize.STRING(64)
      }
    });

    await queryInterface.addConstraint('Sucursales', {
      fields: ['codigo', 'centro_codigo'],
      type: 'unique',
      name: 'sucursales_codigo_centro_codigo_unqx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sucursales');
  }
};