const { Empresa } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');
const { randomUUID } = require('crypto');

const CodigoModelo = 'CodigoEmpresa';
const NombreModelo = 'NombreEmpresa'; 

const GenerarCodigoExterno = async (NombreEmpresa, CodigoEmpresa = null) => {
  const PrimerNombre = String(NombreEmpresa || 'EMPRESA')
    .trim()
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 27) || 'EMPRESA';

  for (let Intento = 0; Intento < 5; Intento += 1) {
    const CodigoExterno = `${PrimerNombre}-${randomUUID().toUpperCase()}`;
    const Condicion = { CodigoExterno };
    if (CodigoEmpresa !== null) Condicion.CodigoEmpresa = { [Op.ne]: CodigoEmpresa };

    const Existente = await Empresa.findOne({
      attributes: [CodigoModelo],
      where: Condicion
    });
    if (!Existente) return CodigoExterno;
  }

  throw LanzarError('No se pudo generar un código externo único.', 500);
};

const Listado = async () => {
  return await Empresa.findAll({
    where: { Estatus: { [Op.in]: [1, 2] } }, 
    order: [[NombreModelo, 'ASC']] 
  });
};

const Crear = async (Datos) => {
  const DatosEmpresa = { ...Datos };
  DatosEmpresa.CodigoExterno = await GenerarCodigoExterno(Datos.NombreEmpresa);
  return await Empresa.create(DatosEmpresa);
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

  const DatosActualizados = { ...Datos };
  if (
    Object.prototype.hasOwnProperty.call(Datos, NombreModelo) &&
    Datos.NombreEmpresa !== Objeto.NombreEmpresa
  ) {
    DatosActualizados.CodigoExterno = await GenerarCodigoExterno(Datos.NombreEmpresa, Codigo);
  } else {
    delete DatosActualizados.CodigoExterno;
  }

  await Objeto.update(DatosActualizados);
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
