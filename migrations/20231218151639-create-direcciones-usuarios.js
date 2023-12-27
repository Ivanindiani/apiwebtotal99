'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DireccionesUsuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
        },
        type: Sequelize.INTEGER
      },
      descripcion: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      estado: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      ciudad: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      municipio: {
        type: Sequelize.STRING(64)
      },
      direccion: {
        allowNull: false,
        type: Sequelize.STRING(256)
      },
      referencia: {
        allowNull: false,
        type: Sequelize.STRING(128)
      },
      lat: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      lng: {
        allowNull: false,
        type: Sequelize.DOUBLE
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DireccionesUsuarios');
  }
};