// Importando ODM mongoose
import mongoose from "mongoose";

// Schema Proyecto (Estructura en la BD)
const proyectoSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      // Eliminando espacios adelante y al final
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    cliente: {
      type: String,
      trim: true,
      required: true,
    },
    creador: {
      // Creador es alguien de tipo Usuario (Relacionamos por ObjectId)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    // Es un arreglo puesto puede tener varias tareas
    tareas: [
      // Tarea es alguien de tipo Tarea (Relacionamos por ObjectId)
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tarea",
      },
    ],
    // Es un arreglo puesto puede tener varios colaboradores
    colaboradores: [
      {
        // Creador es alguien de tipo Usuario (Relacionamos por ObjectId)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
  },
  {
    // Crea columna de creado y otra de actualizado
    timestamps: true,
  }
);

// Definiendo el modelo (Nombre para identificar Modelo y schema)
const Proyecto = mongoose.model("Proyecto", proyectoSchema);

export { Proyecto };
