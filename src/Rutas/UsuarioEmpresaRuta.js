const Express = require('express');
const Router = Express.Router();

const Modelo = 'usuarioempresa';
const Tabla = 'UsuarioEmpresa';

const {
  Listado,
  Crear,
  ObtenerPorCodigo,
  Editar,
  Eliminar
} = require('../Controladores/UsuarioEmpresaControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('ListadoUsuarioEmpresa', Tabla), Listado);
Router.get(`/${Modelo}/:Codigo`, VerificarToken, VerificarPermisos('VerUsuarioEmpresa', Tabla), ObtenerPorCodigo);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('CrearUsuarioEmpresa', Tabla), Crear);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarUsuarioEmpresa', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarUsuarioEmpresa', Tabla), Eliminar);

module.exports = Router;
