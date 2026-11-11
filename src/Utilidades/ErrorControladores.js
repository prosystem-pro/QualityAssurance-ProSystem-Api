const ManejarError = (error, res, mensajeError = 'Error inesperado', statusCodeDefault = 500) => {
  const esDesarrollo = process.env.ALERTA_ERRORES === 'Desarrollo';
  
  const statusCode = error.statusCode ?? statusCodeDefault;
  const tipo = error.tipo ?? (statusCode >= 500 ? 'Error' : 'Alerta');

  const esControlado = !!error.esControlado;
  const mensajeFinal = esControlado 
    ? error.message 
    : mensajeError; 

  const detallesTecnicos = {
    message: error.message,
    stack: error.stack,
    type: error.name,
    sql: error.sql ?? null,
    sqlMensaje: error.original?.message ?? error.parent?.message ?? null,
    sqlCodigo: error.original?.number ?? error.parent?.number ?? null,
    causaInterna: error.innerError?.message ?? null
  };

  console.error(`[${tipo}] ${mensajeFinal}`, esDesarrollo ? detallesTecnicos : '');

  const respuesta = {
    success: false,
    tipo,
    message: mensajeFinal,
    ...(esDesarrollo && { detalles: detallesTecnicos })
  };

  return res.status(statusCode).json(respuesta);
};

module.exports = ManejarError;
