const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

let casos = [];
let pasos = [];
let siguienteCodigo = 1;
const aliasPasosGenerado = 'CasoPruebaPaso_CodigoCasoPrueba';

const crearInstanciaCaso = (registro, transaccion) => ({
  ...registro,
  async update(datos) {
    Object.assign(registro, datos);
    Object.assign(this, datos);
  }
});

const obtenerPasos = (codigoCasoPrueba, origen) =>
  origen.filter((paso) => paso.CodigoCasoPrueba === codigoCasoPrueba)
    .sort((pasoA, pasoB) => pasoA.Orden - pasoB.Orden);

const CasoPrueba = {
  sequelize: {
    async transaction(ejecutar) {
      const transaccion = {
        casos: casos.map((caso) => ({ ...caso })),
        pasos: pasos.map((paso) => ({ ...paso }))
      };
      const resultado = await ejecutar(transaccion);
      casos = transaccion.casos;
      pasos = transaccion.pasos;
      return resultado;
    }
  },
  async create(datos, { transaction }) {
    const registro = { ...datos, CodigoCasoPrueba: siguienteCodigo++ };
    transaction.casos.push(registro);
    return crearInstanciaCaso(registro, transaction);
  },
  async findOne({ where, include, transaction }) {
    const origen = transaction ? transaction.casos : casos;
    const registro = origen.find((caso) =>
      String(caso.CodigoCasoPrueba) === String(where.CodigoCasoPrueba) &&
      (where.CodigoEmpresa === undefined || caso.CodigoEmpresa === where.CodigoEmpresa)
    );
    if (!registro) return null;
    const instancia = crearInstanciaCaso(registro, transaction);
    if (include) {
      instancia[aliasPasosGenerado] = obtenerPasos(
        registro.CodigoCasoPrueba,
        transaction ? transaction.pasos : pasos
      );
    }
    return instancia;
  },
  async findAll({ where, include, transaction }) {
    const origen = transaction ? transaction.casos : casos;
    return origen.filter((caso) =>
      caso.CodigoEmpresa === where.CodigoEmpresa
    ).map((caso) => {
      const instancia = crearInstanciaCaso(caso, transaction);
      if (include) {
        instancia[aliasPasosGenerado] = obtenerPasos(caso.CodigoCasoPrueba, pasos);
      }
      return instancia;
    });
  }
};

const CasoPruebaPaso = {
  async bulkCreate(nuevosPasos, { transaction }) {
    const creados = nuevosPasos.map((paso) => ({
      ...paso,
      CodigoCasoPruebaPaso: transaction.pasos.length + 1
    }));
    transaction.pasos.push(...creados);
    return creados;
  },
  async destroy({ where, transaction }) {
    transaction.pasos = transaction.pasos.filter((paso) =>
      paso.CodigoCasoPrueba !== where.CodigoCasoPrueba
    );
  }
};
CasoPrueba.associations = {
  CasoPruebaPasos: {
    target: CasoPruebaPaso,
    as: aliasPasosGenerado,
    associationType: 'HasMany',
    foreignKey: 'CodigoCasoPrueba'
  }
};

