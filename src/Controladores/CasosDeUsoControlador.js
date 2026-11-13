const Servicio = require('../Servicios/CasosDeUsoServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

// CRUD de TipoPrueba
const Listado = async (req, res) => {
  try {
    const Objeto = await Servicio.Listado();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
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

const Crear = async (req, res) => {
  try {
    const Creado = await Servicio.Crear(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
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

// CRUD de Prioridad
const ListadoPrioridad = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoPrioridad();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener las prioridades');
  }
};

const ObtenerPrioridadPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerPrioridadPorCodigo(Codigo);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener la prioridad');
  }
};

const CrearPrioridad = async (req, res) => {
  try {
    const Creado = await Servicio.CrearPrioridad(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear la prioridad');
  }
};

const EditarPrioridad = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarPrioridad(Codigo, req.body);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar la prioridad');
  }
};

const EliminarPrioridad = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarPrioridad(Codigo);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar la prioridad');
  }
};

// CRUD de EstadoCaso
const ListadoEstadoCaso = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoEstadoCaso();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los estados de caso');
  }
};

const ObtenerEstadoCasoPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerEstadoCasoPorCodigo(Codigo);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener el estado de caso');
  }
};

const CrearEstadoCaso = async (req, res) => {
  try {
    const Creado = await Servicio.CrearEstadoCaso(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear el estado de caso');
  }
};

const EditarEstadoCaso = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarEstadoCaso(Codigo, req.body);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar el estado de caso');
  }
};

const EliminarEstadoCaso = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarEstadoCaso(Codigo);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar el estado de caso');
  }
};

// CRUD de Carpeta
const ListadoCarpeta = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoCarpeta();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener las carpetas');
  }
};

const ObtenerCarpetaPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerCarpetaPorCodigo(Codigo);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener la carpeta');
  }
};

const CrearCarpeta = async (req, res) => {
  try {
    const Creado = await Servicio.CrearCarpeta(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear la carpeta');
  }
};

const EditarCarpeta = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarCarpeta(Codigo, req.body);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar la carpeta');
  }
};

const EliminarCarpeta = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarCarpeta(Codigo);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar la carpeta');
  }
};

// CRUD de CasoPrueba
const ListadoCasoPrueba = async (req, res) => {
  try {
    const Objeto = await Servicio.ListadoCasoPrueba();
    return ResponderExito(res, 'Listado obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los casos de prueba');
  }
};

const ObtenerCasoPruebaPorCodigo = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Objeto = await Servicio.ObtenerCasoPruebaPorCodigo(Codigo);
    return ResponderExito(res, 'Registro obtenido correctamente.', Objeto);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener el caso de prueba');
  }
};

const CrearCasoPrueba = async (req, res) => {
  try {
    const Creado = await Servicio.CrearCasoPrueba(req.body);
    return ResponderExito(res, 'Se guardó el registro exitosamente.', Creado, 201);
  } catch (error) {
    return ManejarError(error, res, 'Error al crear el caso de prueba');
  }
};

const EditarCasoPrueba = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Actualizado = await Servicio.EditarCasoPrueba(Codigo, req.body);
    return ResponderExito(res, 'Se actualizó el registro exitosamente.', Actualizado);
  } catch (error) {
    return ManejarError(error, res, 'Error al actualizar el caso de prueba');
  }
};

const EliminarCasoPrueba = async (req, res) => {
  try {
    const { Codigo } = req.params;
    const Eliminado = await Servicio.EliminarCasoPrueba(Codigo);
    return ResponderExito(res, 'Registro eliminado exitosamente.', Eliminado);
  } catch (error) {
    return ManejarError(error, res, 'Error al eliminar el caso de prueba');
  }
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Crear,
  Editar,
  Eliminar,
  ListadoPrioridad,
  ObtenerPrioridadPorCodigo,
  CrearPrioridad,
  EditarPrioridad,
  EliminarPrioridad,
  ListadoEstadoCaso,
  ObtenerEstadoCasoPorCodigo,
  CrearEstadoCaso,
  EditarEstadoCaso,
  EliminarEstadoCaso,
  ListadoCarpeta,
  ObtenerCarpetaPorCodigo,
  CrearCarpeta,
  EditarCarpeta,
  EliminarCarpeta,
  ListadoCasoPrueba,
  ObtenerCasoPruebaPorCodigo,
  CrearCasoPrueba,
  EditarCasoPrueba,
  EliminarCasoPrueba
};
