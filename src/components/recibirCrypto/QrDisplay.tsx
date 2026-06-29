import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useReceiveStore } from '../../store/receiveStore';
import { buildCryptoUri } from '../../services/cryptoService';
import { Copy, QrCode } from 'lucide-react';
import { useState } from 'react';

interface Props {
  publicAddress: string;
}

export const QrDisplay = ({ publicAddress }: Props) => {
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const smartQrActive = useReceiveStore((state) => state.smartQrActive);
  const receiveAmount = useReceiveStore((state) => state.receiveAmount);
  const selectedToken = useReceiveStore((state) => state.selectedToken);
  const [copied, setCopied] = useState(false);

  // Esta es la fuente de la verdad para el QR y para copiar
  const qrValue = smartQrActive 
    ? buildCryptoUri(selectedNetwork, publicAddress, receiveAmount, selectedToken)
    : publicAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue); // Ahora copia todo el contenido del QR
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para recortar dinámicamente la cadena del QR visualmente
  const formatUri = (uri: string) => {
    if (uri.length <= 30) return uri;
    return `${uri.slice(0, 15)}••••${uri.slice(-12)}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          p: 1.5,
          backgroundColor: '#fff',
          borderRadius: '12px',
          display: 'inline-flex',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
        }}
      >
        <QRCodeSVG value={qrValue} size={180} level="M" />
      </Box>

      {/* Unica sección de datos debajo del QR */}
      <Box 
        sx={{ 
          width: '100%', 
          p: 1.5, 
          backgroundColor: 'rgba(0, 0, 0, 0.4)', 
          borderRadius: '8px', 
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <QrCode size={14} color="#00e5ff" />
          <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Datos del QR
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#b0bec5', letterSpacing: '1px' }}>
            {formatUri(qrValue)}
          </Typography>
          <Tooltip title={copied ? "¡Copiado!" : "Copiar datos"}>
            <IconButton onClick={handleCopy} size="small" sx={{ color: '#00e5ff' }}>
              <Copy size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};