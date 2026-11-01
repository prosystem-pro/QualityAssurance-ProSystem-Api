const { Op } = require('sequelize');
const {
    PermisoRolRecurso,
    PermisoRolRecurso: Modelo,
    Permiso,
    Recurso,
    Rol
} = require('../Modelos/Relaciones');
const { ObtenerTodasLasTablasConPermisos } = require('../FuncionIntermedia/ObtenerPermisosTablas');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'CodigoPermiso';

const Listado = async () => {
    const datos = await PermisoRolRecurso.findAll({
        where: { Estatus: { [Op.in]: [1, 2] } },
        attributes: ['CodigoRol', 'CodigoPermiso', 'CodigoRecurso', 'Estatus'],
        include: [
            { model: Rol, as: 'Rol_CodigoRol', attributes: ['NombreRol'], required: true },
            { model: Permiso, as: 'Permiso_CodigoPermiso', attributes: ['NombrePermiso'], required: true },
            { model: Recurso, as: 'Recurso_CodigoRecurso', attributes: ['NombreRecurso'], required: true }
        ],
        order: [['CodigoRol', 'ASC'], ['CodigoRecurso', 'ASC']]
    });

    return datos.map(item => {
        const plano = item.toJSON();
        return {
            CodigoRol: plano.CodigoRol,
            CodigoPermiso: plano.CodigoPermiso,
            CodigoRecurso: plano.CodigoRecurso,
            Estatus: plano.Estatus,
            Rol: plano.Rol_CodigoRol,
            Permiso: plano.Permiso_CodigoPermiso,
            Recurso: plano.Recurso_CodigoRecurso
        };
    });
};

