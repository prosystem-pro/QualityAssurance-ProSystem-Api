const Express = require('express');
const App = Express();

const Ruter = 'api';
const CuerpoJson = require('./FuncionIntermedia/CuerpoJson');
const CuerpoUrlCodificado = require('./FuncionIntermedia/CuerpoUrlCodificado');
const { ConfiguracionCors } = require('./FuncionIntermedia/Cors');

const RolRuta = require("./Rutas/RolRuta");
const EmpresaRuta = require("./Rutas/EmpresaRuta");
const UsuarioEmpresaRuta = require("./Rutas/UsuarioEmpresaRuta");
const DashboardRuta = require("./Rutas/DashboardRuta");
const PermisoRolRecursoRuta = require("./Rutas/PermisoRolRecursoRuta");
const PermisoRuta = require("./Rutas/PermisoRuta");
const RecursoRuta = require("./Rutas/RecursoRuta");
const UsuarioRuta = require("./Rutas/UsuarioRuta");
const PermisosTablasDisponiblesRuta = require("./Rutas/PermisosTablasDisponiblesRuta");
const GenerarModelosTypescriptRuta = require("./Rutas/GenerarModelosTypescriptRuta");
const LoginRuta = require("./Rutas/LoginRuta");
const CasosDePruebaRuta = require("./Rutas/CasosDePruebaRuta");
const EjecucionPruebaRuta = require("./Rutas/EjecucionPruebaRuta");

App.use(Express.text({ type: 'text/plain' }));
App.use(ConfiguracionCors());
App.use(CuerpoJson);
App.use(CuerpoUrlCodificado);

App.use(`/${Ruter}`, RolRuta);
App.use(`/${Ruter}`, EmpresaRuta);
App.use(`/${Ruter}`, UsuarioEmpresaRuta);
App.use(`/${Ruter}`, DashboardRuta);
App.use(`/${Ruter}`, PermisoRolRecursoRuta);
App.use(`/${Ruter}`, PermisoRuta);
App.use(`/${Ruter}`, RecursoRuta);
App.use(`/${Ruter}`, UsuarioRuta);
App.use(`/${Ruter}`, PermisosTablasDisponiblesRuta);
App.use(`/${Ruter}`, GenerarModelosTypescriptRuta);
App.use(`/${Ruter}`, LoginRuta);
App.use(`/${Ruter}`, CasosDePruebaRuta);
App.use(`/${Ruter}`, EjecucionPruebaRuta);

module.exports = App;