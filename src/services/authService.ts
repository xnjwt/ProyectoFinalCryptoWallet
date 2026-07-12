import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  UserCredential 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  limit 
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

export const obtenerEmailPorUsername = async (username: string): Promise<string> => {
  const q = query(collection(db, "USERS"), where("username", "==", username), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error("USER_NOT_FOUND");
  }
  
  const datos = querySnapshot.docs[0].data();
  return datos.correo;
};

export const verificarExistenciaUsername = async (username: string): Promise<boolean> => {
  const q = query(collection(db, "USERS"), where("username", "==", username), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const vincularBilleteraBackend = async (uid: string, correo: string, username: string): Promise<void> => {
  try {
    const userRef = doc(db, "USERS", uid);
    await setDoc(userRef, {
      correo,
      username,
      fechaCreacion: new Date().toString(),
    });
  } catch (error) {
    throw new Error("ERROR_VINCULACION_BACKEND");
  }
};

export const iniciarSesionConIdentificador = async (identificador: string, contrasena: string): Promise<UserCredential> => {
  let emailParaLogin = identificador;

  if (!identificador.includes("@")) {
    emailParaLogin = await obtenerEmailPorUsername(identificador);
  }

  return await signInWithEmailAndPassword(auth, emailParaLogin, contrasena);
};

export const registrarNuevoUsuario = async (correo: string, contrasena: string, username: string): Promise<UserCredential> => {
  if (username.trim() === "" || username.includes(" ")) {
    throw new Error("INVALID_USERNAME_FORMAT");
  }

  const existe = await verificarExistenciaUsername(username);
  if (existe) {
    throw new Error("USERNAME_TAKEN");
  }

  const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);

  try {
    await vincularBilleteraBackend(credenciales.user.uid, correo, username);
  } catch (errorVinculacion) {
    await credenciales.user.delete();
    throw new Error("ERROR_VINCULACION_BACKEND");
  }

  return credenciales;
};