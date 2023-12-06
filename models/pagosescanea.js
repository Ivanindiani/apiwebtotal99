'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagosEscaneo extends Model {
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
  PagosEscaneo.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    sesion_id: {
      allowNull: false,
      type: DataTypes.UUID
    },
    centro_codigo: {
      allowNull: false,
      type: DataTypes.STRING(4),
    },
    cedula_user: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    monto: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    monto_bs: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    tasa: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,4)
    },
    iva: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    iva_bs: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    total: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    total_bs: {
      allowNull: false,
      type: DataTypes.DECIMAL(11,2)
    },
    descuento_global_bs: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.DECIMAL(11,2)
    },
    igtf: {
      type: DataTypes.DECIMAL(11,2)
    },
    cantidad: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER
    },
    metodo_pago: {
      type: DataTypes.STRING(16)
    },
    referencia: {
      type: DataTypes.STRING(32)
    },
    banco: {
      type: DataTypes.STRING(4)
    },
    tlf: {
      type: DataTypes.STRING(11)
    },
    identificacion: {
      type: DataTypes.STRING(11)
    },
    estado: {
      allowNull: false,
      defaultValue: 'CREADO',
      type: DataTypes.ENUM('CREADO', 'ESPERAMEGASOFT', 'FALLIDO', 'CANCELADO', 'ANULADO', 'PAGARENCAJA', 'PROCESADO')
    },
    numero_control: {
      type: DataTypes.STRING(100)
    },
    codigo_ms: {
      type: DataTypes.STRING(2)
    },
    descripcion_ms: {
      type: DataTypes.STRING(255)
    },
    respuesta_ms: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'PagosEscaneo',
    tableName: 'PagosEscaneo',
    updatedAt: 'actualizado',
    createdAt: 'creado'
  });
  return PagosEscaneo;
};