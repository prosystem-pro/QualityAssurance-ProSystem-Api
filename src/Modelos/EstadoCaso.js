const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EstadoCaso', {
    CodigoEstadoCaso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombreEstadoCaso: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "Uq_QAEstadoCaso_Nombre"
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
    tableName: 'EstadoCaso',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_QAEstadoCaso_CodigoEstadoCaso",
        unique: true,
        fields: [
          { name: "CodigoEstadoCaso" },
        ]
      },
      {
        name: "Uq_QAEstadoCaso_Nombre",
        unique: true,
        fields: [
          { name: "NombreEstadoCaso" },
        ]
      },
    ]
  });
};
