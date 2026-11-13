const Express = require('express');
const Router = Express.Router();

const ModeloTipoPrueba = 'casosdeuso';
const ModeloPrioridad = 'prioridad';
const ModeloEstadoCaso = 'estadocaso';
const ModeloCarpeta = 'carpeta';
const ModeloCasoPrueba = 'casoprueba';
const Tabla = 'CasosDeUso';


const {
  Listado,
  Crear,
  ObtenerPorCodigo,
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
} = require('../Controladores/CasosDeUsoControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

// Rutas de TipoPrueba
Router.get(`/${ModeloTipoPrueba}/listado`, VerificarToken, VerificarPermisos('ListadoTipoPrueba', Tabla), Listado);
Router.get(`/${ModeloTipoPrueba}/:Codigo`, VerificarToken, VerificarPermisos('VerTipoPrueba', Tabla), ObtenerPorCodigo);
Router.post(`/${ModeloTipoPrueba}/crear`, VerificarToken, VerificarPermisos('CrearTipoPrueba', Tabla), Crear);
Router.put(`/${ModeloTipoPrueba}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarTipoPrueba', Tabla), Editar);
Router.delete(`/${ModeloTipoPrueba}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarTipoPrueba', Tabla), Eliminar);

// Rutas de Prioridad
Router.get(`/${ModeloPrioridad}/listado`, VerificarToken, VerificarPermisos('ListadoPrioridad', Tabla), ListadoPrioridad);
Router.get(`/${ModeloPrioridad}/:Codigo`, VerificarToken, VerificarPermisos('VerPrioridad', Tabla), ObtenerPrioridadPorCodigo);
Router.post(`/${ModeloPrioridad}/crear`, VerificarToken, VerificarPermisos('CrearPrioridad', Tabla), CrearPrioridad);
Router.put(`/${ModeloPrioridad}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarPrioridad', Tabla), EditarPrioridad);
Router.delete(`/${ModeloPrioridad}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarPrioridad', Tabla), EliminarPrioridad);

// Rutas de EstadoCaso
Router.get(`/${ModeloEstadoCaso}/listado`, VerificarToken, VerificarPermisos('ListadoEstadoCaso', Tabla), ListadoEstadoCaso);
Router.get(`/${ModeloEstadoCaso}/:Codigo`, VerificarToken, VerificarPermisos('VerEstadoCaso', Tabla), ObtenerEstadoCasoPorCodigo);
Router.post(`/${ModeloEstadoCaso}/crear`, VerificarToken, VerificarPermisos('CrearEstadoCaso', Tabla), CrearEstadoCaso);
Router.put(`/${ModeloEstadoCaso}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarEstadoCaso', Tabla), EditarEstadoCaso);
Router.delete(`/${ModeloEstadoCaso}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarEstadoCaso', Tabla), EliminarEstadoCaso);

// Rutas de Carpeta
Router.get(`/${ModeloCarpeta}/listado`, VerificarToken, VerificarPermisos('ListadoCarpeta', Tabla), ListadoCarpeta);
Router.get(`/${ModeloCarpeta}/:Codigo`, VerificarToken, VerificarPermisos('VerCarpeta', Tabla), ObtenerCarpetaPorCodigo);
Router.post(`/${ModeloCarpeta}/crear`, VerificarToken, VerificarPermisos('CrearCarpeta', Tabla), CrearCarpeta);
Router.put(`/${ModeloCarpeta}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarCarpeta', Tabla), EditarCarpeta);
Router.delete(`/${ModeloCarpeta}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarCarpeta', Tabla), EliminarCarpeta);

// Rutas de CasoPrueba
Router.get(`/${ModeloCasoPrueba}/listado`, VerificarToken, VerificarPermisos('ListadoCasoPrueba', Tabla), ListadoCasoPrueba);
Router.get(`/${ModeloCasoPrueba}/:Codigo`, VerificarToken, VerificarPermisos('VerCasoPrueba', Tabla), ObtenerCasoPruebaPorCodigo);
Router.post(`/${ModeloCasoPrueba}/crear`, VerificarToken, VerificarPermisos('CrearCasoPrueba', Tabla), CrearCasoPrueba);
Router.put(`/${ModeloCasoPrueba}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarCasoPrueba', Tabla), EditarCasoPrueba);
Router.delete(`/${ModeloCasoPrueba}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarCasoPrueba', Tabla), EliminarCasoPrueba);

module.exports = Router;
