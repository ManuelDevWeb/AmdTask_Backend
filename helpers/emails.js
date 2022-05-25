// Importando Nodemailer
import nodemailer from "nodemailer";

// Email de Registro
const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  // Credenciales y configuración nodemailer
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Información del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Comprueba tu cuenta",
    text: "Comprueba tu cuenta en UpTask",
    // Cuerpo del email, etiquetas y estilos.(En enlace apunta a la ruta para confirmar usuario)
    html: `
    <p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
    <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    </p>
    `,
  });
};

// Email de Olvide Password
const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  // Credenciales y configuración nodemailer
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Información del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>"',
    to: email,
    subject: "UpTask - Reestablece tu contraseña",
    text: "Reestablece tu contraseña en UpTask",
    // Cuerpo del email, etiquetas y estilos.(En enlace apunta a la ruta para cambiar contraseña)
    html: `
    <p>Hola: ${nombre} has solicitado reestablecer tu password</p>
    <p>Sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

        <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
    </p>
    `,
  });
};

export { emailRegistro, emailOlvidePassword };
