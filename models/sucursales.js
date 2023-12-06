'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sucursales extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Centros, {
        foreignKey: 'centro_codigo',
        targetKey: 'codigo'
      })
    }
  }
  Sucursales.init({
    codigo: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(4)
    },
    centro_codigo: {
      allowNull: false,
      type: DataTypes.STRING(4),
    },
    nombre:  {
      allowNull: false,
      type: DataTypes.STRING(32),
    },
    descripcion: DataTypes.STRING(64)
  }, {
    sequelize,
    modelName: 'Sucursales',
    timestamps: false
  });
  return Sucursales;
};