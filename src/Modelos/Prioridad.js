const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Prioridad', {
    CodigoPrioridad: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombrePrioridad: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "Uq_QAPrioridad_Nombre"
    },
    Orden: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'Prioridad',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QAPrioridad_CodigoPrioridad",
        unique: true,
        fields: [
          { name: "CodigoPrioridad" },
        ]
      },
      {
        name: "Uq_QAPrioridad_Nombre",
        unique: true,
        fields: [
          { name: "NombrePrioridad" },
        ]
      },
    ]
  });
};
