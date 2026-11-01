const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Empresa', {
    CodigoEmpresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NombreComercial: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: "Uq_AdEmpresa_NombreComercial"
    },
    RazonSocial: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    NIT: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: "Uq_AdEmpresa_NIT"
    },
    NombrePropietario: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    Correo: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    Direccion: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    Telefono: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    Departamento: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    Municipio: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    ImagenUrl: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    ImagenMesaUrl: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'Empresa',
    schema: 'Ad',
    timestamps: false,
    indexes: [
      {
        name: "Pk_AdEmpresa_CodigoEmpresa",
        unique: true,
        fields: [
          { name: "CodigoEmpresa" },
        ]
      },
      {
        name: "Uq_AdEmpresa_NIT",
        unique: true,
        fields: [
          { name: "NIT" },
        ]
      },
      {
        name: "Uq_AdEmpresa_NombreComercial",
        unique: true,
        fields: [
          { name: "NombreComercial" },
        ]
      },
    ]
  });
};
