const Servicio = require('../Servicios/EmpresaServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const Listado = async (req, res) => {
  try {
    const Objeto = await Servicio.Listado();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los registros');
  }
};

const Crear = async (req, res) => {
  try {
    const Creado = await Servicio.Crear(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear el registro');
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

module.exports = { 
  Listado, 
  Crear, 
  ObtenerPorCodigo, 
  Editar, 
  Eliminar 
};
