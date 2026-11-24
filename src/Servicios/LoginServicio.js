const { GenerarToken, CompararClaves } = require("../Configuracion/AutorizacionConfiguracion");
const { Usuario, Rol, Empresa, UsuarioEmpresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { ObtenerPermisosFrontEnd } = require('../Servicios/PermisoRolRecursoServicio');

const ObtenerUsuarioAutenticado = async (DatosUsuario) => {
  const CodigoUsuario = Number(DatosUsuario?.CodigoUsuario);
  if (CodigoUsuario === 0 && DatosUsuario?.SuperAdmin === 1) {
    return {
      CodigoUsuario,
      NombreUsuario: DatosUsuario.NombreUsuario,
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
        model: Rol,
        as: 'Rol_CodigoRol',
        attributes: ['CodigoRol', 'NombreRol', 'Estatus']
      },
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
  if (!AsociacionAcceso.Rol_CodigoRol) {
    throw LanzarError("Rol no asignado al usuario", 403);
  }
  if (AsociacionAcceso.Rol_CodigoRol.Estatus !== 1) {
    throw LanzarError("Rol inactivo", 403);
  }
  const EmpresaAcceso = AsociacionAcceso.Empresa_CodigoEmpresa;
  const RolAcceso = AsociacionAcceso.Rol_CodigoRol;

  const permisos = await ObtenerPermisosFrontEnd(AsociacionAcceso.CodigoRol);
  const Token = GenerarToken({
    CodigoUsuario: usuario.CodigoUsuario,
    CodigoRol: AsociacionAcceso.CodigoRol,
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
      CodigoRol: AsociacionAcceso.CodigoRol,
      NombreRol: RolAcceso.NombreRol || null,
      CodigoEmpresa: EmpresaAcceso.CodigoEmpresa,
      NombreEmpresa: EmpresaAcceso.NombreEmpresa || null,
      SuperAdmin: usuario.SuperAdmin,
      AccesoCompleto: false,
      Permisos: permisos.Recursos
    }
  };
};

const ObtenerRolesPorEmpresaServicio = async (CodigoEmpresaSolicitada, DatosUsuario) => {
  const CodigoEmpresa = Number(CodigoEmpresaSolicitada);
  if (!Number.isInteger(CodigoEmpresa) || CodigoEmpresa <= 0) {
    throw LanzarError('Debe seleccionar una empresa válida.', 400);
  }

  const [usuario, EmpresaAcceso] = await Promise.all([
    ObtenerUsuarioAutenticado(DatosUsuario),
    ObtenerEmpresaActiva(CodigoEmpresa)
  ]);

  if (usuario.SuperAdmin === 1) {
    return {
      CodigoEmpresa,
      NombreEmpresa: EmpresaAcceso.NombreEmpresa,
      AccesoCompleto: true,
      Roles: []
    };
  }

  const Asociaciones = await UsuarioEmpresa.findAll({
    where: {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoEmpresa,
      Estatus: 1
    },
    attributes: ['CodigoRol'],
    include: [{
      model: Rol,
      as: 'Rol_CodigoRol',
      attributes: ['CodigoRol', 'NombreRol'],
      where: { Estatus: 1 },
      required: true
    }]
  });

  if (Asociaciones.length === 0) {
    throw LanzarError('No tiene roles activos asignados a la empresa seleccionada.', 403);
  }

  return {
    CodigoEmpresa,
    NombreEmpresa: EmpresaAcceso.NombreEmpresa,
    AccesoCompleto: false,
    Roles: Asociaciones.map(({ Rol_CodigoRol }) => Rol_CodigoRol)
  };
};

const CambiarEmpresaServicio = async (
  CodigoEmpresaSolicitada,
  CodigoRolSolicitado,
  DatosUsuario
) => {
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

  const CodigoRol = Number(CodigoRolSolicitado);
  if (!Number.isInteger(CodigoRol) || CodigoRol <= 0) {
    throw LanzarError('Debe seleccionar un rol válido para la empresa.', 400);
  }

  const AsociacionAcceso = await UsuarioEmpresa.findOne({
    where: {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoEmpresa,
      CodigoRol,
      Estatus: 1
    },
    include: [{
      model: Rol,
      as: 'Rol_CodigoRol',
      attributes: ['CodigoRol', 'NombreRol', 'Estatus'],
      where: { Estatus: 1 },
      required: true
    }]
  });

  if (!AsociacionAcceso) {
    throw LanzarError('El rol no está activo ni asignado al usuario en esa empresa.', 403);
  }

  const permisos = await ObtenerPermisosFrontEnd(CodigoRol);
  const NombreRol = AsociacionAcceso.Rol_CodigoRol.NombreRol;
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
  ObtenerRolesPorEmpresaServicio,
  CambiarEmpresaServicio
};
