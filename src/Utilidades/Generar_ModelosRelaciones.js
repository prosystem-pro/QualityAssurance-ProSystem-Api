require('dotenv').config();
const { execSync } = require('child_process');

async function build() {

    const command = `npx sequelize-auto -o "./src/Modelos" -d ${process.env.DB_NAME} -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p ${process.env.DB_PORT} -x ${process.env.DB_PASSWORD} -e ${process.env.DB_DIALECT}`;

    try {
        execSync(command, { stdio: 'ignore' });
        const generarRelaciones = require('./GenerarRelaciones');
        await generarRelaciones();
    } catch (err) {
        console.error('❌ Error en build:', err.message);
        process.exit(1);
    }
}

build();