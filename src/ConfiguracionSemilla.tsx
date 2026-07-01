import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Button, Typography } from '@mui/material';
import { techTheme } from './theme';
import { SeedPhraseDisplay } from './components/ClaveSemilla/SeedPhraseDisplay';
import { SeedPhraseVerification } from './components/ClaveSemilla/SeedPhraseVerification';
import { useWalletStore } from './store/walletStore';

// 1. Cambiamos el nombre de la función para que coincida con el archivo
export default function ConfiguracionSemilla() {
  const step = useWalletStore((state) => state.step);
  const initializeWallet = useWalletStore((state) => state.initializeWallet);
  const resetWallet = useWalletStore((state) => state.resetWallet);
  
  // 2. Extraemos la función que actualiza el estado para el Orquestador
  const completeWalletSetup = useWalletStore((state) => state.completeWalletSetup);

  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        // 3. Reemplazamos la redirección HTTP por la actualización de estado en memoria
        completeWalletSetup(); 
      }, 2000); 
      
      return () => clearTimeout(timer);
    }
  }, [step, completeWalletSetup]); // 4. Agregamos completeWalletSetup a las dependencias

  if (step === 0) return null;

  return (
    <ThemeProvider theme={techTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 50%, #1a233a 0%, #0a0e17 100%)',
          pt: 4,
          px: 2,
        }}
      >
        {/* Paso 1: Muestra la frase semilla */}
        {step === 1 && <SeedPhraseDisplay />}
        
        {/* Paso 2: Verifica la frase semilla */}
        {step === 2 && <SeedPhraseVerification />}
        
        {/* Paso 3: Pantalla de confirmación y redirección */}
        {step === 3 && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5" color="primary" sx={{ mb: 4, fontWeight: 'bold' }}>
              ¡Wallet configurada exitosamente!
            </Typography>
            <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
              Redirigiendo a tu panel...
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={resetWallet}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(211, 47, 47, 0.2)',
              }}
            >
              Eliminar Frase Semilla
            </Button>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}