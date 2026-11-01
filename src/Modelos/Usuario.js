const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Usuario', {
    CodigoUsuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoRol: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Rol',
        key: 'CodigoRol'
      }
    },
    NombreCompleto: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    NombreUsuario: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "Uq_AdUsuario_NombreUsuario"
    },
    Correo: {
      type: DataTypes.STRING(128),
      allowNull: true,
      unique: "Uq_AdUsuario_Correo"
    },
    Telefono: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    Direccion: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    ClaveHash: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    ClaveSalt: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    SuperAdmin: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Usuario',
    schema: 'Ad',
    timestamps: false,
    indexes: [
      {
        name: "Pk_AdUsuario_CodigoUsuario",
        unique: true,
        fields: [
          { name: "CodigoUsuario" },
        ]
      },
      {
        name: "Uq_AdUsuario_Correo",
        unique: true,
        fields: [
          { name: "Correo" },
        ]
      },
      {
        name: "Uq_AdUsuario_NombreUsuario",
        unique: true,
        fields: [
          { name: "NombreUsuario" },
        ]
      },
    ]
  });
};
