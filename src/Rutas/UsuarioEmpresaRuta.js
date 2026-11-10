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

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('Listado', Tabla), Listado);
Router.get(`/${Modelo}/:Codigo`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerPorCodigo);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('Crear', Tabla), Crear);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('Editar', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('Eliminar', Tabla), Eliminar);

module.exports = Router;
