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

  let credenciales;
  
  // 1. Capturamos los errores específicos de Firebase Auth
  try {
    credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);
  } catch (error: any) {
    // Mapeamos los códigos de Firebase a tus propios errores
    const errorMessage = error.message || String(error);

    // Mantenemos ambas opciones (cruda y SDK) por si Firebase cambia el formato en el futuro
    if (errorMessage.includes("EMAIL_EXISTS") || errorMessage.includes("email-already-in-use")) {
      throw new Error("EMAIL_EXISTS");
    } else if (errorMessage.includes("WEAK_PASSWORD") || errorMessage.includes("weak-password")) {
      throw new Error("WEAK_PASSWORD");
    } else if (errorMessage.includes("INVALID_EMAIL") || errorMessage.includes("invalid-email")) {
      throw new Error("INVALID_EMAIL");
    }
    // Si es un error desconocido, lo lanzamos para no perderlo
    throw error;
  }

  // 2. Si Firebase Auth tuvo éxito, procedemos a vincular los datos en Firestore
  try {
    await vincularBilleteraBackend(credenciales.user.uid, correo, username);
  } catch (errorVinculacion) {
    console.error("EL ERROR REAL ES:", errorVinculacion);
    
    // Compensación: Si la base de datos falla, borramos la cuenta de Auth
    if (credenciales && credenciales.user) {
        await credenciales.user.delete();
    }
    
    throw new Error("ERROR_VINCULACION_BACKEND");
  }

  return credenciales;
};