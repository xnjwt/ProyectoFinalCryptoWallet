import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Keypair } from "@solana/web3.js";
import { auth } from "../clienteFirebase"; // Ajusta la ruta si es necesario

export default function Registro() {
  // Estados para controlar los inputs y la consola
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consolaMensaje, setConsolaMensaje] = useState("Esperando acción...");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página

    if (!email || !password) {
      setConsolaMensaje("Error: Llena todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      // PASO 1: Crear usuario en Firebase Auth
      setConsolaMensaje("1/3 Creando cuenta en Firebase...");
      const credenciales = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = credenciales.user.uid;

      // PASO 2: Generar billetera de Solana localmente
      setConsolaMensaje("2/3 Generando claves criptográficas...");
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      // La clave privada nace y muere en la memoria RAM del cliente.

      // PASO 3: Enviar UID y Clave Pública al Backend
      setConsolaMensaje("3/3 Vinculando wallet en la base de datos...");
      const respuesta = await fetch(
        "http://localhost:3000/api/users/link-wallet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, email, publicKey }),
        },
      );

      const datosServidor = await respuesta.json();

      if (datosServidor.exito) {
        setConsolaMensaje(
          `¡ÉXITO!\nUID: ${uid}\nWallet: ${publicKey}\n\nRevisa tu Firestore.`,
        );
      } else {
        setConsolaMensaje(`Error del servidor: ${datosServidor.error}`);
      }
    } catch (error) {
      setConsolaMensaje(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#e0e0e0] font-sans m-0">
      <div className="bg-[#1e1e1e] p-8 rounded-lg w-full max-w-md shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl text-center mb-6 mt-0 font-bold">
          Crear Billetera
        </h2>

        <form onSubmit={handleRegistro}>
          <label className="block mb-1 text-[#aaa]" htmlFor="email">
            Correo Electrónico:
          </label>
          <input
            id="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-5 border border-[#333] bg-[#2a2a2a] text-white rounded-md box-border outline-none focus:border-blue-500"
          />

          <label className="block mb-1 text-[#aaa]" htmlFor="password">
            Contraseña (Mínimo 6 caracteres):
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-5 border border-[#333] bg-[#2a2a2a] text-white rounded-md box-border outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 text-white rounded-md font-bold transition-colors duration-300 ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#007bff] hover:bg-[#0056b3]"
            }`}
          >
            {isLoading ? "Procesando..." : "Registrar y Generar Wallet"}
          </button>
        </form>

        <div className="bg-black p-4 rounded-md font-mono text-[#0f0] mt-5 text-xs whitespace-pre-wrap break-all">
          {consolaMensaje}
        </div>
      </div>
    </div>
  );
}
