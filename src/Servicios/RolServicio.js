const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const { Op } = require('sequelize');
const Modelo = require('../Modelos/Rol')(BaseDatos, Sequelize.DataTypes);
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombreRol';
const CodigoModelo = 'CodigoRol';

const Listado = async () => {
  return await Modelo.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } },
    order: [[NombreModelo, 'ASC']]
  });
};

const ObtenerPorCodigo = async (Codigo) => {
  const Registro = await Modelo.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Registro) throw LanzarError('Registro no encontrado', 404);
  return Registro;
};

const Buscar = async (TipoBusqueda, ValorBusqueda) => {
  const Tipo = parseInt(TipoBusqueda);

  switch (Tipo) {
    case 1:
      return await Modelo.findAll({
        where: {
          [NombreModelo]: { [Op.like]: `%${ValorBusqueda}%` },
          Estatus: { [Op.in]: [1, 2] }
        },
        order: [[NombreModelo, 'ASC']]
      });
    case 2:
      return await Modelo.findAll({
        where: { Estatus: { [Op.in]: [1, 2] } },
        order: [[NombreModelo, 'ASC']]
      });
    default:
      throw LanzarError('Tipo de búsqueda no válido', 400);
  }
};

const Crear = async (Datos) => {
  return await Modelo.create(Datos);
};

const Editar = async (Codigo, Datos) => {
  const Registro = await Modelo.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Registro) throw LanzarError('Registro no encontrado', 404);
  await Registro.update(Datos);
  return Registro;
};

const Eliminar = async (Codigo) => {
  const Registro = await Modelo.findOne({
    where: { [CodigoModelo]: Codigo }
  });
  if (!Registro) throw LanzarError('Registro no encontrado', 404);
  await Registro.destroy();
  return Registro;
};

module.exports = {
  Listado,
  ObtenerPorCodigo,
  Buscar,
  Crear,
  Editar,
  Eliminar
};
