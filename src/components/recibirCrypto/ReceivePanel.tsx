import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { NetworkSelector } from './NetworkSelector';
import { QrDisplay } from './QrDisplay';
import { ReceiveForm } from './ReceiveForm';
import { useReceiveStore } from '../../store/receiveStore';
import { deriveAddress } from '../../services/cryptoService';

// TODO: reemplazar por la frase semilla real del usuario
// cuando esté conectada la lógica de generación/restauración de wallet
const TEST_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

interface ReceivePanelProps {
  onClose: () => void;
}

export const ReceivePanel = ({ onClose }: ReceivePanelProps) => {
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const publicAddress = deriveAddress(TEST_MNEMONIC, selectedNetwork);

  return (
    <Box className="h-full w-full bg-slate-950 text-white p-6 overflow-y-auto">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <ArrowLeft size={22} />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Recibir
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 420, mx: 'auto' }}>
        <NetworkSelector />
        <QrDisplay publicAddress={publicAddress} />
        <ReceiveForm />
      </Box>
    </Box>
  );
};