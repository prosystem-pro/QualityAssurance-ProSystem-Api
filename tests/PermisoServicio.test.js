const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { Op } = require('sequelize');

let datosIndividuales;
let datosEnLote;
let opcionesLote;
let opcionesEliminacion;
let cantidadEliminada = 2;

const ModeloPermiso = {
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
  if (padre && padre.filename.endsWith('PermisoServicio.js')) {
    if (solicitud === '../Modelos/Relaciones') {
      return { Permiso: ModeloPermiso };
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
const servicio = require('../src/Servicios/PermisoServicio');
Module._load = cargarOriginal;

test('crea un permiso manteniendo el formato de objeto', async () => {
  const datos = { NombrePermiso: 'CrearUsuario' };

  const creado = await servicio.Crear(datos);

  assert.equal(creado, datos);
  assert.equal(datosIndividuales, datos);
});

test('crea varios permisos desde un arreglo', async () => {
  const datos = [
    { NombrePermiso: 'CrearUsuario' },
    { NombrePermiso: 'EditarUsuario' }
  ];

  const creados = await servicio.Crear(datos);

  assert.equal(creados, datos);
  assert.equal(datosEnLote, datos);
  assert.deepEqual(opcionesLote, { validate: true });
});

test('rechaza arreglos vacíos o permisos sin nombre válido', async () => {
  datosEnLote = undefined;

  await assert.rejects(servicio.Crear([]), {
    message: 'Cada permiso debe incluir un NombrePermiso válido',
    statusCode: 400
  });
  await assert.rejects(servicio.Crear([
    { NombrePermiso: 'CrearUsuario' },
    { NombrePermiso: '   ' }
  ]), {
    message: 'Cada permiso debe incluir un NombrePermiso válido',
    statusCode: 400
  });

  assert.equal(datosEnLote, undefined);
});

test('elimina varios permisos usando sus códigos', async () => {
  const eliminados = await servicio.EliminarEnLote([3, '4', 3]);

  assert.equal(eliminados, 2);
  assert.deepEqual(opcionesEliminacion.where.CodigoPermiso[Op.in], [3, 4]);
});

test('rechaza una lista vacía o códigos inválidos para eliminar', async () => {
  opcionesEliminacion = undefined;

  await assert.rejects(servicio.EliminarEnLote([]), {
    message: 'Debe enviar una lista de códigos de permisos',
    statusCode: 400
  });
  await assert.rejects(servicio.EliminarEnLote([1, 'abc']), {
    message: 'La lista contiene códigos de permiso inválidos',
    statusCode: 400
  });

  assert.equal(opcionesEliminacion, undefined);
});

test('devuelve 404 si ningún permiso coincide con los códigos', async () => {
  cantidadEliminada = 0;

  await assert.rejects(servicio.EliminarEnLote([99]), {
    message: 'No se encontraron permisos para eliminar',
    statusCode: 404
  });

  cantidadEliminada = 2;
});
