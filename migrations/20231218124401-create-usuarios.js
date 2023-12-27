'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(128),
        unique: true
      },
      clave: {
        allowNull: false,
        type: Sequelize.BLOB
      },
      identificacion: {
        type: Sequelize.STRING(10),
      },
      nombre1: {
        type: Sequelize.STRING(32)
      },
      nombre2: {
        type: Sequelize.STRING(32)
      },
      apellido1: {
        type: Sequelize.STRING(32)
      },
      apellido2: {
        type: Sequelize.STRING(32)
      },
      foto: {
        type: Sequelize.STRING(4096)
      },
      tlf1: {
        type: Sequelize.STRING(11)
      },
      tlf2: {
        type: Sequelize.STRING(11)
      },
      codigo: {
        type: Sequelize.STRING(6)
      },
      estatus: {
        allowNull: false,
        type: Sequelize.ENUM('VALIDAR', 'BLOQUEADO', 'ACTIVADO'),
        defaultValue: 'VALIDAR'
      },
      token_google:{
        type: Sequelize.STRING(2048)
      },
      token_facebook: {
        type: Sequelize.STRING(2048)
      },
      token_x: {
        type: Sequelize.STRING(2048)
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
    await queryInterface.dropTable('Usuarios');
  }
};