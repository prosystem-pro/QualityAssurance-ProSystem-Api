const Fs = require("fs");
const Ruta = require("path");
const ConexionBaseDatos = require("../BaseDatos/ConexionBaseDatos");
const Sequelize = require("sequelize");
const { LanzarError } = require("../Utilidades/ErrorServicios");

const RutaModelos = Ruta.join(__dirname, "../Modelos");

const GenerarModelos = async () => {
  if (!Fs.existsSync(RutaModelos)) {
    throw LanzarError(`Carpeta de modelos no encontrada: ${RutaModelos}`, 500, "Configuracion");
  }

  const archivos = Fs.readdirSync(RutaModelos);
  const ModelosTS = {};

  for (const archivo of archivos) {
    if (!archivo.endsWith(".js")) continue;

    const RutaModelo = Ruta.join(RutaModelos, archivo);
    const DefinicionModelo = require(RutaModelo);
    let modelo;

    if (typeof DefinicionModelo === "function") {
      modelo = DefinicionModelo(ConexionBaseDatos, Sequelize.DataTypes);
    } else {
      modelo = DefinicionModelo;
    }

    const NombreModelo = archivo.replace(".js", "");

    if (!modelo || !modelo.rawAttributes) {
      console.warn(`⚠️ El modelo ${NombreModelo} no tiene atributos o rawAttributes. Se omite.`);
      continue;
    }

    let InterfazTS = `export interface ${NombreModelo} {\n`;

    for (const clave of Object.keys(modelo.rawAttributes)) {
      const tipoNombre = modelo.rawAttributes[clave].type.constructor.name.toLowerCase();
      let tipoTS = "any";

      if (tipoNombre.includes("string") || tipoNombre.includes("text")) tipoTS = "string";
      else if (tipoNombre.includes("integer") || tipoNombre.includes("float") || tipoNombre.includes("decimal")) tipoTS = "number";
      else if (tipoNombre.includes("boolean")) tipoTS = "boolean";
      else if (tipoNombre.includes("date")) tipoTS = "Date";

      InterfazTS += `  ${clave}: ${tipoTS};\n`;
    }

    InterfazTS += "}\n";
    ModelosTS[NombreModelo] = InterfazTS;
  }

  ModelosTS["RespuestaBackend"] = `export interface RespuestaBackend {
  success: boolean;
  tipo: string;
  message: string;
  data?: any;
  detalles?: any;
}
`;


  return ModelosTS;
};

module.exports = { GenerarModelos };