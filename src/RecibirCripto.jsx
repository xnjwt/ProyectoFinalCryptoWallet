import { ThemeProvider, CssBaseline, Box, Paper, Typography, Divider } from '@mui/material';
import { techTheme } from './theme';
import { NetworkSelector } from './components/recibirCrypto/NetworkSelector';
import { ReceiveForm } from './components/recibirCrypto/ReceiveForm';
import { QrDisplay } from './components/recibirCrypto/QrDisplay';
import { deriveAddress } from './services/cryptoService';
import { useReceiveStore } from './store/receiveStore';

export default function App() {
  const testMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  
  const publicAddress = deriveAddress(testMnemonic, selectedNetwork);

  return (
    <ThemeProvider theme={techTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 50%, #1a233a 0%, #0a0e17 100%)',
          pt: 4,
          px: 2,
          pb: 6
        }}
      >
        <Paper elevation={0} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom align="center" fontWeight="bold" sx={{ mb: 3 }}>
            Recibir Fondos
          </Typography>

          <NetworkSelector />
          <ReceiveForm />
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
          
          <QrDisplay publicAddress={publicAddress} />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}