// Función para generar un ID
const generarId = () => {
  // Generar ID aleatorio complejo
  const random = Math.random().toString(32).substring(2);
  const fecha = Date.now().toString(32);
  return random + fecha;
};

export { generarId };
