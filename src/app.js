const Express = require('express');
const App = Express();

const Ruter = 'api';
const CuerpoJson = require('./FuncionIntermedia/CuerpoJson');
const CuerpoUrlCodificado = require('./FuncionIntermedia/CuerpoUrlCodificado');
const { ConfiguracionCors } = require('./FuncionIntermedia/Cors');

const RolRuta = require("./Rutas/RolRuta");
const EmpresaRuta = require("./Rutas/EmpresaRuta");
const PermisoRolRecursoRuta = require("./Rutas/PermisoRolRecursoRuta");
const PermisoRuta = require("./Rutas/PermisoRuta");
const RecursoRuta = require("./Rutas/RecursoRuta");
const UsuarioRuta = require("./Rutas/UsuarioRuta");
const PermisosTablasDisponiblesRuta = require("./Rutas/PermisosTablasDisponiblesRuta");
const GenerarModelosTypescriptRuta = require("./Rutas/GenerarModelosTypescriptRuta");
const LoginRuta = require("./Rutas/LoginRuta");

App.use(Express.text({ type: 'text/plain' }));
App.use(ConfiguracionCors());
App.use(CuerpoJson);
App.use(CuerpoUrlCodificado);

App.use(`/${Ruter}`, RolRuta);
App.use(`/${Ruter}`, EmpresaRuta);
App.use(`/${Ruter}`, PermisoRolRecursoRuta);
App.use(`/${Ruter}`, PermisoRuta);
App.use(`/${Ruter}`, RecursoRuta);
App.use(`/${Ruter}`, UsuarioRuta);
App.use(`/${Ruter}`, PermisosTablasDisponiblesRuta);
App.use(`/${Ruter}`, GenerarModelosTypescriptRuta);
App.use(`/${Ruter}`, LoginRuta);

module.exports = App;