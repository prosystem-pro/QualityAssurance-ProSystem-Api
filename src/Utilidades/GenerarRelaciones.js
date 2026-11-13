require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../BaseDatos/ConexionBaseDatos');

const CONFIG = {
  carpetaModelos: path.join(__dirname, '..', 'Modelos'),
  nombreArchivoRelaciones: process.env.NOMBRE_ARCHIVO_RELACIONES || 'Relaciones.js',
  archivosExcluidos: [
    process.env.NOMBRE_ARCHIVO_RELACIONES || 'Relaciones.js',
    'init-models.js' 
  ]
};

const RUTA_SALIDA = path.join(CONFIG.carpetaModelos, CONFIG.nombreArchivoRelaciones);

async function getRelations() {
  const [results] = await sequelize.query(`
    SELECT 
      fk.name AS FK_Name,
      tp.name AS TableName,
      cp.name AS ColumnName,
      tr.name AS ReferencedTable,
      cr.name AS ReferencedColumn
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc 
      ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.tables tp 
      ON fkc.parent_object_id = tp.object_id
    INNER JOIN sys.columns cp 
      ON fkc.parent_object_id = cp.object_id 
      AND fkc.parent_column_id = cp.column_id
    INNER JOIN sys.tables tr 
      ON fkc.referenced_object_id = tr.object_id
    INNER JOIN sys.columns cr 
      ON fkc.referenced_object_id = cr.object_id 
      AND fkc.referenced_column_id = cr.column_id;
  `);
  return results;
}

function modeloExiste(nombre) {
  return fs.existsSync(path.join(CONFIG.carpetaModelos, `${nombre}.js`));
}

function getTodosLosModelos() {
  return fs.readdirSync(CONFIG.carpetaModelos)
    .filter(f =>
      f.endsWith('.js') &&
      !CONFIG.archivosExcluidos.includes(f)
    )
    .map(f => path.basename(f, '.js'));
}

function generateCode(relations) {
  const modelosConRelacion = new Set();
  const relacionesValidas = [];

  relations.forEach(r => {
    if (modeloExiste(r.TableName) && modeloExiste(r.ReferencedTable)) {
      modelosConRelacion.add(r.TableName);
      modelosConRelacion.add(r.ReferencedTable);
      relacionesValidas.push(r);
    }
  });

  const todosLosModelos = new Set([
    ...getTodosLosModelos(),
    ...modelosConRelacion
  ]);

  let code = `// ARCHIVO GENERADO AUTOMÁTICAMENTE — No editar manualmente\n`;
  code += `// Generado el: ${new Date().toISOString()}\n`;
  code += `// Nombre configurado en .env: ${CONFIG.nombreArchivoRelaciones}\n\n`;
  code += `const Path = require('path');\n`;
  code += `const BaseDatos = require('../BaseDatos/ConexionBaseDatos');\n`;
  code += `const Sequelize = require('sequelize');\n\n`;
  code += `const RutaModelos = Path.join(__dirname);\n\n`;

  todosLosModelos.forEach(model => {
    code += `const ${model} = require(Path.join(RutaModelos, '${model}.js'))(BaseDatos, Sequelize.DataTypes);\n`;
  });

  code += `\n// === RELACIONES ===\n`;
  relacionesValidas.forEach(r => {
    const aliasHasMany = r.TableName === r.ReferencedTable
      ? `${r.TableName}Hijas_${r.ColumnName}`
      : `${r.TableName}_${r.ColumnName}`;

    code += `
${r.TableName}.belongsTo(${r.ReferencedTable}, {
  foreignKey: '${r.ColumnName}',
  as: '${r.ReferencedTable}_${r.ColumnName}'
});
${r.ReferencedTable}.hasMany(${r.TableName}, {
  foreignKey: '${r.ColumnName}',
  as: '${aliasHasMany}'
});
`;
  });

  code += `\nmodule.exports = {\n`;
  todosLosModelos.forEach(model => {
    code += `  ${model},\n`;
  });
  code += `};\n`;

  return code;
}

async function main() {
  try {
    const relations = await getRelations();
    const code = generateCode(relations);
    fs.writeFileSync(RUTA_SALIDA, code, 'utf8');
    console.log(`✅ Archivo generado: ${CONFIG.nombreArchivoRelaciones}`);
  } finally {
    await sequelize.close();
  }
}

module.exports = main;
if (require.main === module) main().catch(console.error);
