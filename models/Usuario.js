// Importando ODM mongoose
import mongoose from "mongoose";
// Importando Bcrypt para encriptar contraseña
import bcrypt from "bcrypt";

// Schema Usuario (Estructura en la BD)
const usuarioSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      // Eliminando espacios adelante y al final
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Crea columna de creado y otra de actualizado
    timestamps: true,
  }
);

// Middleware que se ejecuta antes de guardar en la BD
usuarioSchema.pre("save", async function (next) {
  // Hacemos referencia al objeto del usuario
  // console.log(this);
  const usuario = this;

  // Si la contraseña no ha sido modificada por el usuario no se hace nada
  if (!usuario.isModified("password")) {
    // Saltando al siguiente middleware
    next();
  }

  // Hashea la contraseña 10 veces
  const salt = await bcrypt.genSalt(10);

  // Hasheamos la contraseña
  const passwordHashed = await bcrypt.hash(usuario.password, salt);
  // Reemplazamos la contraseña por la encriptada
  usuario.password = passwordHashed;
  next();
});

// Función para comparar contraseñas
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  // Hacemos referencia al objeto del usuario
  const usuario = this;
  // Comparamos la contraseña del usuario con la contraseña que viene del formulario
  return await bcrypt.compare(passwordFormulario, usuario.password);
};

// Definiendo el modelo (Nombre para identificar Modelo y schema)
const Usuario = mongoose.model("Usuario", usuarioSchema);

export { Usuario };
