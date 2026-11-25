const {
  TipoPrueba,
  Prioridad,
  EstadoCaso,
  Carpeta,
  CasoPrueba,
  CasoPruebaPaso,
  UsuarioEmpresa,
  Usuario,
  Empresa
} = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op, Transaction } = require('sequelize');
const { randomBytes } = require('crypto');

const CodigoModelo = 'CodigoTipoPrueba';
const NombreModelo = 'NombreTipoPrueba';
const CodigoPrioridad = 'CodigoPrioridad';
const NombrePrioridad = 'NombrePrioridad';
const CodigoEstadoCaso = 'CodigoEstadoCaso';
const NombreEstadoCaso = 'NombreEstadoCaso';
const CodigoCarpeta = 'CodigoCarpeta';
const NombreCarpeta = 'NombreCarpeta';
const CodigoCasoPrueba = 'CodigoCasoPrueba';
const TituloCasoPrueba = 'Titulo';
const CodigoEmpresaModelo = 'CodigoEmpresa';

const GenerarCodigoExternoTemporal = () =>
  `TMP-${randomBytes(12).toString('hex').toUpperCase()}`;

const NormalizarPasosCasoPrueba = (Pasos) => {
  if (!Array.isArray(Pasos)) {
    throw LanzarError('Los pasos deben enviarse como una lista.', 400);
  }

  const PasosNormalizados = Pasos.map((Paso, Indice) => {
    if (!Paso || typeof Paso !== 'object' || Array.isArray(Paso)) {
      throw LanzarError('Cada paso debe ser un objeto válido.', 400);
    }
    if (typeof Paso.Accion !== 'string' || Paso.Accion.trim().length === 0) {
      throw LanzarError('La acción de cada paso es obligatoria.', 400);
    }
    if (Paso.ResultadoEsperado !== undefined &&
        Paso.ResultadoEsperado !== null &&
        typeof Paso.ResultadoEsperado !== 'string') {
      throw LanzarError('El resultado esperado debe ser texto o null.', 400);
    }

    const Orden = Paso.Orden === undefined ? Indice + 1 : Number(Paso.Orden);
    if (!Number.isInteger(Orden) || Orden < 1) {
      throw LanzarError('El orden de cada paso debe ser un entero mayor que cero.', 400);
    }

    return {
      Orden,
      Accion: Paso.Accion,
      ResultadoEsperado: Paso.ResultadoEsperado ?? null
    };
  });

  PasosNormalizados.sort((PasoA, PasoB) => PasoA.Orden - PasoB.Orden);
  for (let Indice = 1; Indice < PasosNormalizados.length; Indice += 1) {
    if (PasosNormalizados[Indice - 1].Orden === PasosNormalizados[Indice].Orden) {
      throw LanzarError('No puede repetirse el orden de los pasos.', 400);
    }
  }

  return PasosNormalizados.map((Paso, Indice) => ({ ...Paso, Orden: Indice + 1 }));
};

const ValidarDatosCasoPrueba = (Datos, PlantillaActual = 1) => {
  const TipoPlantilla = Number(Datos.TipoPlantilla ?? PlantillaActual);
  if (![1, 2].includes(TipoPlantilla)) {
    throw LanzarError('El tipo de plantilla debe ser 1 (pasos) o 2 (BDD).', 400);
  }
  if (Datos.EsAutomatizado !== undefined &&
      ![true, false, 0, 1].includes(Datos.EsAutomatizado)) {
    throw LanzarError('EsAutomatizado debe ser un valor booleano.', 400);
  }
  if (Datos.TiempoEstimadoMinutos !== undefined &&
      Datos.TiempoEstimadoMinutos !== null &&
      (!Number.isInteger(Number(Datos.TiempoEstimadoMinutos)) ||
        Number(Datos.TiempoEstimadoMinutos) < 0)) {
    throw LanzarError('El tiempo estimado debe ser un entero mayor o igual a cero o null.', 400);
  }
  if (Datos.EscenarioBdd !== undefined &&
      Datos.EscenarioBdd !== null &&
      typeof Datos.EscenarioBdd !== 'string') {
    throw LanzarError('El escenario BDD debe ser texto o null.', 400);
  }
  return TipoPlantilla;
};

