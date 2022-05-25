// Importando express
import express from "express";
// Importando funciones del controlador proyecto
import {
  crearProyecto,
  obtenerProyectos,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  // obtenerTareas,
} from "../controllers/proyectoController.js";
// Importando middleware para verificar que el usuario este autenticado
import { checkAuth } from "../middlewares/checkAuth.js";

// Instanciando router de express
const router = express.Router();

// Crear Proyecto (POST) y Obtener Proyectos (GET), solo si está autenticado (Middleware)
router
  .route("/")
  .post(checkAuth, crearProyecto)
  .get(checkAuth, obtenerProyectos);

// Obtener Proyecto (GET), Editar Proyecto (PUT) y Eliminar Proyecto (DELETE) solo si está autenticado (Middleware)
router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

// Obtener tareas, solo si está autenticado (Middleware)
// router.get("/tareas/:id", checkAuth, obtenerTareas);

// Buscar colaborador, solo si esta autenticado (Middleware)
router.post("/colaboradores", checkAuth, buscarColaborador);

// Agregar colaborador, solo si está autenticado (Middleware)
router.post("/colaboradores/:id", checkAuth, agregarColaborador);

// Eliminar colaborador, solo si está autenticado (Middleware)
// Como solo se va a eliminar un recurso utilizamos post
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default router;
