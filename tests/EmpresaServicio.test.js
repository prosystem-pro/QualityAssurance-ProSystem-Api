const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

let datosCreados;
const datosActualizados = {};
const empresaActual = {
  CodigoEmpresa: 1,
  NombreEmpresa: 'Empresa anterior',
  async update(datos) {
    Object.assign(datosActualizados, datos);
    Object.assign(this, datos);
  }
};

const ModeloEmpresa = {
  async findOne({ where }) {
    return where.CodigoEmpresa === empresaActual.CodigoEmpresa
      ? empresaActual
      : null;
  },
  async create(datos) {
    datosCreados = datos;
    return datos;
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('EmpresaServicio.js')) {
    if (solicitud === '../Modelos/Relaciones') {
      return { Empresa: ModeloEmpresa };
    }
    if (solicitud === '../Utilidades/ErrorServicios') {
      return { LanzarError: (mensaje) => new Error(mensaje) };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/EmpresaServicio');
Module._load = cargarOriginal;

test('crea y edita empresas sin requerir el tipo de empresa', async () => {
  const creado = await servicio.Crear({
    NombreEmpresa: 'Empresa nueva',
    Direccion: 'Calle 1',
    Telefono: '55555555'
  });
  assert.equal(datosCreados.CodigoTipoEmpresa, undefined);
  assert.ok(creado.CodigoExterno);

  await servicio.Editar(1, {
    NombreEmpresa: 'Empresa actualizada',
    Direccion: 'Calle 2'
  });
  assert.equal(datosActualizados.CodigoTipoEmpresa, undefined);
  assert.equal(empresaActual.NombreEmpresa, 'Empresa actualizada');
});
