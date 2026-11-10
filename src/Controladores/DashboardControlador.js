const Servicio = require('../Servicios/DashboardServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const ObtenerEmpresas = async (req, res) => {
  try {
    const Empresas = await Servicio.ObtenerEmpresas(req.Datos);
    return ResponderExito(res, 'Empresas del usuario obtenidas correctamente.', Empresas);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener las empresas del usuario');
  }
};

module.exports = { ObtenerEmpresas };
