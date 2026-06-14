import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. El Observador de Persistencia
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Si hay sesión, guarda el usuario. Si no, guarda null.
      setIsInitializing(false); // Apaga la pantalla de carga
    });

    // Limpieza de memoria (buena práctica en React)
    return () => unsubscribe();
  }, []);

  // 2. Función de Cierre de Sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Le ordena a Firebase destruir el token local
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 3. Pantalla de carga mientras Firebase busca el token
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-bold tracking-widest text-purple-400">
          Iniciando Billetera...
        </div>
      </div>
    );
  }

  return (
    <div>
      {!user ? (
        <AuthForm onAuthSuccess={setUser} />
      ) : (
        // 4. El esqueleto del nuevo Dashboard
        <div className="min-h-screen bg-slate-950 text-white p-6">
          <div className="max-w-4xl mx-auto">
            {/* Barra superior de navegación */}
            <div className="flex justify-between items-center bg-gray-900/50 backdrop-blur-md p-4 rounded-2xl border border-gray-800 mb-8">
              <div>
                <p className="text-sm text-gray-400">Billetera conectada</p>
                <p className="font-mono text-purple-400 font-bold">
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-xl text-sm font-bold transition duration-200"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Contenedor temporal para las futuras tarjetas */}
            <Dashboard />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
