const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

let datosIndividuales;
let datosEnLote;
let opcionesLote;
let opcionesEliminacion;
let cantidadEliminada = 2;

const ModeloRecurso = {
  async create(datos) {
    datosIndividuales = datos;
    return datos;
  },
  async bulkCreate(datos, opciones) {
    datosEnLote = datos;
    opcionesLote = opciones;
    return datos;
  },
  async destroy(opciones) {
    opcionesEliminacion = opciones;
    return cantidadEliminada;
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('RecursoServicio.js')) {
    if (solicitud === '../Modelos/Relaciones') {
      return { Recurso: ModeloRecurso };
    }
    if (solicitud === '../Utilidades/ErrorServicios') {
      return {
        LanzarError(mensaje, statusCode) {
          const error = new Error(mensaje);
          error.statusCode = statusCode;
          throw error;
        }
      };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/RecursoServicio');
Module._load = cargarOriginal;
const { Op } = require('sequelize');

test('crea un solo recurso manteniendo el formato de objeto', async () => {
  const datos = { NombreRecurso: 'Usuarios' };

  const creado = await servicio.Crear(datos);

  assert.equal(creado, datos);
  assert.equal(datosIndividuales, datos);
});

test('crea varios recursos desde un arreglo', async () => {
  const datos = [
    { NombreRecurso: 'Usuarios' },
    { NombreRecurso: 'Empresas' }
  ];

  const creados = await servicio.Crear(datos);

  assert.equal(creados, datos);
  assert.equal(datosEnLote, datos);
  assert.deepEqual(opcionesLote, { validate: true });
});

test('rechaza lotes vacíos o elementos sin nombre antes de guardar', async () => {
  datosEnLote = undefined;

  await assert.rejects(servicio.Crear([]), {
    message: 'Cada recurso debe incluir un NombreRecurso válido',
    statusCode: 400
  });
  await assert.rejects(servicio.Crear([
    { NombreRecurso: 'Usuarios' },
    { NombreRecurso: '   ' }
  ]), {
    message: 'Cada recurso debe incluir un NombreRecurso válido',
    statusCode: 400
  });

  assert.equal(datosEnLote, undefined);
});

test('elimina varios recursos usando sus códigos', async () => {
  const eliminados = await servicio.EliminarEnLote([3, '4', 3]);

  assert.equal(eliminados, 2);
  assert.deepEqual(opcionesEliminacion.where.CodigoRecurso[Op.in], [3, 4]);
});

test('rechaza una lista vacía o códigos inválidos para eliminar', async () => {
  opcionesEliminacion = undefined;

  await assert.rejects(servicio.EliminarEnLote([]), {
    message: 'Debe enviar una lista de códigos de recursos',
    statusCode: 400
  });
  await assert.rejects(servicio.EliminarEnLote([1, 'abc']), {
    message: 'La lista contiene códigos de recurso inválidos',
    statusCode: 400
  });

  assert.equal(opcionesEliminacion, undefined);
});

test('devuelve 404 si ningún recurso coincide con los códigos', async () => {
  cantidadEliminada = 0;

  await assert.rejects(servicio.EliminarEnLote([99]), {
    message: 'No se encontraron recursos para eliminar',
    statusCode: 404
  });

  cantidadEliminada = 2;
});
