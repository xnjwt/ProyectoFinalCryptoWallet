import { useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
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

  const seed = useWalletStore((state) => state.seed);
  const secondsLeft = useWalletStore((state) => state.secondsLeft);
  const decrementTimer = useWalletStore((state) => state.decrementTimer);
  const vistaActual = useConfigStore((state) => state.vistaActual);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const setStep = useWalletStore((state) => state.setStep);
  const resetVerification = useWalletStore((state) => state.resetVerification);

  const palabras = seed ? seed.split(' ') : Array(12).fill('...');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const temporizador = setInterval(decrementTimer, 1000);
    return () => clearInterval(temporizador);
  }, [secondsLeft, decrementTimer]);

  const manejarSiguiente = () => {
    resetVerification();
    cambiarVista('VERIFICAR_SEMILLA')
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3, // Mayor separación con los bordes de la pantalla
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: '640px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h2" color="primary.main" fontWeight={700} mb={3}>
        {t.tituloExportar}
        </Typography>

        {seed && (
        <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{
            mt: 3,
            mb: 4,
            fontWeight:500,
            px: { xs: 0, sm: 2 }
            }}
            
        >
            {t.descExportar}
        </Typography>
        )}

        {!seed && (
        <Alert 
            severity="error" 
            variant="outlined" 
            sx={{ 
            width: '100%',
            mt: 4,
            mb: 4,
            borderRadius: '12px',
            py: 1,
            fontSize: '0.95rem',
            fontWeight: 500,
            boxSizing: 'border-box',
            color: 'error.main',
            borderColor: 'error.main',
            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
            '& .MuiAlert-icon': {
                color: 'error.main',
            }
            }}
        >
            {t.sinSemilla}
        </Alert>
        )}


        <Box
          sx={{
            display: 'grid',
            // Define 2 columnas en móviles y 3 columnas a partir de pantallas "sm" (600px)
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
            gap: 2, // Espacio real y garantizado entre las tarjetas de palabras
            mb: 5,
          }}
        >
          {palabras.map((palabra, indice) => (
            <Box
              key={`${palabra}-${indice}`}
              sx={{
                border: '1px solid',
                borderColor: alpha(useConfigStore.getState().tema.palette.primary.main, 0.4),
                borderRadius: '10px',
                py: 2, // Padding vertical interno
                px: 1.5, // Padding horizontal interno para evitar colisiones del texto
                fontWeight: 700,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                fontSize: '1.05rem',
                backgroundColor: (theme) => alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.06 : 0.03
                ),
              }}
            >
              <Typography component="span" color="text.secondary" fontWeight={600} fontSize="0.95rem">
                {indice + 1}.
              </Typography>
              {palabra}
            </Box>
          ))}
        </Box>

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
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
              color: "secondary.main",
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.5),
              "&:hover": {
                borderColor: "secondary.main",
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.05),
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
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' && secondsLeft <= 0 && seed
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}` 
                  : 'none',
            }}
          >
            {secondsLeft > 0 ? `${t.espera} ${secondsLeft}s...` : t.siguiente}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};