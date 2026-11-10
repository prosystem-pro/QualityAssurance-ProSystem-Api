// ARCHIVO GENERADO AUTOMÁTICAMENTE — No editar manualmente
// Generado el: 2026-11-10T19:15:44.275Z
// Nombre configurado en .env: Relaciones.js

const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname);

const Empresa = require(Path.join(RutaModelos, 'Empresa.js'))(BaseDatos, Sequelize.DataTypes);
const Pago = require(Path.join(RutaModelos, 'Pago.js'))(BaseDatos, Sequelize.DataTypes);
const Pagos = require(Path.join(RutaModelos, 'Pagos.js'))(BaseDatos, Sequelize.DataTypes);
const Permiso = require(Path.join(RutaModelos, 'Permiso.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoRolRecurso = require(Path.join(RutaModelos, 'PermisoRolRecurso.js'))(BaseDatos, Sequelize.DataTypes);
const Recurso = require(Path.join(RutaModelos, 'Recurso.js'))(BaseDatos, Sequelize.DataTypes);
const Rol = require(Path.join(RutaModelos, 'Rol.js'))(BaseDatos, Sequelize.DataTypes);
const TipoEmpresa = require(Path.join(RutaModelos, 'TipoEmpresa.js'))(BaseDatos, Sequelize.DataTypes);
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
  Empresa,
  Pago,
  Pagos,
  Permiso,
  PermisoRolRecurso,
  Recurso,
  Rol,
  TipoEmpresa,
  Usuario,
  UsuarioEmpresa,
};
