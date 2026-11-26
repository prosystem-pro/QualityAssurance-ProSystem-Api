// ARCHIVO GENERADO AUTOMÁTICAMENTE — No editar manualmente
// Generado el: 2026-11-26T16:44:55.153Z
// Nombre configurado en .env: Relaciones.js

const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname);

const Carpeta = require(Path.join(RutaModelos, 'Carpeta.js'))(BaseDatos, Sequelize.DataTypes);
const CasoPrueba = require(Path.join(RutaModelos, 'CasoPrueba.js'))(BaseDatos, Sequelize.DataTypes);
const CasoPruebaPaso = require(Path.join(RutaModelos, 'CasoPruebaPaso.js'))(BaseDatos, Sequelize.DataTypes);
const EjecucionPrueba = require(Path.join(RutaModelos, 'EjecucionPrueba.js'))(BaseDatos, Sequelize.DataTypes);
const EjecucionPruebaDetalle = require(Path.join(RutaModelos, 'EjecucionPruebaDetalle.js'))(BaseDatos, Sequelize.DataTypes);
const EjecucionPruebaPaso = require(Path.join(RutaModelos, 'EjecucionPruebaPaso.js'))(BaseDatos, Sequelize.DataTypes);
const Empresa = require(Path.join(RutaModelos, 'Empresa.js'))(BaseDatos, Sequelize.DataTypes);
const EstadoCaso = require(Path.join(RutaModelos, 'EstadoCaso.js'))(BaseDatos, Sequelize.DataTypes);
const Pago = require(Path.join(RutaModelos, 'Pago.js'))(BaseDatos, Sequelize.DataTypes);
const Pagos = require(Path.join(RutaModelos, 'Pagos.js'))(BaseDatos, Sequelize.DataTypes);
const Permiso = require(Path.join(RutaModelos, 'Permiso.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoRolRecurso = require(Path.join(RutaModelos, 'PermisoRolRecurso.js'))(BaseDatos, Sequelize.DataTypes);
const Prioridad = require(Path.join(RutaModelos, 'Prioridad.js'))(BaseDatos, Sequelize.DataTypes);
const Recurso = require(Path.join(RutaModelos, 'Recurso.js'))(BaseDatos, Sequelize.DataTypes);
const ResultadoEjecucion = require(Path.join(RutaModelos, 'ResultadoEjecucion.js'))(BaseDatos, Sequelize.DataTypes);
const Rol = require(Path.join(RutaModelos, 'Rol.js'))(BaseDatos, Sequelize.DataTypes);
const TipoEmpresa = require(Path.join(RutaModelos, 'TipoEmpresa.js'))(BaseDatos, Sequelize.DataTypes);
const TipoPrueba = require(Path.join(RutaModelos, 'TipoPrueba.js'))(BaseDatos, Sequelize.DataTypes);
const Usuario = require(Path.join(RutaModelos, 'Usuario.js'))(BaseDatos, Sequelize.DataTypes);
const UsuarioEmpresa = require(Path.join(RutaModelos, 'UsuarioEmpresa.js'))(BaseDatos, Sequelize.DataTypes);

// === RELACIONES ===

CasoPrueba.belongsTo(TipoPrueba, {
  foreignKey: 'CodigoTipoPrueba',
  as: 'TipoPrueba_CodigoTipoPrueba'
});
TipoPrueba.hasMany(CasoPrueba, {
  foreignKey: 'CodigoTipoPrueba',
  as: 'CasoPrueba_CodigoTipoPrueba'
});

CasoPrueba.belongsTo(Prioridad, {
  foreignKey: 'CodigoPrioridad',
  as: 'Prioridad_CodigoPrioridad'
});
Prioridad.hasMany(CasoPrueba, {
  foreignKey: 'CodigoPrioridad',
  as: 'CasoPrueba_CodigoPrioridad'
});

CasoPrueba.belongsTo(EstadoCaso, {
  foreignKey: 'CodigoEstadoCaso',
  as: 'EstadoCaso_CodigoEstadoCaso'
});
EstadoCaso.hasMany(CasoPrueba, {
  foreignKey: 'CodigoEstadoCaso',
  as: 'CasoPrueba_CodigoEstadoCaso'
});

EjecucionPruebaPaso.belongsTo(EjecucionPruebaDetalle, {
  foreignKey: 'CodigoEjecucionPruebaDetalle',
  as: 'EjecucionPruebaDetalle_CodigoEjecucionPruebaDetalle'
});
EjecucionPruebaDetalle.hasMany(EjecucionPruebaPaso, {
  foreignKey: 'CodigoEjecucionPruebaDetalle',
  as: 'EjecucionPruebaPaso_CodigoEjecucionPruebaDetalle'
});

EjecucionPruebaDetalle.belongsTo(ResultadoEjecucion, {
  foreignKey: 'CodigoResultadoEjecucion',
  as: 'ResultadoEjecucion_CodigoResultadoEjecucion'
});
ResultadoEjecucion.hasMany(EjecucionPruebaDetalle, {
  foreignKey: 'CodigoResultadoEjecucion',
  as: 'EjecucionPruebaDetalle_CodigoResultadoEjecucion'
});

EjecucionPruebaPaso.belongsTo(ResultadoEjecucion, {
  foreignKey: 'CodigoResultadoEjecucion',
  as: 'ResultadoEjecucion_CodigoResultadoEjecucion'
});
ResultadoEjecucion.hasMany(EjecucionPruebaPaso, {
  foreignKey: 'CodigoResultadoEjecucion',
  as: 'EjecucionPruebaPaso_CodigoResultadoEjecucion'
});

UsuarioEmpresa.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(UsuarioEmpresa, {
  foreignKey: 'CodigoUsuario',
  as: 'UsuarioEmpresa_CodigoUsuario'
});

EjecucionPruebaDetalle.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(EjecucionPruebaDetalle, {
  foreignKey: 'CodigoUsuario',
  as: 'EjecucionPruebaDetalle_CodigoUsuario'
});

CasoPrueba.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(CasoPrueba, {
  foreignKey: 'CodigoUsuario',
  as: 'CasoPrueba_CodigoUsuario'
});

EjecucionPrueba.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(EjecucionPrueba, {
  foreignKey: 'CodigoUsuario',
  as: 'EjecucionPrueba_CodigoUsuario'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'CodigoRol',
  as: 'Rol_CodigoRol'
});
Rol.hasMany(Usuario, {
  foreignKey: 'CodigoRol',
  as: 'Usuario_CodigoRol'
});

PermisoRolRecurso.belongsTo(Rol, {
  foreignKey: 'CodigoRol',
  as: 'Rol_CodigoRol'
});
Rol.hasMany(PermisoRolRecurso, {
  foreignKey: 'CodigoRol',
  as: 'PermisoRolRecurso_CodigoRol'
});

PermisoRolRecurso.belongsTo(Recurso, {
  foreignKey: 'CodigoRecurso',
  as: 'Recurso_CodigoRecurso'
});
Recurso.hasMany(PermisoRolRecurso, {
  foreignKey: 'CodigoRecurso',
  as: 'PermisoRolRecurso_CodigoRecurso'
});

PermisoRolRecurso.belongsTo(Permiso, {
  foreignKey: 'CodigoPermiso',
  as: 'Permiso_CodigoPermiso'
});
Permiso.hasMany(PermisoRolRecurso, {
  foreignKey: 'CodigoPermiso',
  as: 'PermisoRolRecurso_CodigoPermiso'
});

EjecucionPruebaPaso.belongsTo(CasoPruebaPaso, {
  foreignKey: 'CodigoCasoPruebaPaso',
  as: 'CasoPruebaPaso_CodigoCasoPruebaPaso'
});
CasoPruebaPaso.hasMany(EjecucionPruebaPaso, {
  foreignKey: 'CodigoCasoPruebaPaso',
  as: 'EjecucionPruebaPaso_CodigoCasoPruebaPaso'
});

EjecucionPruebaDetalle.belongsTo(CasoPrueba, {
  foreignKey: 'CodigoCasoPrueba',
  as: 'CasoPrueba_CodigoCasoPrueba'
});
CasoPrueba.hasMany(EjecucionPruebaDetalle, {
  foreignKey: 'CodigoCasoPrueba',
  as: 'EjecucionPruebaDetalle_CodigoCasoPrueba'
});

CasoPruebaPaso.belongsTo(CasoPrueba, {
  foreignKey: 'CodigoCasoPrueba',
  as: 'CasoPrueba_CodigoCasoPrueba'
});
CasoPrueba.hasMany(CasoPruebaPaso, {
  foreignKey: 'CodigoCasoPrueba',
  as: 'CasoPruebaPaso_CodigoCasoPrueba'
});

UsuarioEmpresa.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(UsuarioEmpresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'UsuarioEmpresa_CodigoEmpresa'
});

CasoPrueba.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(CasoPrueba, {
  foreignKey: 'CodigoEmpresa',
  as: 'CasoPrueba_CodigoEmpresa'
});

Carpeta.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(Carpeta, {
  foreignKey: 'CodigoEmpresa',
  as: 'Carpeta_CodigoEmpresa'
});

Pagos.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(Pagos, {
  foreignKey: 'CodigoEmpresa',
  as: 'Pagos_CodigoEmpresa'
});

EjecucionPrueba.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(EjecucionPrueba, {
  foreignKey: 'CodigoEmpresa',
  as: 'EjecucionPrueba_CodigoEmpresa'
});

Carpeta.belongsTo(Carpeta, {
  foreignKey: 'CodigoCarpetaPadre',
  as: 'Carpeta_CodigoCarpetaPadre'
});
Carpeta.hasMany(Carpeta, {
  foreignKey: 'CodigoCarpetaPadre',
  as: 'CarpetaHijas_CodigoCarpetaPadre'
});

CasoPrueba.belongsTo(Carpeta, {
  foreignKey: 'CodigoCarpeta',
  as: 'Carpeta_CodigoCarpeta'
});
Carpeta.hasMany(CasoPrueba, {
  foreignKey: 'CodigoCarpeta',
  as: 'CasoPrueba_CodigoCarpeta'
});

EjecucionPruebaDetalle.belongsTo(EjecucionPrueba, {
  foreignKey: 'CodigoEjecucionPrueba',
  as: 'EjecucionPrueba_CodigoEjecucionPrueba'
});
EjecucionPrueba.hasMany(EjecucionPruebaDetalle, {
  foreignKey: 'CodigoEjecucionPrueba',
  as: 'EjecucionPruebaDetalle_CodigoEjecucionPrueba'
});

Empresa.belongsTo(TipoEmpresa, {
  foreignKey: 'CodigoTipoEmpresa',
  as: 'TipoEmpresa_CodigoTipoEmpresa'
});
TipoEmpresa.hasMany(Empresa, {
  foreignKey: 'CodigoTipoEmpresa',
  as: 'Empresa_CodigoTipoEmpresa'
});

module.exports = {
  Carpeta,
  CasoPrueba,
  CasoPruebaPaso,
  EjecucionPrueba,
  EjecucionPruebaDetalle,
  EjecucionPruebaPaso,
  Empresa,
  EstadoCaso,
  Pago,
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
