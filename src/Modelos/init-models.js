var DataTypes = require("sequelize").DataTypes;
var _Carpeta = require("./Carpeta");
var _CasoPrueba = require("./CasoPrueba");
var _Empresa = require("./Empresa");
var _EstadoCaso = require("./EstadoCaso");
var _Pagos = require("./Pagos");
var _Permiso = require("./Permiso");
var _PermisoRolRecurso = require("./PermisoRolRecurso");
var _Prioridad = require("./Prioridad");
var _Recurso = require("./Recurso");
var _Rol = require("./Rol");
var _TipoEmpresa = require("./TipoEmpresa");
var _TipoPrueba = require("./TipoPrueba");
var _Usuario = require("./Usuario");
var _UsuarioEmpresa = require("./UsuarioEmpresa");

function initModels(sequelize) {
  var Carpeta = _Carpeta(sequelize, DataTypes);
  var CasoPrueba = _CasoPrueba(sequelize, DataTypes);
  var Empresa = _Empresa(sequelize, DataTypes);
  var EstadoCaso = _EstadoCaso(sequelize, DataTypes);
  var Pagos = _Pagos(sequelize, DataTypes);
  var Permiso = _Permiso(sequelize, DataTypes);
  var PermisoRolRecurso = _PermisoRolRecurso(sequelize, DataTypes);
  var Prioridad = _Prioridad(sequelize, DataTypes);
  var Recurso = _Recurso(sequelize, DataTypes);
  var Rol = _Rol(sequelize, DataTypes);
  var TipoEmpresa = _TipoEmpresa(sequelize, DataTypes);
  var TipoPrueba = _TipoPrueba(sequelize, DataTypes);
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
  CasoPrueba.belongsTo(Usuario, { as: "CodigoUsuario_Usuario", foreignKey: "CodigoUsuario"});
  Usuario.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoUsuario"});
  Carpeta.belongsTo(Carpeta, { as: "CodigoCarpetaPadre_Carpetum", foreignKey: "CodigoCarpetaPadre"});
  Carpeta.hasMany(Carpeta, { as: "Carpeta", foreignKey: "CodigoCarpetaPadre"});
  CasoPrueba.belongsTo(Carpeta, { as: "CodigoCarpeta_Carpetum", foreignKey: "CodigoCarpeta"});
  Carpeta.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoCarpeta"});
  CasoPrueba.belongsTo(EstadoCaso, { as: "CodigoEstadoCaso_EstadoCaso", foreignKey: "CodigoEstadoCaso"});
  EstadoCaso.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoEstadoCaso"});
  CasoPrueba.belongsTo(Prioridad, { as: "CodigoPrioridad_Prioridad", foreignKey: "CodigoPrioridad"});
  Prioridad.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoPrioridad"});
  CasoPrueba.belongsTo(TipoPrueba, { as: "CodigoTipoPrueba_TipoPrueba", foreignKey: "CodigoTipoPrueba"});
  TipoPrueba.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoTipoPrueba"});

  return {
    Carpeta,
    CasoPrueba,
    Empresa,
    EstadoCaso,
    Pagos,
    Permiso,
    PermisoRolRecurso,
    Prioridad,
    Recurso,
    Rol,
    TipoEmpresa,
    TipoPrueba,
    Usuario,
    UsuarioEmpresa,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
