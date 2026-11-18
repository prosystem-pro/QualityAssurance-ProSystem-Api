const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const CrearModelo = (name) => ({ name, associations: {} });
const EjecucionPrueba = CrearModelo('EjecucionPrueba');
const EjecucionPruebaDetalle = CrearModelo('EjecucionPruebaDetalle');
const EjecucionPruebaPaso = CrearModelo('EjecucionPruebaPaso');
const ResultadoEjecucion = CrearModelo('ResultadoEjecucion');
const CasoPrueba = CrearModelo('CasoPrueba');
const CasoPruebaPaso = CrearModelo('CasoPruebaPaso');
const Carpeta = CrearModelo('Carpeta');
const Empresa = CrearModelo('Empresa');
const UsuarioEmpresa = CrearModelo('UsuarioEmpresa');
const Usuario = CrearModelo('Usuario');

const Asociar = (origen, destino, associationType, foreignKey, as) => {
  origen.associations[as] = {
    source: origen,
    target: destino,
    associationType,
    foreignKey,
    as
  };
};

Asociar(EjecucionPrueba, EjecucionPruebaDetalle, 'HasMany',
  'CodigoEjecucionPrueba', 'EjecucionPruebaDetalle_CodigoEjecucionPrueba');
Asociar(EjecucionPruebaDetalle, EjecucionPruebaPaso, 'HasMany',
  'CodigoEjecucionPruebaDetalle', 'EjecucionPruebaPaso_CodigoEjecucionPruebaDetalle');
Asociar(EjecucionPruebaDetalle, CasoPrueba, 'BelongsTo',
  'CodigoCasoPrueba', 'CasoPrueba_CodigoCasoPrueba');
Asociar(EjecucionPruebaDetalle, ResultadoEjecucion, 'BelongsTo',
  'CodigoResultado', 'ResultadoEjecucion_CodigoResultado');
Asociar(EjecucionPruebaDetalle, Usuario, 'BelongsTo',
  'CodigoUsuario', 'Usuario_CodigoUsuario');
Asociar(EjecucionPruebaPaso, ResultadoEjecucion, 'BelongsTo',
  'CodigoResultado', 'ResultadoEjecucion_CodigoResultado');
Asociar(EjecucionPruebaPaso, CasoPruebaPaso, 'BelongsTo',
  'CodigoCasoPruebaPaso', 'CasoPruebaPaso_CodigoCasoPruebaPaso');
Asociar(CasoPrueba, Carpeta, 'BelongsTo',
  'CodigoCarpeta', 'Carpeta_CodigoCarpeta');
Asociar(EjecucionPrueba, Usuario, 'BelongsTo',
  'CodigoUsuario', 'Usuario_CodigoUsuario');

const ConvertirAInstancia = (registro) => ({
  ...registro,
  get() {
    return { ...registro };
  },
  async update(datos) {
    Object.assign(registro, datos);
    Object.assign(this, datos);
  },
  async destroy() {
    registro.eliminado = true;
  }
});

let datosEjecuciones = [];
let datosDetalles = [];
let datosPasos = [];
let resultados = [];
let casos = [];
let pasosOriginales = [];
let siguienteEjecucion = 100;
let siguienteDetalle = 200;
let empresaActiva = true;
let opcionesCatalogo;

const EjecutarTransaccion = async (ejecutar) =>
  ejecutar({ id: 'transaccion-prueba' });

EjecucionPrueba.sequelize = { transaction: EjecutarTransaccion };
EjecucionPrueba.create = async (datos) => {
  const registro = { ...datos, CodigoEjecucionPrueba: siguienteEjecucion++ };
  datosEjecuciones.push(registro);
  return ConvertirAInstancia(registro);
};
EjecucionPrueba.findOne = async ({ where }) => {
  const registro = datosEjecuciones.find((actual) =>
    actual.CodigoEjecucionPrueba === where.CodigoEjecucionPrueba &&
    actual.CodigoEmpresa === where.CodigoEmpresa
  );
  if (!registro) return null;
  return ConvertirAInstancia({
    ...registro,
    Usuario_CodigoUsuario: { NombreUsuario: 'qa.user' },
    EjecucionPruebaDetalle_CodigoEjecucionPrueba: []
  });
};
EjecucionPrueba.findAll = async ({ where }) =>
  datosEjecuciones.filter((actual) =>
    actual.CodigoEmpresa === where.CodigoEmpresa &&
    (where.Estatus === undefined || [1, 2].includes(actual.Estatus))
  ).map((registro) => ConvertirAInstancia({
    ...registro,
    Usuario_CodigoUsuario: { NombreUsuario: 'qa.user' },
    EjecucionPruebaDetalle_CodigoEjecucionPrueba: []
  }));

