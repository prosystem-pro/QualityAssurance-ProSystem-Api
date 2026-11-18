const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EjecucionPruebaPaso', {
    CodigoEjecucionPruebaPaso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoEjecucionPruebaDetalle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EjecucionPruebaDetalle',
        key: 'CodigoEjecucionPruebaDetalle'
      }
    },
    CodigoCasoPruebaPaso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CasoPruebaPaso',
        key: 'CodigoCasoPruebaPaso'
      }
    },
    Orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    AccionRealizada: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ResultadoObtenido: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CodigoResultado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      references: {
        model: 'ResultadoEjecucion',
        key: 'CodigoResultado'
      }
    },
    Comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'EjecucionPruebaPaso',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QaEjecucionPruebaPaso",
        unique: true,
        fields: [
          { name: "CodigoEjecucionPruebaPaso" },
        ]
      },
    ]
  });
};
