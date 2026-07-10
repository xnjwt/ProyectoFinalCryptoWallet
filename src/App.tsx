import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Box, CircularProgress } from "@mui/material";
import { auth } from "./FirebaseConfig";
import { useWalletStore } from "./store/walletStore";
import { useConfigStore } from "./store/configStore";

import { GenerarFraseSemilla } from "./components/ClaveSemilla/GenerarFraseSemilla";
import { VerificarFrase } from "./components/ClaveSemilla/VerificarFrase";
import { Autenticacion } from "./components/Autenticacion/Autenticacion";
import { WalletDashboard } from "./components/dashboard/WalletDashboard";

function App() {
  const checkWalletStatus = useWalletStore((state) => state.checkWalletStatus);

  const vistaActual = useConfigStore((state) => state.vistaActual);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);

  const [usuarioActivo, setUsuarioActivo] = useState<User | null>(null);
  const [autenticando, setAutenticando] = useState(true);

  const enrutarSesionInicial = async (usuario: User) => {
    await checkWalletStatus(usuario.uid);
    const yaTieneWallet = useWalletStore.getState().isWalletConfigured;

    if (yaTieneWallet) {
      cambiarVista('DASHBOARD');
      return;
    }
    cambiarVista('GENERAR_SEMILLA');
  };

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (user) => {
      setAutenticando(true);
      setUsuarioActivo(user);

      if (!user) {
        setAutenticando(false);
        cambiarVista('AUTENTICACION');
        console.log("Usuario no autenticado. Redirigiendo a la vista de autenticación.");
        return;
      } else {
        console.log("Usuario autenticado:", user.email);
      }

      await enrutarSesionInicial(user);
      setAutenticando(false);
    });

    return () => desuscribir();
  }, [checkWalletStatus, cambiarVista]);

  const manejarCerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (autenticando) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  //prueba de cambio

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {vistaActual === 'AUTENTICACION' && <Autenticacion onAuthSuccess={() => {}} />}
      {vistaActual === 'GENERAR_SEMILLA' && <GenerarFraseSemilla />}
      {vistaActual === 'VERIFICAR_SEMILLA' && <VerificarFrase />}
      {(vistaActual === 'DASHBOARD' ||
        vistaActual === 'CONFIGURACION' ||
        vistaActual === 'RECIBIR_CRYPTO' ||
        vistaActual === 'ENVIAR_CRYPTO') && (
        <WalletDashboard onLogout={manejarCerrarSesion} />
      )}
    </Box>
  );
}

export default App;