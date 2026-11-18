const {
  EjecucionPrueba,
  EjecucionPruebaDetalle,
  EjecucionPruebaPaso,
  ResultadoEjecucion,
  CasoPrueba,
  CasoPruebaPaso,
  Carpeta,
  Empresa,
  UsuarioEmpresa,
  Usuario
} = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');
const { randomBytes } = require('crypto');

const CodigoEmpresaModelo = 'CodigoEmpresa';
const ResultadoNoEjecutado = 4;
const EstatusVisibles = { [Op.in]: [1, 2] };

const GenerarCodigoExternoTemporal = () =>
  `TMP-${randomBytes(12).toString('hex').toUpperCase()}`;

const ObtenerAsociacion = (Modelo, Destino, Tipo, LlaveForanea) => {
  const Asociacion = Object.values(Modelo.associations || {}).find((Relacion) =>
    Relacion.target === Destino &&
    Relacion.associationType === Tipo &&
    Relacion.foreignKey === LlaveForanea
  );
  if (!Asociacion) {
    throw LanzarError(
      `Falta la relación generada ${Modelo.name}.${LlaveForanea}. Verifique la clave foránea en la base de datos y regenere las relaciones.`,
      500,
      'Configuracion'
    );
  }
  return Asociacion;
};

const AsociacionDetalles = () => ObtenerAsociacion(
  EjecucionPrueba, EjecucionPruebaDetalle, 'HasMany', 'CodigoEjecucionPrueba'
);
const AsociacionPasos = () => ObtenerAsociacion(
  EjecucionPruebaDetalle, EjecucionPruebaPaso, 'HasMany', 'CodigoEjecucionPruebaDetalle'
);
const AsociacionCaso = () => ObtenerAsociacion(
  EjecucionPruebaDetalle, CasoPrueba, 'BelongsTo', 'CodigoCasoPrueba'
);
const AsociacionCarpetaCaso = () => ObtenerAsociacion(
  CasoPrueba, Carpeta, 'BelongsTo', 'CodigoCarpeta'
);
const AsociacionResultadoDetalle = () => ObtenerAsociacion(
  EjecucionPruebaDetalle, ResultadoEjecucion, 'BelongsTo', 'CodigoResultado'
);
const AsociacionResultadoPaso = () => ObtenerAsociacion(
  EjecucionPruebaPaso, ResultadoEjecucion, 'BelongsTo', 'CodigoResultado'
);
const AsociacionUsuarioDetalle = () => ObtenerAsociacion(
  EjecucionPruebaDetalle, Usuario, 'BelongsTo', 'CodigoUsuario'
);
const AsociacionCasoPaso = () => ObtenerAsociacion(
  EjecucionPruebaPaso, CasoPruebaPaso, 'BelongsTo', 'CodigoCasoPruebaPaso'
);
const AsociacionUsuario = () => ObtenerAsociacion(
  EjecucionPrueba, Usuario, 'BelongsTo', 'CodigoUsuario'
);

const CrearIncludesDetalle = () => [
  {
    association: AsociacionCaso(),
    attributes: ['CodigoCasoPrueba', 'CodigoExterno', 'Titulo', 'CodigoCarpeta'],
    required: false,
    include: [{
      association: AsociacionCarpetaCaso(),
      attributes: ['CodigoCarpeta', 'NombreCarpeta', 'CodigoCarpetaPadre', 'CodigoExterno'],
      required: false
    }]
  },
  {
    association: AsociacionResultadoDetalle(),
    attributes: ['CodigoResultado', 'Nombre'],
    required: false
  },
  {
    association: AsociacionUsuarioDetalle(),
    attributes: ['NombreUsuario'],
    required: false
  },
  {
    association: AsociacionPasos(),
    separate: true,
    where: { Estatus: 1 },
    order: [['Orden', 'ASC']],
    include: [
      {
        association: AsociacionCasoPaso(),
        attributes: ['CodigoCasoPruebaPaso', 'Orden', 'Accion', 'ResultadoEsperado'],
        required: false
      },
      {
        association: AsociacionResultadoPaso(),
        attributes: ['CodigoResultado', 'Nombre'],
        required: false
      }
    ]
  }
];

const ObtenerCodigoUsuarioAutenticado = (DatosUsuario) => {
  const CodigoUsuario = Number(DatosUsuario?.CodigoUsuario);
  if (!Number.isInteger(CodigoUsuario) || CodigoUsuario <= 0) {
    throw LanzarError('El token no contiene un usuario válido para registrar la ejecución.', 401);
  }
  return CodigoUsuario;
};

