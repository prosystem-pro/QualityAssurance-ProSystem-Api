// ARCHIVO GENERADO AUTOMÁTICAMENTE — No editar manualmente
// Generado el: 2026-11-14T01:01:28.673Z
// Nombre configurado en .env: Relaciones.js

const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname);

const Carpeta = require(Path.join(RutaModelos, 'Carpeta.js'))(BaseDatos, Sequelize.DataTypes);
const CasoPrueba = require(Path.join(RutaModelos, 'CasoPrueba.js'))(BaseDatos, Sequelize.DataTypes);
const Empresa = require(Path.join(RutaModelos, 'Empresa.js'))(BaseDatos, Sequelize.DataTypes);
const EstadoCaso = require(Path.join(RutaModelos, 'EstadoCaso.js'))(BaseDatos, Sequelize.DataTypes);
const Pago = require(Path.join(RutaModelos, 'Pago.js'))(BaseDatos, Sequelize.DataTypes);
const Pagos = require(Path.join(RutaModelos, 'Pagos.js'))(BaseDatos, Sequelize.DataTypes);
const Permiso = require(Path.join(RutaModelos, 'Permiso.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoRolRecurso = require(Path.join(RutaModelos, 'PermisoRolRecurso.js'))(BaseDatos, Sequelize.DataTypes);
const Prioridad = require(Path.join(RutaModelos, 'Prioridad.js'))(BaseDatos, Sequelize.DataTypes);
const Recurso = require(Path.join(RutaModelos, 'Recurso.js'))(BaseDatos, Sequelize.DataTypes);
const Rol = require(Path.join(RutaModelos, 'Rol.js'))(BaseDatos, Sequelize.DataTypes);
const TipoEmpresa = require(Path.join(RutaModelos, 'TipoEmpresa.js'))(BaseDatos, Sequelize.DataTypes);
const TipoPrueba = require(Path.join(RutaModelos, 'TipoPrueba.js'))(BaseDatos, Sequelize.DataTypes);
const Usuario = require(Path.join(RutaModelos, 'Usuario.js'))(BaseDatos, Sequelize.DataTypes);
const UsuarioEmpresa = require(Path.join(RutaModelos, 'UsuarioEmpresa.js'))(BaseDatos, Sequelize.DataTypes);

// === RELACIONES ===

UsuarioEmpresa.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(UsuarioEmpresa, {
  foreignKey: 'CodigoUsuario',
  as: 'UsuarioEmpresa_CodigoUsuario'
});

CasoPrueba.belongsTo(Usuario, {
  foreignKey: 'CodigoUsuario',
  as: 'Usuario_CodigoUsuario'
});
Usuario.hasMany(CasoPrueba, {
  foreignKey: 'CodigoUsuario',
  as: 'CasoPrueba_CodigoUsuario'
});

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

UsuarioEmpresa.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(UsuarioEmpresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'UsuarioEmpresa_CodigoEmpresa'
});

Usuario.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(Usuario, {
  foreignKey: 'CodigoEmpresa',
  as: 'Usuario_CodigoEmpresa'
});

Carpeta.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(Carpeta, {
  foreignKey: 'CodigoEmpresa',
  as: 'Carpeta_CodigoEmpresa'
});

CasoPrueba.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(CasoPrueba, {
  foreignKey: 'CodigoEmpresa',
  as: 'CasoPrueba_CodigoEmpresa'
});

Pagos.belongsTo(Empresa, {
  foreignKey: 'CodigoEmpresa',
  as: 'Empresa_CodigoEmpresa'
});
Empresa.hasMany(Pagos, {
  foreignKey: 'CodigoEmpresa',
  as: 'Pagos_CodigoEmpresa'
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
  Empresa,
  EstadoCaso,
  Pago,
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
