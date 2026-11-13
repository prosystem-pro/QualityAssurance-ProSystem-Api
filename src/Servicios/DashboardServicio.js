const {
  Empresa,
  TipoEmpresa,
  Usuario,
  UsuarioEmpresa
} = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const AtributosEmpresa = [
  'CodigoEmpresa',
  'CodigoTipoEmpresa',
  'NombreEmpresa',
  'RazonSocial',
  'NIT',
  'Correo',
  'Direccion',
  'Telefono',
  'Departamento',
  'Municipio',
  'ImagenUrl',
  'Eslogan',
  'CodigoExterno',
  'Estatus'
];

const CrearIncluirTipoEmpresa = () => ({
  model: TipoEmpresa,
  as: 'TipoEmpresa_CodigoTipoEmpresa',
  attributes: ['CodigoTipoEmpresa', 'NombreTipoEmpresa']
});

const ObtenerEmpresas = async ({ CodigoUsuario, SuperAdmin }) => {
  if (SuperAdmin === 1) {
    const Empresas = await Empresa.findAll({
      attributes: AtributosEmpresa,
      where: { Estatus: { [Op.in]: [1, 2] } },
      include: [CrearIncluirTipoEmpresa()],
      order: [['NombreEmpresa', 'ASC']]
    });

    return Empresas.map((EmpresaActual) => ({
      ...EmpresaActual.toJSON(),
      EsEmpresaPrincipal: false
    }));
  }

  const Codigo = Number(CodigoUsuario);
  if (!Number.isInteger(Codigo) || Codigo <= 0) {
    throw LanzarError('El token no contiene un usuario válido.', 401);
  }

  const [Asociaciones, UsuarioActual] = await Promise.all([
    UsuarioEmpresa.findAll({
      attributes: ['EsEmpresaPrincipal'],
      where: {
        CodigoUsuario: Codigo,
        Estatus: { [Op.in]: [1, 2] }
      },
      include: [{
        model: Empresa,
        as: 'Empresa_CodigoEmpresa',
        attributes: AtributosEmpresa,
        where: { Estatus: { [Op.in]: [1, 2] } },
        required: true,
        include: [CrearIncluirTipoEmpresa()]
      }]
    }),
    Usuario.findByPk(Codigo, { attributes: ['Estatus'] })
  ]);

  if (!UsuarioActual || UsuarioActual.Estatus !== 1) {
    throw LanzarError('Usuario inactivo o no encontrado.', 403);
  }

  const EmpresasPorCodigo = new Map();
  for (const Asociacion of Asociaciones) {
    const EmpresaActual = Asociacion.Empresa_CodigoEmpresa;
    if (!EmpresaActual) continue;

    EmpresasPorCodigo.set(EmpresaActual.CodigoEmpresa, {
      ...EmpresaActual.toJSON(),
      EsEmpresaPrincipal: Asociacion.EsEmpresaPrincipal === 1
    });
  }

  return Array.from(EmpresasPorCodigo.values())
    .sort((EmpresaA, EmpresaB) =>
      String(EmpresaA.NombreEmpresa || '').localeCompare(String(EmpresaB.NombreEmpresa || ''))
    );
};

module.exports = { ObtenerEmpresas };
