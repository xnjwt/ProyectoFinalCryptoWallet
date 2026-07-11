import { Box, Paper, Typography, Divider, useTheme } from '@mui/material';
import { NetworkSelector } from './NetworkSelector';
import { ReceiveForm } from './ReceiveForm';
import { QrDisplay } from './QrDisplay';

import {  obtenerClavesPublicas } from '../../services/walletService';
import { useReceiveStore } from '../../store/receiveStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    titulo: "Recibir Fondos",
  },
  en: {
    titulo: "Receive Funds",
  }
};

export default function RecibirCrypto() {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const theme = useTheme(); // Obtenemos el tema dinámico

  
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const publicAddress = obtenerClavesPublicas(selectedNetwork as any) as string;
  return (
    // 1. Contenedor principal: Centra la tarjeta perfectamente en el panel
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, sm: 4 }
      }}
    >
      {/* 2. Tarjeta principal: Mismos estilos "Glassmorphism" que EnviarCrypto */}
      <Paper 
        sx={{ 
          width: "100%",
          maxWidth: "500px", // Unificamos el ancho con la tarjeta de envíos
          p: { xs: 4, sm: 5 }, 
          
          // Sombras y bordes modernos
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          borderRadius: '40px',
          
          // Colores dinámicos
          bgcolor: 'background.paper', 
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
          
          // Layout interno flexible
          display: 'flex',
          flexDirection: 'column',
          gap: 3 
        }}
      >
        <Typography 
          variant="h5" 
          align="center" 
          fontWeight={800} 
          sx={{ 
            mb: 2,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}
        >
          {t.titulo}
        </Typography>

        <NetworkSelector />
        
        <ReceiveForm />
        
        {/* Eliminamos el <Divider /> y en su lugar usamos un Box con margen superior para separar el QR */}
        <Box sx={{ mt: 2 }}>
          <QrDisplay publicAddress={publicAddress} />
        </Box>
        
      </Paper>
    </Box>
  );
}