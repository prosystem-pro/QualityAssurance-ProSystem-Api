const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const { Op } = require('sequelize');
const {
  Rol: Modelo,
  Recurso,
  Permiso,
  PermisoRolRecurso
} = require('../Modelos/Relaciones');
const { ObtenerTodasLasTablasConPermisos } = require('../FuncionIntermedia/ObtenerPermisosTablas');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombreRol';
const CodigoModelo = 'CodigoRol';

const PermisosPorRecurso = {
  Dashboard: ['ListadoDashboard'],
  CasosDePrueba: [
    'ListadoTipoPrueba', 'VerTipoPrueba', 'CrearTipoPrueba', 'EditarTipoPrueba', 'EliminarTipoPrueba',
    'ListadoPrioridad', 'VerPrioridad', 'CrearPrioridad', 'EditarPrioridad', 'EliminarPrioridad',
    'ListadoEstadoCaso', 'VerEstadoCaso', 'CrearEstadoCaso', 'EditarEstadoCaso', 'EliminarEstadoCaso',
    'ListadoCarpeta', 'VerCarpeta', 'CrearCarpeta', 'EditarCarpeta', 'EliminarCarpeta',
    'ListadoCasoPrueba', 'VerCasoPrueba', 'CrearCasoPrueba', 'EditarCasoPrueba', 'EliminarCasoPrueba'
  ],
  EjecucionPrueba: [
    'ListadoResultadoEjecucion', 'VerResultadoEjecucion', 'CrearResultadoEjecucion', 'EditarResultadoEjecucion', 'EliminarResultadoEjecucion',
    'ListadoEjecucionPrueba', 'VerEjecucionPrueba', 'CrearEjecucionPrueba', 'EditarEjecucionPrueba', 'EliminarEjecucionPrueba',
    'CrearDetalleEjecucionPrueba', 'EditarDetalleEjecucionPrueba', 'EliminarDetalleEjecucionPrueba'
  ]
};

const ObtenerNombreRolValidado = (Datos) => {
  const NombreRol = typeof Datos?.NombreRol === 'string'
    ? Datos.NombreRol.trim()
    : '';
  if (!NombreRol || NombreRol.length > 64) {
    throw LanzarError('NombreRol es obligatorio y debe tener máximo 64 caracteres', 400);
  }
  return NombreRol;
};

const ObtenerRecursosSeleccionados = (Datos) => {
  const NombresRecurso = Datos?.NombresRecurso;
  if (!Array.isArray(NombresRecurso) || NombresRecurso.length === 0) {
    throw LanzarError('Debe seleccionar al menos un recurso', 400);
  }
  if (NombresRecurso.some((Nombre) => typeof Nombre !== 'string' || !Nombre.trim())) {
    throw LanzarError('Cada recurso debe tener un nombre válido', 400);
  }

  const Recursos = [...new Set(NombresRecurso.map((Nombre) => Nombre.trim()))];
  const Desconocidos = Recursos.filter(
    (Nombre) => !Object.prototype.hasOwnProperty.call(PermisosPorRecurso, Nombre)
  );
  if (Desconocidos.length > 0) {
    throw LanzarError(`Recursos no disponibles: ${Desconocidos.join(', ')}`, 400);
  }

  const CatalogoRecursos = new Map();
  for (const { Tabla, Permisos } of ObtenerTodasLasTablasConPermisos()) {
    if (!CatalogoRecursos.has(Tabla)) CatalogoRecursos.set(Tabla, new Set());
    for (const Permiso of Permisos) CatalogoRecursos.get(Tabla).add(Permiso);
  }

  for (const NombreRecurso of Recursos) {
    const PermisosDelRecurso = CatalogoRecursos.get(NombreRecurso);
    if (!PermisosDelRecurso) {
      throw LanzarError(
        `Configuración inválida: el recurso "${NombreRecurso}" no existe en las rutas`,
        500
      );
    }
    const PermisosDesconocidos = PermisosPorRecurso[NombreRecurso].filter(
      (Permiso) => !PermisosDelRecurso.has(Permiso)
    );
    if (PermisosDesconocidos.length > 0) {
      throw LanzarError(
        `Configuración inválida: permisos no definidos para "${NombreRecurso}": ${PermisosDesconocidos.join(', ')}`,
        500
      );
    }
  }

  return Recursos;
};

