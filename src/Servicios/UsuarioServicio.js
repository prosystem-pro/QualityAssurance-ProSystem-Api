const { Usuario: Modelo, Rol } = require('../Modelos/Relaciones');
const { EncriptarClave } = require('../Configuracion/AutorizacionConfiguracion');
const { Op } = require('sequelize');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const CodigoModelo = 'CodigoUsuario';

const ObtenerCodigoRolActivo = async (CodigoRol) => {
  const Codigo = Number(CodigoRol);
  if (!Number.isInteger(Codigo) || Codigo <= 0) {
    throw LanzarError('Debe asignar un rol válido al usuario', 400);
  }

  const RolActivo = await Rol.findOne({
    where: { CodigoRol: Codigo, Estatus: 1 }
  });
  if (!RolActivo) {
    throw LanzarError('El rol no existe o está inactivo', 400);
  }
  return Codigo;
};

const ConvertirRespuestaUsuario = (Usuario) => {
  const DatosUsuario = Usuario.toJSON();
  delete DatosUsuario.ClaveHash;
  delete DatosUsuario.ClaveSalt;
  return DatosUsuario;
};

const Listado = async () => {
  const Usuarios = await Modelo.findAll({
    where: {
      Estatus: { [Op.in]: [1, 2] },
      SuperAdmin: { [Op.is]: null }
    },
    order: [['NombreUsuario', 'ASC']] 
  });
  return Usuarios.map(ConvertirRespuestaUsuario);
};

const Crear = async (Datos) => {
  if (!Datos || typeof Datos !== 'object' || Array.isArray(Datos)) {
    throw LanzarError('Datos inválidos para crear usuario', 400);
  }

  if (!Datos.Clave) {
    throw LanzarError('La clave es obligatoria', 400); 
  }

  if ('SuperAdmin' in Datos && Datos.SuperAdmin !== null) {
    throw LanzarError('No se puede asignar un valor a la columna Super Administrador', 400); 
  }

  const CodigoRol = await ObtenerCodigoRolActivo(Datos.CodigoRol);

  if (Datos.Correo && Datos.Correo.trim() !== '') {
    const correoExistente = await Modelo.findOne({ 
      where: { Correo: Datos.Correo } 
    });
    if (correoExistente) {
      throw LanzarError('El correo electrónico ya se encuentra registrado', 400);
    }
  }

  const { Salt, Hash } = await EncriptarClave(Datos.Clave);
  const DatosUsuario = { ...Datos, CodigoRol, ClaveHash: Hash, ClaveSalt: Salt };
  delete DatosUsuario.Clave;

  const Usuario = await Modelo.create(DatosUsuario);
  return ConvertirRespuestaUsuario(Usuario);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await Modelo.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  
  if (!Objeto) {
    throw LanzarError('Registro no encontrado', 404); 
  }

  const DatosActualizados = { ...Datos };

  if ('SuperAdmin' in Datos) {
    if (Objeto.SuperAdmin !== null) {
      throw LanzarError('No se puede modificar la columna Super Administrador de este registro', 400); 
    }
    delete DatosActualizados.SuperAdmin;
  }

  if ('CodigoRol' in DatosActualizados) {
    DatosActualizados.CodigoRol = await ObtenerCodigoRolActivo(DatosActualizados.CodigoRol);
  }

  if (DatosActualizados.Correo && DatosActualizados.Correo.trim() !== '') {
    const { Op } = require('sequelize'); 
    const correoExistente = await Modelo.findOne({ 
      where: { 
        Correo: DatosActualizados.Correo,
        [CodigoModelo]: { [Op.ne]: Codigo } 
      } 
    });
    if (correoExistente) {
      throw LanzarError('El correo electrónico ya se encuentra registrado por otro usuario', 400);
    }
  }

  if (DatosActualizados.Clave && DatosActualizados.Clave.trim() !== '') {
    const { Salt, Hash } = await EncriptarClave(DatosActualizados.Clave);
    DatosActualizados.ClaveHash = Hash;
    DatosActualizados.ClaveSalt = Salt;
    delete DatosActualizados.Clave;
  }

  await Objeto.update(DatosActualizados);
  return ConvertirRespuestaUsuario(Objeto);
};

const Eliminar = async (Codigo) => {
  const Objeto = await Modelo.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  
  if (!Objeto) {
    throw LanzarError('Registro no encontrado', 404); 
  }

  if (Objeto.SuperAdmin !== null) {
    throw LanzarError('No se puede eliminar un registro con Super Administrador asignado', 400);
  }

  await Objeto.destroy();
  return ConvertirRespuestaUsuario(Objeto);
};

module.exports = {
  Listado,
  Crear,
  Editar,
  Eliminar
};