const ValidarAccesoEmpresa = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = Number(CodigoEmpresaSolicitado);
  if (!Number.isInteger(CodigoEmpresa) || CodigoEmpresa <= 0) {
    throw LanzarError('Debe seleccionar una empresa válida.', 400);
  }

  const EmpresaActual = await Empresa.findOne({
    where: { [CodigoEmpresaModelo]: CodigoEmpresa, Estatus: EstatusVisibles },
    attributes: [CodigoEmpresaModelo]
  });
  if (!EmpresaActual) throw LanzarError('La empresa no existe o no está disponible.', 404);
  if (DatosUsuario?.SuperAdmin === 1) return CodigoEmpresa;

  const CodigoUsuario = ObtenerCodigoUsuarioAutenticado(DatosUsuario);
  const [UsuarioActual, Asociacion] = await Promise.all([
    Usuario.findOne({
      where: { CodigoUsuario, Estatus: 1 },
      attributes: ['CodigoUsuario']
    }),
    UsuarioEmpresa.findOne({
      where: {
        CodigoUsuario,
        [CodigoEmpresaModelo]: CodigoEmpresa,
        Estatus: EstatusVisibles
      },
      attributes: ['CodigoUsuarioEmpresa']
    })
  ]);
  if (!UsuarioActual || !Asociacion) {
    throw LanzarError('No tiene acceso a la empresa seleccionada.', 403);
  }
  return CodigoEmpresa;
};

const ValidarEntero = (Valor, Nombre, Minimo = 1) => {
  const Numero = Number(Valor);
  if (!Number.isInteger(Numero) || Numero < Minimo) {
    throw LanzarError(`${Nombre} debe ser un entero mayor o igual a ${Minimo}.`, 400);
  }
  return Numero;
};

const ValidarTextoOpcional = (Valor, Nombre) => {
  if (Valor !== undefined && Valor !== null && typeof Valor !== 'string') {
    throw LanzarError(`${Nombre} debe ser texto o null.`, 400);
  }
};

const ObtenerFecha = (Valor, Nombre) => {
  if (Valor === undefined) return undefined;
  if (Valor === null) return null;
  const Fecha = new Date(Valor);
  if (Number.isNaN(Fecha.getTime())) {
    throw LanzarError(`${Nombre} debe ser una fecha válida.`, 400);
  }
  return Fecha;
};

const ValidarResultado = async (CodigoResultado, Transaccion) => {
  const Codigo = ValidarEntero(CodigoResultado, 'CodigoResultado');
  const Resultado = await ResultadoEjecucion.findOne({
    where: { CodigoResultado: Codigo, Estatus: EstatusVisibles },
    transaction: Transaccion
  });
  if (!Resultado) throw LanzarError('El resultado de ejecución no existe o no está activo.', 400);
  return Codigo;
};

const CrearIncludesEjecucion = () => {
  const AsociacionDetalle = AsociacionDetalles();
  const AsociacionUsuarioActual = AsociacionUsuario();

  return [
    {
      association: AsociacionUsuarioActual,
      attributes: ['NombreUsuario'],
      required: false
    },
    {
      association: AsociacionDetalle,
      separate: true,
      where: { Estatus: 1 },
      include: CrearIncludesDetalle()
    }
  ];
};

const APlan = (Instancia) =>
  Instancia && typeof Instancia.get === 'function'
    ? Instancia.get({ plain: true })
    : Instancia;

const NormalizarDetalle = (Instancia) => {
  const Detalle = APlan(Instancia);
  if (!Detalle) return Detalle;
  const Caso = AsociacionCaso();
  const Resultado = AsociacionResultadoDetalle();
  const UsuarioDetalle = AsociacionUsuarioDetalle();
  const Pasos = AsociacionPasos();
  const ClaveCaso = Detalle[Caso.as];
  const ClaveResultado = Detalle[Resultado.as];
  const ClaveUsuario = Detalle[UsuarioDetalle.as];
  const ClavePasos = Detalle[Pasos.as] || [];

  delete Detalle[Caso.as];
  delete Detalle[Resultado.as];
  delete Detalle[UsuarioDetalle.as];
  delete Detalle[Pasos.as];
  if (ClaveCaso) {
    const CarpetaCaso = AsociacionCarpetaCaso();
    const DatosCarpeta = ClaveCaso[CarpetaCaso.as];
    delete ClaveCaso[CarpetaCaso.as];
    ClaveCaso.Carpeta = DatosCarpeta || null;
  }
  Detalle.CasoPrueba = ClaveCaso || null;
  Detalle.Resultado = ClaveResultado || null;
  Detalle.NombreUsuario = ClaveUsuario?.NombreUsuario ?? null;
  Detalle.Pasos = ClavePasos.map((InstanciaPaso) => {
    const Paso = APlan(InstanciaPaso);
    const CasoPaso = AsociacionCasoPaso();
    const ResultadoPaso = AsociacionResultadoPaso();
    const DefinicionPaso = Paso[CasoPaso.as];
    const ResultadoActual = Paso[ResultadoPaso.as];
    delete Paso[CasoPaso.as];
    delete Paso[ResultadoPaso.as];
    Paso.PasoOriginal = DefinicionPaso || null;
    Paso.Resultado = ResultadoActual || null;
    return Paso;
  });
  return Detalle;
};

