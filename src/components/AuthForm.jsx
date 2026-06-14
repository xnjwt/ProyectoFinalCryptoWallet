import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../FirebaseConfig";

export const AuthForm = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // NUEVO: Estado para mensajes de éxito
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMessage("");
    setSuccessMessage(""); // Limpiamos los mensajes al cambiar de pantalla
  };

  // NUEVA FUNCIÓN: Manejo de recuperación de contraseña
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage(
        "Por favor, ingresa tu correo electrónico arriba para recuperar la contraseña.",
      );
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "Te hemos enviado un correo con el enlace para restablecer tu contraseña.",
      );
    } catch (error) {
      console.error("Error al recuperar:", error.code);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        setErrorMessage("No hay ninguna cuenta registrada con este correo.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("El formato del correo es inválido.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      let userCredential;

      if (isLoginMode) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
      }

      onAuthSuccess(userCredential.user);
    } catch (error) {
      console.error("Error de Firebase:", error.code);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Este correo ya está registrado.");
      } else if (error.code === "auth/invalid-credential") {
        setErrorMessage("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-purple-950 via-gray-900 to-slate-950 p-4">
      {/* Nombre de la Wallet */}
      <h1 className="text-4xl font-extrabold text-center mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
          Wallet-Crypto LoL
        </span>
      </h1>

      {/* Eslogan */}
      <p className="text-gray-400 text-center mb-8 text-sm font-medium tracking-widest uppercase">
        Dame tu dinero y te hare millonario
      </p>

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>

        <form onSubmit={handleAuthentication} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isLoginMode} // Solo es obligatoria si estamos creando cuenta o iniciando sesión, no para recuperar
            />
          </div>

          {/* NUEVO: Botón de recuperar contraseña (Solo visible en modo Login) */}
          {isLoginMode && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="text-sm text-purple-400 hover:text-purple-300 transition duration-200"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Caja de Errores */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center">
              {errorMessage}
            </div>
          )}

          {/* NUEVO: Caja de Éxito */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 text-sm p-3 rounded-lg text-center">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading
              ? "Procesando..."
              : isLoginMode
                ? "Entrar"
                : "Registrarse"}
          </button>
        </form>

        <button
          onClick={toggleMode}
          className="w-full mt-6 text-gray-400 hover:text-white text-sm transition duration-200"
        >
          {isLoginMode
            ? "¿No tienes cuenta? Regístrate aquí"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};
