const Jwt = require("jsonwebtoken");
const Bcrypt = require("bcryptjs");
require("dotenv").config();
const { LanzarError } = require("../Utilidades/ErrorServicios");

const GenerarToken = (datos) => {
  if (!process.env.CLAVE_SECRETA_TOKEN) {
    throw LanzarError("CLAVE_SECRETA_TOKEN no configurada en el entorno", 500, "Configuracion");
  }
  if (!process.env.EXPIRACION_TOKEN) {
    throw LanzarError("EXPIRACION_TOKEN no configurada en el entorno", 500, "Configuracion");
  }
  if (!datos || !datos.CodigoUsuario) {
    throw LanzarError("Datos insuficientes para generar el token", 400, "Validacion");
  }

  return Jwt.sign(
    {
      CodigoUsuario: datos.CodigoUsuario,
      CodigoRol: datos.CodigoRol,
      NombreUsuario: datos.NombreUsuario,
      NombreRol: datos.NombreRol,
      SuperAdmin: datos.SuperAdmin,
      CodigoEmpresa: datos.CodigoEmpresa,
      NombreEmpresa: datos.NombreEmpresa
    },
    process.env.CLAVE_SECRETA_TOKEN,
    { expiresIn: process.env.EXPIRACION_TOKEN }
  );
};

const EncriptarClave = async (clave) => {
  if (!clave || clave.length < 4) {
    throw LanzarError("La clave es inválida o demasiado corta", 400, "Validacion");
  }
  const Salt = await Bcrypt.genSalt(10);
  const Hash = await Bcrypt.hash(clave, Salt);
  return { Salt, Hash };
};

const CompararClaves = async (clave, hash) => {
  if (!clave) {
    throw LanzarError("La clave es requerida para comparar", 400, "Validacion");
  }
  if (!hash) {
    throw LanzarError("El hash es requerido para comparar", 400, "Validacion");
  }
  return await Bcrypt.compare(clave, hash);
};

module.exports = { GenerarToken, EncriptarClave, CompararClaves };