const NormalizarEjecucion = (Instancia) => {
  const Ejecucion = APlan(Instancia);
  if (!Ejecucion) return Ejecucion;
  const Detalles = AsociacionDetalles();
  const UsuarioActual = AsociacionUsuario();
  const NombreUsuario = Ejecucion[UsuarioActual.as]?.NombreUsuario ?? null;
  const DatosDetalles = Ejecucion[Detalles.as] || [];
  delete Ejecucion[Detalles.as];
  delete Ejecucion[UsuarioActual.as];
  Ejecucion.NombreUsuario = NombreUsuario;
  Ejecucion.Detalles = DatosDetalles.map(NormalizarDetalle);
  return Ejecucion;
};

const ObtenerEjecucion = async (Codigo, CodigoEmpresa, Transaccion) => {
  const Ejecucion = await EjecucionPrueba.findOne({
    where: {
      CodigoEjecucionPrueba: Codigo,
      [CodigoEmpresaModelo]: CodigoEmpresa
    },
    include: CrearIncludesEjecucion(),
    transaction: Transaccion
  });
  if (!Ejecucion) throw LanzarError('Ejecución de prueba no encontrada.', 404);
  return NormalizarEjecucion(Ejecucion);
};

const ListadoResultadoEjecucion = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  return ResultadoEjecucion.findAll({
    where: { Estatus: 1 },
    order: [['CodigoResultado', 'ASC']]
  });
};

const ObtenerResultadoEjecucionPorCodigo = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Resultado = await ResultadoEjecucion.findOne({
    where: { CodigoResultado: ValidarEntero(Codigo, 'Codigo') }
  });
  if (!Resultado) throw LanzarError('Resultado de ejecución no encontrado.', 404);
  return Resultado;
};

const PrepararDatosResultado = (Datos, EsCreacion) => {
  const DatosValidos = {};
  if (EsCreacion || Datos.Nombre !== undefined) {
    if (typeof Datos.Nombre !== 'string' || Datos.Nombre.trim().length === 0 ||
        Datos.Nombre.trim().length > 32) {
      throw LanzarError('El nombre del resultado es obligatorio (máximo 32 caracteres).', 400);
    }
    DatosValidos.Nombre = Datos.Nombre.trim();
  }
  if (Datos.Descripcion !== undefined) {
    ValidarTextoOpcional(Datos.Descripcion, 'Descripcion');
    if (Datos.Descripcion && Datos.Descripcion.length > 256) {
      throw LanzarError('La descripción no puede superar 256 caracteres.', 400);
    }
    DatosValidos.Descripcion = Datos.Descripcion;
  }
  if (Datos.Estatus !== undefined) {
    if (![0, 1].includes(Number(Datos.Estatus))) {
      throw LanzarError('Estatus debe ser 1 (activo) o 0 (inactivo).', 400);
    }
    DatosValidos.Estatus = Number(Datos.Estatus);
  }
  return DatosValidos;
};

const GuardarResultado = async (Accion) => {
  try {
    return await Accion();
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw LanzarError('Ya existe un resultado con ese nombre.', 409);
    }
    throw error;
  }
};

const CrearResultadoEjecucion = async (Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const DatosCrear = PrepararDatosResultado(Datos || {}, true);
  return GuardarResultado(() => ResultadoEjecucion.create(DatosCrear));
};

const EditarResultadoEjecucion = async (Codigo, Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const Resultado = await ObtenerResultadoEjecucionPorCodigo(
    Codigo, CodigoEmpresaSolicitado, DatosUsuario
  );
  const DatosActualizar = PrepararDatosResultado(Datos || {}, false);
  await GuardarResultado(() => Resultado.update(DatosActualizar));
  return Resultado;
};

const EliminarResultadoEjecucion = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const Resultado = await ObtenerResultadoEjecucionPorCodigo(
    Codigo, CodigoEmpresaSolicitado, DatosUsuario
  );
  try {
    await Resultado.destroy();
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw LanzarError(
        'No se puede eliminar el resultado porque ya está siendo usado en ejecuciones.',
        409
      );
    }
    throw error;
  }
  return Resultado;
};

