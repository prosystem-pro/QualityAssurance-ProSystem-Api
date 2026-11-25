var DataTypes = require("sequelize").DataTypes;
var _Carpeta = require("./Carpeta");
var _CasoPrueba = require("./CasoPrueba");
var _CasoPruebaPaso = require("./CasoPruebaPaso");
var _EjecucionPrueba = require("./EjecucionPrueba");
var _EjecucionPruebaDetalle = require("./EjecucionPruebaDetalle");
var _EjecucionPruebaPaso = require("./EjecucionPruebaPaso");
var _Empresa = require("./Empresa");
var _EstadoCaso = require("./EstadoCaso");
var _Pagos = require("./Pagos");
var _Permiso = require("./Permiso");
var _PermisoRolRecurso = require("./PermisoRolRecurso");
var _Prioridad = require("./Prioridad");
var _Recurso = require("./Recurso");
var _ResultadoEjecucion = require("./ResultadoEjecucion");
var _Rol = require("./Rol");
var _TipoEmpresa = require("./TipoEmpresa");
var _TipoPrueba = require("./TipoPrueba");
var _Usuario = require("./Usuario");
var _UsuarioEmpresa = require("./UsuarioEmpresa");

function initModels(sequelize) {
  var Carpeta = _Carpeta(sequelize, DataTypes);
  var CasoPrueba = _CasoPrueba(sequelize, DataTypes);
  var CasoPruebaPaso = _CasoPruebaPaso(sequelize, DataTypes);
  var EjecucionPrueba = _EjecucionPrueba(sequelize, DataTypes);
  var EjecucionPruebaDetalle = _EjecucionPruebaDetalle(sequelize, DataTypes);
  var EjecucionPruebaPaso = _EjecucionPruebaPaso(sequelize, DataTypes);
  var Empresa = _Empresa(sequelize, DataTypes);
  var EstadoCaso = _EstadoCaso(sequelize, DataTypes);
  var Pagos = _Pagos(sequelize, DataTypes);
  var Permiso = _Permiso(sequelize, DataTypes);
  var PermisoRolRecurso = _PermisoRolRecurso(sequelize, DataTypes);
  var Prioridad = _Prioridad(sequelize, DataTypes);
  var Recurso = _Recurso(sequelize, DataTypes);
  var ResultadoEjecucion = _ResultadoEjecucion(sequelize, DataTypes);
  var Rol = _Rol(sequelize, DataTypes);
  var TipoEmpresa = _TipoEmpresa(sequelize, DataTypes);
  var TipoPrueba = _TipoPrueba(sequelize, DataTypes);
  var Usuario = _Usuario(sequelize, DataTypes);
  var UsuarioEmpresa = _UsuarioEmpresa(sequelize, DataTypes);

  Pagos.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(Pagos, { as: "Pagos", foreignKey: "CodigoEmpresa"});
  UsuarioEmpresa.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(UsuarioEmpresa, { as: "UsuarioEmpresas", foreignKey: "CodigoEmpresa"});
  Carpeta.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(Carpeta, { as: "Carpeta", foreignKey: "CodigoEmpresa"});
  CasoPrueba.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoEmpresa"});
  EjecucionPrueba.belongsTo(Empresa, { as: "CodigoEmpresa_Empresa", foreignKey: "CodigoEmpresa"});
  Empresa.hasMany(EjecucionPrueba, { as: "EjecucionPruebas", foreignKey: "CodigoEmpresa"});
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
  EjecucionPrueba.belongsTo(Usuario, { as: "CodigoUsuario_Usuario", foreignKey: "CodigoUsuario"});
  Usuario.hasMany(EjecucionPrueba, { as: "EjecucionPruebas", foreignKey: "CodigoUsuario"});
  EjecucionPruebaDetalle.belongsTo(Usuario, { as: "CodigoUsuario_Usuario", foreignKey: "CodigoUsuario"});
  Usuario.hasMany(EjecucionPruebaDetalle, { as: "EjecucionPruebaDetalles", foreignKey: "CodigoUsuario"});
  Carpeta.belongsTo(Carpeta, { as: "CodigoCarpetaPadre_Carpetum", foreignKey: "CodigoCarpetaPadre"});
  Carpeta.hasMany(Carpeta, { as: "Carpeta", foreignKey: "CodigoCarpetaPadre"});
  CasoPrueba.belongsTo(Carpeta, { as: "CodigoCarpeta_Carpetum", foreignKey: "CodigoCarpeta"});
  Carpeta.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoCarpeta"});
  CasoPruebaPaso.belongsTo(CasoPrueba, { as: "CodigoCasoPrueba_CasoPrueba", foreignKey: "CodigoCasoPrueba"});
  CasoPrueba.hasMany(CasoPruebaPaso, { as: "CasoPruebaPasos", foreignKey: "CodigoCasoPrueba"});
  EjecucionPruebaDetalle.belongsTo(CasoPrueba, { as: "CodigoCasoPrueba_CasoPrueba", foreignKey: "CodigoCasoPrueba"});
  CasoPrueba.hasMany(EjecucionPruebaDetalle, { as: "EjecucionPruebaDetalles", foreignKey: "CodigoCasoPrueba"});
  EjecucionPruebaPaso.belongsTo(CasoPruebaPaso, { as: "CodigoCasoPruebaPaso_CasoPruebaPaso", foreignKey: "CodigoCasoPruebaPaso"});
  CasoPruebaPaso.hasMany(EjecucionPruebaPaso, { as: "EjecucionPruebaPasos", foreignKey: "CodigoCasoPruebaPaso"});
  EjecucionPruebaDetalle.belongsTo(EjecucionPrueba, { as: "CodigoEjecucionPrueba_EjecucionPrueba", foreignKey: "CodigoEjecucionPrueba"});
  EjecucionPrueba.hasMany(EjecucionPruebaDetalle, { as: "EjecucionPruebaDetalles", foreignKey: "CodigoEjecucionPrueba"});
  EjecucionPruebaPaso.belongsTo(EjecucionPruebaDetalle, { as: "CodigoEjecucionPruebaDetalle_EjecucionPruebaDetalle", foreignKey: "CodigoEjecucionPruebaDetalle"});
  EjecucionPruebaDetalle.hasMany(EjecucionPruebaPaso, { as: "EjecucionPruebaPasos", foreignKey: "CodigoEjecucionPruebaDetalle"});
  CasoPrueba.belongsTo(EstadoCaso, { as: "CodigoEstadoCaso_EstadoCaso", foreignKey: "CodigoEstadoCaso"});
  EstadoCaso.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoEstadoCaso"});
  CasoPrueba.belongsTo(Prioridad, { as: "CodigoPrioridad_Prioridad", foreignKey: "CodigoPrioridad"});
  Prioridad.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoPrioridad"});
  EjecucionPruebaDetalle.belongsTo(ResultadoEjecucion, { as: "CodigoResultado_ResultadoEjecucion", foreignKey: "CodigoResultado"});
  ResultadoEjecucion.hasMany(EjecucionPruebaDetalle, { as: "EjecucionPruebaDetalles", foreignKey: "CodigoResultado"});
  EjecucionPruebaPaso.belongsTo(ResultadoEjecucion, { as: "CodigoResultado_ResultadoEjecucion", foreignKey: "CodigoResultado"});
  ResultadoEjecucion.hasMany(EjecucionPruebaPaso, { as: "EjecucionPruebaPasos", foreignKey: "CodigoResultado"});
  CasoPrueba.belongsTo(TipoPrueba, { as: "CodigoTipoPrueba_TipoPrueba", foreignKey: "CodigoTipoPrueba"});
  TipoPrueba.hasMany(CasoPrueba, { as: "CasoPruebas", foreignKey: "CodigoTipoPrueba"});

  return {
    Carpeta,
    CasoPrueba,
    CasoPruebaPaso,
    EjecucionPrueba,
    EjecucionPruebaDetalle,
    EjecucionPruebaPaso,
    Empresa,
    EstadoCaso,
    Pagos,
    Permiso,
    PermisoRolRecurso,
    Prioridad,
    Recurso,
    ResultadoEjecucion,
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
