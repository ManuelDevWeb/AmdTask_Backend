// Importando ODM mongoose
import mongoose from "mongoose";

// Schema Tarea (Estructura en la BD)
const tareaSchema = mongoose.Schema(
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
    estado: {
      type: Boolean,
      default: false,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    prioridad: {
      type: String,
      required: true,
      // Permite solo valores que están en este arreglo
      enum: ["Baja", "Media", "Alta"],
    },
    proyecto: {
      // Proyecto es de tipo Proyecto (Relacionamos por ObjectId)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
    },
    completado: {
      // Completado es de tipo Usuario (Relacionamos por ObjectId)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  {
    // Crea columna de creado y otra de actualizado
    timestamps: true,
  }
);

// Definiendo el modelo (Nombre para identificar Modelo y schema)
const Tarea = mongoose.model("Tarea", tareaSchema);

export { Tarea };
