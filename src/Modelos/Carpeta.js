const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Carpeta', {
    CodigoCarpeta: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombreCarpeta: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    CodigoCarpetaPadre: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Carpeta',
        key: 'CodigoCarpeta'
      }
    },
    Descripcion: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    Orden: {
      type: DataTypes.INTEGER,
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
    tableName: 'Carpeta',
    schema: 'Qa',
    timestamps: false,
    indexes: [
      {
        name: "Pk_AdCarpeta_CodigoCarpeta",
        unique: true,
        fields: [
          { name: "CodigoCarpeta" },
        ]
      },
    ]
  });
};
