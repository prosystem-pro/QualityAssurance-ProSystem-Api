const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const usuario = {
  CodigoUsuario: 4,
  NombreUsuario: 'usuario',
  ClaveHash: 'hash',
  CodigoRol: 22,
  TemaOscuro: true,
  Estatus: 1,
  SuperAdmin: null
};
const Empresa = {};
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
  Rol: {
    async findOne({ where }) {
      return where.CodigoRol === 22 ? { CodigoRol: 22, NombreRol: 'Editor', Estatus: 1 } : null;
    }
  },
  UsuarioEmpresa: {
    async findOne(opciones) {
      consultaAsociacion = opciones;
      return {
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

test('obtiene el rol del usuario y la empresa desde su asociación prioritaria', async () => {
  const respuesta = await IniciarSesionServicio('usuario', 'clave');

  assert.equal(consultaAsociacion.where.CodigoUsuario, usuario.CodigoUsuario);
  assert.deepEqual(consultaAsociacion.order, [
    ['EsEmpresaPrincipal', 'DESC'],
    ['CodigoUsuarioEmpresa', 'ASC']
  ]);
  assert.deepEqual(
    consultaAsociacion.include.map(({ model, as }) => ({ model, as })),
    [{ model: Empresa, as: 'Empresa_CodigoEmpresa' }]
  );
  assert.equal(codigoPermisos, 22);
  assert.equal(tokenGenerado.CodigoRol, 22);
  assert.equal(tokenGenerado.CodigoEmpresa, 8);
  assert.equal(respuesta.usuario.CodigoRol, 22);
  assert.equal(respuesta.usuario.CodigoEmpresa, 8);
  assert.equal(respuesta.usuario.TemaOscuro, true);
});
