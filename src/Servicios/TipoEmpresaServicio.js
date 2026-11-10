const { TipoEmpresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const CodigoModelo = 'CodigoTipoEmpresa';
const NombreModelo = 'NombreTipoEmpresa';

const Listado = async () => {
  return await TipoEmpresa.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Objeto = await TipoEmpresa.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const Crear = async (Datos) => {
  return await TipoEmpresa.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await TipoEmpresa.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const Eliminar = async (Codigo) => {
  const Objeto = await TipoEmpresa.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.destroy();
  return Objeto;
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Crear,
  Editar,
  Eliminar
};
