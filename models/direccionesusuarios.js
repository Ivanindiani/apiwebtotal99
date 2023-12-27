'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DireccionesUsuarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.Usuarios, {
        foreignKey: 'usuario_id',
        targetKey: 'id'
      })
    }
  }
  DireccionesUsuarios.init({
    usuario_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    direccion: {
      allowNull: false,
      type: DataTypes.STRING(32),
    },
    estado: {
      allowNull: false,
      type: DataTypes.STRING(32),
    },
    ciudad: {
      allowNull: false,
      type: DataTypes.STRING(32),
    },
    municipio: {
      allowNull: false,
      type: DataTypes.STRING(64),
    },
    direccion: {
      allowNull: false,
      type: DataTypes.STRING(256),
    },
    referencia: {
      allowNull: false,
      type: DataTypes.STRING(128),
    },
    lat: {
      allowNull: false,
      type: DataTypes.DECIMAL,
    },
    lng: {
      allowNull: false,
      type: DataTypes.DECIMAL
    }
  }, {
    sequelize,
    modelName: 'DireccionesUsuarios',
    createdAt: 'creado',
    updatedAt: 'actualizado'
  });
  return DireccionesUsuarios;
};