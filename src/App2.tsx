import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Button, Typography} from '@mui/material';
import { techTheme } from './theme';
import { SeedPhraseDisplay } from './components/ClaveSemilla/SeedPhraseDisplay';
import { SeedPhraseVerification } from './components/ClaveSemilla/SeedPhraseVerification';
import { useWalletStore } from './store/walletStore';

export default function App() {
  const step = useWalletStore((state) => state.step);
  const initializeWallet = useWalletStore((state) => state.initializeWallet);
  const resetWallet = useWalletStore((state) => state.resetWallet);

  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

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
        {step === 1 && <SeedPhraseDisplay />}
        {step === 2 && <SeedPhraseVerification />}
        {step === 3 && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5" color="primary" sx={{ mb: 4, fontWeight: 'bold' }}>
              ¡Wallet configurada exitosamente!
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