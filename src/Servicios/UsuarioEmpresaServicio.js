const { UsuarioEmpresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const CodigoModelo = 'CodigoUsuarioEmpresa';

const Listado = async () => {
  return await UsuarioEmpresa.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[CodigoModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Objeto = await UsuarioEmpresa.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  return Objeto;
};

const Crear = async (Datos) => {
  return await UsuarioEmpresa.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Objeto = await UsuarioEmpresa.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Objeto) throw LanzarError('Registro no encontrado', 404);
  await Objeto.update(Datos);
  return Objeto;
};

const Eliminar = async (Codigo) => {
  const Objeto = await UsuarioEmpresa.findOne({
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
