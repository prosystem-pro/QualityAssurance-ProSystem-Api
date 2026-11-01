const { Empresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const CodigoModelo = 'CodigoEmpresa';
const NombreModelo = 'NombreEmpresa'; 

const Listado = async () => {
  return await Empresa.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } }, 
    order: [[NombreModelo, 'ASC']] 
  });
};

const Crear = async (Datos) => {
  return await Empresa.create(Datos);
};

const ObtenerPorCodigo = async (Codigo) => {
  const Objeto = await Empresa.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await Empresa.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404); 
  await Objeto.update(Datos);
  return Objeto;
};

const Eliminar = async (Codigo) => {
  const Objeto = await Empresa.findOne({ 
    where: { [CodigoModelo]: Codigo } 
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404); 
  await Objeto.destroy();
  return Objeto;
};

module.exports = {
  Listado,
  Crear,
  ObtenerPorCodigo,
  Editar,
  Eliminar
};
