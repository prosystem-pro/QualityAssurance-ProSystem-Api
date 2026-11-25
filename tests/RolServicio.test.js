const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const transaccion = {};
let transaccionesConfirmadas;
let transaccionesRevertidas;
let recursosCreados;
let permisosCreados;
let asignacionesCreadas;
let asignacionesConsultadas;
let eliminacionAsignaciones;
let rolesGuardados;
let eventos;
let errorUnicoEn;
let permisoInactivo;

const crearErrorUnico = () => {
  const error = new Error('Duplicate role name');
  error.name = 'SequelizeUniqueConstraintError';
  error.fields = { NombreRol: 'NombreRol' };
  return error;
};

const crearRol = (CodigoRol, NombreRol, Estatus = 1) => ({
  CodigoRol,
  NombreRol,
  Estatus,
  toJSON() {
    return {
      CodigoRol: this.CodigoRol,
      NombreRol: this.NombreRol,
      Estatus: this.Estatus
    };
  },
  async update(datos, opciones) {
    assert.equal(opciones.transaction, transaccion);
    if (errorUnicoEn === 'editar') throw crearErrorUnico();
    Object.assign(this, datos);
    eventos.push('actualizar-rol');
    return this;
  }
});

const crearModeloCatalogo = (Codigo) => {
  const registros = new Map();
  let siguienteCodigo = 1;
  return {
    limpiar() {
      registros.clear();
      siguienteCodigo = 1;
    },
    async findOrCreate({ where, defaults }) {
      const Nombre = Object.values(where)[0];
      if (!registros.has(Nombre)) {
        registros.set(Nombre, {
          ...defaults,
          [Codigo]: siguienteCodigo++,
          Estatus: Nombre === permisoInactivo ? 2 : 1
        });
      }
      const Registro = registros.get(Nombre);
      if (Codigo === 'CodigoRecurso') recursosCreados.push(Registro);
      else permisosCreados.push(Registro);
      return [Registro, false];
    }
  };
};

const ModeloRol = {
  async findAll() { return []; },
  async findOne({ where }) {
    if (where.CodigoRol !== undefined) {
      return rolesGuardados.find(
        (rol) => String(rol.CodigoRol) === String(where.CodigoRol)
      ) || null;
    }
    return rolesGuardados.find((rol) => rol.NombreRol === where.NombreRol) || null;
  },
  async create(datos) {
    if (errorUnicoEn === 'crear') throw crearErrorUnico();
    const rol = crearRol(10, datos.NombreRol, datos.Estatus);
    rolesGuardados.push(rol);
    return rol;
  }
};

const ModeloRecurso = crearModeloCatalogo('CodigoRecurso');
const ModeloPermiso = crearModeloCatalogo('CodigoPermiso');
const ModeloPermisoRolRecurso = {
  async findAll() {
    return asignacionesConsultadas;
  },
  async destroy(opciones) {
    assert.equal(opciones.transaction, transaccion);
    eliminacionAsignaciones = opciones;
    asignacionesCreadas = [];
    eventos.push('eliminar-asignaciones');
    return 1;
  },
  async bulkCreate(datos, opciones) {
    assert.equal(opciones.transaction, transaccion);
    asignacionesCreadas = datos;
    eventos.push('crear-asignaciones');
    return datos;
  }
};

const BaseDatos = {
  async transaction(ejecutar) {
    try {
      const resultado = await ejecutar(transaccion);
      transaccionesConfirmadas++;
      return resultado;
    } catch (error) {
      transaccionesRevertidas++;
      throw error;
    }
  }
};

