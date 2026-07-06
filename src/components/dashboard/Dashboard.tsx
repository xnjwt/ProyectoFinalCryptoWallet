import { useEffect, useState } from "react";
import { Box, Typography, Paper, IconButton, CircularProgress, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowDownLeft, Settings, Wallet } from "lucide-react";
import { auth } from "../../FirebaseConfig";
import { useWalletStore } from "../../store/walletStore";
import { useConfigStore } from "../../store/configStore";

const textos = {
  es: {
    tituloDashboard: "Panel Principal",
    labelDireccion: "Tu dirección de Solana",
    cargando: "Cargando...",
    tituloActivos: "Tus Activos",
    sinActivos: "No se encontraron activos en esta cuenta.",
    btnRecibir: "Recibir Crypto"
  },
  en: {
    tituloDashboard: "Dashboard",
    labelDireccion: "Your Solana Address",
    cargando: "Loading...",
    tituloActivos: "Your Assets",
    sinActivos: "No assets found in this account.",
    btnRecibir: "Receive Crypto"
  }
};

interface DatosWallet {
  publicKey: string;
}

export const Dashboard = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const t = textos[idioma] || textos.es;

  const [wallet, setWallet] = useState<DatosWallet | null>(null);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const res = await fetch(`http://localhost:3000/api/users/${user.uid}`);
          const data = await res.json();
          setWallet(data);
        } catch (err) {
          console.error("Error al traer wallet:", err);
        } finally {
          setEstaCargando(false);
        }
      } else {
        setEstaCargando(false);
      }
    };
    fetchWallet();
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: "720px", margin: "0 auto", p: { xs: 1, sm: 3 } }}>
      
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4 
        }}
      >
        <Typography variant="h4" component="h1" color="text.primary" fontWeight={800}>
          {t.tituloDashboard}
        </Typography>
        
        <IconButton 
          color="primary" 
          onClick={() => cambiarVista('CONFIGURACION')} 
          sx={{ 
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
            p: 1.5,
            borderRadius: "12px",
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              borderColor: "primary.main"
            }
          }}
        >
          <Settings size={22} />
        </IconButton>
      </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<ArrowDownLeft size={20} />}
            onClick={() => cambiarVista('RECIBIR_CRYPTO')}
            sx={{
              py: 1.8,
              borderRadius: '14px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' 
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}` 
                  : 'none',
            }}
          >
            {t.btnRecibir}
          </Button>
        </Box>
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderLeft: "6px solid", 
          borderColor: "primary.main",
          boxShadow: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Wallet size={18} style={{ opacity: 0.6 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ letterSpacing: "0.5px" }}>
            {t.labelDireccion.toUpperCase()}
          </Typography>
        </Box>
        
        {estaCargando ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
            <CircularProgress size={16} color="primary" />
            <Typography variant="body1" color="text.secondary" fontFamily="monospace">
              {t.cargando}
            </Typography>
          </Box>
        ) : (
          <Typography 
            variant="h6" 
            color="primary.main" 
            fontWeight={700}
            sx={{ 
              fontFamily: "monospace", 
              breakWord: "break-all", 
              wordBreak: "break-all",
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}
          >
            {wallet ? wallet.publicKey : "—"}
          </Typography>
        )}
      </Paper>

      <Paper 
        sx={{ 
          p: 3, 
          boxShadow: 1,
          backgroundColor: (theme) => 
            theme.palette.mode === "dark" 
              ? alpha(theme.palette.background.paper, 0.4) 
              : theme.palette.background.paper
        }}
      >
        <Typography variant="h6" component="h3" color="text.primary" fontWeight={700} mb={2}>
          {t.tituloActivos}
        </Typography>
        
        <Box 
          sx={{ 
            minHeight: "100px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            border: "1px dashed",
            borderColor: (theme) => alpha(theme.palette.text.secondary, 0.2),
            borderRadius: "12px",
            p: 2
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t.sinActivos}
          </Typography>
        </Box>
      </Paper>

    </Box>
  );
};