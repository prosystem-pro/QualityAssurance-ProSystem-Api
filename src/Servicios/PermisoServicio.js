const { Op } = require('sequelize');
const { Permiso: Modelo } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombrePermiso';
const CodigoModelo = 'CodigoPermiso';

const Listado = async () => {
    return await Modelo.findAll({
        where: { Estatus: { [Op.in]: [1, 2] } },
        order: [[NombreModelo, 'ASC']]
    });
};

const ObtenerPorCodigo = async (Codigo) => {
    const registro = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!registro) throw LanzarError('Registro no encontrado', 404);
    return registro;
};

const Buscar = async (TipoBusqueda, ValorBusqueda) => {
    switch (parseInt(TipoBusqueda)) {
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
            throw LanzarError('Tipo de búsqueda inválido', 400);
    }
};

const Crear = async (Datos) => {
    const EsPermisoValido = (Dato) =>
        Dato !== null &&
        typeof Dato === 'object' &&
        !Array.isArray(Dato) &&
        typeof Dato.NombrePermiso === 'string' &&
        Dato.NombrePermiso.trim().length > 0;

    if (Array.isArray(Datos)) {
        if (Datos.length === 0 || !Datos.every(EsPermisoValido)) {
            throw LanzarError('Cada permiso debe incluir un NombrePermiso válido', 400);
        }
        return await Modelo.bulkCreate(Datos, { validate: true });
    }

    if (!EsPermisoValido(Datos)) {
        throw LanzarError('Datos inválidos para crear registro', 400);
    }
    return await Modelo.create(Datos);
};

const Editar = async (Codigo, Datos) => {
    const registro = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!registro) throw LanzarError('Registro no encontrado para editar', 404);
    await registro.update(Datos);
    return registro;
};

const Eliminar = async (Codigo) => {
    const registro = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!registro) throw LanzarError('Registro no encontrado para eliminar', 404);
    await registro.destroy();
    return registro;
};

const EliminarEnLote = async (Codigos) => {
    if (!Array.isArray(Codigos) || Codigos.length === 0) {
        throw LanzarError('Debe enviar una lista de códigos de permisos', 400);
    }

    const CodigosNormalizados = Codigos.map((Codigo) => {
        if (typeof Codigo !== 'number' && typeof Codigo !== 'string') return NaN;
        if (typeof Codigo === 'string' && !Codigo.trim()) return NaN;
        return Number(Codigo);
    });

    if (CodigosNormalizados.some((Codigo) =>
        !Number.isSafeInteger(Codigo) || Codigo <= 0
    )) {
        throw LanzarError('La lista contiene códigos de permiso inválidos', 400);
    }

    const CodigosUnicos = [...new Set(CodigosNormalizados)];
    const CantidadEliminada = await Modelo.destroy({
        where: { [CodigoModelo]: { [Op.in]: CodigosUnicos } }
    });

    if (CantidadEliminada === 0) {
        throw LanzarError('No se encontraron permisos para eliminar', 404);
    }

    return CantidadEliminada;
};

module.exports = {
    Listado,
    ObtenerPorCodigo,
    Buscar,
    Crear,
    Editar,
    Eliminar,
    EliminarEnLote
};
