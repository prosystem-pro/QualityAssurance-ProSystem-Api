const { Op } = require('sequelize');
const { Recurso: Modelo } = require('../Modelos/Relaciones');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombreRecurso';
const CodigoModelo = 'CodigoRecurso';

const Listado = async () => {
    return await Modelo.findAll({
        where: { Estatus: { [Op.in]: [1, 2] } },
        order: [[NombreModelo, 'ASC']]
    });
};

const ObtenerPorCodigo = async (Codigo) => {
    const Objeto = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!Objeto) throw LanzarError('Registro no encontrado', 404);
    return Objeto;
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
    const EsRecursoValido = (Dato) =>
        Dato !== null &&
        typeof Dato === 'object' &&
        !Array.isArray(Dato) &&
        typeof Dato[NombreModelo] === 'string' &&
        Dato[NombreModelo].trim().length > 0;

    if (Array.isArray(Datos)) {
        if (Datos.length === 0 || !Datos.every(EsRecursoValido)) {
            throw LanzarError('Cada recurso debe incluir un NombreRecurso válido', 400);
        }
        return await Modelo.bulkCreate(Datos, { validate: true });
    }

    if (!EsRecursoValido(Datos)) {
        throw LanzarError('Datos inválidos para crear registro', 400);
    }
    return await Modelo.create(Datos);
};

const Editar = async (Codigo, Datos) => {
    const Objeto = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!Objeto) throw LanzarError('Registro no encontrado para editar', 404);
    await Objeto.update(Datos);
    return Objeto;
};

const Eliminar = async (Codigo) => {
    const Objeto = await Modelo.findOne({
        where: { [CodigoModelo]: Codigo }
    });
    if (!Objeto) throw LanzarError('Registro no encontrado para eliminar', 404);
    await Objeto.destroy();
    return Objeto;
};

const EliminarEnLote = async (Codigos) => {
    if (!Array.isArray(Codigos) || Codigos.length === 0) {
        throw LanzarError('Debe enviar una lista de códigos de recursos', 400);
    }

    const CodigosNormalizados = Codigos.map((Codigo) => {
        if (typeof Codigo !== 'number' && typeof Codigo !== 'string') return NaN;
        if (typeof Codigo === 'string' && !Codigo.trim()) return NaN;
        return Number(Codigo);
    });

    if (CodigosNormalizados.some((Codigo) =>
        !Number.isSafeInteger(Codigo) || Codigo <= 0
    )) {
        throw LanzarError('La lista contiene códigos de recurso inválidos', 400);
    }

    const CodigosUnicos = [...new Set(CodigosNormalizados)];
    const CantidadEliminada = await Modelo.destroy({
        where: { [CodigoModelo]: { [Op.in]: CodigosUnicos } }
    });

    if (CantidadEliminada === 0) {
        throw LanzarError('No se encontraron recursos para eliminar', 404);
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
