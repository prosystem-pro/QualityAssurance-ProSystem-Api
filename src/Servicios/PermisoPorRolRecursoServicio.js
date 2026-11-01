const { PermisoRolRecurso, Permiso, Recurso } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const ObtenerPermisosPorRolYRecurso = async (CodigoRol, NombreRecurso, NombrePermiso) => {

  const recursoData = await Recurso.findOne({ where: { NombreRecurso } });
  if (!recursoData) {
    throw LanzarError(`El recurso "${NombreRecurso}" no existe.`, 404, 'Alerta');
  }
  if (recursoData.Estatus !== 1) {
    throw LanzarError(`El recurso "${NombreRecurso}" está inactivo.`, 403, 'Alerta');
  }

  const permisoData = await Permiso.findOne({ where: { NombrePermiso } });
  if (!permisoData) {
    throw LanzarError(`El permiso "${NombrePermiso}" no existe.`, 404, 'Alerta');
  }
  if (permisoData.Estatus !== 1) {
    throw LanzarError(`El permiso "${NombrePermiso}" está inactivo.`, 403, 'Alerta');
  }

  const relacion = await PermisoRolRecurso.findOne({
    where: {
      CodigoRol,
      CodigoRecurso: recursoData.CodigoRecurso,
      CodigoPermiso: permisoData.CodigoPermiso
    }
  });
  if (!relacion) {
    throw LanzarError('No tienes asignado este permiso.', 404, 'Alerta');
  }
  if (relacion.Estatus !== 1) {
    throw LanzarError('El permiso asignado está inactivo.', 403, 'Alerta');
  }

  const existeRol = await PermisoRolRecurso.findOne({
    where: { CodigoRol, Estatus: 1 }
  });
  if (!existeRol) {
    throw LanzarError(`El rol "${CodigoRol}" no existe o está inactivo.`, 404, 'Alerta');
  }


  const asignaciones = await PermisoRolRecurso.findAll({
    where: { CodigoRol, Estatus: 1 },
    include: [
      {
        model: Permiso,
        as: 'Permiso_CodigoPermiso', 
        attributes: ['NombrePermiso', 'Estatus'],
        where: { Estatus: 1 },
        required: true
      },
      {
        model: Recurso,
        as: 'Recurso_CodigoRecurso', 
        attributes: ['NombreRecurso', 'Estatus'],
        where: { NombreRecurso, Estatus: 1 },
        required: true
      }
    ]
  });

  if (!asignaciones || asignaciones.length === 0) {
    throw LanzarError(`No se encontraron permisos para el rol ${CodigoRol} y recurso ${NombreRecurso}`, 404, 'Alerta');
  }

  return asignaciones.map(reg => reg.Permiso_CodigoPermiso.NombrePermiso);
};

module.exports = { ObtenerPermisosPorRolYRecurso };
