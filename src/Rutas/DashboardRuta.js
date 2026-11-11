const Express = require('express');
const Router = Express.Router();

const { ObtenerEmpresas } = require('../Controladores/DashboardControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

const Tabla = 'UsuarioEmpresa';

Router.get('/dashboard/empresas',VerificarToken,VerificarPermisos('ListadoDashboard', Tabla),ObtenerEmpresas);

module.exports = Router;
