// Importando express
import express from "express";
// Importando dotenv
import dotenv from "dotenv";
// Importando cors
import cors from "cors";
// Importando Socket.io
import { Server } from "socket.io";

// Importando routes de usuario
import usuarioRoutes from "./routes/usuarioRoutes.js";
// Importando routes de proyecto
import proyectoRoutes from "./routes/proyectoRoutes.js";
// Importando routes de tarea
import tareaRoutes from "./routes/tareaRoutes.js";
// Importando función para conectarnos a la db
import { conectarDB } from "./config/db.js";

// Puerto
const PORT = process.env.PORT || 4000;

// Inicializando aplicación con express
const app = express();

// Permitir el manejo de datos en formato json
app.use(express.json());

// Indicando que busque por el archivo .env (Evita tener que importar dotenv en todos los archivo)
dotenv.config();

// Llamando función que conecta a la BD
conectarDB();

// Configuración CORS
// Dominios permitidos (Para probar desde postman quitar esta configuración)
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
  // Verifica que el origen de la petición este en la lista blanca
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      // Puede consultar la API
      callback(null, true);
    } else {
      // No esta permitido su Request
      callback(new Error("Error de Cors"));
    }
  },
};

app.use(cors(corsOptions));

// Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const servidor = app.listen(PORT, () => {
  console.log(`Server run on port ${PORT}`);
});

// Instanciando Socket.io
const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// Abrir conexion Socket.io
io.on("connection", (socket) => {
  // console.log("Conectado a socket.io");

  // Definir los eventos de Socket.io

  // Recibiendo datos desde el frontend
  socket.on("abrir proyecto", (proyecto) => {
    // Agregando la informacion que nos llega desde el front al room (Cada proyecto entra a un room diferente)
    // Con esto permitimos que solo se le emita la informacion a los usuarios que esten en la misma sala
    socket.join(proyecto);
  });

  // Recibiendo datos desde el frontend
  socket.on("nueva tarea", (tarea) => {
    // Emitiremos este nuevo evento a la persona que tenga abierto ese proyecto
    socket.to(tarea.proyecto).emit("tarea agregada", tarea);
  });

  // Recibiendo datos desde el frontend
  socket.on("eliminar tarea", (tarea) => {
    // Emitiremos este nuevo evento a la persona que tenga abierto ese proyecto
    socket.to(tarea.proyecto).emit("tarea eliminada", tarea);
  });

  // Recibiendo datos desde el frontend
  socket.on("actualizar tarea", (tarea) => {
    // Emitiremos este nuevo evento a la persona que tenga abierto ese proyecto
    socket.to(tarea.proyecto._id).emit("tarea actualizada", tarea);
  });

  // Recibiendo datos desde el frontned
  socket.on("cambiar estado", (tarea) => {
    // Emitiremos este nuevo evento a la persona que tenga abierto ese proyecto
    socket.to(tarea.proyecto._id).emit("nuevo estado", tarea);
  });
});