const cargarOriginal = Module._load;
Module._load = function(solicitud, padre, principal) {
  if (padre && padre.filename.endsWith('RolServicio.js')) {
    if (solicitud === '../BaseDatos/ConexionBaseDatos') return BaseDatos;
    if (solicitud === '../Modelos/Relaciones') {
      return {
        Rol: ModeloRol,
        Recurso: ModeloRecurso,
        Permiso: ModeloPermiso,
        PermisoRolRecurso: ModeloPermisoRolRecurso
      };
    }
    if (solicitud === '../FuncionIntermedia/ObtenerPermisosTablas') {
      return {
        ObtenerTodasLasTablasConPermisos: () => [
          {
            Tabla: 'Dashboard',
            Permisos: ['ListadoDashboard']
          },
          {
            Tabla: 'CasosDePrueba',
            Permisos: [
              'ListadoTipoPrueba', 'VerTipoPrueba', 'CrearTipoPrueba', 'EditarTipoPrueba', 'EliminarTipoPrueba',
              'ListadoPrioridad', 'VerPrioridad', 'CrearPrioridad', 'EditarPrioridad', 'EliminarPrioridad',
              'ListadoEstadoCaso', 'VerEstadoCaso', 'CrearEstadoCaso', 'EditarEstadoCaso', 'EliminarEstadoCaso',
              'ListadoCarpeta', 'VerCarpeta', 'CrearCarpeta', 'EditarCarpeta', 'EliminarCarpeta',
              'ListadoCasoPrueba', 'VerCasoPrueba', 'CrearCasoPrueba', 'EditarCasoPrueba', 'EliminarCasoPrueba'
            ]
          },
          {
            Tabla: 'EjecucionPrueba',
            Permisos: [
              'ListadoResultadoEjecucion', 'VerResultadoEjecucion', 'CrearResultadoEjecucion', 'EditarResultadoEjecucion', 'EliminarResultadoEjecucion',
              'ListadoEjecucionPrueba', 'VerEjecucionPrueba', 'CrearEjecucionPrueba', 'EditarEjecucionPrueba', 'EliminarEjecucionPrueba',
              'CrearDetalleEjecucionPrueba', 'EditarDetalleEjecucionPrueba', 'EliminarDetalleEjecucionPrueba'
            ]
          }
        ]
      };
    }
    if (solicitud === '../Utilidades/ErrorServicios') {
      return {
        LanzarError(mensaje, statusCode) {
          const error = new Error(mensaje);
          error.statusCode = statusCode;
          throw error;
        }
      };
    }
  }
  return cargarOriginal.call(this, solicitud, padre, principal);
};
const servicio = require('../src/Servicios/RolServicio');
Module._load = cargarOriginal;

test.beforeEach(() => {
  transaccionesConfirmadas = 0;
  transaccionesRevertidas = 0;
  recursosCreados = [];
  permisosCreados = [];
  asignacionesCreadas = undefined;
  asignacionesConsultadas = [];
  eliminacionAsignaciones = undefined;
  rolesGuardados = [];
  eventos = [];
  errorUnicoEn = undefined;
  permisoInactivo = undefined;
  ModeloRecurso.limpiar();
  ModeloPermiso.limpiar();
});

test('crea el rol y asigna los permisos de cada recurso seleccionado en una transacción', async () => {
  const resultado = await servicio.Crear({
    NombreRol: ' Administrador ',
    NombresRecurso: ['Dashboard', 'CasosDePrueba', 'EjecucionPrueba']
  });

  assert.deepEqual(resultado, {
    mensaje: 'Rol creado y permisos asignados correctamente',
    CodigoRol: 10,
    NombreRol: 'Administrador',
    RecursosAplicados: ['Dashboard', 'CasosDePrueba', 'EjecucionPrueba'],
    RecursosAsignados: 3,
    PermisosAsignados: 39
  });
  assert.equal(transaccionesConfirmadas, 1);
  assert.equal(transaccionesRevertidas, 0);
  assert.equal(asignacionesCreadas.length, 39);
  assert.ok(asignacionesCreadas.every((asignacion) => asignacion.CodigoRol === 10));
  assert.deepEqual(
    Object.fromEntries(
      ['Dashboard', 'CasosDePrueba', 'EjecucionPrueba'].map((Nombre) => [
        Nombre,
        asignacionesCreadas.filter((registro) =>
          registro.CodigoRecurso === recursosCreados.find(
            (recurso) => recurso.NombreRecurso === Nombre
          ).CodigoRecurso
        ).length
      ])
    ),
    { Dashboard: 1, CasosDePrueba: 25, EjecucionPrueba: 13 }
  );
});

