const { GenerarToken, CompararClaves } = require("../Configuracion/AutorizacionConfiguracion");
const { Usuario, Rol, Empresa, UsuarioEmpresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { ObtenerPermisosFrontEnd } = require('../Servicios/PermisoRolRecursoServicio');

const ObtenerTemaOscuro = (usuario) =>
  usuario.TemaOscuro === true || usuario.TemaOscuro === 1;

const ObtenerUsuarioAutenticado = async (DatosUsuario) => {
  const CodigoUsuario = Number(DatosUsuario?.CodigoUsuario);
  if (CodigoUsuario === 0 && DatosUsuario?.SuperAdmin === 1) {
    return {
      CodigoUsuario,
      NombreUsuario: DatosUsuario.NombreUsuario,
      TemaOscuro: false,
      SuperAdmin: 1
    };
  }
  if (!Number.isInteger(CodigoUsuario) || CodigoUsuario <= 0) {
    throw LanzarError('El token no contiene un usuario válido.', 401);
  }

  const usuario = await Usuario.findOne({
    where: { CodigoUsuario, Estatus: 1 }
  });
  if (!usuario) {
    throw LanzarError('Usuario inactivo o no encontrado.', 403);
  }
  return usuario;
};

const ObtenerEmpresaActiva = async (CodigoEmpresa) => {
  const EmpresaAcceso = await Empresa.findOne({
    where: { CodigoEmpresa, Estatus: 1 },
    attributes: ['CodigoEmpresa', 'NombreEmpresa']
  });
  if (!EmpresaAcceso) {
    throw LanzarError('La empresa no existe o no está activa.', 404);
  }
  return EmpresaAcceso;
};

const ObtenerRolActivoUsuario = async (usuario) => {
  const CodigoRol = Number(usuario.CodigoRol);
  if (!Number.isInteger(CodigoRol) || CodigoRol <= 0) {
    throw LanzarError('El usuario no tiene un rol asignado.', 403);
  }

  const RolUsuario = await Rol.findOne({
    where: { CodigoRol, Estatus: 1 }
  });
  if (!RolUsuario) {
    throw LanzarError('El rol del usuario no existe o está inactivo.', 403);
  }
  return RolUsuario;
};

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
        TemaOscuro: false,
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
    where: { NombreUsuario }
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
      CodigoEmpresa: null,
      NombreEmpresa: null,
      SuperAdmin: usuario.SuperAdmin
    });
    return {
      Token,
      usuario: {
        CodigoUsuario: usuario.CodigoUsuario,
        NombreUsuario: usuario.NombreUsuario,
        TemaOscuro: ObtenerTemaOscuro(usuario),
        CodigoRol: null,
        NombreRol: null,
        CodigoEmpresa: null,
        NombreEmpresa: null,
        SuperAdmin: usuario.SuperAdmin,
        AccesoCompleto: true,
        Permisos: []
      }
    };
  }

  if (usuario.Estatus !== 1) {
    throw LanzarError("Usuario inactivo", 403);
  }

  const AsociacionAcceso = await UsuarioEmpresa.findOne({
    where: {
      CodigoUsuario: usuario.CodigoUsuario,
      Estatus: 1
    },
    include: [
      {
        model: Empresa,
        as: 'Empresa_CodigoEmpresa',
        attributes: ['CodigoEmpresa', 'NombreEmpresa', 'Estatus'],
        where: { Estatus: 1 },
        required: true
      }
    ],
    order: [
      ['EsEmpresaPrincipal', 'DESC'],
      ['CodigoUsuarioEmpresa', 'ASC']
    ]
  });

  if (!AsociacionAcceso) {
    throw LanzarError("Empresa no asignada o activa para el usuario", 403);
  }
  const EmpresaAcceso = AsociacionAcceso.Empresa_CodigoEmpresa;
  const RolAcceso = await ObtenerRolActivoUsuario(usuario);

  const permisos = await ObtenerPermisosFrontEnd(usuario.CodigoRol);
  const Token = GenerarToken({
    CodigoUsuario: usuario.CodigoUsuario,
    CodigoRol: usuario.CodigoRol,
    NombreUsuario: usuario.NombreUsuario,
    NombreRol: RolAcceso.NombreRol || null,
    CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
    NombreEmpresa: EmpresaAcceso.NombreEmpresa || null,
    SuperAdmin: usuario.SuperAdmin
  });

  return {
    Token,
    usuario: {
      CodigoUsuario: usuario.CodigoUsuario,
      NombreUsuario: usuario.NombreUsuario,
      TemaOscuro: ObtenerTemaOscuro(usuario),
      CodigoRol: usuario.CodigoRol,
      NombreRol: RolAcceso.NombreRol || null,
      CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
      NombreEmpresa: EmpresaAcceso.NombreEmpresa || null,
      SuperAdmin: usuario.SuperAdmin,
      AccesoCompleto: false,
      Permisos: permisos.Recursos
    }
  };
};

