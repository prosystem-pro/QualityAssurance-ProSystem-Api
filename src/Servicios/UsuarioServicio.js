const { Usuario: Modelo } = require('../Modelos/Relaciones');
const { EncriptarClave } = require('../Configuracion/AutorizacionConfiguracion');
const { Op } = require('sequelize');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const CodigoModelo = 'CodigoUsuario';

const Listado = async () => {
  return await Modelo.findAll({
    where: {
      Estatus: { [Op.in]: [1, 2] },
      SuperAdmin: { [Op.is]: null }
    },
    order: [['NombreUsuario', 'ASC']] 
  });
};

const Crear = async (Datos) => {
  if (!Datos.Clave) {
    throw LanzarError('La clave es obligatoria', 400); 
  }

  if ('SuperAdmin' in Datos && Datos.SuperAdmin !== null) {
    throw LanzarError('No se puede asignar un valor a la columna Super Administrador', 400); 
  }

  if (Datos.Correo && Datos.Correo.trim() !== '') {
    const correoExistente = await Modelo.findOne({ 
      where: { Correo: Datos.Correo } 
    });
    if (correoExistente) {
      throw LanzarError('El correo electrónico ya se encuentra registrado', 400);
    }
  }

  const { Salt, Hash } = await EncriptarClave(Datos.Clave);
  Datos.ClaveHash = Hash;
  Datos.ClaveSalt = Salt;
  delete Datos.Clave;

  return await Modelo.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await Modelo.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  
  if (!Objeto) {
    throw LanzarError('Registro no encontrado', 404); 
  }

  if ('SuperAdmin' in Datos) {
    if (Objeto.SuperAdmin !== null) {
      throw LanzarError('No se puede modificar la columna Super Administrador de este registro', 400); 
    }
    delete Datos.SuperAdmin;
  }


  if (Datos.Correo && Datos.Correo.trim() !== '') {
    const { Op } = require('sequelize'); 
    const correoExistente = await Modelo.findOne({ 
      where: { 
        Correo: Datos.Correo,
        [CodigoModelo]: { [Op.ne]: Codigo } 
      } 
    });
    if (correoExistente) {
      throw LanzarError('El correo electrónico ya se encuentra registrado por otro usuario', 400);
    }
  }

  if (Datos.Clave && Datos.Clave.trim() !== '') {
    const { Salt, Hash } = await EncriptarClave(Datos.Clave);
    Datos.ClaveHash = Hash;
    Datos.ClaveSalt = Salt;
    delete Datos.Clave;
  }

  await Objeto.update(Datos);
  return Objeto;
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
  return Objeto;
};

module.exports = {
  Listado,
  Crear,
  Editar,
  Eliminar
};
