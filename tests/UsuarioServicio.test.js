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
  TemaOscuro: false,
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
      TemaOscuro: false,
      ClaveHash: 'hash-privado',
      ClaveSalt: 'salt-privado'
    });
  }
};
const ModeloRol = {
  async findOne({ where }) {
    return where.CodigoRol === 99 ? null : { CodigoRol: where.CodigoRol, Estatus: 1 };
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('UsuarioServicio.js')) {
    if (solicitud === '../Modelos/Relaciones') return { Usuario: Modelo, Rol: ModeloRol };
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
    Clave: 'clave',
    CodigoRol: 7
  });
  assert.equal(creado.CodigoRol, 7);
  assert.equal(creado.TemaOscuro, false);
  assertSinCredenciales(creado);

  const actualizado = await servicio.Editar(1, {
    NombreCompleto: 'Nombre',
    CodigoRol: 8,
    TemaOscuro: true
  });
  assert.equal(actualizado.CodigoRol, 8);
  assert.equal(actualizado.TemaOscuro, true);
  assertSinCredenciales(actualizado);

  const eliminado = await servicio.Eliminar(1);
  assertSinCredenciales(eliminado);
});

test('actualiza solo la preferencia del usuario autenticado y exige un booleano', async () => {
  const actualizado = await servicio.EditarTemaOscuro(1, false);

  assert.equal(actualizado.TemaOscuro, false);
  assert.equal(registro.TemaOscuro, false);
  await assert.rejects(servicio.EditarTemaOscuro(1, 'true'), {
    message: 'TemaOscuro debe ser true o false'
  });
  await assert.rejects(servicio.EditarTemaOscuro(0, true), {
    message: 'El token no contiene un usuario válido.'
  });
});

test('requiere un rol activo al crear usuario', async () => {
  await assert.rejects(servicio.Crear({
    NombreUsuario: 'sin-rol',
    Clave: 'clave'
  }), {
    message: 'Debe asignar un rol válido al usuario'
  });

  await assert.rejects(servicio.Crear({
    NombreUsuario: 'rol-inactivo',
    Clave: 'clave',
    CodigoRol: 99
  }), {
    message: 'El rol no existe o está inactivo'
  });

  await assert.rejects(servicio.Editar(1, { CodigoRol: 99 }), {
    message: 'El rol no existe o está inactivo'
  });
});
