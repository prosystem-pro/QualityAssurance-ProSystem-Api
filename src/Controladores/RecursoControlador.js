const Servicio = require('../Servicios/RecursoServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const Listado = async (req, res) => {
  try {
    const Objeto = await Servicio.Listado();
    return ResponderExito(res, 'Registros obtenidos correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los registros');
  }
};

const ObtenerPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerPorCodigo(Codigo);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener el registro');
  }
};

const Buscar = async (req, res) => {
  try {
    const { TipoBusqueda, ValorBusqueda } = req.params;
    const Objeto = await Servicio.Buscar(TipoBusqueda, ValorBusqueda);
    return ResponderExito(res, 'Búsqueda realizada correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al realizar la búsqueda');
  }
};

const Crear = async (req, res) => {
  try {
    const Creado = await Servicio.Crear(req.body);
    const Mensaje = Array.isArray(req.body)
      ? 'Se guardaron los registros exitosamente.'
      : 'Se guardó el registro exitosamente.';
    return ResponderExito(res, Mensaje, Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear el registro');
  }
};

const Editar = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.Editar(Codigo, req.body);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar el registro');
  }
};

const Eliminar = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.Eliminar(Codigo);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar el registro');
  }
};

const EliminarEnLote = async (req, res) => {
  try {
    const CantidadEliminada = await Servicio.EliminarEnLote(req.body);
    return ResponderExito(
      res,
      `Se eliminaron ${CantidadEliminada} recursos exitosamente.`,
      { CantidadEliminada }
    );
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar los recursos');
  }
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Buscar,
  Crear,
  Editar,
  Eliminar,
  EliminarEnLote
};