const ListadoEjecucionPrueba = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Ejecuciones = await EjecucionPrueba.findAll({
    where: {
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: 1
    },
    include: CrearIncludesEjecucion(),
    order: [['FechaCreacion', 'DESC']]
  });
  return Ejecuciones.map(NormalizarEjecucion);
};

const ObtenerEjecucionPruebaPorCodigo = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  return ObtenerEjecucion(ValidarEntero(Codigo, 'Codigo'), CodigoEmpresa);
};

const CrearEjecucionPrueba = async (Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoUsuario = ObtenerCodigoUsuarioAutenticado(DatosUsuario);
  if (typeof Datos.NombreEjecucionPrueba !== 'string' ||
    Datos.NombreEjecucionPrueba.trim().length === 0) {
    throw LanzarError('El nombre de la ejecución es obligatorio.', 400);
  }
  ValidarTextoOpcional(Datos.Descripcion, 'Descripcion');
  ValidarTextoOpcional(Datos.ObservacionesGenerales, 'ObservacionesGenerales');

  const DatosCrear = {
    CodigoEmpresa,
    CodigoUsuario,
    NombreEjecucionPrueba: Datos.NombreEjecucionPrueba.trim(),
    CodigoExterno: GenerarCodigoExternoTemporal()
  };
  for (const Campo of ['Descripcion', 'ObservacionesGenerales']) {
    if (Datos[Campo] !== undefined) DatosCrear[Campo] = Datos[Campo];
  }
  if (Datos.CodigoEstadoEjecucion !== undefined) {
    const Estado = ValidarEntero(Datos.CodigoEstadoEjecucion, 'CodigoEstadoEjecucion');
    if (![1, 2].includes(Estado)) {
      throw LanzarError('CodigoEstadoEjecucion debe ser 1 (En progreso) o 2 (Finalizada).', 400);
    }
    DatosCrear.CodigoEstadoEjecucion = Estado;
    if (Estado === 2) DatosCrear.FechaEjecucion = new Date();
  }

  const FechaEjecucion = ObtenerFecha(Datos.FechaEjecucion, 'FechaEjecucion');
  if (FechaEjecucion !== undefined) DatosCrear.FechaEjecucion = FechaEjecucion;
  const Creada = await EjecucionPrueba.sequelize.transaction(async (Transaccion) => {
    const Nueva = await EjecucionPrueba.create(DatosCrear, { transaction: Transaccion });
    await Nueva.update({
      CodigoExterno: `EJP-${Nueva.CodigoEjecucionPrueba}`
    }, { transaction: Transaccion });
    return Nueva;
  });
  return ObtenerEjecucion(Creada.CodigoEjecucionPrueba, CodigoEmpresa);
};

const EditarEjecucionPrueba = async (
  CodigoSolicitado, Datos, CodigoEmpresaSolicitado, DatosUsuario
) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Codigo = ValidarEntero(CodigoSolicitado, 'Codigo');
  const Ejecucion = await EjecucionPrueba.findOne({
    where: { CodigoEjecucionPrueba: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa }
  });
  if (!Ejecucion) throw LanzarError('Ejecución de prueba no encontrada.', 404);

  const DatosActualizar = {};
  if (Datos.NombreEjecucionPrueba !== undefined) {
    if (typeof Datos.NombreEjecucionPrueba !== 'string' ||
      Datos.NombreEjecucionPrueba.trim().length === 0) {
      throw LanzarError('El nombre de la ejecución es obligatorio.', 400);
    }
    DatosActualizar.NombreEjecucionPrueba = Datos.NombreEjecucionPrueba.trim();
  }
  for (const Campo of ['Descripcion', 'ObservacionesGenerales']) {
    if (Datos[Campo] !== undefined) {
      ValidarTextoOpcional(Datos[Campo], Campo);
      DatosActualizar[Campo] = Datos[Campo];
    }
  }
  if (Datos.CodigoEstadoEjecucion !== undefined) {
    const Estado = ValidarEntero(Datos.CodigoEstadoEjecucion, 'CodigoEstadoEjecucion');
    if (![1, 2].includes(Estado)) {
      throw LanzarError('CodigoEstadoEjecucion debe ser 1 (En progreso) o 2 (Finalizada).', 400);
    }
    DatosActualizar.CodigoEstadoEjecucion = Estado;
    if (Estado === 2 && Datos.FechaEjecucion === undefined) {
      DatosActualizar.FechaEjecucion = new Date();
    }
  }
  const FechaEjecucion = ObtenerFecha(Datos.FechaEjecucion, 'FechaEjecucion');
  if (FechaEjecucion !== undefined) DatosActualizar.FechaEjecucion = FechaEjecucion;
  await Ejecucion.update({ ...DatosActualizar, FechaUltimaModificacion: new Date() });
  return ObtenerEjecucion(Codigo, CodigoEmpresa);
};

