'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Centros', {
      codigo: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(4)
      },
      nombre: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      descripcion: {
        type: Sequelize.STRING(64)
      },
      estado: {
        type: Sequelize.STRING(32)
      },
      ciudad: {
        type: Sequelize.STRING(32)
      },
      municipio: {
        type: Sequelize.STRING(32)
      },
      direccion: {
        type: Sequelize.STRING(128)
      },
      lat: {
        type: Sequelize.DOUBLE
      },
      long: {
        type: Sequelize.DOUBLE
      },
      radio_mts: {
        type: Sequelize.INTEGER
      },
      wifi: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      ip_publica: {
        type: Sequelize.STRING(16)
      },
      status: {
        allowNull: false,
        defaultValue: 'HABILITADO',
        type: Sequelize.ENUM('DESHABILITADO', 'HABILITADO')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Centros');
  }
};