EjecucionPruebaDetalle.sequelize = EjecucionPrueba.sequelize;
EjecucionPruebaDetalle.findOne = async ({ where }) =>
  datosDetalles.find((actual) =>
    actual.CodigoEjecucionPruebaDetalle === where.CodigoEjecucionPruebaDetalle &&
    (where.CodigoEjecucionPrueba === undefined ||
      actual.CodigoEjecucionPrueba === where.CodigoEjecucionPrueba)
  ) || null;
EjecucionPruebaDetalle.create = async (datos) => {
  const registro = {
    ...datos,
    CodigoEjecucionPruebaDetalle: siguienteDetalle++
  };
  datosDetalles.push(registro);
  return ConvertirAInstancia(registro);
};

EjecucionPruebaPaso.bulkCreate = async (datos) => {
  datosPasos.push(...datos);
  return datos;
};

ResultadoEjecucion.findAll = async (opciones) => {
  opcionesCatalogo = opciones;
  return resultados.filter((resultado) => resultado.Estatus === opciones.where.Estatus);
};
ResultadoEjecucion.findOne = async ({ where }) => {
  const estatusPermitidos = where.Estatus[require('sequelize').Op.in];
  return resultados.find((resultado) =>
    resultado.CodigoResultado === where.CodigoResultado &&
    estatusPermitidos.includes(resultado.Estatus)
  ) || null;
};

Empresa.findOne = async () => empresaActiva ? { CodigoEmpresa: 7 } : null;
Usuario.findOne = async () => ({ CodigoUsuario: 44 });
UsuarioEmpresa.findOne = async () => ({ CodigoUsuarioEmpresa: 1 });
CasoPrueba.findOne = async ({ where }) =>
  casos.find((caso) =>
    caso.CodigoCasoPrueba === where.CodigoCasoPrueba &&
    caso.CodigoEmpresa === where.CodigoEmpresa
  ) || null;
CasoPruebaPaso.findAll = async ({ where }) =>
  pasosOriginales.filter((paso) =>
    paso.CodigoCasoPrueba === where.CodigoCasoPrueba &&
    where.CodigoCasoPruebaPaso[require('sequelize').Op.in].includes(paso.CodigoCasoPruebaPaso)
  );