const CambiarEmpresaServicio = async (CodigoEmpresaSolicitada, DatosUsuario) => {
  const CodigoEmpresa = Number(CodigoEmpresaSolicitada);
  if (!Number.isInteger(CodigoEmpresa) || CodigoEmpresa <= 0) {
    throw LanzarError('Debe seleccionar una empresa válida.', 400);
  }

  const [usuario, EmpresaAcceso] = await Promise.all([
    ObtenerUsuarioAutenticado(DatosUsuario),
    ObtenerEmpresaActiva(CodigoEmpresa)
  ]);

  if (usuario.SuperAdmin === 1) {
    const Token = GenerarToken({
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoRol: null,
      NombreUsuario: usuario.NombreUsuario,
      NombreRol: null,
      CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
      NombreEmpresa: EmpresaAcceso.NombreEmpresa,
      SuperAdmin: 1
    });
    return {
      Token,
      usuario: {
        CodigoUsuario: usuario.CodigoUsuario,
        NombreUsuario: usuario.NombreUsuario,
        TemaOscuro: ObtenerTemaOscuro(usuario),
        CodigoRol: null,
        NombreRol: null,
        CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
        NombreEmpresa: EmpresaAcceso.NombreEmpresa,
        SuperAdmin: 1,
        AccesoCompleto: true,
        Permisos: []
      }
    };
  }

  const AsociacionAcceso = await UsuarioEmpresa.findOne({
    where: {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoEmpresa,
      Estatus: 1
    }
  });

  if (!AsociacionAcceso) {
    throw LanzarError('La empresa no está asignada al usuario.', 403);
  }

  const RolAcceso = await ObtenerRolActivoUsuario(usuario);
  const CodigoRol = usuario.CodigoRol;
  const permisos = await ObtenerPermisosFrontEnd(CodigoRol);
  const NombreRol = RolAcceso.NombreRol || null;
  const Token = GenerarToken({
    CodigoUsuario: usuario.CodigoUsuario,
    CodigoRol,
    NombreUsuario: usuario.NombreUsuario,
    NombreRol,
    CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
    NombreEmpresa: EmpresaAcceso.NombreEmpresa,
    SuperAdmin: usuario.SuperAdmin
  });

  return {
    Token,
    usuario: {
      CodigoUsuario: usuario.CodigoUsuario,
      NombreUsuario: usuario.NombreUsuario,
      TemaOscuro: ObtenerTemaOscuro(usuario),
      CodigoRol,
      NombreRol,
      CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
      NombreEmpresa: EmpresaAcceso.NombreEmpresa,
      SuperAdmin: usuario.SuperAdmin,
      AccesoCompleto: false,
      Permisos: permisos.Recursos
    }
  };
};

module.exports = {
  IniciarSesionServicio,
  CambiarEmpresaServicio
};
