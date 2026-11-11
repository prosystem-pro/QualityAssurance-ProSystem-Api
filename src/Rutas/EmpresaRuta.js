const Express = require('express');
const Router = Express.Router();

const Modelo = 'empresa';
const Tabla = 'Empresa';

const { Listado, Crear, Editar, Eliminar } = require('../Controladores/EmpresaControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado`,VerificarToken, VerificarPermisos('ListadoEmpresa', Tabla), Listado);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('CrearEmpresa', Tabla), Crear);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarEmpresa', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarEmpresa', Tabla), Eliminar);

module.exports = Router;