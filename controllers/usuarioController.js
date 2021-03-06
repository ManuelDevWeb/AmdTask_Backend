// Importando modelo Usuario
import { Usuario } from "../models/Usuario.js";
// Importando funci贸n que genera ID
import { generarId } from "../helpers/generarId.js";
// Importando funci贸n que genera JWT
import { generarJWT } from "../helpers/generarJWT.js";
// Importando funciones para enviar los emails
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

// Funci贸n para crear usuario
const registrarUsuario = async (req, res) => {
  // Obteniendo el email del usuario
  const { email } = req.body;

  // Verificar si el email ya existe en la BD
  const existeUsuario = await Usuario.findOne({ email: email });
  // console.log("existeUsuario", existeUsuario);

  // Si el usuario ya existe retornar error con status 400
  if (existeUsuario) {
    const error = new Error("El usuario ya existe 馃様");
    return res.status(400).json({
      msg: error.message,
    });
  }

  try {
    // Instanciando un usuario a partir del modelo Usuario
    const usuario = new Usuario(req.body);
    // console.log(usuario);
    // Asignando valor token al usuario, con la funci贸n que genera ID aleatorio
    usuario.token = generarId();
    // Guardar usuario en BD
    const usuarioAlmacenado = await usuario.save();
    // Enviamos datos a la funci贸n para generar el email de confirmaci贸n
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({
      msg: "Usuario Creado Correctamente, Revisa tu Email Para confirmar tu Cuenta",
    });
  } catch (error) {
    console.log(error);
  }
};

// Funci贸n para autenticar usuario
const autenticarUsuario = async (req, res) => {
  // Obteniendo el email y la contrase帽a del usuario
  const { email, password } = req.body;

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El Usuario no existe");
    return res.status(400).json({
      msg: error.message,
    });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error(
      "Tu cuenta no est谩 confirmada. Porfavor verifique su correo"
    );
    return res.status(403).json({
      msg: error.message,
    });
  }

  // Comprobar si la contrase帽a es correcta
  const passwordCorrecto = await usuario.comprobarPassword(password);
  if (passwordCorrecto) {
    // Enviamos un res.json para acceder a la informaci贸n del usuario desde el Front
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      // Asignando valor token al usuario, con la funci贸n que genera JWT
      jwtToken: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("La contrase帽a es incorrecta, intenta de nuevo");
    return res.status(400).json({
      msg: error.message,
    });
  }
};

// Funci贸n para confirmar usuario
const confirmarUsuario = async (req, res) => {
  // Obteniendo el token del usuario
  const { token } = req.params;

  // Verificar si el usuario existe en la BD
  const usuarioConfirmar = await Usuario.findOne({ token: token });
  if (!usuarioConfirmar) {
    const error = new Error("Token no v谩lido");
    return res.status(403).json({
      msg: error.message,
    });
  }

  try {
    // Asignamos el valor confirmado a true
    usuarioConfirmar.confirmado = true;
    // El token es de un solo uso, por ende re asignamos su valor a vac铆o
    usuarioConfirmar.token = "";
    // Actualizamos el usuario en la BD
    await usuarioConfirmar.save();

    res.json({
      msg: "隆Tu cuenta ha sido confirmada!",
    });
  } catch (error) {
    console.log(error);
  }
};

// Funci贸n para recuperar contrase帽a (Genera un nuevo Token)
const recuperarPasswordUsuario = async (req, res) => {
  // Obteniendo el email del usuario
  const { email } = req.body;

  // Comprobamos si el usuario existe en la BD
  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    const error = new Error("No existe usuario con ese email");
    res.status(403).json({
      msg: error.message,
    });
  }

  try {
    // Asignando valor token al usuario, con la funci贸n que genera ID aleatorio
    usuario.token = generarId();
    // Actualizamos el usuario en la BD
    const usuarioActualizado = await usuario.save();
    // Enviamos datos a la funci贸n para generar el email de Olvide Password
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({
      msg: "Hemos enviado un email con los pasos para recuperar tu contrase帽a",
    });
  } catch (error) {
    console.log(error);
  }
};

// Funci贸n para validar el token (Verifica si corresponda a un Usuario)
const validarTokenUsuario = async (req, res) => {
  // Obteniendo el token del usuario
  const { token } = req.params;

  // Verificar si el usuario existe en la BD
  const tokenValido = await Usuario.findOne({ token });
  if (tokenValido) {
    res.json({ msg: "Token v谩lido!" });
  } else {
    const error = new Error("Token no v谩lido");
    return res.status(403).json({
      msg: error.message,
    });
  }
};

// Funci贸n para actualizar contrase帽a (Verificar si corresponda a un Usuario y actualizar contrase帽a)
const nuevaPasswordUsuario = async (req, res) => {
  // Obteniendo el token del usuario
  const { token } = req.params;
  // Obteniendo la nueva contrase帽a
  const { password } = req.body;

  // Verificar si el usuario existe en la BD
  const usuario = await Usuario.findOne({ token });
  if (!usuario) {
    const error = new Error("Token no v谩lido");
    return res.status(403).json({
      msg: error.message,
    });
  }

  try {
    // Asignamos el nuevo valor de la contrase帽a al usuario
    usuario.password = password;
    // El token es de un solo uso, por ende re asignamos su valor a vac铆o
    usuario.token = "";
    // Actualizamos el usuario en la BD
    await usuario.save();

    res.json({ msg: "Tu contrase帽a ha sido actualizada!" });
  } catch (error) {
    console.log(error);
  }
};

// Funci贸n para obtener el perfil del usuario
const perfilUsuario = async (req, res) => {
  // Obteniendo la informaci贸n del usuario almacenada en la req, a trav茅s del middleware checkAuth
  const { usuario } = req;

  res.json(usuario);
};

export {
  registrarUsuario,
  autenticarUsuario,
  confirmarUsuario,
  recuperarPasswordUsuario,
  validarTokenUsuario,
  nuevaPasswordUsuario,
  perfilUsuario,
};
