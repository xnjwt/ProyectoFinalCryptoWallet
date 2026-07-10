import { Box, Paper, Typography, useTheme} from '@mui/material';
import { SendForm } from './SendForm';
import { SendSummary } from './SendSummary';
import { useSendStore } from '../../store/sendStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    titulo: "Enviar Fondos",
  },
  en: {
    titulo: "Send Funds",
  }
};

export const EnviarCrypto = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const faseActual = useSendStore((state) => state.faseActual);
  const theme = useTheme(); // Hook para obtener el tema actual

  return (
    // 1. MODIFICADO: Cambiamos el Box contenedor principal.
    // Le decimos que ocupe todo el alto disponible (flex: 1) y centramos su contenido.
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, sm: 4 },
        // Eliminamos "minHeight: 100vh" si lo tenías, y dejamos que el panel de WalletDashboard mande.
      }}
    >
      {/* 2. MODIFICADO: El Paper ahora tiene un maxWidth fijo y se adapta al tema base de tu app */}
      <Paper 
        sx={{ 
          width: "100%",
          maxWidth: "500px", // Hacemos la tarjeta un poco más esbelta para que se vea elegante
          p: { xs: 4, sm: 5 }, 
          
          // Mantenemos la sombra y los bordes modernos
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          borderRadius: '32px',
          
          // IMPORTANTE: Le damos el color "card" o "paper" de tu tema, no un color fijo oscuro
          bgcolor: 'background.paper', 
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <Typography 
          variant="h5" 
          align="center" 
          fontWeight={800} 
          sx={{ 
            mb: 5,
            color: 'text.primary', // Usamos el color de texto del tema
            letterSpacing: '-0.02em'
          }}
        >
          {t.titulo}
        </Typography>

        {faseActual === 'FORM' ? <SendForm /> : <SendSummary />}
        
      </Paper>
    </Box>
  );
};