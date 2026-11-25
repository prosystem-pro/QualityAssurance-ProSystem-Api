const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EjecucionPruebaDetalle', {
    CodigoEjecucionPruebaDetalle: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoEjecucionPrueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EjecucionPrueba',
        key: 'CodigoEjecucionPrueba'
      }
    },
    CodigoCasoPrueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CasoPrueba',
        key: 'CodigoCasoPrueba'
      }
    },
    CodigoResultadoEjecucion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ResultadoEjecucion',
        key: 'CodigoResultadoEjecucion'
      }
    },
    CodigoUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'CodigoUsuario'
      }
    },
    Comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ResultadoReal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FechaEjecucion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    TiempoEjecucionSegundos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EnlaceDefecto: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    FechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    FechaUltimaModificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    }
  }, {
    sequelize,
    tableName: 'EjecucionPruebaDetalle',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QaEjecucionPruebaDetalle",
        unique: true,
        fields: [
          { name: "CodigoEjecucionPruebaDetalle" },
        ]
      },
    ]
  });
};
