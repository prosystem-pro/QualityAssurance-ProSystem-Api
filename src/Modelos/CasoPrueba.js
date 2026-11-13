const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CasoPrueba', {
    CodigoCasoPrueba: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoCarpeta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Carpeta',
        key: 'CodigoCarpeta'
      }
    },
    CodigoPrioridad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Prioridad',
        key: 'CodigoPrioridad'
      }
    },
    CodigoTipoPrueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TipoPrueba',
        key: 'CodigoTipoPrueba'
      }
    },
    CodigoEstadoCaso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EstadoCaso',
        key: 'CodigoEstadoCaso'
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
    Titulo: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: "Uq_QACasoPrueba_Titulo"
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Precondiciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Pasos: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ResultadoEsperado: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Etiquetas: {
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
    tableName: 'CasoPrueba',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QACasoPrueba_CodigoCaso",
        unique: true,
        fields: [
          { name: "CodigoCasoPrueba" },
        ]
      },
      {
        name: "Uq_QACasoPrueba_Titulo",
        unique: true,
        fields: [
          { name: "Titulo" },
        ]
      },
    ]
  });
};
