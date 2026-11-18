const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ResultadoEjecucion', {
    CodigoResultado: {
      autoIncrement: true,
      type: DataTypes.TINYINT,
      allowNull: false,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "Uq_QaResultadoEjecucion_Nombre"
    },
    Descripcion: {
      type: DataTypes.STRING(256),
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
    }
  }, {
    sequelize,
    tableName: 'ResultadoEjecucion',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QaResultadoEjecucion",
        unique: true,
        fields: [
          { name: "CodigoResultado" },
        ]
      },
      {
        name: "Uq_QaResultadoEjecucion_Nombre",
        unique: true,
        fields: [
          { name: "Nombre" },
        ]
      },
    ]
  });
};
