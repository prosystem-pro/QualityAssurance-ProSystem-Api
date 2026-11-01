
function LanzarError(mensaje, statusCode = 400, tipo = 'Alerta') {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  error.tipo = tipo;
  error.esControlado = true; 
  Error.captureStackTrace(error, LanzarError); 
  throw error;
}

module.exports = { LanzarError };
