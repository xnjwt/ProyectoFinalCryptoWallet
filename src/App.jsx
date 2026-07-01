import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import ConfiguracionSemilla from "./ConfiguracionSemilla";
import useWalletStore from "./store/walletStore";

function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Extraemos el estado y la acción de Zustand
  const isWalletConfigured = useWalletStore(
    (state) => state.isWalletConfigured,
  );
  const checkWalletStatus = useWalletStore((state) => state.checkWalletStatus);

  // El Observador de Persistencia
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Validamos en el backend si este usuario ya configuró su frase semilla
        await checkWalletStatus(currentUser.uid);
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [checkWalletStatus]); // Añadimos checkWalletStatus a las dependencias

  // Función de Cierre de Sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Pantalla de carga
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-bold tracking-widest text-purple-400">
          Iniciando Billetera...
        </div>
      </div>
    );
  }

  // Si NO hay usuario -> Mostrar Login/Registro
  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  // Si SÍ hay usuario, pero NO ha configurado la wallet -> Mostrar Frase Semilla
  // Aquí es donde solucionas el error de ESLint al usar el componente
  if (!isWalletConfigured) {
    return <ConfiguracionSemilla />;
  }

  // Si SÍ hay usuario y SÍ tiene la wallet configurada -> Mostrar el Dashboard con tu diseño
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Barra superior de navegación */}
        <div className="flex justify-between items-center bg-gray-900/50 backdrop-blur-md p-4 rounded-2xl border border-gray-800 mb-8">
          <div>
            <p className="text-sm text-gray-400">Billetera conectada</p>
            <p className="font-mono text-purple-400 font-bold">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-xl text-sm font-bold transition duration-200"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Contenedor del Dashboard */}
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