const relaciones = {
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
};
const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('EjecucionPruebaServicio.js') &&
      solicitud === '../Modelos/Relaciones') {
    return relaciones;
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/EjecucionPruebaServicio');
Module._load = cargarOriginal;

const admin = { SuperAdmin: 1, CodigoUsuario: 44 };
const reiniciarDatos = () => {
  datosEjecuciones = [];
  datosDetalles = [];
  datosPasos = [];
  resultados = [
    { CodigoResultado: 1, Nombre: 'PASA', Estatus: 1 },
    { CodigoResultado: 2, Nombre: 'FALLA', Estatus: 1 },
    { CodigoResultado: 3, Nombre: 'INACTIVO', Estatus: 0 }
  ];
  casos = [];
  pasosOriginales = [];
  siguienteEjecucion = 100;
  siguienteDetalle = 200;
  empresaActiva = true;
  opcionesCatalogo = undefined;
};

test('el catálogo devuelve solo resultados activos y valida acceso a empresa', async () => {
  reiniciarDatos();
  const catalogo = await servicio.ListadoResultadoEjecucion(7, admin);
  assert.deepEqual(catalogo.map((resultado) => resultado.Nombre), ['PASA', 'FALLA']);
  assert.equal(opcionesCatalogo.where.Estatus, 1);
  empresaActiva = false;
  await assert.rejects(servicio.ListadoResultadoEjecucion(7, admin), { statusCode: 404 });
});

test('crea encabezado con empresa y usuario autenticado, no con los valores del cliente', async () => {
  reiniciarDatos();
  const ejecucion = await servicio.CrearEjecucionPrueba({
    CodigoEmpresa: 999,
    CodigoUsuario: 999,
    NombreEjecucionPrueba: 'Release 1.5',
    CodigoEstadoEjecucion: 2,
    CodigoExterno: 'EXTERNO-CLIENTE'
  }, 7, admin);

  assert.equal(ejecucion.CodigoExterno, 'EJP-100');
  assert.equal(ejecucion.CodigoEmpresa, 7);
  assert.equal(ejecucion.CodigoUsuario, 44);
  assert.equal(ejecucion.CodigoEstadoEjecucion, 2);
  assert.ok(ejecucion.FechaEjecucion instanceof Date);
  assert.equal(ejecucion.NombreUsuario, 'qa.user');
  assert.deepEqual(ejecucion.Detalles, []);
});

test('rechaza detalles de casos de otra empresa y resultados fuera del catálogo activo', async () => {
  reiniciarDatos();
  datosEjecuciones = [{
    CodigoEjecucionPrueba: 100,
    CodigoEmpresa: 7,
    CodigoEstadoEjecucion: 1
  }];
  casos = [{
    CodigoCasoPrueba: 10,
    CodigoEmpresa: 8,
    Titulo: 'Caso de otra empresa'
  }];

  await assert.rejects(servicio.CrearEjecucionPruebaDetalle(100, {
    CodigoCasoPrueba: 10,
    CodigoResultado: 1
  }, 7, admin), { statusCode: 404 });

  casos = [{ CodigoCasoPrueba: 10, CodigoEmpresa: 7, Titulo: 'Caso válido' }];
  await assert.rejects(servicio.CrearEjecucionPruebaDetalle(100, {
    CodigoCasoPrueba: 10,
    CodigoResultado: 3
  }, 7, admin), { statusCode: 400 });
  assert.equal(datosDetalles.length, 0);
});

test('registra resultado del caso y pasos originales sin aceptar un paso de otro caso', async () => {
  reiniciarDatos();
  datosEjecuciones = [{
    CodigoEjecucionPrueba: 100,
    CodigoEmpresa: 7,
    CodigoEstadoEjecucion: 1
  }];
  casos = [{ CodigoCasoPrueba: 10, CodigoEmpresa: 7, Titulo: 'Caso válido' }];
  pasosOriginales = [{
    CodigoCasoPruebaPaso: 30,
    CodigoCasoPrueba: 10,
    Orden: 1
  }];

  const detalle = await servicio.CrearEjecucionPruebaDetalle(100, {
    CodigoCasoPrueba: 10,
    CodigoResultado: 1,
    CodigoUsuario: 999,
    Pasos: [{
      CodigoCasoPruebaPaso: 30,
      Orden: 1,
      CodigoResultado: 2
    }]
  }, 7, admin);

  assert.equal(detalle.CodigoUsuario, 44);
  assert.equal(datosPasos[0].CodigoEjecucionPruebaDetalle, detalle.CodigoEjecucionPruebaDetalle);
  assert.equal(datosPasos[0].CodigoResultado, 2);

  await assert.rejects(servicio.CrearEjecucionPruebaDetalle(100, {
    CodigoCasoPrueba: 10,
    CodigoResultado: 1,
    Pasos: [{
      CodigoCasoPruebaPaso: 31,
      Orden: 1,
      CodigoResultado: 1
    }]
  }, 7, admin), { statusCode: 400 });
});

test('administra el catálogo de resultados con nombre único y sin enviar estatus inválido', async () => {
  reiniciarDatos();
  const findOneOriginal = ResultadoEjecucion.findOne;
  const createOriginal = ResultadoEjecucion.create;
  ResultadoEjecucion.findOne = async ({ where }) => {
    const encontrado = resultados.find((r) => r.CodigoResultado === where.CodigoResultado);
    return encontrado ? ConvertirAInstancia(encontrado) : null;
  };
  ResultadoEjecucion.create = async (datos) => {
    if (resultados.some((r) => r.Nombre === datos.Nombre)) {
      const error = new Error('duplicado');
      error.name = 'SequelizeUniqueConstraintError';
      throw error;
    }
    const nuevo = { CodigoResultado: 10, Estatus: 1, ...datos };
    resultados.push(nuevo);
    return ConvertirAInstancia(nuevo);
  };
  try {
    const creado = await servicio.CrearResultadoEjecucion({ Nombre: '  OMITIDO  ' }, 7, admin);
    assert.equal(creado.Nombre, 'OMITIDO');
    await assert.rejects(servicio.CrearResultadoEjecucion({ Nombre: 'PASA' }, 7, admin), { statusCode: 409 });
    await assert.rejects(servicio.CrearResultadoEjecucion({}, 7, admin), { statusCode: 400 });
    await assert.rejects(servicio.EditarResultadoEjecucion(10, { Estatus: 5 }, 7, admin), { statusCode: 400 });
    const editado = await servicio.EditarResultadoEjecucion(10, { Estatus: 0 }, 7, admin);
    assert.equal(editado.Estatus, 0);
    await assert.rejects(servicio.EliminarResultadoEjecucion(999, 7, admin), { statusCode: 404 });
  } finally {
    ResultadoEjecucion.findOne = findOneOriginal;
    ResultadoEjecucion.create = createOriginal;
  }
});

test('agrega en bloque los casos de una carpeta con subcarpetas y casos sueltos, omitiendo repetidos', async () => {
  reiniciarDatos();
  const originales = {
    ejecucionFindOne: EjecucionPrueba.findOne,
    casoFindAll: CasoPrueba.findAll,
    carpetaFindAll: Carpeta.findAll,
    detalleFindAll: EjecucionPruebaDetalle.findAll,
    detalleBulkCreate: EjecucionPruebaDetalle.bulkCreate
  };
  const { Op } = require('sequelize');
  const carpetas = [
    { CodigoCarpeta: 1, CodigoCarpetaPadre: null },
    { CodigoCarpeta: 2, CodigoCarpetaPadre: 1 },
    { CodigoCarpeta: 3, CodigoCarpetaPadre: null }
  ];
  const casosBd = [
    { CodigoCasoPrueba: 10, CodigoCarpeta: 1 },
    { CodigoCasoPrueba: 11, CodigoCarpeta: 2 },
    { CodigoCasoPrueba: 12, CodigoCarpeta: 3 },
    { CodigoCasoPrueba: 13, CodigoCarpeta: 3 }
  ];
  let detallesBd = [{ CodigoEjecucionPrueba: 100, CodigoCasoPrueba: 10, Estatus: 1 }];
  const CarpetaFiltro = (where, campo) => carpetas.filter((c) =>
    where[campo][Op.in].includes(c[campo]));
  Carpeta.findAll = async ({ where }) => where.CodigoCarpeta
    ? CarpetaFiltro(where, 'CodigoCarpeta')
    : CarpetaFiltro(where, 'CodigoCarpetaPadre');
  CasoPrueba.findAll = async ({ where }) => casosBd.filter((c) =>
    where.CodigoCasoPrueba
      ? where.CodigoCasoPrueba[Op.in].includes(c.CodigoCasoPrueba)
      : where.CodigoCarpeta[Op.in].includes(c.CodigoCarpeta));
  EjecucionPrueba.findOne = async () => ({ CodigoEjecucionPrueba: 100, CodigoEstadoEjecucion: 1 });
  EjecucionPruebaDetalle.findAll = async ({ where }) => detallesBd
    .filter((d) => where.CodigoCasoPrueba[Op.in].includes(d.CodigoCasoPrueba))
    .map((d) => ConvertirAInstancia({
      ...d,
      CasoPrueba_CodigoCasoPrueba: { CodigoCasoPrueba: d.CodigoCasoPrueba, Carpeta_CodigoCarpeta: { CodigoCarpeta: 1 } }
    }));
  EjecucionPruebaDetalle.bulkCreate = async (datos) => { detallesBd = [...detallesBd, ...datos.map((d) => ({ ...d, Estatus: 1 }))]; };
  try {
    const respuesta = await servicio.CrearEjecucionPruebaDetalleMultiple(100, {
      CodigosCarpeta: [1],
      CodigosCasoPrueba: [12],
      CodigoResultado: 1
    }, 7, admin);
    assert.equal(respuesta.TotalCreados, 2);
    assert.deepEqual(respuesta.CodigosCasoOmitidos, [10]);
    assert.deepEqual(detallesBd.map((d) => d.CodigoCasoPrueba).sort(), [10, 11, 12]);
    assert.ok(detallesBd.every((d) => d.CodigoUsuario === undefined || d.CodigoUsuario === 44));
    assert.equal(respuesta.Creados[0].CasoPrueba.Carpeta.CodigoCarpeta, 1);
    await assert.rejects(servicio.CrearEjecucionPruebaDetalleMultiple(100, {}, 7, admin), { statusCode: 400 });
    await assert.rejects(servicio.CrearEjecucionPruebaDetalleMultiple(100, { CodigosCarpeta: [1, 99], CodigoResultado: 1 }, 7, admin), { statusCode: 404 });
  } finally {
    EjecucionPrueba.findOne = originales.ejecucionFindOne;
    CasoPrueba.findAll = originales.casoFindAll;
    Carpeta.findAll = originales.carpetaFindAll;
    EjecucionPruebaDetalle.findAll = originales.detalleFindAll;
    EjecucionPruebaDetalle.bulkCreate = originales.detalleBulkCreate;
  }
});
