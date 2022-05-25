// Importando modelo Proyecto
import { Proyecto } from "../models/Proyecto.js";
// Importando modelo Tarea
import { Tarea } from "../models/Tarea.js";
// Importando modelo Usuario
import { Usuario } from "../models/Usuario.js";

// Función para crear nuevo proyecto
const crearProyecto = async (req, res) => {
  // Obteniendo la información del proyecto enviada
  const { body } = req;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  try {
    // Instanciando un proyecto a partir del modelo Proyecto
    const proyecto = new Proyecto(body);
    // Asignando valor creador al proyecto, con la info del usuario almacenado en la req
    proyecto.creador = usuario._id;
    // Guardando proyecto en BD
    const proyectoAlmacenado = await proyecto.save();

    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

// Función para obtener proyectos
const obtenerProyectos = async (req, res) => {
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Buscando proyectos que fueron creador por el usuario que está autenticado o es colaborador (No se trae las tareas)
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: usuario._id } },
      { creador: { $in: usuario._id } },
    ],
  }).select("-tareas");

  res.json(proyectos);
};

// Función para obtener un proyecto
const obtenerProyecto = async (req, res) => {
  // Obteniendo el id del proyecto
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // const proyecto = await Proyecto.find()
  //   .where("creador")
  //   .equals(req.usuario._id);
  // console.log(proyecto);

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando que existe el proyecto (Populate cruza la información y me trae los datos de esa tareas)
    // Como es consulta cruzada no podemos usar select para seleccionar los atributos, pero si podemos pasarlos en las comillas luego de la coma
    const proyecto = await Proyecto.findById(id.trim())
      // Populate con tareas y a las tareas un populate de completado
      .populate({
        path: "tareas",
        populate: { path: "completado", select: "nombre" },
      })
      .populate("colaboradores", "nombre email");

    // console.log(proyecto);
    if (!proyecto) {
      const error = new Error("El proyecto no existe");
      return res.status(404).json({ msg: error.message });
    }

    // Validando que el proyecto sea del usuario autenticado o de algun colaborador
    if (
      proyecto.creador.toString() !== usuario._id.toString() &&
      !proyecto.colaboradores.some(
        (colaborador) => colaborador._id.toString() === usuario._id.toString()
      )
    ) {
      const error = new Error(
        "No tienes autorización para realizar esta acción"
      );
      return res.status(401).json({
        msg: error.message,
      });
    }

    res.json(proyecto);
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para editar proyecto
const editarProyecto = async (req, res) => {
  // Obteniendo el id del proyecto
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Comprobar si el proyecto existe
    const proyecto = await Proyecto.findById(id.trim());

    if (!proyecto) {
      const errror = new Error("El proyecto no existe");
      return res.status(404).json({
        msg: errror.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (proyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error("No tienes permiso para realizar esta acción");
      return res.status(401).json({
        msg: error.message,
      });
    }

    // Actualizando los valores de proyecto con lo que el usuario envía, sino envia algun campo dejamos por defecto el que había
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;

    try {
      // Guardando proyecto en BD
      const proyectoAlmacenado = await proyecto.save();

      res.json(proyectoAlmacenado);
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para eliminar proyecto
const eliminarProyecto = async (req, res) => {
  // Obteniendo id del proyecto
  const { id } = req.params;
  // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
  const { usuario } = req;

  // Validamos que el id cumpla con la expresión regular
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Comprobar si el proyecto existe
    const proyecto = await Proyecto.findById(id.trim());

    if (!proyecto) {
      const error = new Error("El proyecto no existe");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (proyecto.creador.toString() !== usuario._id.toString()) {
      const error = new Error("No tienes permiso para realizar esta acción");
      return res.status(401).json({
        msg: error.message,
      });
    }

    try {
      // Eliminando proyecto de la BD
      await proyecto.deleteOne();

      res.json({
        msg: "Proyecto eliminado",
      });
    } catch (error) {
      console.log("Error");
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Funcion para buscar colaborador del proyecto
const buscarColaborador = async (req, res) => {
  // Obteniendo el email del usuario
  const { email } = req.body;

  // Buscamos el usuario por email
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

// Función para agregar colaborador al proyecto
const agregarColaborador = async (req, res) => {
  // Validamos que el id cumpla con la expresión regular
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando si existe el proyecto
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes permiso para realizar esta acción");
      return res.status(401).json({
        msg: error.message,
      });
    }

    // Obteniendo el email del usuario
    const { email } = req.body;

    // Buscamos el usuario por email
    const usuario = await Usuario.findOne({ email }).select(
      "-confirmado -createdAt -password -token -updatedAt -__v"
    );

    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ msg: error.message });
    }

    // El colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
      const error = new Error(
        "El Creador del Proyecto no puede ser colaborador"
      );
      return res.status(401).json({
        msg: error.message,
      });
    }

    // Revisar que no este ya agregado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
      const error = new Error("El Usuario ya pertenece al proyecto");
      return res.status(401).json({
        msg: error.message,
      });
    }

    // Agregamos el usuario como colaborador del proyecto
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({ msg: "Colaborador Agregado correctamente." });

    try {
    } catch (error) {
      console.log("Error");
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para eliminar colaborador del proyecto
const eliminarColaborador = async (req, res) => {
  // Validamos que el id cumpla con la expresión regular
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    // Validando si existe el proyecto
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Validando que el proyecto sea del usuario autenticado
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes permiso para realizar esta acción");
      return res.status(401).json({
        msg: error.message,
      });
    }

    // Eliminamos colaborador del proyecto
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({ msg: "Colaborador Eliminado correctamente." });

    try {
    } catch (error) {
      console.log("Error");
    }
  } else {
    return res.status(404).json({ msg: "Id inválido" });
  }
};

// Función para obtener tareas del proyecto (Forma no muy adecuada)
// const obtenerTareas = async (req, res) => {
//     // Obtener id del proyecto
//     const { id } = req.params;
//     // Obteniendo la información del usuario almacenada en la req, a través del middleware checkAuth
//     const { usuario } = req;
//     // Validamos que el id cumpla con la expresión regular
//     if (id.match(/^[0-9a-fA-F]{24}$/)) {
//       // Validamos que exista el proyecto
//       const existeProyecto = await Proyecto.findById(id);
//       if (!existeProyecto) {
//         const error = new Error("El proyecto no existe");
//         return res.status(404).json({
//           msg: error.message,
//         });
//       }
//       // Validando que el proyecto sea del usuario autenticado
//       if (existeProyecto.creador.toString() !== usuario._id.toString()) {
//         const error = new Error(
//           "No tiene autorización para realizar esta acción"
//         );
//         return res.status(403).json({
//           msg: error.message,
//         });
//       }
//       // Buscamos las tareas donde el valor proyecto sea igual al id del proyecto que nos envia el usuario
//       const tareas = await Tarea.find().where("proyecto").equals(id);
//       res.json(tareas);
//     } else {
//       return res.status(404).json({ msg: "Id inválido" });
//     }
// };

export {
  crearProyecto,
  obtenerProyectos,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  // obtenerTareas,
};