const ObtenerAsociacionPasosCasoPrueba = () => {
  const Asociacion = Object.values(CasoPrueba.associations || {}).find((Relacion) =>
    Relacion.target === CasoPruebaPaso &&
    Relacion.associationType === 'HasMany' &&
    Relacion.foreignKey === 'CodigoCasoPrueba'
  );
  if (!Asociacion) {
    throw LanzarError(
      'Falta la relación de CasoPrueba con CasoPruebaPaso en la base de datos. Agregue la clave foránea y regenere las relaciones.',
      500,
      'Configuracion'
    );
  }
  return Asociacion;
};

const CrearIncluirPasosCasoPrueba = () => ({
  association: ObtenerAsociacionPasosCasoPrueba(),
  separate: true,
  order: [['Orden', 'ASC']]
});

const ObtenerAsociacionUsuarioCasoPrueba = () => {
  const Asociacion = Object.values(CasoPrueba.associations || {}).find((Relacion) =>
    Relacion.target === Usuario &&
    Relacion.associationType === 'BelongsTo' &&
    Relacion.foreignKey === 'CodigoUsuario'
  );
  if (!Asociacion) {
    throw LanzarError(
      'Falta la relación generada de CasoPrueba con Usuario. Verifique la clave foránea en la base de datos y regenere las relaciones.',
      500,
      'Configuracion'
    );
  }
  return Asociacion;
};

const NormalizarCasoPruebaParaRespuesta = (Caso) => {
  if (!Caso) return Caso;

  const Asociacion = ObtenerAsociacionPasosCasoPrueba();
  const DatosCaso = typeof Caso.get === 'function'
    ? Caso.get({ plain: true })
    : { ...Caso };
  const Pasos = DatosCaso[Asociacion.as] || [];
  if (Asociacion.as !== 'Pasos') delete DatosCaso[Asociacion.as];
  DatosCaso.Pasos = Pasos;
  return DatosCaso;
};

const ValidarAccesoEmpresa = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = Number(CodigoEmpresaSolicitado);
  if (!Number.isInteger(CodigoEmpresa) || CodigoEmpresa <= 0) {
    throw LanzarError('Debe seleccionar una empresa válida.', 400);
  }

  const EmpresaActual = await Empresa.findOne({
    where: {
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: { [Op.in]: [1, 2] }
    },
    attributes: [CodigoEmpresaModelo]
  });
  if (!EmpresaActual) throw LanzarError('La empresa no existe o no está disponible.', 404);

  if (DatosUsuario?.SuperAdmin === 1) return CodigoEmpresa;

  const CodigoUsuario = Number(DatosUsuario?.CodigoUsuario);
  if (!Number.isInteger(CodigoUsuario) || CodigoUsuario <= 0) {
    throw LanzarError('El token no contiene un usuario válido.', 401);
  }
  if (Number(DatosUsuario?.CodigoEmpresa) !== CodigoEmpresa) {
    throw LanzarError('Cambie a la empresa seleccionada antes de continuar.', 403);
  }
  const [UsuarioActual, Asociacion] = await Promise.all([
    Usuario.findOne({
      where: { CodigoUsuario, Estatus: 1 },
      attributes: ['CodigoUsuario']
    }),
    UsuarioEmpresa.findOne({
      where: {
        CodigoUsuario,
        [CodigoEmpresaModelo]: CodigoEmpresa,
        Estatus: { [Op.in]: [1, 2] }
      },
      attributes: ['CodigoUsuarioEmpresa']
    })
  ]);

  if (!UsuarioActual || !Asociacion) {
    throw LanzarError('No tiene acceso a la empresa seleccionada.', 403);
  }

  return CodigoEmpresa;
};

