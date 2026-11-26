const Express = require('express');
const Router = Express.Router();

const Modelo = 'usuario';
const Tabla = 'Usuario';

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');
const {
  Listado,
  Crear,
  Editar,
  EditarTemaOscuro,
  Eliminar
} = require('../Controladores/UsuarioControlador');

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('ListadoUsuario', Tabla), Listado);
Router.post(`/${Modelo}/crear`, Crear);
Router.put(`/${Modelo}/tema-oscuro`, VerificarToken, EditarTemaOscuro);
Router.put(`/${Modelo}/editar/:Codigo`, VerificarToken, VerificarPermisos('EditarUsuario', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar/:Codigo`, VerificarToken, VerificarPermisos('EliminarUsuario', Tabla), Eliminar);

module.exports = Router;