const ValidarNombreRolUnico = async (NombreRol, CodigoRolActual, transaction) => {
  const RolConNombre = await Modelo.findOne({
    where: { NombreRol },
    transaction
  });
  if (
    RolConNombre &&
    String(RolConNombre.CodigoRol) !== String(CodigoRolActual)
  ) {
    LanzarError('Ya existe un rol con ese nombre', 409);
  }
};

const EsErrorNombreRolDuplicado = (error) => {
  const Tipo = error?.name || error?.type;
  const Mensaje = [
    error?.message,
    error?.original?.message,
    error?.parent?.message,
    error?.sqlMensaje
  ].filter(Boolean).join(' ');

  return Tipo === 'SequelizeUniqueConstraintError' &&
    (error?.fields?.NombreRol !== undefined || Mensaje.includes('Uq_Adrol_NombreRol'));
};

const CrearAsignaciones = async (CodigoRol, Recursos, transaction) => {
  const PermisosExistentes = new Map();
  const Registros = [];

  for (const NombreRecurso of Recursos) {
    const [RecursoExistente] = await Recurso.findOrCreate({
      where: { NombreRecurso },
      defaults: { NombreRecurso, Estatus: 1 },
      transaction
    });
    if (RecursoExistente.Estatus !== 1) {
      throw LanzarError(`El recurso "${NombreRecurso}" está inactivo`, 409);
    }

    for (const NombrePermiso of PermisosPorRecurso[NombreRecurso]) {
      let PermisoExistente = PermisosExistentes.get(NombrePermiso);
      if (!PermisoExistente) {
        [PermisoExistente] = await Permiso.findOrCreate({
          where: { NombrePermiso },
          defaults: { NombrePermiso, Estatus: 1 },
          transaction
        });
        PermisosExistentes.set(NombrePermiso, PermisoExistente);
      }
      if (PermisoExistente.Estatus !== 1) {
        throw LanzarError(`El permiso "${NombrePermiso}" está inactivo`, 409);
      }

      Registros.push({
        CodigoRol,
        CodigoRecurso: RecursoExistente.CodigoRecurso,
        CodigoPermiso: PermisoExistente.CodigoPermiso,
        Estatus: 1
      });
    }
  }

  await PermisoRolRecurso.bulkCreate(Registros, {
    transaction,
    validate: true
  });
  return Registros.length;
};

const LanzarErrorNombreRolDuplicado = () => {
  LanzarError('Ya existe un rol con ese nombre', 409);
};

const Listado = async () => {
  return await Modelo.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Registro = await Modelo.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Registro) throw LanzarError('Registro no encontrado', 404);

  const Asignaciones = await PermisoRolRecurso.findAll({
    where: { CodigoRol: Registro.CodigoRol },
    attributes: ['CodigoRecurso', 'CodigoPermiso', 'Estatus'],
    include: [
      {
        model: Recurso,
        as: 'Recurso_CodigoRecurso',
        attributes: ['NombreRecurso'],
        required: true
      },
      {
        model: Permiso,
        as: 'Permiso_CodigoPermiso',
        attributes: ['NombrePermiso'],
        required: true
      }
    ],
    order: [['CodigoRecurso', 'ASC'], ['CodigoPermiso', 'ASC']]
  });

  const Recursos = new Map();
  for (const Asignacion of Asignaciones) {
    const Datos = typeof Asignacion.toJSON === 'function'
      ? Asignacion.toJSON()
      : Asignacion;
    const CodigoRecurso = Datos.CodigoRecurso;
    if (!Recursos.has(CodigoRecurso)) {
      Recursos.set(CodigoRecurso, {
        CodigoRecurso,
        NombreRecurso: Datos.Recurso_CodigoRecurso.NombreRecurso,
        Permisos: []
      });
    }
    Recursos.get(CodigoRecurso).Permisos.push({
      CodigoPermiso: Datos.CodigoPermiso,
      NombrePermiso: Datos.Permiso_CodigoPermiso.NombrePermiso,
      Estatus: Datos.Estatus
    });
  }

  const DatosRol = typeof Registro.toJSON === 'function' ? Registro.toJSON() : Registro;
  const ListaRecursos = [...Recursos.values()];
  return {
    ...DatosRol,
    NombresRecurso: ListaRecursos.map((RecursoActual) => RecursoActual.NombreRecurso),
    Recursos: ListaRecursos
  };
};