const EliminarEjecucionPrueba = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Ejecucion = await EjecucionPrueba.findOne({
    where: {
      CodigoEjecucionPrueba: ValidarEntero(Codigo, 'Codigo'),
      [CodigoEmpresaModelo]: CodigoEmpresa
    }
  });
  if (!Ejecucion) throw LanzarError('Ejecución de prueba no encontrada.', 404);
  await Ejecucion.destroy();
  return Ejecucion;
};

const ValidarEjecucionEnProgreso = async (Codigo, CodigoEmpresa, Transaccion) => {
  const Ejecucion = await EjecucionPrueba.findOne({
    where: {
      CodigoEjecucionPrueba: Codigo,
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: 1
    },
    transaction: Transaccion
  });
  if (!Ejecucion) throw LanzarError('Ejecución de prueba no encontrada.', 404);
  if (Ejecucion.CodigoEstadoEjecucion !== 1) {
    throw LanzarError('No se pueden cambiar detalles de una ejecución finalizada.', 409);
  }
  return Ejecucion;
};

const NormalizarPasosEjecucion = async (Pasos, CodigoCasoPrueba, Transaccion) => {
  if (Pasos === undefined) return [];
  if (!Array.isArray(Pasos)) throw LanzarError('Pasos debe ser una lista.', 400);
  if (Pasos.length === 0) return [];

  const PasosValidos = Pasos.map((Paso) => {
    if (!Paso || typeof Paso !== 'object' || Array.isArray(Paso)) {
      throw LanzarError('Cada resultado de paso debe ser un objeto válido.', 400);
    }
    return {
      CodigoCasoPruebaPaso: ValidarEntero(Paso.CodigoCasoPruebaPaso, 'CodigoCasoPruebaPaso'),
      Orden: ValidarEntero(Paso.Orden, 'Orden'),
      CodigoResultado: Paso.CodigoResultado,
      AccionRealizada: Paso.AccionRealizada ?? null,
      ResultadoObtenido: Paso.ResultadoObtenido ?? null,
      Comentario: Paso.Comentario ?? null
    };
  });
  const CodigosPaso = PasosValidos.map((Paso) => Paso.CodigoCasoPruebaPaso);
  if (new Set(CodigosPaso).size !== CodigosPaso.length) {
    throw LanzarError('No se puede repetir un paso en el mismo detalle.', 400);
  }
  const PasosOriginales = await CasoPruebaPaso.findAll({
    where: {
      CodigoCasoPrueba,
      CodigoCasoPruebaPaso: { [Op.in]: CodigosPaso }
    },
    transaction: Transaccion
  });
  const PasosPorCodigo = new Map(PasosOriginales.map((Paso) =>
    [Paso.CodigoCasoPruebaPaso, Paso]
  ));
  if (PasosPorCodigo.size !== CodigosPaso.length) {
    throw LanzarError('Uno o más pasos no pertenecen al caso de prueba seleccionado.', 400);
  }

  const Normalizados = [];
  for (const Paso of PasosValidos) {
    const Original = PasosPorCodigo.get(Paso.CodigoCasoPruebaPaso);
    if (Original.Orden !== Paso.Orden) {
      throw LanzarError('El orden debe coincidir con el paso original del caso de prueba.', 400);
    }
    ValidarTextoOpcional(Paso.AccionRealizada, 'AccionRealizada');
    ValidarTextoOpcional(Paso.ResultadoObtenido, 'ResultadoObtenido');
    ValidarTextoOpcional(Paso.Comentario, 'Comentario');
    Normalizados.push({
      ...Paso,
      CodigoResultado: await ValidarResultado(Paso.CodigoResultado, Transaccion)
    });
  }
  return Normalizados;
};

const CrearDatosEjecucionPaso = (Pasos, CodigoEjecucionPruebaDetalle) =>
  Pasos.map((Paso) => ({
    ...Paso,
    CodigoEjecucionPruebaDetalle
  }));

const ValidarCasoEnEmpresa = async (CodigoCasoPrueba, CodigoEmpresa, Transaccion) => {
  const Caso = await CasoPrueba.findOne({
    where: {
      CodigoCasoPrueba,
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: EstatusVisibles
    },
    transaction: Transaccion
  });
  if (!Caso) throw LanzarError('El caso de prueba no existe en la empresa seleccionada.', 404);
  return Caso;
};

const ValidarDatosDetalle = (Datos) => {
  ValidarTextoOpcional(Datos.Comentario, 'Comentario');
  ValidarTextoOpcional(Datos.ResultadoReal, 'ResultadoReal');
  ValidarTextoOpcional(Datos.EnlaceDefecto, 'EnlaceDefecto');
  const Tiempo = Datos.TiempoEjecucionSegundos === undefined ||
    Datos.TiempoEjecucionSegundos === null
    ? Datos.TiempoEjecucionSegundos
    : ValidarEntero(Datos.TiempoEjecucionSegundos, 'TiempoEjecucionSegundos', 0);
  return Tiempo;
};

