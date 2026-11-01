const { ObtenerPermisosPorRolYRecurso } = require('../Servicios/PermisoPorRolRecursoServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const { LanzarError } = require('../Utilidades/ErrorServicios'); 

const VerificarPermisos = (Permiso, Recurso) => {
  return async (req, res, next) => {
    try {
      const { CodigoRol, SuperAdmin } = req.Datos;

      if (SuperAdmin === 1) {
        return next();
      }

      if (!CodigoRol) {
        LanzarError('No autorizado, rol no proporcionado', 403);
      }

      const Permisos = await ObtenerPermisosPorRolYRecurso(CodigoRol, Recurso, Permiso);
      
      if (!Permisos.includes(Permiso)) {
        LanzarError('No tienes permiso para realizar esta acción', 403);
      }

      next();
    } catch (error) {
      return ManejarError(error, res, 'Error verificando permisos');
    }
  };
};

module.exports = VerificarPermisos;
