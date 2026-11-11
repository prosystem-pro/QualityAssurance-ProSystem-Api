const Express = require('express');
const Router = Express.Router();

const Modelo = 'rol';
const Tabla = 'Rol';

const { Listado, Crear, Editar, Eliminar, ObtenerPorCodigo, Buscar } = require('../Controladores/RolControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');


Router.get(`/${Modelo}/listado`,VerificarToken, VerificarPermisos('ListadoRol', Tabla), Listado);
Router.get(`/${Modelo}/buscar/:TipoBusqueda/:ValorBusqueda`, VerificarToken, VerificarPermisos('BuscarRol', Tabla), Buscar);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('CrearRol', Tabla), Crear);
Router.get(`/${Modelo}/:Codigo`, VerificarToken, VerificarPermisos('VerUnidadRol', Tabla), ObtenerPorCodigo);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarRol', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarRol', Tabla), Eliminar);

module.exports = Router;