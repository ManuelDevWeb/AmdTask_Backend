// Importando ODM mongoose
import mongoose from "mongoose";

// Función para conectarnos a la BD
const conectarDB = async () => {
  try {
    // Conectandonos a la BD con mongoose
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Almacenando la info de la conexión de la BD
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(`MongoDB conectado en: ${url}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    // Forzar cierre del proceso
    process.exit(1);
  }
};

// Exportando función
export { conectarDB };
