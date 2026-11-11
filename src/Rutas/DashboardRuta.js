const Express = require('express');
const Router = Express.Router();

const { ObtenerEmpresas } = require('../Controladores/DashboardControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

const Tabla = 'Dashboard';

Router.get('/dashboard/empresas',VerificarToken,VerificarPermisos('ListadoDashboard', 'UsuarioEmpresa'),ObtenerEmpresas);

module.exports = Router;
