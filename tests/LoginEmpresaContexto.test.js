const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const usuario = {
  CodigoUsuario: 5,
  CodigoRol: 7,
  TemaOscuro: false,
  NombreUsuario: 'Roberto',
  SuperAdmin: null,
  Estatus: 1
};
const empresa = {
  CodigoEmpresa: 9,
  NombreEmpresa: 'Empresa 9'
};
let consultaAsociacion;
let datosToken;
let codigoRolPermisos;
let empresaAsignada = true;

const ModeloUsuario = {
  async findOne() {
    return usuario;
  }
};
const ModeloEmpresa = {
  async findOne({ where }) {
    return where.CodigoEmpresa === empresa.CodigoEmpresa ? empresa : null;
  }
};
const ModeloRol = {
  async findOne({ where }) {
    return where.CodigoRol === usuario.CodigoRol
      ? { CodigoRol: usuario.CodigoRol, NombreRol: 'Administrador', Estatus: 1 }
      : null;
  }
};
const ModeloUsuarioEmpresa = {
  async findOne(opciones) {
    consultaAsociacion = opciones;
    return empresaAsignada && opciones.where.CodigoEmpresa === empresa.CodigoEmpresa
      ? { CodigoEmpresa: empresa.CodigoEmpresa }
      : null;
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('LoginServicio.js')) {
    if (solicitud === '../Configuracion/AutorizacionConfiguracion') {
      return {
        GenerarToken(datos) {
          datosToken = datos;
          return 'token-contexto';
        },
        async CompararClaves() {
          return true;
        }
      };
    }
    if (solicitud === '../Modelos/Relaciones') {
      return {
        Usuario: ModeloUsuario,
        Rol: ModeloRol,
        Empresa: ModeloEmpresa,
        UsuarioEmpresa: ModeloUsuarioEmpresa
      };
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
    if (solicitud === '../Servicios/PermisoRolRecursoServicio') {
      return {
        async ObtenerPermisosFrontEnd(codigoRol) {
          codigoRolPermisos = codigoRol;
          return { Recursos: [{ CodigoRol: codigoRol }] };
        }
      };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const { CambiarEmpresaServicio } = require('../src/Servicios/LoginServicio');
Module._load = cargarOriginal;

test('cambia empresa manteniendo el rol global del usuario', async () => {
  const respuesta = await CambiarEmpresaServicio(9, {
    CodigoUsuario: usuario.CodigoUsuario,
    SuperAdmin: null
  });

  assert.deepEqual(consultaAsociacion.where, {
    CodigoUsuario: usuario.CodigoUsuario,
    CodigoEmpresa: empresa.CodigoEmpresa,
    Estatus: 1
  });
  assert.equal(datosToken.CodigoEmpresa, empresa.CodigoEmpresa);
  assert.equal(datosToken.CodigoRol, usuario.CodigoRol);
  assert.equal(codigoRolPermisos, usuario.CodigoRol);
  assert.equal(respuesta.usuario.Permisos[0].CodigoRol, usuario.CodigoRol);
  assert.equal(respuesta.usuario.TemaOscuro, false);
});

test('rechaza cambiar a una empresa no asignada al usuario', async () => {
  empresaAsignada = false;
  await assert.rejects(
    CambiarEmpresaServicio(9, {
      CodigoUsuario: usuario.CodigoUsuario,
      SuperAdmin: null
    }),
    { statusCode: 403 }
  );
  empresaAsignada = true;
});
