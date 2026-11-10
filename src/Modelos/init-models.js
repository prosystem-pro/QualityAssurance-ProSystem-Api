var DataTypes = require("sequelize").DataTypes;
var _Empresa = require("./Empresa");
var _Pagos = require("./Pagos");
var _Permiso = require("./Permiso");
var _PermisoRolRecurso = require("./PermisoRolRecurso");
var _Recurso = require("./Recurso");
var _Rol = require("./Rol");
var _TipoEmpresa = require("./TipoEmpresa");
var _Usuario = require("./Usuario");
var _UsuarioEmpresa = require("./UsuarioEmpresa");

function initModels(sequelize) {
  var Empresa = _Empresa(sequelize, DataTypes);
  var Pagos = _Pagos(sequelize, DataTypes);
  var Permiso = _Permiso(sequelize, DataTypes);
  var PermisoRolRecurso = _PermisoRolRecurso(sequelize, DataTypes);
  var Recurso = _Recurso(sequelize, DataTypes);
  var Rol = _Rol(sequelize, DataTypes);
  var TipoEmpresa = _TipoEmpresa(sequelize, DataTypes);
  var Usuario = _Usuario(sequelize, DataTypes);
  var UsuarioEmpresa = _UsuarioEmpresa(sequelize, DataTypes);

  Pagos.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(Pagos, { as: "Pagos", foreignKey: "CodigoEmpresa"});
  Usuario.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(Usuario, { as: "Usuarios", foreignKey: "CodigoEmpresa"});
  UsuarioEmpresa.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(UsuarioEmpresa, { as: "UsuarioEmpresas", foreignKey: "CodigoEmpresa"});
  PermisoRolRecurso.belongsTo(Permiso, { as: "CodigoPermiso_Permiso", foreignKey: "CodigoPermiso"});
  Permiso.hasMany(PermisoRolRecurso, { as: "PermisoRolRecursos", foreignKey: "CodigoPermiso"});
  PermisoRolRecurso.belongsTo(Recurso, { as: "CodigoRecurso_Recurso", foreignKey: "CodigoRecurso"});
  Recurso.hasMany(PermisoRolRecurso, { as: "PermisoRolRecursos", foreignKey: "CodigoRecurso"});
  PermisoRolRecurso.belongsTo(Rol, { as: "CodigoRol_Rol", foreignKey: "CodigoRol"});
  Rol.hasMany(PermisoRolRecurso, { as: "PermisoRolRecursos", foreignKey: "CodigoRol"});
  Usuario.belongsTo(Rol, { as: "CodigoRol_Rol", foreignKey: "CodigoRol"});
  Rol.hasMany(Usuario, { as: "Usuarios", foreignKey: "CodigoRol"});
  Empresa.belongsTo(TipoEmpresa, { as: "CodigoTipoEmpresa_TipoEmpresa", foreignKey: "CodigoTipoEmpresa"});
  TipoEmpresa.hasMany(Empresa, { as: "Empresas", foreignKey: "CodigoTipoEmpresa"});
  UsuarioEmpresa.belongsTo(Usuario, { as: "CodigoUsuario_Usuario", foreignKey: "CodigoUsuario"});
  Usuario.hasMany(UsuarioEmpresa, { as: "UsuarioEmpresas", foreignKey: "CodigoUsuario"});

  return {
    Empresa,
    Pagos,
    Permiso,
    PermisoRolRecurso,
    Recurso,
    Rol,
    TipoEmpresa,
    Usuario,
    UsuarioEmpresa,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
