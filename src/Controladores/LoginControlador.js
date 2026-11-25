const {
  IniciarSesionServicio,
  CambiarEmpresaServicio
} = require('../Servicios/LoginServicio');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');
const ManejarError = require('../Utilidades/ErrorControladores');

const IniciarSesion = async (req, res) => {
  try {
    const Resultado = await IniciarSesionServicio(req.body.NombreUsuario, req.body.Clave);
    return ResponderExito(res, 'Inicio de sesión exitoso', Resultado);
  } catch (error) {
    return ManejarError(error, res, 'Error al iniciar sesión', 401);
  }
};

const CambiarEmpresa = async (req, res) => {
  try {
    const Resultado = await CambiarEmpresaServicio(
      req.body?.CodigoEmpresa,
      req.Datos
    );
    return ResponderExito(res, 'Empresa activa cambiada correctamente.', Resultado);
  } catch (error) {
    return ManejarError(error, res, 'Error al cambiar la empresa');
  }
};

module.exports = {
  IniciarSesion,
  CambiarEmpresa
};
