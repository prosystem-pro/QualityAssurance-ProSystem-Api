const Jwt = require("jsonwebtoken");
require("dotenv").config();
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const VerificarToken = (req, res, next) => {
  if (!process.env.CLAVE_SECRETA_TOKEN) {
    return ManejarError(
      new Error('CLAVE_SECRETA_TOKEN no configurada en el entorno'),
      res,
      'Error de configuración de seguridad'
    );
  }

  const Token = req.header("Authorization");
  if (!Token) {
    return ResponderExito(res, "Acceso denegado, token requerido", null, 401);
  }

  try {
    const TokenLimpio = Token.replace("Bearer ", "");
    const Decodificado = Jwt.verify(TokenLimpio, process.env.CLAVE_SECRETA_TOKEN);
    
    req.Datos = Decodificado;
    
    next();
  } catch (error) {
    return ManejarError(error, res, 'Token inválido o expirado');
  }
};

module.exports = VerificarToken;
