import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { techTheme } from './theme';
import { SeedPhraseDisplay } from './components/ClaveSemilla/SeedPhraseDisplay';
import { SeedPhraseVerification } from './components/ClaveSemilla/SeedPhraseVerification';
import {
  generateSeedPhrase,
  saveSeedToStorage,
  getSeedFromStorage,
  clearSeedFromStorage,
} from './services/walletService';

export default function App() {
  const [step, setStep] = useState<number>(0);
  const [seed, setSeed] = useState<string>('');
  
  useEffect(() => {
    clearSeedFromStorage();
    const existingSeed = getSeedFromStorage();
    if (existingSeed) {
      setSeed(existingSeed);
      setStep(3); // Salta directamente al éxito/interfaz principal porque ya está creada y validada
    } else {
      const newSeed = generateSeedPhrase();
      setSeed(newSeed);
      saveSeedToStorage(newSeed);
      setStep(1); // Es usuario nuevo, inicia el flujo de respaldo
    }
  }, []);

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
        {step === 1 && (
          <SeedPhraseDisplay seedPhrase={seed} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <SeedPhraseVerification
            originalSeed={seed}
            onBack={() => setStep(1)}
            onSuccess={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Box sx={{ color: '#00e5ff', textAlign: 'center', mt: 10, fontSize: '1.5rem' }}>
            ¡Wallet configurada exitosamente!
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}