// Importando JWT
import jwt from "jsonwebtoken";

// Importando Modelo Usuario
import { Usuario } from "../models/Usuario.js";

// Función que valida que el usuario este autenticado
const checkAuth = async (req, res, next) => {
  let token;

  // Normalmente los JWT se envian en los headers (En postman ir al apartado Authorization,
  // poner Bearer Token y el JWT generado para el Usuario cuando se logeó)
  // Validamos que venga el header Authorization y que sea de tipo Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obteniendo el token
      token = req.headers.authorization.split(" ")[1];
      // console.log(token);
      // Verificando (Leyendo) el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Creamos una variable en la req (usuario) y guardamos la información del usuario si está en la BD
      // Almacenamos la información del usuario en la variable usuario del request, excepto la contraseña,
      // confirmado, token, createdAt y updatedAt
      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -createdAt -updatedAt -__v"
      );
      //console.log(req.usuario);

      return next();
    } catch (error) {
      return res.status(404).json({ msg: "Hubo un error" });
    }
  }

  // Si no hay token enviamos error
  if (!token) {
    const error = new Error("Token no válido");
    return res.status(401).json({ msg: error.message });
  }

  next();
};

export { checkAuth };
