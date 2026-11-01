require('dotenv').config();
process.env.TZ = 'UTC';
const os = require('os');
const App = require('./src/app');

const PORT = process.env.PORT || 3000;

const networkInterfaces = os.networkInterfaces();
let ipLocal = 'localhost';
for (const iface of Object.values(networkInterfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) ipLocal = iface.address;
}

App.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}/api`);
    console.log(`🚀 Servidor corriendo en: http://${ipLocal}:${PORT}/api`);
});

module.exports = App;