const CrearEjecucionPruebaDetalle = async (
  Codigo, Datos, CodigoEmpresaSolicitado, DatosUsuario
) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoEjecucionPrueba = ValidarEntero(Codigo, 'Codigo');
  const CodigoUsuario = ObtenerCodigoUsuarioAutenticado(DatosUsuario);

  return EjecucionPrueba.sequelize.transaction(async (Transaccion) => {
    await ValidarEjecucionEnProgreso(CodigoEjecucionPrueba, CodigoEmpresa, Transaccion);
    const CodigoCasoPrueba = ValidarEntero(Datos.CodigoCasoPrueba, 'CodigoCasoPrueba');
    const Caso = await ValidarCasoEnEmpresa(CodigoCasoPrueba, CodigoEmpresa, Transaccion);
    const Existente = await EjecucionPruebaDetalle.findOne({
      where: {
        CodigoEjecucionPrueba,
        CodigoCasoPrueba,
        Estatus: 1
      },
      transaction: Transaccion
    });
    if (Existente) {
      throw LanzarError('Este caso de prueba ya está agregado a la ejecución.', 409);
    }
    const CodigoResultado = await ValidarResultado(
      Datos.CodigoResultado ?? ResultadoNoEjecutado, Transaccion
    );
    const TiempoEjecucionSegundos = ValidarDatosDetalle(Datos);
    const Pasos = await NormalizarPasosEjecucion(Datos.Pasos, CodigoCasoPrueba, Transaccion);
    const Detalle = await EjecucionPruebaDetalle.create({
      CodigoEjecucionPrueba,
      CodigoCasoPrueba,
      CodigoResultado,
      CodigoUsuario,
      Comentario: Datos.Comentario ?? null,
      ResultadoReal: Datos.ResultadoReal ?? null,
      TiempoEjecucionSegundos: TiempoEjecucionSegundos ?? null,
      EnlaceDefecto: Datos.EnlaceDefecto ?? null
    }, { transaction: Transaccion });

    if (Pasos.length > 0) {
      await EjecucionPruebaPaso.bulkCreate(
        CrearDatosEjecucionPaso(Pasos, Detalle.CodigoEjecucionPruebaDetalle),
        { transaction: Transaccion }
      );
    }
    const DetalleCreado = await EjecucionPruebaDetalle.findOne({
      where: { CodigoEjecucionPruebaDetalle: Detalle.CodigoEjecucionPruebaDetalle },
      include: CrearIncludesDetalle(),
      transaction: Transaccion
    });
    const DatosDetalle = NormalizarDetalle(DetalleCreado);
    if (!DatosDetalle.CasoPrueba) {
      DatosDetalle.CasoPrueba = {
        CodigoCasoPrueba: Caso.CodigoCasoPrueba,
        CodigoExterno: Caso.CodigoExterno,
        Titulo: Caso.Titulo
      };
    }
    return DatosDetalle;
  });
};

