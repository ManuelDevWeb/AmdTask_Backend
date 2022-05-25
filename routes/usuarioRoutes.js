// Importando express
import express from "express";
// Importando funciones del controllador usuario
import {
  registrarUsuario,
  autenticarUsuario,
  confirmarUsuario,
  recuperarPasswordUsuario,
  validarTokenUsuario,
  nuevaPasswordUsuario,
  perfilUsuario,
} from "../controllers/usuarioController.js";
// Importando middleware para verificar que el usuario este autenticado
import { checkAuth } from "../middlewares/checkAuth.js";

// Instanciando router de express
const router = express.Router();

// Autenticación, Registro y Confirmación de Usuarios

// Crear nuevo usuario
router.post("/", registrarUsuario);

// Autenticar usuario
router.post("/login", autenticarUsuario);

// Confirmar usuario
router.get("/confirmar/:token", confirmarUsuario);

// Recuperar contraseña (Genera un nuevo Token)
router.post("/recuperar-password", recuperarPasswordUsuario);

// Validar token para recuperar contraseña (GET) y Almacenar la nueva contraseña (POST)
router
  .route("/recuperar-password/:token")
  .get(validarTokenUsuario)
  .post(nuevaPasswordUsuario);

// Obtener el perfil del usuario, solo si está autenticado (Middleware)
router.get("/perfil", checkAuth, perfilUsuario);

export default router;
