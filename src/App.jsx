import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { FormularioAcceso } from "./components/FormularioAcceso";
import { Dashboard } from "./components/dashboard/Dashboard";
import { useWalletStore } from "./store/walletStore";
import { SeedPhraseDisplay } from "./components/ClaveSemilla/SeedPhraseDisplay";
import { SeedPhraseVerification } from "./components/ClaveSemilla/SeedPhraseVerification";

function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Estados extraídos del store
  const isWalletConfigured = useWalletStore(
    (state) => state.isWalletConfigured,
  );
  const checkWalletStatus = useWalletStore((state) => state.checkWalletStatus);
  const step = useWalletStore((state) => state.step); // Controla si es paso 1 o 2

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkWalletStatus(currentUser.uid);
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, [checkWalletStatus]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 1. Pantalla de carga
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-bold tracking-widest text-purple-400">
          Iniciando Billetera...
        </div>
      </div>
    );
  }

  // 2. Si NO hay usuario -> Mostrar Formulario
  if (!user) {
    return <FormularioAcceso onAuthSuccess={setUser} />;
  }

  // 3. Si hay usuario pero NO ha terminado la configuración de semilla
  if (!isWalletConfigured) {
    if (step === 1) return <SeedPhraseDisplay />;
    if (step === 2) return <SeedPhraseVerification />;
    return <SeedPhraseDisplay />; // Default por seguridad
  }

  // 4. Si TODO está listo -> Mostrar Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
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
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
