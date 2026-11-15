const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CasoPruebaPaso', {
    CodigoCasoPruebaPaso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoCasoPrueba: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CasoPrueba',
        key: 'CodigoCasoPrueba'
      }
    },
    Orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Accion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ResultadoEsperado: {
      type: DataTypes.TEXT,
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
    }
  }, {
    sequelize,
    tableName: 'CasoPruebaPaso',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QaCasoPruebaPaso",
        unique: true,
        fields: [
          { name: "CodigoCasoPruebaPaso" },
        ]
      },
    ]
  });
};
