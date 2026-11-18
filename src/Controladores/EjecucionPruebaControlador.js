const Servicio = require('../Servicios/EjecucionPruebaServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const ListadoResultadoEjecucion = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoResultadoEjecucion(req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los resultados de ejecución');
  }
};

const ObtenerResultadoEjecucionPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerResultadoEjecucionPorCodigo(Codigo, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener el resultado de ejecución');
  }
};

const CrearResultadoEjecucion = async (req, res) => {
  try {
    const Creado = await Servicio.CrearResultadoEjecucion(req.body, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear el resultado de ejecución');
  }
};

const EditarResultadoEjecucion = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarResultadoEjecucion(Codigo, req.body, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar el resultado de ejecución');
  }
};

const EliminarResultadoEjecucion = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarResultadoEjecucion(Codigo, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar el resultado de ejecución');
  }
};

const ListadoEjecucionPrueba = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoEjecucionPrueba(req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener las ejecuciones');
  }
};

const ObtenerEjecucionPruebaPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerEjecucionPruebaPorCodigo(Codigo, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener la ejecución');
  }
};

const CrearEjecucionPrueba = async (req, res) => {
  try {
    const Creado = await Servicio.CrearEjecucionPrueba(req.body, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear la ejecución');
  }
};

const EditarEjecucionPrueba = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarEjecucionPrueba(
      Codigo, req.body, req.query.CodigoEmpresa, req.Datos
    );
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar la ejecución');
  }
};

const EliminarEjecucionPrueba = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarEjecucionPrueba(Codigo, req.query.CodigoEmpresa, req.Datos);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar la ejecución');
  }
};

const CrearEjecucionPruebaDetalle = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Creado = await Servicio.CrearEjecucionPruebaDetalle(
      Codigo, req.body, req.query.CodigoEmpresa, req.Datos
    );
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al agregar el caso a la ejecución');
  }
};

const EditarEjecucionPruebaDetalle = async (req, res) => {
  try {
    const { Codigo, CodigoDetalle } = req.params;
    const Actualizado = await Servicio.EditarEjecucionPruebaDetalle(
      Codigo, CodigoDetalle, req.body, req.query.CodigoEmpresa, req.Datos
    );
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar el resultado del caso');
  }
};

const EliminarEjecucionPruebaDetalle = async (req, res) => {
  try {
    const { Codigo, CodigoDetalle } = req.params;
    const Eliminado = await Servicio.EliminarEjecucionPruebaDetalle(
      Codigo, CodigoDetalle, req.query.CodigoEmpresa, req.Datos
    );
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al retirar el caso de la ejecución');
  }
};

module.exports = {
  ListadoResultadoEjecucion,
  ObtenerResultadoEjecucionPorCodigo,
  CrearResultadoEjecucion,
  EditarResultadoEjecucion,
  EliminarResultadoEjecucion,
  ListadoEjecucionPrueba,
  ObtenerEjecucionPruebaPorCodigo,
  CrearEjecucionPrueba,
  EditarEjecucionPrueba,
  EliminarEjecucionPrueba,
  CrearEjecucionPruebaDetalle,
  EditarEjecucionPruebaDetalle,
  EliminarEjecucionPruebaDetalle
};
