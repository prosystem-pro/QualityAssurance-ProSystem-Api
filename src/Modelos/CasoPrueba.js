const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CasoPrueba', {
    CodigoCasoPrueba: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoEmpresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Empresa',
        key: 'CodigoEmpresa'
      },
      unique: "Uq_QaCasoPrueba_CodigoEmpresa_CodigoExterno"
    },
    CodigoCarpeta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Carpeta',
        key: 'CodigoCarpeta'
      },
      unique: "Uq_QaCasoPrueba_Carpeta_Titulo"
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
    Etiquetas: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    Titulo: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: "Uq_QaCasoPrueba_Carpeta_Titulo"
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Precondiciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TipoPlantilla: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    EsAutomatizado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    TiempoEstimadoMinutos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EscenarioBdd: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CodigoExterno: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "Uq_QaCasoPrueba_CodigoEmpresa_CodigoExterno"
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
        name: "Pk_QaCasoPrueba_CodigoCasoPrueba",
        unique: true,
        fields: [
          { name: "CodigoCasoPrueba" },
        ]
      },
      {
        name: "Uq_QaCasoPrueba_Carpeta_Titulo",
        unique: true,
        fields: [
          { name: "CodigoCarpeta" },
          { name: "Titulo" },
        ]
      },
      {
        name: "Uq_QaCasoPrueba_CodigoEmpresa_CodigoExterno",
        unique: true,
        fields: [
          { name: "CodigoEmpresa" },
          { name: "CodigoExterno" },
        ]
      },
    ]
  });
};
