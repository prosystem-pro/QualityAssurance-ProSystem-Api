const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EjecucionPrueba', {
    CodigoEjecucionPrueba: {
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
    NombreEjecucionPrueba: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    Descripcion: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    CodigoEstadoEjecucion: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    ObservacionesGenerales: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    FechaEjecucion: {
      type: DataTypes.DATE,
      allowNull: true
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
    },
    CodigoExterno: {
      type: DataTypes.STRING(32),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'EjecucionPrueba',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QaEjecucionPrueba",
        unique: true,
        fields: [
          { name: "CodigoEjecucionPrueba" },
        ]
      },
    ]
  });
};
