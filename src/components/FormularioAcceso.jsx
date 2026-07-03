import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
//import { collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "../FirebaseConfig";
import { useWalletStore } from "../store/walletStore";

export const FormularioAcceso = ({ onAuthSuccess }) => {
  const [esModoLogin, setEsModoLogin] = useState(true);

  // Renombramos 'correo' a 'identificador'
  // porque ahora sirve para ambas cosas en el login
  const [identificador, setIdentificador] = useState("");
  const [username, setUsername] = useState("");
  const [correoRegistro, setCorreoRegistro] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [mensajeError, setMensajeError] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const setStep = useWalletStore((state) => state.setStep);

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    setMensajeError("");
    setEstaCargando(true);

    try {
      if (esModoLogin) {
        let emailParaLogin = identificador;
        // Si el identificador no tiene "@", asumimos que es un username
        if (!identificador.includes("@")) {
          const respuesta = await fetch(
            `http://localhost:3000/api/users/get-email/${identificador}`,
          );
          const datos = await respuesta.json();
          if (!respuesta.ok || !datos.correo)
            throw new Error("El nombre de usuario no existe.");
          emailParaLogin = datos.correo;
        }
        // Iniciamos sesión con el correo (ya sea que lo ingresó directo o lo obtuvimos del username)
        const credenciales = await signInWithEmailAndPassword(
          auth,
          emailParaLogin,
          contrasena,
        );
        onAuthSuccess(credenciales.user);
      } else {
        // --- VALIDACIONES DE USERNAME ---
        //Validar que no tenga espacios
        if (username.trim() === "" || username.includes(" ")) {
          throw new Error(
            "El nombre de usuario es obligatorio y no puede contener espacios.",
          );
        }
        // Validar Unicidad en Firestore
        const verificarUser = await fetch(
          `http://localhost:3000/api/users/check-username/${username}`,
        );
        const dataVerificacion = await verificarUser.json();
        if (dataVerificacion.existe)
          throw new Error("Este nombre de usuario ya está en uso. Elige otro.");

        // --- FLUJO NORMAL DE REGISTRO ---
        const credenciales = await createUserWithEmailAndPassword(
          auth,
          correoRegistro,
          contrasena,
        );
        const uid = credenciales.user.uid;

        //Guardado en la base de datos
        await fetch("http://localhost:3000/api/users/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Agregamos el username al payload que se envía al servidor actual
          body: JSON.stringify({
            uid,
            correo: correoRegistro,
            username,
          }),
        });
        setStep(1);
        onAuthSuccess(credenciales.user);
      }
    } catch (error) {
      // Simplificamos los mensajes de error de Firebase para el usuario
      if (error.code === "auth/invalid-credential") {
        setMensajeError("Credenciales incorrectas.");
      } else {
        setMensajeError(error.message);
      }
    } finally {
      setEstaCargando(false);
    }
  };

  const alternarModo = () => {
    setEsModoLogin(!esModoLogin);
    setMensajeError("");
    setUsername(""); // Limpiamos el username al cambiar de modo
  };

  //Ocultar lo de recuperar contra
  /*const manejarRecuperacionContrasena = async () => {
    if (!identificador || !identificador.includes("@")) {
      setMensajeError(
        "Por favor, ingresa tu correo electrónico para recuperar la contraseña.",
      );
      return;
    }
    setEstaCargando(true);
    try {
      await sendPasswordResetEmail(auth, identificador);
      setMensajeExito("Te hemos enviado un correo de recuperación.");
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEstaCargando(false);
    }
  };*/

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] tracking-wide">
        Wallet-Crypto
      </h1>

      <div className="bg-[#0b1320] border border-cyan-900/30 rounded-2xl p-8 md:p-10 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 text-center mb-8">
          {esModoLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>

        <form onSubmit={manejarAutenticacion} className="space-y-5">
          {esModoLogin ? (
            <div>
              <label className="block text-cyan-700 mb-2 text-sm font-bold tracking-wide">
                CORREO ELECTRÓNICO O USUARIO
              </label>
              <input
                type="text"
                className="w-full bg-black/20 border border-cyan-900/50 text-cyan-200 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-cyan-900/50"
                placeholder="tu@correo.com o tu_usuario"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value.trim())}
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-cyan-700 mb-2 text-sm font-bold tracking-wide">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  className="w-full bg-black/20 border border-cyan-900/50 text-cyan-200 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-cyan-900/50"
                  placeholder="tu@correo.com"
                  value={correoRegistro}
                  onChange={(e) => setCorreoRegistro(e.target.value.trim())}
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-700 mb-2 text-sm font-bold tracking-wide">
                  NOMBRE DE USUARIO
                </label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-cyan-900/50 text-cyan-200 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-cyan-900/50"
                  placeholder="ejemplo123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-cyan-700 mb-2 text-sm font-bold tracking-wide">
              CONTRASEÑA
            </label>
            <input
              type="password"
              className="w-full bg-black/20 border border-cyan-900/50 text-cyan-200 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-cyan-900/50"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          {mensajeError && (
            <div className="bg-red-950/40 text-red-400 border border-red-900/50 text-sm font-semibold p-3 rounded-lg text-center">
              {mensajeError}
            </div>
          )}

          <button
            type="submit"
            disabled={estaCargando}
            className={`w-full py-4 rounded-xl font-bold tracking-widest transition-all duration-300 mt-4 ${
              estaCargando
                ? "bg-cyan-900/50 text-cyan-700 cursor-not-allowed border border-cyan-900"
                : "bg-cyan-400 text-slate-900 hover:bg-cyan-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            }`}
          >
            {estaCargando
              ? "PROCESANDO..."
              : esModoLogin
                ? "ENTRAR"
                : "REGISTRARSE"}
          </button>
        </form>

        <button
          onClick={alternarModo}
          className="w-full mt-8 text-cyan-800 hover:text-cyan-400 text-sm font-bold tracking-wide transition-colors"
        >
          {esModoLogin
            ? "¿NO TIENES CUENTA? REGÍSTRATE AQUÍ"
            : "¿YA TIENES CUENTA? INICIA SESIÓN"}
        </button>
      </div>
    </div>
  );
};
