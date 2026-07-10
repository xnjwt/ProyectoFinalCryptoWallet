import { useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useWalletStore } from '../../store/walletStore';
import { useConfigStore } from '../../store/configStore';


const textos = {
  es: {
    tituloExportar: "Tu Frase Semilla",
    descExportar: "Anota estas 12 palabras en orden. Las necesitarás en el siguiente paso.",
    espera: "ESPERA",
    siguiente: "SIGUIENTE",
    sinSemilla: "No se encontró ninguna wallet configurada en este dispositivo.",
    volver: "VOLVER AL MENÚ",
  },
  en: {
    tituloExportar: "Your Seed Phrase",
    descExportar: "Write down these 12 words in order. You will need them in the next step.",
    espera: "WAIT",
    siguiente: "NEXT",
    sinSemilla: "No wallet configured on this device.",
    volver: "BACK TO MENU",
  },
};

export const GenerarFraseSemilla = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const theme = useTheme(); // Obtenemos el tema de manera reactiva

  const seed = useWalletStore((state) => state.seed);
  const secondsLeft = useWalletStore((state) => state.secondsLeft);
  const decrementTimer = useWalletStore((state) => state.decrementTimer);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const resetVerification = useWalletStore((state) => state.resetVerification);

  const palabras = seed ? seed.split(' ') : Array(12).fill('...');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const temporizador = setInterval(decrementTimer, 1000);
    return () => clearInterval(temporizador);
  }, [secondsLeft, decrementTimer]);

  const manejarSiguiente = () => {
    resetVerification();
    cambiarVista('VERIFICAR_SEMILLA');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 4 }, // Separación dinámica con los bordes
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: '700px', // Mismo ancho que ImportarSemilla
          width: '100%',
          textAlign: 'center',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          borderRadius: "40px",
          bgcolor: 'background.paper',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          color="primary.main" 
          fontWeight={800} 
          mb={1}
          sx={{ letterSpacing: '-0.02em' }}
        >
          {t.tituloExportar}
        </Typography>

        {seed && (
          <Typography 
            variant="body1" 
            sx={{
              mt: 1,
              mb: 4,
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              maxWidth: "450px",
              mx: "auto"
            }}
          >
            {t.descExportar}
          </Typography>
        )}

        {/* ALERTA MODERNIZADA */}
        {!seed && (
          <Alert 
            severity="error" 
            variant="outlined" 
            sx={{ 
              width: '100%',
              mb: 4,
              borderRadius: '16px',
              py: 1,
              fontWeight: 600,
              boxSizing: 'border-box',
              color: 'error.main',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.4)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(244, 67, 54, 0.05)',
              '& .MuiAlert-icon': {
                color: 'error.main',
              }
            }}
          >
            {t.sinSemilla}
          </Alert>
        )}

        {/* GRID DE LAS 12 PALABRAS (Estilo Cristal) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
            gap: 2, 
            mb: 5,
          }}
        >
          {palabras.map((palabra, indice) => (
            <Box
              key={`${palabra}-${indice}`}
              sx={{
                borderRadius: '16px',
                py: 2, 
                px: 1.5, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <Typography 
                component="span" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', 
                  fontWeight: 600, 
                  fontSize: '0.9rem' 
                }}
              >
                {indice + 1}.
              </Typography>
              <Typography 
                component="span" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827', 
                  fontWeight: 700, 
                  fontSize: '1.05rem',
                  letterSpacing: '0.05em'
                }}
              >
                {palabra}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* BOTONES */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => cambiarVista('MENU_BILLETERA')}
            sx={{
              py: 2,
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.05em",
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              "&:hover": {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
              },
            }}
          >
            {t.volver}
          </Button>

          <Button
            variant="contained"
            fullWidth
            disabled={secondsLeft > 0 || !seed}
            onClick={manejarSiguiente}
            sx={{
              py: 2,
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: theme.palette.mode === 'dark' && secondsLeft <= 0 && seed
                ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: theme.palette.mode === 'dark' && secondsLeft <= 0 && seed
                  ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.5)}`
                  : 'none',
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
              }
            }}
          >
            {secondsLeft > 0 ? `${t.espera} ${secondsLeft}s...` : t.siguiente}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};