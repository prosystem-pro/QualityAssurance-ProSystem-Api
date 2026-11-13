const {
  TipoPrueba,
  Prioridad,
  EstadoCaso,
  Carpeta,
  CasoPrueba
} = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const CodigoModelo = 'CodigoTipoPrueba';
const NombreModelo = 'NombreTipoPrueba';
const CodigoPrioridad = 'CodigoPrioridad';
const NombrePrioridad = 'NombrePrioridad';
const CodigoEstadoCaso = 'CodigoEstadoCaso';
const NombreEstadoCaso = 'NombreEstadoCaso';
const CodigoCarpeta = 'CodigoCarpeta';
const NombreCarpeta = 'NombreCarpeta';
const CodigoCasoPrueba = 'CodigoCasoPrueba';
const TituloCasoPrueba = 'Titulo';

// CRUD de TipoPrueba
const Listado = async () => {
  return await TipoPrueba.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const Crear = async (Datos) => {
  return await TipoPrueba.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const Eliminar = async (Codigo) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de Prioridad
const ListadoPrioridad = async () => {
  return await Prioridad.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [['Orden', 'ASC'], [NombrePrioridad, 'ASC']]
  });
};

const ObtenerPrioridadPorCodigo = async (Codigo) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearPrioridad = async (Datos) => {
  return await Prioridad.create(Datos);
};

const EditarPrioridad = async (Codigo, Datos) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarPrioridad = async (Codigo) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de EstadoCaso
const ListadoEstadoCaso = async () => {
  return await EstadoCaso.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreEstadoCaso, 'ASC']]
  });
};

const ObtenerEstadoCasoPorCodigo = async (Codigo) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearEstadoCaso = async (Datos) => {
  return await EstadoCaso.create(Datos);
};

const EditarEstadoCaso = async (Codigo, Datos) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarEstadoCaso = async (Codigo) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de Carpeta
const ListadoCarpeta = async () => {
  return await Carpeta.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [['Orden', 'ASC'], [NombreCarpeta, 'ASC']]
  });
};

const ObtenerCarpetaPorCodigo = async (Codigo) => {
  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearCarpeta = async (Datos) => {
  return await Carpeta.create(Datos);
};

const EditarCarpeta = async (Codigo, Datos) => {
  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarCarpeta = async (Codigo) => {
  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de CasoPrueba
const ListadoCasoPrueba = async () => {
  return await CasoPrueba.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[TituloCasoPrueba, 'ASC']]
  });
};

const ObtenerCasoPruebaPorCodigo = async (Codigo) => {
  const Objeto = await CasoPrueba.findOne({
    where: { [CodigoCasoPrueba]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearCasoPrueba = async (Datos) => {
  return await CasoPrueba.create(Datos);
};

const EditarCasoPrueba = async (Codigo, Datos) => {
  const Objeto = await CasoPrueba.findOne({
    where: { [CodigoCasoPrueba]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarCasoPrueba = async (Codigo) => {
  const Objeto = await CasoPrueba.findOne({
    where: { [CodigoCasoPrueba]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
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
