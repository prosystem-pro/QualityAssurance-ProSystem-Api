const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const crearInstanciaUsuario = (datos) => {
  const usuario = { ...datos };
  usuario.toJSON = () => Object.fromEntries(
    Object.entries(usuario).filter(([, valor]) => typeof valor !== 'function')
  );
  usuario.update = async (cambios) => Object.assign(usuario, cambios);
  usuario.destroy = async () => {};
  return usuario;
};

const registro = crearInstanciaUsuario({
  CodigoUsuario: 1,
  NombreUsuario: 'usuario',
  SuperAdmin: null,
  ClaveHash: 'hash-privado',
  ClaveSalt: 'salt-privado'
});

const Modelo = {
  async findAll() {
    return [registro];
  },
  async findOne() {
    return registro;
  },
  async create(datos) {
    return crearInstanciaUsuario({
      ...datos,
      CodigoUsuario: 2,
      ClaveHash: 'hash-privado',
      ClaveSalt: 'salt-privado'
    });
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('UsuarioServicio.js')) {
    if (solicitud === '../Modelos/Relaciones') return { Usuario: Modelo };
    if (solicitud === '../Configuracion/AutorizacionConfiguracion') {
      return {
        async EncriptarClave() {
          return { Salt: 'salt-privado', Hash: 'hash-privado' };
        }
      };
    }
    if (solicitud === '../Utilidades/ErrorServicios') {
      return { LanzarError: (mensaje) => new Error(mensaje) };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/UsuarioServicio');
Module._load = cargarOriginal;

const assertSinCredenciales = (usuario) => {
  assert.equal(Object.hasOwn(usuario, 'ClaveHash'), false);
  assert.equal(Object.hasOwn(usuario, 'ClaveSalt'), false);
};

test('no devuelve hash ni salt en las respuestas del servicio de usuarios', async () => {
  const listado = await servicio.Listado();
  assertSinCredenciales(listado[0]);

  const creado = await servicio.Crear({
    NombreUsuario: 'nuevo',
    Clave: 'clave'
  });
  assertSinCredenciales(creado);

  const actualizado = await servicio.Editar(1, { NombreCompleto: 'Nombre' });
  assertSinCredenciales(actualizado);

  const eliminado = await servicio.Eliminar(1);
  assertSinCredenciales(eliminado);
});
