const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TipoPrueba', {
    CodigoTipoPrueba: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombreTipoPrueba: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "Uq_QATipoPrueba_Nombre"
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
    tableName: 'TipoPrueba',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QATipoPrueba_CodigoTipoPrueba",
        unique: true,
        fields: [
          { name: "CodigoTipoPrueba" },
        ]
      },
      {
        name: "Uq_QATipoPrueba_Nombre",
        unique: true,
        fields: [
          { name: "NombreTipoPrueba" },
        ]
      },
    ]
  });
};
