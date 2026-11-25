const Express = require("express");
const Router = Express.Router();
const { IniciarSesion, CambiarEmpresa } = require("../Controladores/LoginControlador");
const VerificarToken = require("../FuncionIntermedia/VerificarToken");

Router.post("/login", IniciarSesion);
Router.post("/login/cambiar-empresa", VerificarToken, CambiarEmpresa);

module.exports = Router;
