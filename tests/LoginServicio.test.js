const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const usuario = {
  CodigoUsuario: 4,
  NombreUsuario: 'usuario',
  ClaveHash: 'hash',
  Estatus: 1,
  SuperAdmin: null
};
const Empresa = {};
const Rol = {};
let consultaAsociacion;
let tokenGenerado;
let codigoPermisos;

const relaciones = {
  Usuario: {
    async findOne() {
      return usuario;
    }
  },
  Empresa,
  Rol,
  UsuarioEmpresa: {
    async findOne(opciones) {
      consultaAsociacion = opciones;
      return {
        CodigoRol: 22,
        Rol_CodigoRol: { CodigoRol: 22, NombreRol: 'Editor', Estatus: 1 },
        Empresa_CodigoEmpresa: {
          CodigoEmpresa: 8,
          NombreEmpresa: 'Empresa principal',
          Estatus: 1
        }
      };
    }
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('LoginServicio.js')) {
    if (solicitud === '../Configuracion/AutorizacionConfiguracion') {
      return {
        GenerarToken(datos) {
          tokenGenerado = datos;
          return 'token';
        },
        async CompararClaves() {
          return true;
        }
      };
    }
    if (solicitud === '../Modelos/Relaciones') return relaciones;
    if (solicitud === '../Utilidades/ErrorServicios') {
      return { LanzarError: (mensaje) => new Error(mensaje) };
    }
    if (solicitud === '../Servicios/PermisoRolRecursoServicio') {
      return {
        async ObtenerPermisosFrontEnd(codigoRol) {
          codigoPermisos = codigoRol;
          return { Recursos: [] };
        }
      };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const { IniciarSesionServicio } = require('../src/Servicios/LoginServicio');
Module._load = cargarOriginal;

test('obtiene el rol y la empresa desde la asociación prioritaria del usuario', async () => {
  const respuesta = await IniciarSesionServicio('usuario', 'clave');

  assert.equal(consultaAsociacion.where.CodigoUsuario, usuario.CodigoUsuario);
  assert.deepEqual(consultaAsociacion.order, [
    ['EsEmpresaPrincipal', 'DESC'],
    ['CodigoUsuarioEmpresa', 'ASC']
  ]);
  assert.deepEqual(
    consultaAsociacion.include.map(({ model, as }) => ({ model, as })),
    [
      { model: Rol, as: 'Rol_CodigoRol' },
      { model: Empresa, as: 'Empresa_CodigoEmpresa' }
    ]
  );
  assert.equal(codigoPermisos, 22);
  assert.equal(tokenGenerado.CodigoRol, 22);
  assert.equal(tokenGenerado.CodigoEmpresa, 8);
  assert.equal(respuesta.usuario.CodigoRol, 22);
  assert.equal(respuesta.usuario.CodigoEmpresa, 8);
});
