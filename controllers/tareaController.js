// Importando modelo Tarea
import { Tarea } from "../models/Tarea.js";
// Importando modelo Proyecto
import { Proyecto } from "../models/Proyecto.js";

// Función para crear nueva tarea
const crearTarea = async (req, res) => {
  // Obteniendo el id del proyecto
  const { proyecto } = req.body;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (proyecto.match(/^[0-9a-fA-F]{24}$/)) {
    // Validar que exista el proyecto
    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      const error = new Error("El proyecto no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (existeProyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error(
        "No tiene autorización para realizar esta acción"
      );
      return res.status(401).json({
        msg: error.message,
      });
    }

    try {
      // Creando la tarea, se puede de ambas formas
      const tareaCreada = await Tarea.create(req.body);
      // const tareaCreada = new Tarea(req.body);
      // Guardando tarea en la BD
      // await tareaCreada.save();
      // Almacenar el ID de la tarea en el proyecto
      existeProyecto.tareas.push(tareaCreada._id);
      await existeProyecto.save();
      res.json(tareaCreada);
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para obtener una tarea
const obtenerTarea = async (req, res) => {
  // Obtener id de la tarea
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validar que exista la tarea (Populate cruza la información y me trae los datos de ese proyecto)
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (tarea.proyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error(
        "No tiene autorización para realizar esta acción"
      );
      return res.status(403).json({
        msg: error.message,
      });
    }

    res.json(tarea);
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para actualizar tarea
const actualizarTarea = async (req, res) => {
  // Obtener id de la tarea
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando que exista la tarea (Populate cruza la información y me trae los datos de ese proyecto)
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (tarea.proyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error("No tiene autorización para realizar la acción");
      return res.status(403).json({
        msg: error.message,
      });
    }

    // Actualizando los valores de tarea con lo que el usuario envía, sino envia algun campo dejamos por defecto el que había
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
      // Guardamos tarea en BD
      const tareaAlmacenada = await tarea.save();

      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para eliminar tarea
const eliminarTarea = async (req, res) => {
  // Obtener id de la tarea
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando que existe la tarea (Populate cruza la información y me trae los datos de ese proyecto)
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (tarea.proyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error("No tiene autorización para realizar la acción");
      return res.status(403).json({
        msg: error.message,
      });
    }

    try {
      // Obtener proyecto para eliminar referencia de la tarea
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id);

      // Actualizando proyecto y eliminando tarea
      await Promise.allSettled([
        await proyecto.save(),
        await tarea.deleteOne(),
      ]);

      res.json({ msg: "La Tarea se elimino" });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para cambiar el estado de la tarea
const cambiarEstadoTarea = async (req, res) => {
  // Obtener id de la tarea
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando que existe la tarea (Populate cruza la información y me trae los datos de ese proyecto)
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado o colaborador
    if (
      tarea.proyecto.creador.toString() !== usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) => colaborador._id.toString() === usuario._id.toString()
      )
    ) {
      const error = new Error("No tiene autorización para realizar la acción");
      return res.status(403).json({
        msg: error.message,
      });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = usuario._id;
    await tarea.save();

    // Volvemos a consultar la tarea para que traiga la informacion correcta del campo completado
    const tareaAlmacenada = await Tarea.findById(id)
      .populate("proyecto")
      .populate("completado");

    res.json(tareaAlmacenada);
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

export {
  crearTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
};
