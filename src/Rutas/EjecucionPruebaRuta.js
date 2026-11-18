const Express = require('express');
const Router = Express.Router();

const ModeloEjecucionPrueba = 'ejecucionprueba';
const ModeloResultadoEjecucion = 'resultadoejecucion';
const Tabla = 'EjecucionPrueba';

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');
const {
  ListadoResultadoEjecucion,
  ListadoEjecucionPrueba,
  ObtenerEjecucionPruebaPorCodigo,
  CrearEjecucionPrueba,
  EditarEjecucionPrueba,
  EliminarEjecucionPrueba,
  CrearEjecucionPruebaDetalle,
  EditarEjecucionPruebaDetalle,
  EliminarEjecucionPruebaDetalle
} = require('../Controladores/EjecucionPruebaControlador');

Router.get(`/${ModeloResultadoEjecucion}/listado`, VerificarToken, VerificarPermisos('ListadoResultadoEjecucion', Tabla), ListadoResultadoEjecucion);

// Rutas de EjecucionPrueba
Router.get(`/${ModeloEjecucionPrueba}/listado`, VerificarToken, VerificarPermisos('ListadoEjecucionPrueba', Tabla), ListadoEjecucionPrueba);
Router.get(`/${ModeloEjecucionPrueba}/:Codigo`, VerificarToken, VerificarPermisos('VerEjecucionPrueba', Tabla), ObtenerEjecucionPruebaPorCodigo);
Router.post(`/${ModeloEjecucionPrueba}/crear`, VerificarToken, VerificarPermisos('CrearEjecucionPrueba', Tabla), CrearEjecucionPrueba);
Router.put(`/${ModeloEjecucionPrueba}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarEjecucionPrueba', Tabla), EditarEjecucionPrueba);
Router.delete(`/${ModeloEjecucionPrueba}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarEjecucionPrueba', Tabla), EliminarEjecucionPrueba);

// Rutas de EjecucionPruebaDetalle
Router.post(`/${ModeloEjecucionPrueba}/:Codigo/detalles/crear`, VerificarToken, VerificarPermisos('CrearDetalleEjecucionPrueba', Tabla), CrearEjecucionPruebaDetalle);
Router.put(`/${ModeloEjecucionPrueba}/:Codigo/detalles/:CodigoDetalle`, VerificarToken, VerificarPermisos('EditarDetalleEjecucionPrueba', Tabla), EditarEjecucionPruebaDetalle);
Router.delete(`/${ModeloEjecucionPrueba}/:Codigo/detalles/:CodigoDetalle`, VerificarToken, VerificarPermisos('EliminarDetalleEjecucionPrueba', Tabla), EliminarEjecucionPruebaDetalle);



module.exports = Router;
