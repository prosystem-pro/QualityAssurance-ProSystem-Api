const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UsuarioEmpresa', {
    CodigoUsuarioEmpresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'CodigoUsuario'
      },
      unique: "Uq_UsuarioEmpresa"
    },
    CodigoEmpresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Empresa',
        key: 'CodigoEmpresa'
      },
      unique: "Uq_UsuarioEmpresa"
    },
    EsEmpresaPrincipal: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'UsuarioEmpresa',
    schema: 'Ad',
    timestamps: false,
    indexes: [
      {
        name: "Pk_AdUsuarioEmpresa",
        unique: true,
        fields: [
          { name: "CodigoUsuarioEmpresa" },
        ]
      },
      {
        name: "Uq_UsuarioEmpresa",
        unique: true,
        fields: [
          { name: "CodigoUsuario" },
          { name: "CodigoEmpresa" },
        ]
      },
    ]
  });
};
