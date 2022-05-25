// Importando JWT para crear el token
import jwt from "jsonwebtoken";

// Función para generar JWT
const generarJWT = (id) => {
  // Firmando (generando) token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export { generarJWT };
