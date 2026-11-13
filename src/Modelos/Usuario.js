const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Usuario', {
    CodigoUsuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoEmpresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Empresa',
        key: 'CodigoEmpresa'
      }
    },
    CodigoRol: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Rol',
        key: 'CodigoRol'
      }
    },
    NombreUsuario: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "Uq_AdUsuario_NombreUsuario"
    },
    NombreCompleto: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    ApellidoCompleto: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    ClaveHash: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    ClaveSalt: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    Correo: {
      type: DataTypes.STRING(256),
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
    SuperAdmin: {
      type: DataTypes.TINYINT,
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
