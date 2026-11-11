const Express = require('express');
const Router = Express.Router();

const Modelo = 'rol';
const Tabla = 'Rol';

const { Listado, Crear, Editar, Eliminar, ObtenerPorCodigo, Buscar } = require('../Controladores/RolControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');


Router.get(`/${Modelo}/listado`,VerificarToken, VerificarPermisos('Buscar', Tabla), Listado);
Router.get(`/${Modelo}/buscar/:TipoBusqueda/:ValorBusqueda`, VerificarToken, VerificarPermisos('Buscar', Tabla), Buscar);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('Crear', Tabla), Crear);
Router.get(`/${Modelo}/:Codigo`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerPorCodigo);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('Editar', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('Eliminar', Tabla), Eliminar);

module.exports = Router;