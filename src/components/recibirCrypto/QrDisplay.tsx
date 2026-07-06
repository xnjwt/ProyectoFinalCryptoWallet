import { useState } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import { useReceiveStore } from '../../store/receiveStore';
import { useConfigStore } from '../../store/configStore';
import { buildCryptoUri } from '../../services/cryptoService';
import { Copy, QrCode } from 'lucide-react';

const textos = {
  es: {
    datosQr: "Datos del QR",
    copiar: "Copiar datos",
    copiado: "¡Copiado!",
  },
  en: {
    datosQr: "QR Data",
    copiar: "Copy data",
    copiado: "Copied!",
  }
};

interface QrDisplayProps {
  publicAddress: string;
}

export const QrDisplay = ({ publicAddress }: QrDisplayProps) => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const smartQrActive = useReceiveStore((state) => state.smartQrActive);
  const receiveAmount = useReceiveStore((state) => state.receiveAmount);
  const selectedToken = useReceiveStore((state) => state.selectedToken);
  const [copied, setCopied] = useState(false);

  const qrValue = smartQrActive 
    ? buildCryptoUri(selectedNetwork, publicAddress, receiveAmount, selectedToken)
    : publicAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUri = (uri: string) => {
    if (uri.length <= 30) return uri;
    return `${uri.slice(0, 15)}••••${uri.slice(-12)}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Box
        sx={{
          p: 2,
          backgroundColor: '#fff',
          borderRadius: '16px',
          display: 'inline-flex',
          boxShadow: (theme) => `0 0 25px ${alpha(theme.palette.primary.main, 0.25)}`
        }}
      >
        <QRCodeSVG value={qrValue} size={180} level="M" />
      </Box>

      <Box 
        sx={{ 
          width: '100%', 
          p: 2, 
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6), 
          borderRadius: '12px', 
          border: '1px solid',
          borderColor: (theme) => theme.palette.divider,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode size={14} style={{ opacity: 0.8 }} />
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t.datosQr}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'text.primary', letterSpacing: '0.5px' }}>
            {formatUri(qrValue)}
          </Typography>
          <Tooltip title={copied ? t.copiado : t.copiar}>
            <IconButton onClick={handleCopy} size="small" color="primary">
              <Copy size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};