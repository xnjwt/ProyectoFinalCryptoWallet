import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  UserCredential 
} from "firebase/auth";
import { auth } from "../FirebaseConfig";
// Base URL para evitar repeticiones en las llamadas fetch
const API_BASE_URL = "http://localhost:3000/api/users";

/**
 * Busca el correo electrónico asociado a un nombre de usuario en el backend.
 * @param username Nombre de usuario a buscar.
 * @returns Promesa con el correo electrónico del usuario.
 */
export const obtenerEmailPorUsername = async (username: string): Promise<string> => {
  const respuesta = await fetch(`${API_BASE_URL}/get-email/${username}`);
  const datos = await respuesta.json();
  
  if (!respuesta.ok || !datos.correo) {
    throw new Error("USER_NOT_FOUND");
  }
  
  return datos.correo;
};

/**
 * Verifica si un nombre de usuario ya está registrado en el sistema.
 * @param username Nombre de usuario a comprobar.
 * @returns Promesa que resuelve en true si el usuario ya existe, o false si está disponible.
 */
export const verificarExistenciaUsername = async (username: string): Promise<boolean> => {
  const verificarUser = await fetch(`${API_BASE_URL}/check-username/${username}`);
  const dataVerificacion = await verificarUser.json();
  return !!dataVerificacion.existe;
};

/**
 * Vincula la cuenta de Firebase recién creada con los datos del usuario en el backend.
 * @param uid Identificador único de Firebase.
 * @param correo Correo electrónico del usuario.
 * @param username Nombre de usuario elegido.
 */
export const vincularBilleteraBackend = async (uid: string, correo: string, username: string): Promise<void> => {
  const respuesta = await fetch(`${API_BASE_URL}/link-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, correo, username }),
  });

  if (!respuesta.ok) {
    throw new Error("ERROR_VINCULACION_BACKEND");
  }
};

/**
 * Maneja el flujo completo de inicio de sesión, soportando tanto correo como nombre de usuario.
 * @param identificador Correo electrónico o nombre de usuario.
 * @param contrasena Contraseña de la cuenta.
 * @returns Credenciales del usuario autenticado en Firebase.
 */
export const iniciarSesionConIdentificador = async (identificador: string, contrasena: string): Promise<UserCredential> => {
  let emailParaLogin = identificador;

  // Si no contiene un '@', asumimos que introdujo un nombre de usuario y buscamos su correo vinculado
  if (!identificador.includes("@")) {
    emailParaLogin = await obtenerEmailPorUsername(identificador);
  }

  // Autentica al usuario usando las herramientas nativas de Firebase
  return await signInWithEmailAndPassword(auth, emailParaLogin, contrasena);
};

/**
 * Registra un nuevo usuario en Firebase y guarda su información adicional en el backend.
 * @param correo Correo electrónico para el registro.
 * @param contrasena Contraseña de la cuenta.
 * @param username Nombre de usuario único para la plataforma.
 * @returns Credenciales del usuario creado en Firebase.
 */
export const registrarNuevoUsuario = async (correo: string, contrasena: string, username: string): Promise<UserCredential> => {
  // Validación básica: asegura que el username no esté vacío ni contenga espacios intermedios
  if (username.trim() === "" || username.includes(" ")) {
    throw new Error("INVALID_USERNAME_FORMAT");
  }

  // Verifica disponibilidad del nombre de usuario antes de proceder con el registro en Firebase
  const existe = await verificarExistenciaUsername(username);
  if (existe) {
    throw new Error("USERNAME_TAKEN");
  }

 // Crea el usuario en la base de datos de autenticación de Firebase
  const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);

  // Sincroniza el UID generado por Firebase con el backend de la aplicación
  try {
    await vincularBilleteraBackend(credenciales.user.uid, correo, username);
  } catch (errorVinculacion) {
    // Compensación: si el backend falla, eliminamos el usuario de Firebase
    // para no dejar una cuenta huérfana sin datos en el backend
    await credenciales.user.delete();
    throw new Error("ERROR_VINCULACION_BACKEND");
  }

  return credenciales;
};