const Buscar = async (TipoBusqueda, ValorBusqueda) => {
  const Tipo = parseInt(TipoBusqueda);

  switch (Tipo) {
    case 1:
      return await Modelo.findAll({
        where: {
          [NombreModelo]: { [Op.like]: `%${ValorBusqueda}%` },
          Estatus: { [Op.in]: [1, 2] }
        },
        order: [[NombreModelo, 'ASC']]
      });
    case 2:
      return await Modelo.findAll({
        where: { Estatus: { [Op.in]: [1, 2] } },
        order: [[NombreModelo, 'ASC']]
      });
    default:
      throw LanzarError('Tipo de búsqueda no válido', 400);
  }
};

const Crear = async (Datos) => {
  const NombreRol = ObtenerNombreRolValidado(Datos);
  const RecursosSeleccionados = ObtenerRecursosSeleccionados(Datos);

  try {
    return await BaseDatos.transaction(async (transaction) => {
      await ValidarNombreRolUnico(NombreRol, undefined, transaction);
      const RolNuevo = await Modelo.create(
        { NombreRol, Estatus: 1 },
        { transaction }
      );
      const PermisosAsignados = await CrearAsignaciones(
        RolNuevo.CodigoRol,
        RecursosSeleccionados,
        transaction
      );

      return {
        mensaje: 'Rol creado y permisos asignados correctamente',
        CodigoRol: RolNuevo.CodigoRol,
        NombreRol: RolNuevo.NombreRol,
        RecursosAplicados: RecursosSeleccionados,
        RecursosAsignados: RecursosSeleccionados.length,
        PermisosAsignados
      };
    });
  } catch (error) {
    if (EsErrorNombreRolDuplicado(error)) LanzarErrorNombreRolDuplicado();
    throw error;
  }
};

const Editar = async (Codigo, Datos) => {
  const NombreRol = ObtenerNombreRolValidado(Datos);
  const RecursosSeleccionados = ObtenerRecursosSeleccionados(Datos);

  try {
    return await BaseDatos.transaction(async (transaction) => {
      const Registro = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo },
        transaction
      });
      if (!Registro) throw LanzarError('Registro no encontrado', 404);

      await ValidarNombreRolUnico(NombreRol, Registro.CodigoRol, transaction);
      const Cambios = { NombreRol };
      if (Datos.Estatus !== undefined) Cambios.Estatus = Datos.Estatus;
      await Registro.update(Cambios, { transaction });

      await PermisoRolRecurso.destroy({
        where: { CodigoRol: Registro.CodigoRol },
        transaction
      });
      const PermisosAsignados = await CrearAsignaciones(
        Registro.CodigoRol,
        RecursosSeleccionados,
        transaction
      );

      return {
        mensaje: 'Rol y permisos actualizados correctamente',
        CodigoRol: Registro.CodigoRol,
        NombreRol: Registro.NombreRol,
        RecursosAplicados: RecursosSeleccionados,
        RecursosAsignados: RecursosSeleccionados.length,
        PermisosAsignados
      };
    });
  } catch (error) {
    if (EsErrorNombreRolDuplicado(error)) LanzarErrorNombreRolDuplicado();
    throw error;
  }
};

const Eliminar = async (Codigo) => {
  const Registro = await Modelo.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Registro) throw LanzarError('Registro no encontrado', 404);
  await Registro.destroy();
  return Registro;
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Buscar,
  Crear,
  Editar,
  Eliminar
};
