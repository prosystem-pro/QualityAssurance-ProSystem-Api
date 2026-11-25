const Express = require('express');
const Router = Express.Router();
const Modelo = 'permisorolrecurso';
const Tabla = 'PermisoRolRecurso'
const { Listado, ObtenerPorCodigo, Buscar, Crear, Editar,
    EliminarPorRol, FiltrarPermisos, FiltrarRecursos,
    FiltrarRoles, EliminarPorRolRecurso,
    EliminarPorRolRecursoPermiso, ObtenerResumenPermisos   } = require('../Controladores/PermisoRolRecursoControlador');
const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');


Router.get(`/${Modelo}/listado`,VerificarToken, VerificarPermisos('ListadoPermisoRolRecurso', Tabla), Listado);
Router.get(`/${Modelo}/:CodigoRol/:CodigoPermiso/:CodigoRecurso`, VerificarToken, VerificarPermisos('VerUnidadPermisoRolRecurso', Tabla), ObtenerPorCodigo);
Router.get(`/${Modelo}/buscar/:TipoBusqueda/:ValorBusqueda`, VerificarToken, VerificarPermisos('BuscarPermisoRolRecurso', Tabla), Buscar);
Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('CrearPermisoRolRecurso', Tabla), Crear);
Router.put(`/${Modelo}/editar`, VerificarToken, VerificarPermisos('EditarPermisoRolRecurso', Tabla), Editar);
Router.delete(`/${Modelo}/eliminar-por-rol/:CodigoRol`, VerificarToken, VerificarPermisos('EliminarRolPermisoRolRecurso', Tabla), EliminarPorRol);
Router.delete(`/${Modelo}/eliminar-por-rol-recurso/:CodigoRol/:CodigoRecurso`, VerificarToken, VerificarPermisos('EliminarRolRecurso', Tabla), EliminarPorRolRecurso);
Router.delete(`/${Modelo}/eliminar-por-rol-recurso-permiso/:CodigoRol/:CodigoRecurso/:CodigoPermiso`, VerificarToken, VerificarPermisos('EliminarRolRecursoPermiso', Tabla), EliminarPorRolRecursoPermiso);
Router.get(`/${Modelo}/filtrar-roles`, VerificarToken, VerificarPermisos('VerRol', Tabla), FiltrarRoles);
Router.get(`/${Modelo}/filtrar-recursos/:CodigoRol`, VerificarToken, VerificarPermisos('VerRecurso', Tabla), FiltrarRecursos);
Router.get(`/${Modelo}-filtrar-permisos/:CodigoRol/:CodigoRecurso`, VerificarToken, VerificarPermisos('VerRolRecurso', Tabla), FiltrarPermisos);

module.exports = Router;