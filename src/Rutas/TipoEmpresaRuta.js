const Express = require('express');
const Router = Express.Router();

const Modelo = 'tipoempresa';
const Tabla = 'TipoEmpresa';

const {
  Listado,
  Crear,
  ObtenerPorCodigo,
  Editar,
  Eliminar
} = require('../Controladores/TipoEmpresaControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('ListadoTipoEmpresa', Tabla), Listado);
Router.get(`/${Modelo}/:Codigo`, VerificarToken, VerificarPermisos('VerTipoEmpresa', Tabla), ObtenerPorCodigo);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('CrearTipoEmpresa', Tabla), Crear);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarTipoEmpresa', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarTipoEmpresa', Tabla), Eliminar);

module.exports = Router;
