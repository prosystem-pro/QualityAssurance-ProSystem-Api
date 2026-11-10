const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TipoEmpresa', {
    CodigoTipoEmpresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombreTipoEmpresa: {
      type: DataTypes.STRING(64),
      allowNull: false
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
    tableName: 'TipoEmpresa',
    schema: 'Ad',
    timestamps: false,
    indexes: [
      {
        name: "Pk_AdTipoEmpresa_CodigoTipoEmpresa",
        unique: true,
        fields: [
          { name: "CodigoTipoEmpresa" },
        ]
      },
    ]
  });
};
