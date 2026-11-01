// ARCHIVO GENERADO AUTOMÁTICAMENTE — No editar manualmente
// Generado el: 2026-10-30T01:37:49.405Z
// Nombre configurado en .env: Relaciones.js

const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname);

const Empresa = require(Path.join(RutaModelos, 'Empresa.js'))(BaseDatos, Sequelize.DataTypes);
const Pago = require(Path.join(RutaModelos, 'Pago.js'))(BaseDatos, Sequelize.DataTypes);
const Permiso = require(Path.join(RutaModelos, 'Permiso.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoRolRecurso = require(Path.join(RutaModelos, 'PermisoRolRecurso.js'))(BaseDatos, Sequelize.DataTypes);
const Recurso = require(Path.join(RutaModelos, 'Recurso.js'))(BaseDatos, Sequelize.DataTypes);
const Rol = require(Path.join(RutaModelos, 'Rol.js'))(BaseDatos, Sequelize.DataTypes);
const Usuario = require(Path.join(RutaModelos, 'Usuario.js'))(BaseDatos, Sequelize.DataTypes);

// === RELACIONES ===

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

module.exports = {
  Empresa,
  Pago,
  Permiso,
  PermisoRolRecurso,
  Recurso,
  Rol,
  Usuario,
};
