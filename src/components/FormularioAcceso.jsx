import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Keypair } from "@solana/web3.js";
import { auth } from "../FirebaseConfig";
import { useWalletStore } from "../store/walletStore";
import { generateSeedPhrase } from "../services/walletService";

export const FormularioAcceso = ({ onAuthSuccess }) => {
  const [esModoLogin, setEsModoLogin] = useState(true);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const setSeed = useWalletStore((state) => state.setSeed);
  const setStep = useWalletStore((state) => state.setStep);

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    setMensajeError("");
    setEstaCargando(true);

    try {
      if (esModoLogin) {
        const credenciales = await signInWithEmailAndPassword(
          auth,
          correo,
          contrasena,
        );
        onAuthSuccess(credenciales.user);
      } else {
        const credenciales = await createUserWithEmailAndPassword(
          auth,
          correo,
          contrasena,
        );
        const uid = credenciales.user.uid;

        const keypair = Keypair.generate();
        const llavePublica = keypair.publicKey.toString();

        const semillaReal = generateSeedPhrase();
        setSeed(semillaReal);

        await fetch("http://localhost:3000/api/users/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, correo, llavePublica }),
        });

        setStep(1);
        onAuthSuccess(credenciales.user);
      }
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEstaCargando(false);
    }
  };

  const alternarModo = () => {
    setEsModoLogin(!esModoLogin);
    setMensajeError("");
    setMensajeExito("");
  };

  const manejarRecuperacionContrasena = async () => {
    if (!correo) {
      setMensajeError(
        "Por favor, ingresa tu correo para recuperar la contraseña.",
      );
      return;
    }
    setEstaCargando(true);
    try {
      await sendPasswordResetEmail(auth, correo);
      setMensajeExito("Te hemos enviado un correo de recuperación.");
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEstaCargando(false);
    }
  };

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
          <div>
            <label className="block text-cyan-700 mb-2 text-sm font-bold tracking-wide">
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              className="w-full bg-black/20 border border-cyan-900/50 text-cyan-200 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-cyan-900/50"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

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

          {esModoLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={manejarRecuperacionContrasena}
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {mensajeError && (
            <div className="bg-red-950/40 text-red-400 border border-red-900/50 text-sm font-semibold p-3 rounded-lg text-center">
              {mensajeError}
            </div>
          )}
          {mensajeExito && (
            <div className="bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 text-sm font-semibold p-3 rounded-lg text-center">
              {mensajeExito}
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
