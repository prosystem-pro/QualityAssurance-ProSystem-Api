const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

let registros = [];
let fallarActualizacion;
let nivelAislamiento;

const instancia = (registro) => ({
  ...registro,
  async update(datos) {
    if (fallarActualizacion === registro.CodigoCarpeta) {
      throw new Error('Error de prueba al actualizar');
    }
    Object.assign(registro, datos);
    Object.assign(this, datos);
  }
});

const Carpeta = {
  sequelize: {
    async transaction(opciones, ejecutar) {
      nivelAislamiento = opciones.isolationLevel;
      const transaccion = { registros: registros.map((registro) => ({ ...registro })) };
      const resultado = await ejecutar(transaccion);
      registros = transaccion.registros;
      return resultado;
    }
  },
  async findOne({ where, transaction }) {
    const datos = transaction ? transaction.registros : registros;
    const registro = datos.find((actual) =>
      String(actual.CodigoCarpeta) === String(where.CodigoCarpeta) &&
      actual.CodigoEmpresa === where.CodigoEmpresa
    );
    return registro ? instancia(registro) : null;
  },
  async findAll({ where, transaction }) {
    return transaction.registros
      .filter((actual) =>
        actual.CodigoEmpresa === where.CodigoEmpresa &&
        actual.CodigoCarpetaPadre === where.CodigoCarpetaPadre
      )
      .map(instancia);
  }
};

const relaciones = {
  Carpeta,
  Empresa: { findOne: async () => ({}) },
  TipoPrueba: {}, Prioridad: {}, EstadoCaso: {}, CasoPrueba: {},
  UsuarioEmpresa: {}, Usuario: {}
};
const cargarOriginal = Module._load;
Module._load = function (solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('CasosDePruebaServicio.js') &&
      solicitud === '../Modelos/Relaciones') {
    return relaciones;
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/CasosDePruebaServicio');
Module._load = cargarOriginal;

const admin = { SuperAdmin: 1 };
const carpeta = (codigo, padre, orden, empresa = 1, estatus = 1) => ({
  CodigoCarpeta: codigo,
  CodigoEmpresa: empresa,
  CodigoCarpetaPadre: padre,
  NombreCarpeta: `Carpeta ${codigo}`,
  Orden: orden,
  Estatus: estatus
});
const ordenes = () => Object.fromEntries(
  registros.map((actual) => [actual.CodigoCarpeta, actual.Orden])
);

test('mueve una carpeta entre sus hermanas sin afectar otros padres o empresas', async () => {
  registros = [
    carpeta(1, 10, 1), carpeta(2, 10, 2), carpeta(3, 10, 3),
    carpeta(4, 20, 1), carpeta(5, 10, 1, 2)
  ];
  fallarActualizacion = undefined;

  const resultado = await servicio.EditarCarpeta(3, { Orden: 1 }, 1, admin);
  assert.equal(resultado.CodigoCarpeta, 3);
  assert.equal(resultado.Orden, 1);
  assert.deepEqual(ordenes(), { 1: 2, 2: 3, 3: 1, 4: 1, 5: 1 });
  assert.equal(nivelAislamiento, require('sequelize').Transaction.ISOLATION_LEVELS.SERIALIZABLE);

  await servicio.EditarCarpeta(3, { Orden: 3 }, 1, admin);
  assert.deepEqual(ordenes(), { 1: 1, 2: 2, 3: 3, 4: 1, 5: 1 });
});

test('reordena raíces, corrige huecos y coloca carpetas ocultas después de las visibles', async () => {
  registros = [
    carpeta(1, null, 2), carpeta(2, null, 5),
    carpeta(3, null, 1, 1, 0), carpeta(4, 1, 1)
  ];
  fallarActualizacion = undefined;

  await servicio.EditarCarpeta(2, { Orden: 1 }, 1, admin);
  assert.deepEqual(ordenes(), { 1: 2, 2: 1, 3: 3, 4: 1 });
});

test('rechaza posiciones inválidas, carpetas ocultas y cambio de padre al reordenar', async () => {
  registros = [carpeta(1, null, 1), carpeta(2, null, 2, 1, 0)];
  fallarActualizacion = undefined;

  for (const Orden of [0, -1, 1.5, '1', null, 2]) {
    await assert.rejects(servicio.EditarCarpeta(1, { Orden }, 1, admin), { statusCode: 400 });
  }
  await assert.rejects(servicio.EditarCarpeta(2, { Orden: 1 }, 1, admin), { statusCode: 400 });
  await assert.rejects(
    servicio.EditarCarpeta(1, { Orden: 1, CodigoCarpetaPadre: 2 }, 1, admin),
    { statusCode: 400 }
  );
  assert.deepEqual(ordenes(), { 1: 1, 2: 2 });
});

test('revierte todas las posiciones si falla una actualización', async () => {
  registros = [carpeta(1, null, 1), carpeta(2, null, 2), carpeta(3, null, 3)];
  fallarActualizacion = 1;
  await assert.rejects(
    servicio.EditarCarpeta(3, { Orden: 1 }, 1, admin),
    /Error de prueba al actualizar/
  );
  assert.deepEqual(ordenes(), { 1: 1, 2: 2, 3: 3 });
  fallarActualizacion = undefined;
});

test('conserva la edición normal sin enviar orden', async () => {
  registros = [carpeta(1, null, 1)];
  fallarActualizacion = undefined;
  const resultado = await servicio.EditarCarpeta(1, { NombreCarpeta: 'Nuevo nombre' }, 1, admin);
  assert.equal(resultado.NombreCarpeta, 'Nuevo nombre');
  assert.equal(resultado.Orden, 1);
});
