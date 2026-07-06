import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Box, Container, CircularProgress, Button, Typography, IconButton, alpha } from "@mui/material";
import { auth } from "./FirebaseConfig";
import { useWalletStore } from "./store/walletStore";
import { useConfigStore } from "./store/configStore";


import { GenerarFraseSemilla } from "./components/ClaveSemilla/GenerarFraseSemilla";
import { VerificarFrase } from "./components/ClaveSemilla/VerificarFrase";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Configuracion } from "./components/dashboard/Configuracion";
import { Autenticacion } from "./components/Autenticacion/Autenticacion";
import { ArrowLeft } from "lucide-react";
import RecibirCripto from "./components/recibirCrypto/RecibirCripto";

function App() {
  const checkWalletStatus = useWalletStore((state) => state.checkWalletStatus);
  
  // ESTA LÍNEA ES CRÍTICA: Debe usar la función selectora para activar la reactividad
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
        cambiarVista('AUTENTICACION');
        setAutenticando(false);
        return;
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

  if (!usuarioActivo) {
    return <Autenticacion onAuthSuccess={() => {}} />;
  }

  return (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: (theme) => theme.palette.divider,
          backdropFilter: "blur(16px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* BOTÓN DE RETROCESO CONDICIONAL */}
          {(vistaActual === 'CONFIGURACION' || vistaActual === 'RECIBIR_CRYPTO') && (
            <IconButton
              color="primary"
              onClick={() => cambiarVista('DASHBOARD')}
              sx={{
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                borderRadius: "10px",
                p: 1,
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                },
              }}
            >
              <ArrowLeft size={20} />
            </IconButton>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.5px' }}>
              BILLETERA CONECTADA
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
              {usuarioActivo.email}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="error"
          onClick={manejarCerrarSesion}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Container>

    <Container maxWidth="md">
      {vistaActual === 'GENERAR_SEMILLA' && <GenerarFraseSemilla />}
      {vistaActual === 'VERIFICAR_SEMILLA' && <VerificarFrase />}
      {vistaActual === 'DASHBOARD' && <Dashboard />}
      {vistaActual === 'CONFIGURACION' && <Configuracion />}
      {vistaActual === 'RECIBIR_CRYPTO' && <RecibirCripto />}
    </Container>
  </Box>
);
}

export default App;