const ValidarCarpetaDeEmpresa = async (CodigoCarpetaSolicitada, CodigoEmpresa) => {
  const CarpetaActual = await Carpeta.findOne({
    where: {
      [CodigoCarpeta]: CodigoCarpetaSolicitada,
      [CodigoEmpresaModelo]: CodigoEmpresa
    },
    attributes: [CodigoCarpeta]
  });
  if (!CarpetaActual) {
    throw LanzarError('La carpeta no existe en la empresa seleccionada.', 404);
  }
};

// CRUD de TipoPrueba
const Listado = async () => {
  return await TipoPrueba.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const Crear = async (Datos) => {
  return await TipoPrueba.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const Eliminar = async (Codigo) => {
  const Objeto = await TipoPrueba.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de Prioridad
const ListadoPrioridad = async () => {
  return await Prioridad.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [['Orden', 'ASC'], [NombrePrioridad, 'ASC']]
  });
};

const ObtenerPrioridadPorCodigo = async (Codigo) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearPrioridad = async (Datos) => {
  return await Prioridad.create(Datos);
};

const EditarPrioridad = async (Codigo, Datos) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarPrioridad = async (Codigo) => {
  const Objeto = await Prioridad.findOne({
    where: { [CodigoPrioridad]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de EstadoCaso
const ListadoEstadoCaso = async () => {
  return await EstadoCaso.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreEstadoCaso, 'ASC']]
  });
};

const ObtenerEstadoCasoPorCodigo = async (Codigo) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearEstadoCaso = async (Datos) => {
  return await EstadoCaso.create(Datos);
};

const EditarEstadoCaso = async (Codigo, Datos) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const EliminarEstadoCaso = async (Codigo) => {
  const Objeto = await EstadoCaso.findOne({
    where: { [CodigoEstadoCaso]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// CRUD de Carpeta
const OrdenarCarpetasPorJerarquia = (Carpetas) => {
  const CarpetasPorPadre = new Map();
  const CarpetasPorCodigo = new Set(
    Carpetas.map((CarpetaActual) => String(CarpetaActual[CodigoCarpeta]))
  );
  const CompararOrden = (CarpetaA, CarpetaB) =>
    CarpetaA.Orden - CarpetaB.Orden ||
    CarpetaA[NombreCarpeta].localeCompare(CarpetaB[NombreCarpeta]);

  for (const CarpetaActual of Carpetas) {
    const CodigoPadre = CarpetaActual.CodigoCarpetaPadre;
    const ClavePadre = CodigoPadre === null || CodigoPadre === undefined
      ? null
      : String(CodigoPadre);
    if (!CarpetasPorPadre.has(ClavePadre)) CarpetasPorPadre.set(ClavePadre, []);
    CarpetasPorPadre.get(ClavePadre).push(CarpetaActual);
  }

  const Raices = Carpetas.filter((CarpetaActual) => {
    const CodigoPadre = CarpetaActual.CodigoCarpetaPadre;
    return CodigoPadre === null || CodigoPadre === undefined ||
      !CarpetasPorCodigo.has(String(CodigoPadre));
  }).sort(CompararOrden);

  for (const Hijas of CarpetasPorPadre.values()) Hijas.sort(CompararOrden);

  const Ordenadas = [];
  const Visitadas = new Set();
  const Recorrer = (CarpetaInicial) => {
    const Pendientes = [CarpetaInicial];
    while (Pendientes.length > 0) {
      const CarpetaActual = Pendientes.pop();
      const CodigoActual = String(CarpetaActual[CodigoCarpeta]);
      if (Visitadas.has(CodigoActual)) continue;
      Visitadas.add(CodigoActual);
      Ordenadas.push(CarpetaActual);

      const Hijas = CarpetasPorPadre.get(CodigoActual) || [];
      for (let Indice = Hijas.length - 1; Indice >= 0; Indice -= 1) {
        Pendientes.push(Hijas[Indice]);
      }
    }
  };

  for (const Raiz of Raices) Recorrer(Raiz);
  for (const CarpetaActual of [...Carpetas].sort(CompararOrden)) {
    Recorrer(CarpetaActual);
  }

  return Ordenadas;
};

const ListadoCarpeta = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Carpetas = await Carpeta.findAll({
    where: {
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: { [Op.in]: [1, 2] }
    },
    order: [['Orden', 'ASC'], [NombreCarpeta, 'ASC']]
  });
  return OrdenarCarpetasPorJerarquia(Carpetas);
};

const ObtenerCarpetaPorCodigo = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const CrearCarpeta = async (Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoCarpetaPadre = Datos.CodigoCarpetaPadre ?? null;
  if (CodigoCarpetaPadre !== null) {
    await ValidarCarpetaDeEmpresa(CodigoCarpetaPadre, CodigoEmpresa);
  }

  return await Carpeta.sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  }, async (Transaccion) => {
    const UltimoOrden = await Carpeta.max('Orden', {
      where: { CodigoEmpresa, CodigoCarpetaPadre },
      transaction: Transaccion
    });
    const Orden = Number(UltimoOrden ?? 0) + 1;

    const CarpetaCreada = await Carpeta.create({
      ...Datos,
      CodigoCarpetaPadre,
      CodigoEmpresa,
      Orden,
      CodigoExterno: GenerarCodigoExternoTemporal()
    }, { transaction: Transaccion });
    await CarpetaCreada.update({
      CodigoExterno: `CRP-${CarpetaCreada.CodigoCarpeta}`
    }, { transaction: Transaccion });
    return CarpetaCreada;
  });
};

const EditarCarpeta = async (Codigo, Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const DatosActualizacion = { ...Datos };
  delete DatosActualizacion.CodigoExterno;
  if (Datos.Orden !== undefined) {
    if (!Number.isInteger(Datos.Orden) || Datos.Orden < 1) {
      throw LanzarError('El orden debe ser un número entero mayor que cero.', 400);
    }

    return await Carpeta.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, async (Transaccion) => {
      const Objeto = await Carpeta.findOne({
        where: { [CodigoCarpeta]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa },
        transaction: Transaccion
      });
      if (!Objeto) throw LanzarError('Registro no encontrado', 404);

      if (Datos.CodigoCarpetaPadre !== undefined &&
          String(Datos.CodigoCarpetaPadre) !== String(Objeto.CodigoCarpetaPadre)) {
        throw LanzarError('No se puede cambiar de carpeta padre al reordenar.', 400);
      }
      if (Datos.Estatus !== undefined && Number(Datos.Estatus) !== Objeto.Estatus) {
        throw LanzarError('No se puede cambiar el estatus al reordenar.', 400);
      }

      const Hermanas = await Carpeta.findAll({
        where: { CodigoEmpresa, CodigoCarpetaPadre: Objeto.CodigoCarpetaPadre },
        transaction: Transaccion
      });
      const CompararOrden = (A, B) =>
        A.Orden - B.Orden ||
        A[NombreCarpeta].localeCompare(B[NombreCarpeta]) ||
        A[CodigoCarpeta] - B[CodigoCarpeta];
      const Visibles = Hermanas.filter((CarpetaActual) =>
        CarpetaActual.Estatus === 1 || CarpetaActual.Estatus === 2
      ).sort(CompararOrden);
      const IndiceActual = Visibles.findIndex((CarpetaActual) =>
        String(CarpetaActual[CodigoCarpeta]) === String(Codigo)
      );
      if (IndiceActual === -1) {
        throw LanzarError('Solo se pueden reordenar carpetas visibles.', 400);
      }
      if (Datos.Orden > Visibles.length) {
        throw LanzarError('El orden supera el número de carpetas del mismo nivel.', 400);
      }

      const [Movida] = Visibles.splice(IndiceActual, 1);
      Visibles.splice(Datos.Orden - 1, 0, Movida);
      const Ocultas = Hermanas.filter((CarpetaActual) =>
        CarpetaActual.Estatus !== 1 && CarpetaActual.Estatus !== 2
      ).sort(CompararOrden);
      const Ordenadas = [...Visibles, ...Ocultas];

      for (let Indice = 0; Indice < Ordenadas.length; Indice += 1) {
        const CarpetaActual = Ordenadas[Indice];
        const Orden = Indice + 1;
        if (CarpetaActual === Movida) {
          await CarpetaActual.update({
            ...DatosActualizacion,
            CodigoEmpresa,
            Orden
          }, { transaction: Transaccion });
        } else if (CarpetaActual.Orden !== Orden) {
          await CarpetaActual.update({ Orden }, { transaction: Transaccion });
        }
      }
      return Movida;
    });
  }

  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  if (Datos.CodigoCarpetaPadre !== null && Datos.CodigoCarpetaPadre !== undefined) {
    await ValidarCarpetaDeEmpresa(Datos.CodigoCarpetaPadre, CodigoEmpresa);
  }
  await Objeto.update({ ...DatosActualizacion, CodigoEmpresa });
  return Objeto;
};

const EliminarCarpeta = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Objeto = await Carpeta.findOne({
    where: { [CodigoCarpeta]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

// Operaciones de casos de prueba
const ListadoCasoPrueba = async (CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const AsociacionUsuario = ObtenerAsociacionUsuarioCasoPrueba();
  const Casos = await CasoPrueba.findAll({
    where: {
      [CodigoEmpresaModelo]: CodigoEmpresa,
      Estatus: { [Op.in]: [1, 2] }
    },
    include: [
      CrearIncluirPasosCasoPrueba(),
      { association: AsociacionUsuario, attributes: ['NombreUsuario'], required: false }
    ],
    order: [[TituloCasoPrueba, 'ASC']]
  });
  return Casos.map((Caso) => {
    const DatosCaso = NormalizarCasoPruebaParaRespuesta(Caso);
    const UsuarioCreador = DatosCaso[AsociacionUsuario.as];
    DatosCaso.NombreUsuario = UsuarioCreador ? UsuarioCreador.NombreUsuario : null;
    delete DatosCaso[AsociacionUsuario.as];
    return DatosCaso;
  });
};

const ObtenerCasoPruebaPorCodigo = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Objeto = await CasoPrueba.findOne({
    where: { [CodigoCasoPrueba]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa },
    include: [CrearIncluirPasosCasoPrueba()]
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return NormalizarCasoPruebaParaRespuesta(Objeto);
};

const CrearCasoPrueba = async (Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const CodigoUsuario = Number(DatosUsuario?.CodigoUsuario);
  if (!Number.isInteger(CodigoUsuario) || CodigoUsuario <= 0) {
    throw LanzarError('No se puede asociar el caso de prueba al usuario autenticado.', 401);
  }
  await ValidarCarpetaDeEmpresa(Datos.CodigoCarpeta, CodigoEmpresa);
  const TipoPlantilla = ValidarDatosCasoPrueba(Datos);
  const Pasos = TipoPlantilla === 1
    ? NormalizarPasosCasoPrueba(Datos.Pasos ?? [])
    : [];
  const DatosCaso = {
    ...Datos,
    TipoPlantilla,
    CodigoEmpresa,
    CodigoUsuario,
    CodigoExterno: GenerarCodigoExternoTemporal()
  };
  delete DatosCaso.Pasos;
  DatosCaso.EscenarioBdd = TipoPlantilla === 1 ? null : (Datos.EscenarioBdd ?? null);
  if (Datos.EsAutomatizado !== undefined) {
    DatosCaso.EsAutomatizado = Boolean(Datos.EsAutomatizado);
  }
  if (Datos.TiempoEstimadoMinutos !== undefined &&
      Datos.TiempoEstimadoMinutos !== null) {
    DatosCaso.TiempoEstimadoMinutos = Number(Datos.TiempoEstimadoMinutos);
  }

  return await CasoPrueba.sequelize.transaction(async (Transaccion) => {
    const Creado = await CasoPrueba.create(DatosCaso, { transaction: Transaccion });
    await Creado.update({
      CodigoExterno: `CP-${Creado.CodigoCasoPrueba}`
    }, { transaction: Transaccion });
    if (Pasos.length > 0) {
      await CasoPruebaPaso.bulkCreate(Pasos.map((Paso) => ({
        ...Paso,
        CodigoCasoPrueba: Creado.CodigoCasoPrueba
      })), { transaction: Transaccion });
    }
    const CasoCreado = await CasoPrueba.findOne({
      where: { [CodigoCasoPrueba]: Creado.CodigoCasoPrueba },
      include: [CrearIncluirPasosCasoPrueba()],
      transaction: Transaccion
    });
    return NormalizarCasoPruebaParaRespuesta(CasoCreado);
  });
};

const EditarCasoPrueba = async (Codigo, Datos, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  if (Datos.CodigoCarpeta !== undefined) {
    await ValidarCarpetaDeEmpresa(Datos.CodigoCarpeta, CodigoEmpresa);
  }

  return await CasoPrueba.sequelize.transaction(async (Transaccion) => {
    const Objeto = await CasoPrueba.findOne({
      where: { [CodigoCasoPrueba]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa },
      transaction: Transaccion
    });
    if (!Objeto) throw LanzarError('Registro no encontrado', 404);

    const TipoPlantilla = ValidarDatosCasoPrueba(Datos, Objeto.TipoPlantilla);
    const PasosFueronEnviados = Object.prototype.hasOwnProperty.call(Datos, 'Pasos');
    const Pasos = TipoPlantilla === 1 && PasosFueronEnviados
      ? NormalizarPasosCasoPrueba(Datos.Pasos)
      : [];
    const DatosActualizar = {
      ...Datos,
      TipoPlantilla,
      CodigoEmpresa,
      CodigoUsuario: Objeto.CodigoUsuario
    };
    delete DatosActualizar.Pasos;
    delete DatosActualizar.CodigoExterno;
    if (TipoPlantilla === 1) DatosActualizar.EscenarioBdd = null;
    if (Datos.EsAutomatizado !== undefined) {
      DatosActualizar.EsAutomatizado = Boolean(Datos.EsAutomatizado);
    }
    if (Datos.TiempoEstimadoMinutos !== undefined &&
        Datos.TiempoEstimadoMinutos !== null) {
      DatosActualizar.TiempoEstimadoMinutos = Number(Datos.TiempoEstimadoMinutos);
    }

    await Objeto.update(DatosActualizar, { transaction: Transaccion });

    if (TipoPlantilla === 2 || PasosFueronEnviados) {
      await CasoPruebaPaso.destroy({
        where: { [CodigoCasoPrueba]: Objeto.CodigoCasoPrueba },
        transaction: Transaccion
      });
      if (Pasos.length > 0) {
        await CasoPruebaPaso.bulkCreate(Pasos.map((Paso) => ({
          ...Paso,
          CodigoCasoPrueba: Objeto.CodigoCasoPrueba
        })), { transaction: Transaccion });
      }
    }

    const CasoActualizado = await CasoPrueba.findOne({
      where: { [CodigoCasoPrueba]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa },
      include: [CrearIncluirPasosCasoPrueba()],
      transaction: Transaccion
    });
    return NormalizarCasoPruebaParaRespuesta(CasoActualizado);
  });
};

const EliminarCasoPrueba = async (Codigo, CodigoEmpresaSolicitado, DatosUsuario) => {
  const CodigoEmpresa = await ValidarAccesoEmpresa(CodigoEmpresaSolicitado, DatosUsuario);
  const Objeto = await CasoPrueba.findOne({
    where: { [CodigoCasoPrueba]: Codigo, [CodigoEmpresaModelo]: CodigoEmpresa }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Crear,
  Editar,
  Eliminar,
  ListadoPrioridad,
  ObtenerPrioridadPorCodigo,
  CrearPrioridad,
  EditarPrioridad,
  EliminarPrioridad,
  ListadoEstadoCaso,
  ObtenerEstadoCasoPorCodigo,
  CrearEstadoCaso,
  EditarEstadoCaso,
  EliminarEstadoCaso,
  ListadoCarpeta,
  ObtenerCarpetaPorCodigo,
  CrearCarpeta,
  EditarCarpeta,
  EliminarCarpeta,
  ListadoCasoPrueba,
  ObtenerCasoPruebaPorCodigo,
  CrearCasoPrueba,
  EditarCasoPrueba,
  EliminarCasoPrueba
};