const ObtenerPorCodigo = async (CodigoRol, CodigoPermiso, CodigoRecurso) => {
    const registro = await Modelo.findOne({
        where: { CodigoRol, CodigoPermiso, CodigoRecurso }
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
            throw LanzarError('Tipo de búsqueda no válido', 400);
    }
};

const Crear = async (Datos) => {
    const { CodigoRol, Datos: items } = Datos;

    if (!CodigoRol) throw LanzarError('Falta CódigoRol en los datos', 400);
    if (!Array.isArray(items) || items.length === 0) {
        throw LanzarError('No hay items para crear', 400);
    }

    const registros = items.map(item => ({
        CodigoRol,
        CodigoRecurso: item.CodigoRecurso,
        CodigoPermiso: item.CodigoPermiso,
        Estatus: item.Estatus ?? 1
    }));

    const existentes = await Modelo.findAll({
        where: {
            CodigoRol,
            [Op.or]: registros.map(r => ({
                CodigoRecurso: r.CodigoRecurso,
                CodigoPermiso: r.CodigoPermiso
            }))
        }
    });

    const existentesSet = new Set(existentes.map(e => `${e.CodigoRecurso}-${e.CodigoPermiso}`));
    const registrosFiltrados = registros.filter(r =>
        !existentesSet.has(`${r.CodigoRecurso}-${r.CodigoPermiso}`)
    );

    if (registrosFiltrados.length === 0) {
        throw LanzarError('Todos los permisos ya existen para este rol', 409);
    }

    return await Modelo.bulkCreate(registrosFiltrados);
};

const Editar = async (Datos) => {
    const { CodigoRol, CodigoPermiso, CodigoRecurso, Estatus } = Datos;
    const Objeto = await Modelo.findOne({
        where: { CodigoRol, CodigoPermiso, CodigoRecurso }
    });
    if (!Objeto) throw LanzarError('Registro no encontrado para editar', 404);

    await Objeto.update({ Estatus });
    return Objeto;
};

const EliminarPorRol = async (CodigoRol) => {
    if (!CodigoRol || isNaN(CodigoRol)) {
        throw LanzarError('Código de rol inválido', 400);
    }

    const registros = await Modelo.findAll({ where: { CodigoRol } });
    if (registros.length === 0) {
        throw LanzarError(`No se encontraron registros para el rol ${CodigoRol}`, 404);
    }

    const cantidadEliminada = await Modelo.destroy({ where: { CodigoRol } });
    return { Exito: `Se eliminaron ${cantidadEliminada} registros relacionados al rol ${CodigoRol}.` };
};

const EliminarPorRolRecurso = async (CodigoRol, CodigoRecurso) => {
    if (!CodigoRol || isNaN(CodigoRol)) {
        throw LanzarError('Código de rol inválido', 400);
    }
    if (!CodigoRecurso || isNaN(CodigoRecurso)) {
        throw LanzarError('Código de recurso inválido', 400);
    }

    const registros = await Modelo.findAll({ where: { CodigoRol, CodigoRecurso } });
    if (registros.length === 0) return 0;

    return await Modelo.destroy({ where: { CodigoRol, CodigoRecurso } });
};

const EliminarPorPermisoRolRecurso = async (CodigoRol, CodigoRecurso, CodigoPermiso) => {
    if (!CodigoRol || isNaN(CodigoRol)) {
        throw LanzarError('Código de rol inválido', 400);
    }
    if (!CodigoRecurso || isNaN(CodigoRecurso)) {
        throw LanzarError('Código de recurso inválido', 400);
    }
    if (!CodigoPermiso || isNaN(CodigoPermiso)) {
        throw LanzarError('Código de permiso inválido', 400);
    }

    const registro = await Modelo.findOne({
        where: { CodigoRol, CodigoRecurso, CodigoPermiso }
    });
    if (!registro) return 0;

    await registro.destroy();
    return 1;
};

const FiltrarRoles = async () => {
    const roles = await Rol.findAll();
    const recursos = await Recurso.findAll();
    const tablasConPermisos = ObtenerTodasLasTablasConPermisos();
    const todosLosPermisos = await Permiso.findAll();

    const permisosPorNombre = new Map();
    todosLosPermisos.forEach(p => permisosPorNombre.set(p.NombrePermiso, p.CodigoPermiso));

    const rolesIncompletos = [];

    for (const rol of roles) {
        let rolCompleto = true;
        for (const recurso of recursos) {
            const definicion = tablasConPermisos.find(t => t.Tabla === recurso.NombreRecurso);
            if (!definicion) continue;

            const permisosValidos = definicion.Permisos
                .map(nombre => permisosPorNombre.get(nombre))
                .filter(Boolean);

            const permisosAsignados = await PermisoRolRecurso.findAll({
                where: { CodigoRol: rol.CodigoRol, CodigoRecurso: recurso.CodigoRecurso },
                attributes: ['CodigoPermiso']
            });

            const permisosAsignadosSet = new Set(permisosAsignados.map(p => p.CodigoPermiso));
            const faltantes = permisosValidos.filter(pid => !permisosAsignadosSet.has(pid));

            if (faltantes.length > 0) { rolCompleto = false; break; }
        }
        if (!rolCompleto) rolesIncompletos.push(rol);
    }

    return rolesIncompletos;
};

const FiltrarRecursos = async (CodigoRol) => {
    const todosLosRecursos = await Recurso.findAll();
    const permisosPorRecurso = await PermisoRolRecurso.findAll({
        where: { CodigoRol },
        attributes: ['CodigoRecurso', 'CodigoPermiso']
    });

    const permisosAsignadosMap = new Map();
    for (const pr of permisosPorRecurso) {
        if (!permisosAsignadosMap.has(pr.CodigoRecurso)) {
            permisosAsignadosMap.set(pr.CodigoRecurso, new Set());
        }
        permisosAsignadosMap.get(pr.CodigoRecurso).add(pr.CodigoPermiso);
    }

    const todosLosPermisos = await Permiso.findAll();
    const permisosPorNombre = new Map();
    todosLosPermisos.forEach(p => permisosPorNombre.set(p.NombrePermiso, p.CodigoPermiso));

    const tablasConPermisos = ObtenerTodasLasTablasConPermisos();
    const recursosNoCreados = [];
    const recursosConPermisosPendientes = [];

    for (const recurso of todosLosRecursos) {
        const definicion = tablasConPermisos.find(t => t.Tabla === recurso.NombreRecurso);
        if (!definicion) continue;

        const permisosValidos = definicion.Permisos
            .map(n => permisosPorNombre.get(n))
            .filter(Boolean);

        const permisosAsignados = permisosAsignadosMap.get(recurso.CodigoRecurso) || new Set();

        if (permisosAsignados.size === 0) {
            recursosNoCreados.push(recurso);
            continue;
        }

        const faltantes = permisosValidos.filter(pid => !permisosAsignados.has(pid));
        if (faltantes.length > 0) {
            recursosConPermisosPendientes.push(recurso);
        }
    }

    return { recursosNoCreados, recursosConPermisosPendientes };
};

const FiltrarPermisos = async (CodigoRol, CodigoRecurso) => {
    const permisosAsignados = await PermisoRolRecurso.findAll({
        where: { CodigoRol, CodigoRecurso },
        attributes: ['CodigoPermiso']
    });

    const permisosAsignadosIds = permisosAsignados.map(p => p.CodigoPermiso);
    const permisosDisponibles = await Permiso.findAll({
        where: { CodigoPermiso: { [Op.notIn]: permisosAsignadosIds } }
    });

    const recurso = await Recurso.findOne({
        where: { CodigoRecurso },
        attributes: ['NombreRecurso']
    });
    if (!recurso) return [];

    const tablasConPermisos = ObtenerTodasLasTablasConPermisos();
    const definicionRecurso = tablasConPermisos.find(t => t.Tabla === recurso.NombreRecurso);
    if (!definicionRecurso) return [];

    return permisosDisponibles.filter(p => definicionRecurso.Permisos.includes(p.NombrePermiso));
};

const ObtenerResumenPermisosUnicos = () => {
    const tablasConPermisos = ObtenerTodasLasTablasConPermisos();
    const permisosSet = new Set();
    tablasConPermisos.forEach(tabla =>
        tabla.Permisos.forEach(permiso => permisosSet.add(permiso))
    );
    return Array.from(permisosSet);
};

const ObtenerPermisosFrontEnd = async (CodigoRol) => {
    if (!CodigoRol || isNaN(CodigoRol)) {
        throw LanzarError('Código de rol inválido', 400);
    }

    const registros = await PermisoRolRecurso.findAll({
        where: { CodigoRol },
        attributes: ['CodigoRecurso', 'CodigoPermiso'],
        include: [
            { model: Rol, as: 'Rol_CodigoRol', attributes: ['NombreRol'] },
            { model: Recurso, as: 'Recurso_CodigoRecurso', attributes: ['NombreRecurso'] },
            { model: Permiso, as: 'Permiso_CodigoPermiso', attributes: ['NombrePermiso'] }
        ],
        order: [['CodigoRecurso', 'ASC'], ['CodigoPermiso', 'ASC']]
    });

    if (registros.length === 0) {
        throw LanzarError(`No se encontraron permisos para el rol ${CodigoRol}`, 404);
    }

    const nombreRol = registros[0].Rol_CodigoRol.NombreRol;
    const recursosMap = new Map();

    for (const reg of registros) {
        const recursoId = reg.CodigoRecurso;
        if (!recursosMap.has(recursoId)) {
            recursosMap.set(recursoId, {
                CodigoRecurso: recursoId,
                NombreRecurso: reg.Recurso_CodigoRecurso.NombreRecurso,
                Permisos: []
            });
        }
        recursosMap.get(recursoId).Permisos.push({
            CodigoPermiso: reg.CodigoPermiso,
            NombrePermiso: reg.Permiso_CodigoPermiso.NombrePermiso
        });
    }

    return {
        CodigoRol,
        NombreRol: nombreRol,
        Recursos: Array.from(recursosMap.values())
    };
};

module.exports = {
    Listado,
    ObtenerPorCodigo,
    Buscar,
    Crear,
    Editar,
    FiltrarPermisos,
    FiltrarRecursos,
    FiltrarRoles,
    EliminarPorRol,
    EliminarPorRolRecurso,
    EliminarPorPermisoRolRecurso,
    ObtenerResumenPermisosUnicos,
    ObtenerPermisosFrontEnd
};
