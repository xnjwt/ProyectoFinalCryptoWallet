import { useState } from 'react';
import { Box, IconButton, Typography, Tooltip, useTheme } from '@mui/material';
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
  const theme = useTheme();

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

  const formatUri = (addr: string) => {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-6)}`;
};
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* CONTENEDOR DEL CÓDIGO QR */}
      <Box
        sx={{
          p: 2.5, // Un poco más de margen interno para que respire
          backgroundColor: '#ffffff', // Siempre blanco para asegurar legibilidad del escáner
          borderRadius: '24px', // Esquinas súper redondeadas
          display: 'inline-flex',
          // Resplandor dinámico: más intenso en modo oscuro, más suave como sombra en modo claro
          boxShadow: theme.palette.mode === 'dark' 
            ? `0 0 45px ${alpha(theme.palette.primary.main, 0.25)}` 
            : `0 15px 35px ${alpha(theme.palette.primary.main, 0.15)}`,
          border: theme.palette.mode === 'dark' ? 'none' : '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <QRCodeSVG value={qrValue} size={200} level="M" />
      </Box>

      {/* CAJA DE DATOS DEL QR */}
      <Box 
        sx={{ 
          width: '100%', 
          p: 2.5, 
          // Fondo cristal moderno
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
          borderRadius: '16px', 
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {/* Título de la caja */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode size={16} color={theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563'} />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 550, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827'
            }}
          >
            {t.datosQr}
          </Typography>
        </Box>
        
        {/* Dirección y Botón Copiar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '1rem', 
              color: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151', 
              letterSpacing: '0.5px' 
            }}
          >
            {formatUri(qrValue)}
          </Typography>
          <Tooltip title={copied ? t.copiado : t.copiar} placement="top">
            <IconButton 
              onClick={handleCopy} 
              sx={{ 
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Copy size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

    </Box>
  );
};