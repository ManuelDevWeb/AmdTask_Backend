// Importando express
import express from "express";
// Imrportando funciones del controlador tarea
import {
  crearTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
} from "../controllers/tareaController.js";

// Importando middleware para verificar que el usuario este autenticado
import { checkAuth } from "../middlewares/checkAuth.js";

// Instanciando router de express
const router = express.Router();

// Crear Tarea, solo si está autenticado (Middleware)
router.post("/", checkAuth, crearTarea);

// Obtener una tarea (GET), Editar Tarea (PUT), Eliminar Tarea (DELETE), solo si está autenticado (Middleware)
router
  .route("/:id")
  .get(checkAuth, obtenerTarea)
  .put(checkAuth, actualizarTarea)
  .delete(checkAuth, eliminarTarea);

// Cambiar estado de una tarea, solo si está autenticado
router.post("/estado/:id", checkAuth, cambiarEstadoTarea);

export default router;
