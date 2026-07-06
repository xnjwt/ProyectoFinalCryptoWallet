import { Box, Paper, Typography, Divider } from '@mui/material';
import { NetworkSelector } from './NetworkSelector';
import { ReceiveForm } from './ReceiveForm';
import { QrDisplay } from './QrDisplay';
import { deriveAddress } from '../../services/cryptoService';
import { getSeedFromStorage } from '../../services/walletService';
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

  const testMnemonic = getSeedFromStorage() || "";
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const publicAddress = deriveAddress(testMnemonic, selectedNetwork);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "720px",
        margin: "0 auto",
        p: { xs: 1, sm: 3 }
      }}
    >
      <Paper 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          boxShadow: 3 
        }}
      >
        <Typography 
          variant="h5" 
          color="primary.main" 
          align="center" 
          fontWeight={700} 
          sx={{ mb: 4 }}
        >
          {t.titulo}
        </Typography>

        <NetworkSelector />
        <ReceiveForm />
        
        <Divider sx={{ my: 4 }} />
        
        <QrDisplay publicAddress={publicAddress} />
      </Paper>
    </Box>
  );
}