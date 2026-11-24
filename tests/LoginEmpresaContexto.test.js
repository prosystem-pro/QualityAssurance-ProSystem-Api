const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const usuario = {
  CodigoUsuario: 5,
  NombreUsuario: 'Roberto',
  SuperAdmin: null,
  Estatus: 1
};
const empresa = {
  CodigoEmpresa: 9,
  NombreEmpresa: 'Empresa 9'
};
const roles = [
  { CodigoRol: 3, NombreRol: 'Consulta', Estatus: 1 },
  { CodigoRol: 7, NombreRol: 'Administrador', Estatus: 1 }
];
let consultaRoles;
let consultaAsociacion;
let datosToken;
let codigoRolPermisos;

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
const ModeloUsuarioEmpresa = {
  async findAll(opciones) {
    consultaRoles = opciones;
    return roles.map((rol) => ({
      CodigoRol: rol.CodigoRol,
      Rol_CodigoRol: rol
    }));
  },
  async findOne(opciones) {
    consultaAsociacion = opciones;
    const rol = roles.find((actual) =>
      actual.CodigoRol === opciones.where.CodigoRol
    );
    return rol
      ? { CodigoRol: rol.CodigoRol, Rol_CodigoRol: rol }
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
        Rol: {},
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
const {
  ObtenerRolesPorEmpresaServicio,
  CambiarEmpresaServicio
} = require('../src/Servicios/LoginServicio');
Module._load = cargarOriginal;

test('lista solamente los roles activos del usuario en la empresa solicitada', async () => {
  const respuesta = await ObtenerRolesPorEmpresaServicio(9, {
    CodigoUsuario: usuario.CodigoUsuario,
    SuperAdmin: null
  });

  assert.equal(consultaRoles.where.CodigoEmpresa, empresa.CodigoEmpresa);
  assert.equal(consultaRoles.where.CodigoUsuario, usuario.CodigoUsuario);
  assert.deepEqual(respuesta.Roles.map((rol) => rol.CodigoRol), [3, 7]);
});

test('emite el token con el rol elegido para la empresa seleccionada', async () => {
  const respuesta = await CambiarEmpresaServicio(9, 7, {
    CodigoUsuario: usuario.CodigoUsuario,
    SuperAdmin: null
  });

  assert.equal(consultaAsociacion.where.CodigoEmpresa, empresa.CodigoEmpresa);
  assert.equal(consultaAsociacion.where.CodigoRol, 7);
  assert.equal(datosToken.CodigoEmpresa, empresa.CodigoEmpresa);
  assert.equal(datosToken.CodigoRol, 7);
  assert.equal(codigoRolPermisos, 7);
  assert.equal(respuesta.usuario.Permisos[0].CodigoRol, 7);
});

test('rechaza un rol que no está asignado al usuario en esa empresa', async () => {
  await assert.rejects(
    CambiarEmpresaServicio(9, 99, {
      CodigoUsuario: usuario.CodigoUsuario,
      SuperAdmin: null
    }),
    { statusCode: 403 }
  );
});
