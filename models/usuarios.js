'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.DireccionesUsuarios, {
        foreignKey: 'usuario_id',
        sourceKey: 'id'
      })
    }
  }
  Usuarios.init({
    email: {
      type: DataTypes.STRING(128),
      unique: true
    },
    clave: {
      allowNull: false,
      type: DataTypes.BLOB
    },
    identificacion: {
      type: DataTypes.STRING(10),
    },
    nombre1: {
      type: DataTypes.STRING(32)
    },
    nombre2: {
      type: DataTypes.STRING(32)
    },
    apellido1: {
      type: DataTypes.STRING(32)
    },
    apellido2: {
      type: DataTypes.STRING(32)
    },
    foto: {
      type: DataTypes.STRING(4096)
    },
    tlf1: {
      type: DataTypes.STRING(11)
    },
    tlf2: {
      type: DataTypes.STRING(11)
    },
    codigo: {
      type: DataTypes.STRING(6)
    },
    estatus: {
      allowNull: false,
      type: DataTypes.ENUM('VALIDAR', 'BLOQUEADO', 'ACTIVADO'),
      defaultValue: 'VALIDAR'
    },
    token_google:{
      type: DataTypes.STRING(2048)
    },
    token_facebook: {
      type: DataTypes.STRING(2048)
    },
    token_x: {
      type: DataTypes.STRING(2048)
    },
  }, {
    sequelize,
    modelName: 'Usuarios',
    createdAt: 'creado',
    updatedAt: 'actualizado'
  });
  return Usuarios;
};