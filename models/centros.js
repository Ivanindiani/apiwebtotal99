'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Centros extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Sucursales, {
        foreignKey: 'codigo_centro',
        sourceKey: 'codigo'
      })
    }
  }
  Centros.init({
    codigo: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(4)
    },
    nombre: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    descripcion: DataTypes.STRING(64),
    estado: DataTypes.STRING(32),
    ciudad: DataTypes.STRING(32),
    municipio: DataTypes.STRING(32),
    direccion: DataTypes.STRING(128),
    lat: DataTypes.DOUBLE,
    long: DataTypes.DOUBLE,
    radio_mts: DataTypes.INTEGER,
    wifi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ip_publica: DataTypes.STRING(16),
    status: {
      allowNull: false,
      defaultValue: 'HABILITADO',
      type: DataTypes.ENUM('DESHABILITADO', 'HABILITADO')
    }
  }, {
    sequelize,
    modelName: 'Centros',
    timestamps: false
  });
  return Centros;
};