const EditarEjecucionPruebaDetalle = async (
  Codigo, CodigoDetalle, Datos, CodigoEmpresaSolicitado, DatosUsuario
) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoEjecucionPrueba = ValidarEntero(Codigo, 'Codigo');
  const CodigoEjecucionPruebaDetalle = ValidarEntero(CodigoDetalle, 'CodigoDetalle');
  const CodigoUsuario = ObtenerCodigoUsuarioAutenticado(DatosUsuario);

  return EjecucionPrueba.sequelize.transaction(async (Transaccion) => {
    await ValidarEjecucionEnProgreso(CodigoEjecucionPrueba, CodigoEmpresa, Transaccion);
    const Detalle = await EjecucionPruebaDetalle.findOne({
      where: { CodigoEjecucionPruebaDetalle, CodigoEjecucionPrueba, Estatus: 1 },
      transaction: Transaccion
    });
    if (!Detalle) throw LanzarError('El detalle no pertenece a esta ejecución.', 404);

    const DatosActualizar = { CodigoUsuario, FechaUltimaModificacion: new Date() };
    if (Datos.CodigoResultado !== undefined) {
      DatosActualizar.CodigoResultado = await ValidarResultado(
        Datos.CodigoResultado, Transaccion
      );
    }
    if (Datos.Comentario !== undefined) {
      ValidarTextoOpcional(Datos.Comentario, 'Comentario');
      DatosActualizar.Comentario = Datos.Comentario;
    }
    if (Datos.ResultadoReal !== undefined) {
      ValidarTextoOpcional(Datos.ResultadoReal, 'ResultadoReal');
      DatosActualizar.ResultadoReal = Datos.ResultadoReal;
    }
    if (Datos.EnlaceDefecto !== undefined) {
      ValidarTextoOpcional(Datos.EnlaceDefecto, 'EnlaceDefecto');
      DatosActualizar.EnlaceDefecto = Datos.EnlaceDefecto;
    }
    if (Datos.TiempoEjecucionSegundos !== undefined) {
      DatosActualizar.TiempoEjecucionSegundos =
        Datos.TiempoEjecucionSegundos === null
          ? null
          : ValidarEntero(Datos.TiempoEjecucionSegundos, 'TiempoEjecucionSegundos', 0);
    }
    await Detalle.update(DatosActualizar, { transaction: Transaccion });

    if (Object.prototype.hasOwnProperty.call(Datos, 'Pasos')) {
      const Caso = await ValidarCasoEnEmpresa(Detalle.CodigoCasoPrueba, CodigoEmpresa, Transaccion);
      const Pasos = await NormalizarPasosEjecucion(
        Datos.Pasos, Caso.CodigoCasoPrueba, Transaccion
      );
      await EjecucionPruebaPaso.destroy({
        where: { CodigoEjecucionPruebaDetalle },
        transaction: Transaccion
      });
      if (Pasos.length > 0) {
        await EjecucionPruebaPaso.bulkCreate(
          CrearDatosEjecucionPaso(Pasos, CodigoEjecucionPruebaDetalle),
          { transaction: Transaccion }
        );
      }
    }
    const DetalleActualizado = await EjecucionPruebaDetalle.findOne({
      where: { CodigoEjecucionPruebaDetalle },
      include: CrearIncludesDetalle(),
      transaction: Transaccion
    });
    return NormalizarDetalle(DetalleActualizado);
  });
};

const EliminarEjecucionPruebaDetalle = async (
  Codigo, CodigoDetalle, CodigoEmpresaSolicitado, DatosUsuario
) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoEjecucionPrueba = ValidarEntero(Codigo, 'Codigo');
  const CodigoEjecucionPruebaDetalle = ValidarEntero(CodigoDetalle, 'CodigoDetalle');
  return EjecucionPrueba.sequelize.transaction(async (Transaccion) => {
    await ValidarEjecucionEnProgreso(CodigoEjecucionPrueba, CodigoEmpresa, Transaccion);
    const Detalle = await EjecucionPruebaDetalle.findOne({
      where: { CodigoEjecucionPruebaDetalle, CodigoEjecucionPrueba, Estatus: 1 },
      transaction: Transaccion
    });
    if (!Detalle) throw LanzarError('El detalle no pertenece a esta ejecución.', 404);
    await Detalle.destroy({ transaction: Transaccion });
    return Detalle;
  });
};

const ValidarListaCodigos = (Lista, Nombre) => {
  if (Lista === undefined || Lista === null) return [];
  if (!Array.isArray(Lista)) throw LanzarError(`${Nombre} debe ser una lista.`, 400);
  return [...new Set(Lista.map((Codigo) => ValidarEntero(Codigo, Nombre)))];
};

const ObtenerCodigosCarpetaConSubcarpetas = async (CodigosCarpeta, CodigoEmpresa, Transaccion) => {
  const Encontradas = await Carpeta.findAll({
    where: {
      CodigoCarpeta: { [Op.in]: CodigosCarpeta },
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: EstatusVisibles
    },
    attributes: ['CodigoCarpeta'],
    transaction: Transaccion
  });
  if (Encontradas.length !== CodigosCarpeta.length) {
    throw LanzarError('Una o más carpetas no existen en la empresa seleccionada.', 404);
  }

  const Todas = new Set(CodigosCarpeta);
  let Pendientes = [...CodigosCarpeta];
  while (Pendientes.length > 0) {
    const Hijas = await Carpeta.findAll({
      where: {
        CodigoCarpetaPadre: { [Op.in]: Pendientes },
        [CodigoEmpresaModelo]: CodigoEmpresa,
        Estatus: EstatusVisibles
      },
      attributes: ['CodigoCarpeta'],
      transaction: Transaccion
    });
    Pendientes = Hijas
      .map((Hija) => Hija.CodigoCarpeta)
      .filter((Codigo) => !Todas.has(Codigo));
    Pendientes.forEach((Codigo) => Todas.add(Codigo));
  }
  return [...Todas];
};