const relaciones = {
  CasoPrueba,
  CasoPruebaPaso,
  Carpeta: { findOne: async () => ({}) },
  Empresa: { findOne: async () => ({}) },
  TipoPrueba: {},
  Prioridad: {},
  EstadoCaso: {},
  UsuarioEmpresa: {},
  Usuario: {}
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('CasosDePruebaServicio.js') &&
      solicitud === '../Modelos/Relaciones') {
    return relaciones;
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/CasosDePruebaServicio');
Module._load = cargarOriginal;

const admin = { SuperAdmin: 1, CodigoUsuario: 44 };
const reiniciarDatos = () => {
  casos = [];
  pasos = [];
  siguienteCodigo = 1;
};

test('crea un caso tradicional con pasos ordenados y campos nuevos', async () => {
  reiniciarDatos();
  const creado = await servicio.CrearCasoPrueba({
    CodigoCarpeta: 2,
    CodigoPrioridad: 1,
    CodigoTipoPrueba: 1,
    CodigoEstadoCaso: 1,
    Titulo: 'Flujo de compra',
    TipoPlantilla: 1,
    EsAutomatizado: true,
    TiempoEstimadoMinutos: 12,
    CodigoExterno: 'valor-del-front',
    EscenarioBdd: 'no aplica',
    Pasos: [
      { Orden: 2, Accion: 'Confirmar compra' },
      { Orden: 1, Accion: 'Agregar artículo', ResultadoEsperado: 'Artículo en carrito' }
    ]
  }, 7, admin);

  assert.equal(creado.CodigoEmpresa, 7);
  assert.equal(creado.CodigoUsuario, 44);
  assert.equal(creado.CodigoExterno, 'CP-1');
  assert.equal(creado.TipoPlantilla, 1);
  assert.equal(creado.EscenarioBdd, null);
  assert.deepEqual(creado.Pasos.map(({ Orden, Accion }) => ({ Orden, Accion })), [
    { Orden: 1, Accion: 'Agregar artículo' },
    { Orden: 2, Accion: 'Confirmar compra' }
  ]);
});

test('crea casos BDD sin pasos tradicionales', async () => {
  reiniciarDatos();
  const creado = await servicio.CrearCasoPrueba({
    CodigoCarpeta: 2,
    CodigoPrioridad: 1,
    CodigoTipoPrueba: 1,
    CodigoEstadoCaso: 1,
    Titulo: 'Compra BDD',
    TipoPlantilla: 2,
    EscenarioBdd: 'Given un artículo disponible\\nWhen se compra\\nThen se confirma'
  }, 7, admin);

  assert.equal(creado.TipoPlantilla, 2);
  assert.match(creado.EscenarioBdd, /^Given/);
  assert.deepEqual(creado.Pasos, []);
  assert.deepEqual(pasos, []);
});

test('reemplaza todos los pasos en una actualización tradicional', async () => {
  reiniciarDatos();
  casos = [{
    CodigoCasoPrueba: 1,
    CodigoEmpresa: 7,
    CodigoCarpeta: 2,
    CodigoUsuario: 44,
    CodigoExterno: 'CP-1',
    TipoPlantilla: 1,
    Titulo: 'Caso existente'
  }];
  pasos = [{
    CodigoCasoPrueba: 1,
    CodigoCasoPruebaPaso: 1,
    Orden: 1,
    Accion: 'Paso anterior',
    ResultadoEsperado: null
  }];

  const actualizado = await servicio.EditarCasoPrueba(1, {
    CodigoExterno: 'otro-valor-del-front',
    Pasos: [{ Accion: 'Paso actualizado', ResultadoEsperado: 'Correcto' }]
  }, 7, admin);

  assert.deepEqual(actualizado.Pasos.map(({ Orden, Accion }) => ({ Orden, Accion })), [
    { Orden: 1, Accion: 'Paso actualizado' }
  ]);
  assert.equal(actualizado.CodigoExterno, 'CP-1');
  assert.equal(pasos.length, 1);
});

test('cambiar a BDD limpia los pasos tradicionales y conserva el escenario enviado', async () => {
  reiniciarDatos();
  casos = [{
    CodigoCasoPrueba: 1,
    CodigoEmpresa: 7,
    CodigoCarpeta: 2,
    CodigoUsuario: 44,
    TipoPlantilla: 1,
    Titulo: 'Caso existente'
  }];
  pasos = [{
    CodigoCasoPrueba: 1,
    CodigoCasoPruebaPaso: 1,
    Orden: 1,
    Accion: 'Paso anterior',
    ResultadoEsperado: null
  }];

  const actualizado = await servicio.EditarCasoPrueba(1, {
    TipoPlantilla: 2,
    EscenarioBdd: 'Given una condición\\nWhen ocurre una acción\\nThen se valida el resultado'
  }, 7, admin);

  assert.equal(actualizado.TipoPlantilla, 2);
  assert.match(actualizado.EscenarioBdd, /^Given/);
  assert.deepEqual(actualizado.Pasos, []);
  assert.deepEqual(pasos, []);
});

test('rechaza pasos inválidos antes de persistirlos', async () => {
  reiniciarDatos();
  await assert.rejects(
    servicio.CrearCasoPrueba({
      CodigoCarpeta: 2,
      Titulo: 'Caso inválido',
      Pasos: [{ Orden: 1, Accion: '   ' }]
    }, 7, admin),
    { statusCode: 400 }
  );
  assert.equal(casos.length, 0);
});

test('falla explícitamente si falta la relación generada desde la base de datos', async () => {
  const asociacionesOriginales = CasoPrueba.associations;
  CasoPrueba.associations = {};
  try {
    await assert.rejects(
      servicio.ListadoCasoPrueba(7, admin),
      {
        statusCode: 500,
        message: /Falta la relación de CasoPrueba con CasoPruebaPaso/
      }
    );
  } finally {
    CasoPrueba.associations = asociacionesOriginales;
  }
});

test('incluye CodigoExterno en listado y consulta de casos de prueba', async () => {
  reiniciarDatos();
  casos = [{
    CodigoCasoPrueba: 1,
    CodigoEmpresa: 7,
    CodigoCarpeta: 2,
    CodigoUsuario: 44,
    CodigoExterno: 'CP-1',
    TipoPlantilla: 1,
    Titulo: 'Caso existente',
    Estatus: 1
  }];
  pasos = [{
    CodigoCasoPrueba: 1,
    CodigoCasoPruebaPaso: 1,
    Orden: 1,
    Accion: 'Abrir página',
    ResultadoEsperado: 'Página visible'
  }];

  const listado = await servicio.ListadoCasoPrueba(7, admin);
  const consultado = await servicio.ObtenerCasoPruebaPorCodigo(1, 7, admin);

  assert.equal(listado[0].CodigoExterno, 'CP-1');
  assert.equal(consultado.CodigoExterno, 'CP-1');
  assert.equal(consultado.Pasos[0].Accion, 'Abrir página');
});
