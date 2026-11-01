const fs = require('fs');
const path = require('path');

const rutaRutas = path.join(__dirname, '../Rutas');

function extraerTablaYPermisos(rutaArchivo) {
  try {

    if (!fs.existsSync(rutaArchivo)) return null;
    const estadistica = fs.statSync(rutaArchivo);
    if (!estadistica.isFile()) return null;

    const textoCompleto = fs.readFileSync(rutaArchivo, 'utf8');
    const lineas = textoCompleto.split('\n');

    const lineasSinComentarios = lineas.filter(linea => {
      return !/^\s*\/\//.test(linea);
    });

    const contenido = lineasSinComentarios.join('\n');

    const regexTabla = /\b(?:const|let|var)\s+Tabla\s*=\s*['"`](.*?)['"`]/;
    const matchTabla = contenido.match(regexTabla);
    if (!matchTabla) return null;

    const nombreTabla = matchTabla[1];

    const regexPermisos = /VerificarPermisos\(['"`](.*?)['"`],\s*Tabla\)/g;
    const permisos = new Set();
    let match;
    while ((match = regexPermisos.exec(contenido)) !== null) {
      permisos.add(match[1]);
    }

    return {
      Tabla: nombreTabla,
      Permisos: Array.from(permisos)
    };
  } catch (error) {
    console.warn(`⚠️ No se pudo procesar: ${rutaArchivo}`, error.message);
    return null;
  }
}

function ObtenerTodasLasTablasConPermisos() {
  try {
    if (!fs.existsSync(rutaRutas)) {
      console.warn(`⚠️ Carpeta no encontrada: ${rutaRutas}`);
      return [];
    }

    const entradas = fs.readdirSync(rutaRutas);
    const resultados = [];

    for (const nombreArchivo of entradas) {
      if (!nombreArchivo.endsWith('.js')) continue;

      const rutaCompleta = path.join(rutaRutas, nombreArchivo);
      const info = extraerTablaYPermisos(rutaCompleta);

      if (info) resultados.push(info);
    }

    return resultados;
  } catch (error) {
    console.error('❌ Error al leer carpeta de rutas:', error.message);
    return [];
  }
}

module.exports = {
  ObtenerTodasLasTablasConPermisos
};
