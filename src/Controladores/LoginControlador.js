const {
  IniciarSesionServicio,
  ObtenerRolesPorEmpresaServicio,
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

const ObtenerRolesPorEmpresa = async (req, res) => {
  try {
    const Resultado = await ObtenerRolesPorEmpresaServicio(
      req.params.CodigoEmpresa,
      req.Datos
    );
    return ResponderExito(res, 'Roles de la empresa obtenidos correctamente.', Resultado);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los roles de la empresa');
  }
};

const CambiarEmpresa = async (req, res) => {
  try {
    const Resultado = await CambiarEmpresaServicio(
      req.body?.CodigoEmpresa,
      req.body?.CodigoRol,
      req.Datos
    );
    return ResponderExito(res, 'Empresa y rol activos cambiados correctamente.', Resultado);
  } catch (error) {
    return ManejarError(error, res, 'Error al cambiar la empresa y el rol');
  }
};

module.exports = {
  IniciarSesion,
  ObtenerRolesPorEmpresa,
  CambiarEmpresa
};
