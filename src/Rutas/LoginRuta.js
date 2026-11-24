const Express = require("express");
const Router = Express.Router();
const {
  IniciarSesion,
  ObtenerRolesPorEmpresa,
  CambiarEmpresa
} = require("../Controladores/LoginControlador");
const VerificarToken = require("../FuncionIntermedia/VerificarToken");

Router.post("/login", IniciarSesion);
Router.get(
  "/login/empresas/:CodigoEmpresa/roles",
  VerificarToken,
  ObtenerRolesPorEmpresa
);
Router.post("/login/cambiar-empresa", VerificarToken, CambiarEmpresa);

module.exports = Router;