const CrearEjecucionPruebaDetalleMultiple = async (
  Codigo, Datos, CodigoEmpresaSolicitado, DatosUsuario
) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoEjecucionPrueba = ValidarEntero(Codigo, 'Codigo');
  const CodigoUsuario = ObtenerCodigoUsuarioAutenticado(DatosUsuario);
  const CodigosCarpeta = ValidarListaCodigos(Datos?.CodigosCarpeta, 'CodigosCarpeta');
  const CodigosCasoIndividuales = ValidarListaCodigos(
    Datos?.CodigosCasoPrueba, 'CodigosCasoPrueba'
  );
  if (CodigosCarpeta.length === 0 && CodigosCasoIndividuales.length === 0) {
    throw LanzarError('Debe enviar CodigosCarpeta y/o CodigosCasoPrueba.', 400);
  }
  const IncluirSubcarpetas = Datos?.IncluirSubcarpetas !== false;

  return EjecucionPrueba.sequelize.transaction(async (Transaccion) => {
    await ValidarEjecucionEnProgreso(CodigoEjecucionPrueba, CodigoEmpresa, Transaccion);
    const CodigoResultado = await ValidarResultado(
      Datos.CodigoResultado ?? ResultadoNoEjecutado, Transaccion
    );

    const CodigosCasoTotales = new Set(CodigosCasoIndividuales);
    if (CodigosCasoIndividuales.length > 0) {
      const Individuales = await CasoPrueba.findAll({
        where: {
          CodigoCasoPrueba: { [Op.in]: CodigosCasoIndividuales },
          [CodigoEmpresaModelo]: CodigoEmpresa,
          Estatus: EstatusVisibles
        },
        attributes: ['CodigoCasoPrueba'],
        transaction: Transaccion
      });
      if (Individuales.length !== CodigosCasoIndividuales.length) {
        throw LanzarError('Uno o más casos de prueba no existen en la empresa seleccionada.', 404);
      }
    }
    if (CodigosCarpeta.length > 0) {
      const CarpetasObjetivo = IncluirSubcarpetas
        ? await ObtenerCodigosCarpetaConSubcarpetas(CodigosCarpeta, CodigoEmpresa, Transaccion)
        : CodigosCarpeta;
      const CasosCarpeta = await CasoPrueba.findAll({
        where: {
          CodigoCarpeta: { [Op.in]: CarpetasObjetivo },
          [CodigoEmpresaModelo]: CodigoEmpresa,
          Estatus: EstatusVisibles
        },
        attributes: ['CodigoCasoPrueba'],
        transaction: Transaccion
      });
      CasosCarpeta.forEach((Caso) => CodigosCasoTotales.add(Caso.CodigoCasoPrueba));
    }

    const CodigosSolicitados = [...CodigosCasoTotales];
    const Existentes = CodigosSolicitados.length === 0 ? [] : await EjecucionPruebaDetalle.findAll({
      where: {
        CodigoEjecucionPrueba,
        CodigoCasoPrueba: { [Op.in]: CodigosSolicitados },
        Estatus: 1
      },
      attributes: ['CodigoCasoPrueba'],
      transaction: Transaccion
    });
    const YaAgregados = new Set(Existentes.map((Detalle) => Detalle.CodigoCasoPrueba));
    const CodigosNuevos = CodigosSolicitados.filter((Caso) => !YaAgregados.has(Caso));

    if (CodigosNuevos.length > 0) {
      await EjecucionPruebaDetalle.bulkCreate(CodigosNuevos.map((CodigoCasoPrueba) => ({
        CodigoEjecucionPrueba,
        CodigoCasoPrueba,
        CodigoResultado,
        CodigoUsuario
      })), { transaction: Transaccion });
    }
    const Creados = CodigosNuevos.length === 0 ? [] : await EjecucionPruebaDetalle.findAll({
      where: {
        CodigoEjecucionPrueba,
        CodigoCasoPrueba: { [Op.in]: CodigosNuevos },
        Estatus: 1
      },
      include: CrearIncludesDetalle(),
      transaction: Transaccion
    });
    return {
      TotalCreados: Creados.length,
      TotalOmitidos: YaAgregados.size,
      CodigosCasoOmitidos: [...YaAgregados],
      Creados: Creados.map(NormalizarDetalle)
    };
  });
};

module.exports = {
  CrearEjecucionPruebaDetalleMultiple,
  ListadoResultadoEjecucion,
  ObtenerResultadoEjecucionPorCodigo,
  CrearResultadoEjecucion,
  EditarResultadoEjecucion,
  EliminarResultadoEjecucion,
  ListadoEjecucionPrueba,
  ObtenerEjecucionPruebaPorCodigo,
  CrearEjecucionPrueba,
  EditarEjecucionPrueba,
  EliminarEjecucionPrueba,
  CrearEjecucionPruebaDetalle,
  EditarEjecucionPruebaDetalle,
  EliminarEjecucionPruebaDetalle
};
