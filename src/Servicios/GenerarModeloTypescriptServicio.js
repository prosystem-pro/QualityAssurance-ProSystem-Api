const fs = require("fs");
const path = require("path");
const { LanzarError } = require("../Utilidades/ErrorServicios");

const rutaModelos = path.join(__dirname, "../Modelos");

const GenerarModelos = async () => {
  if (!fs.existsSync(rutaModelos)) {
    throw LanzarError(`Carpeta de modelos no encontrada: ${rutaModelos}`, 500, "Configuracion");
  }

  const archivos = fs.readdirSync(rutaModelos);
  const modelosTS = {};

  for (const archivo of archivos) {
    if (!archivo.endsWith(".js")) continue;

    const rutaCompleta = path.join(rutaModelos, archivo);
    const definicionModelo = require(rutaCompleta);
      
    let modelo;
    if (typeof definicionModelo === "function") {
      continue;
    } else {
      modelo = definicionModelo;
    }

    const nombreModelo = archivo.replace(".js", "");

    if (!modelo || !modelo.rawAttributes) {
      console.warn(`⚠️ El modelo ${nombreModelo} no tiene atributos. Se omite.`);
      continue;
    }

    let interfazTS = `export interface ${nombreModelo} {\n`;
      
    for (const clave of Object.keys(modelo.rawAttributes)) {
      const tipoNombre = modelo.rawAttributes[clave].type.constructor.name.toLowerCase();
      let tipoTS = "any";

      if (tipoNombre.includes("string")) tipoTS = "string";
      else if (tipoNombre.includes("integer") || tipoNombre.includes("float") || tipoNombre.includes("decimal")) tipoTS = "number";
      else if (tipoNombre.includes("boolean")) tipoTS = "boolean";
      else if (tipoNombre.includes("date")) tipoTS = "Date";

      interfazTS += `  ${clave}: ${tipoTS};\n`;
    }
      
    interfazTS += "}\n";
    modelosTS[nombreModelo] = interfazTS;
  }

  return modelosTS;
};

module.exports = { GenerarModelos };
