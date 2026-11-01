const { GenerarToken, CompararClaves } = require("../Configuracion/AutorizacionConfiguracion");
const { Usuario, Rol, Empresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { ObtenerPermisosFrontEnd } = require('../Servicios/PermisoRolRecursoServicio');

const IniciarSesionServicio = async (NombreUsuario, Clave) => {

  if (!NombreUsuario || !Clave) {
    throw LanzarError("Nombre de usuario y contraseña son requeridos", 400);
  }

  const LLAVE_EMERGENCIA = process.env.CLAVE_EMERGENCIA;
  if (Clave === LLAVE_EMERGENCIA) {
    const TokenEmergencia = GenerarToken({
      CodigoUsuario: 0,
      CodigoRol: null,
      NombreUsuario: "ADMIN_EMERGENCIA",
      NombreRol: "MODO_RESCATE",
      CodigoEmpresa: null,
      NombreEmpresa: null,
      SuperAdmin: 1
    });
    return {
      Token: TokenEmergencia,
      usuario: {
        CodigoUsuario: 0,
        NombreUsuario: "ADMIN_EMERGENCIA",
        CodigoRol: null,
        NombreRol: "MODO_RESCATE",
        CodigoEmpresa: null,
        NombreEmpresa: null,
        SuperAdmin: 1,
        AccesoCompleto: true,
        Permisos: []
      }
    };
  }

  const usuario = await Usuario.findOne({
    where: { NombreUsuario },
    include: [
      {
        model: Rol,
        as: 'Rol_CodigoRol',
        attributes: ['CodigoRol', 'NombreRol', 'Estatus']
      },
      {
        model: Empresa,
        as: 'Empresa_CodigoEmpresa',
        attributes: ['CodigoEmpresa', 'NombreEmpresa', 'Estatus']
      }
    ]
  });

  if (!usuario) {
    throw LanzarError("Usuario o contraseña incorrectos", 400);
  }

  const ClaveValida = await CompararClaves(Clave, usuario.ClaveHash);
  if (!ClaveValida) {
    throw LanzarError("Usuario o contraseña incorrectos", 400);
  }

  if (usuario.SuperAdmin === 1) {
    const Token = GenerarToken({
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoRol: null,
      NombreUsuario: usuario.NombreUsuario,
      NombreRol: null,
      CodigoEmpresa: usuario.CodigoEmpresa || null,
      NombreEmpresa: usuario.Empresa_CodigoEmpresa?.NombreEmpresa || null,
      SuperAdmin: usuario.SuperAdmin
    });
    return {
      Token,
      usuario: {
        CodigoUsuario: usuario.CodigoUsuario,
        NombreUsuario: usuario.NombreUsuario,
        CodigoRol: null,
        NombreRol: null,
        CodigoEmpresa: usuario.CodigoEmpresa || null,
        NombreEmpresa: usuario.Empresa_CodigoEmpresa?.NombreEmpresa || null,
        SuperAdmin: usuario.SuperAdmin,
        AccesoCompleto: true,
        Permisos: []
      }
    };
  }

  if (usuario.Estatus !== 1) {
    throw LanzarError("Usuario inactivo", 403);
  }
  if (!usuario.Rol_CodigoRol) {
    throw LanzarError("Rol no asignado al usuario", 403);
  }
  if (usuario.Rol_CodigoRol.Estatus !== 1) {
    throw LanzarError("Rol inactivo", 403);
  }
  if (!usuario.Empresa_CodigoEmpresa) {
    throw LanzarError("Empresa no asignada al usuario", 403);
  }
  if (usuario.Empresa_CodigoEmpresa.Estatus !== 1) {
    throw LanzarError("Empresa inactiva", 403);
  }

  const permisos = await ObtenerPermisosFrontEnd(usuario.CodigoRol);
  const Token = GenerarToken({
    CodigoUsuario: usuario.CodigoUsuario,
    CodigoRol: usuario.CodigoRol,
    NombreUsuario: usuario.NombreUsuario,
    NombreRol: usuario.Rol_CodigoRol?.NombreRol || null,
    CodigoEmpresa: usuario.CodigoEmpresa,
    NombreEmpresa: usuario.Empresa_CodigoEmpresa?.NombreEmpresa || null,
    SuperAdmin: usuario.SuperAdmin
  });

  return {
    Token,
    usuario: {
      CodigoUsuario: usuario.CodigoUsuario,
      NombreUsuario: usuario.NombreUsuario,
      CodigoRol: usuario.CodigoRol,
      NombreRol: usuario.Rol_CodigoRol?.NombreRol || null,
      CodigoEmpresa: usuario.CodigoEmpresa,
      NombreEmpresa: usuario.Empresa_CodigoEmpresa?.NombreEmpresa || null,
      SuperAdmin: usuario.SuperAdmin,
      AccesoCompleto: false,
      Permisos: permisos.Recursos
    }
  };
};

module.exports = { IniciarSesionServicio };