test('rechaza recursos no definidos sin iniciar una transacción', async () => {
  await assert.rejects(servicio.Crear({
    NombreRol: 'Consulta',
    NombresRecurso: ['NoExiste']
  }), {
    message: 'Recursos no disponibles: NoExiste',
    statusCode: 400
  });

  assert.equal(transaccionesConfirmadas, 0);
  assert.equal(transaccionesRevertidas, 0);
});

test('revierte la creación si el catálogo de permisos seleccionado está inactivo', async () => {
  permisoInactivo = 'ListadoTipoPrueba';

  await assert.rejects(servicio.Crear({
    NombreRol: 'Consulta',
    NombresRecurso: ['CasosDePrueba']
  }), {
    message: 'El permiso "ListadoTipoPrueba" está inactivo',
    statusCode: 409
  });

  assert.equal(transaccionesConfirmadas, 0);
  assert.equal(transaccionesRevertidas, 1);
  assert.equal(asignacionesCreadas, undefined);
});

test('edita el nombre y reemplaza los permisos según los recursos enviados', async () => {
  rolesGuardados.push(crearRol(20, 'Contador'));

  const resultado = await servicio.Editar(20, {
    NombreRol: 'Contador actualizado',
    NombresRecurso: ['Dashboard']
  });

  assert.equal(resultado.NombreRol, 'Contador actualizado');
  assert.deepEqual(resultado.RecursosAplicados, ['Dashboard']);
  assert.equal(resultado.PermisosAsignados, 1);
  assert.deepEqual(eventos, [
    'actualizar-rol',
    'eliminar-asignaciones',
    'crear-asignaciones'
  ]);
  assert.equal(eliminacionAsignaciones.where.CodigoRol, 20);
  assert.equal(transaccionesConfirmadas, 1);
});

test('ObtenerPorCodigo devuelve el rol con sus recursos y permisos asignados', async () => {
  rolesGuardados.push(crearRol(20, 'Contador'));
  asignacionesConsultadas = [{
    CodigoRecurso: 4,
    CodigoPermiso: 9,
    Estatus: 1,
    Recurso_CodigoRecurso: { NombreRecurso: 'Dashboard' },
    Permiso_CodigoPermiso: { NombrePermiso: 'ListadoDashboard' }
  }];

  const resultado = await servicio.ObtenerPorCodigo(20);

  assert.deepEqual(resultado.NombresRecurso, ['Dashboard']);
  assert.deepEqual(resultado.Recursos, [{
    CodigoRecurso: 4,
    NombreRecurso: 'Dashboard',
    Permisos: [{
      CodigoPermiso: 9,
      NombrePermiso: 'ListadoDashboard',
      Estatus: 1
    }]
  }]);
});

test('devuelve un error controlado si el nombre del rol ya existe al crear', async () => {
  errorUnicoEn = 'crear';

  await assert.rejects(servicio.Crear({
    NombreRol: 'Contador',
    NombresRecurso: ['Dashboard']
  }), {
    message: 'Ya existe un rol con ese nombre',
    statusCode: 409
  });

  assert.equal(transaccionesRevertidas, 1);
});

test('devuelve un error controlado si el nombre del rol ya existe al editar', async () => {
  errorUnicoEn = 'editar';
  rolesGuardados.push(crearRol(20, 'Contador'));

  await assert.rejects(servicio.Editar(20, {
    NombreRol: 'Contador duplicado',
    NombresRecurso: ['Dashboard']
  }), {
    message: 'Ya existe un rol con ese nombre',
    statusCode: 409
  });

  assert.equal(transaccionesRevertidas, 1);
  assert.equal(eliminacionAsignaciones, undefined);
});
