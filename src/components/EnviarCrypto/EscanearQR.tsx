import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography } from '@mui/material';
import { useConfigStore } from '../../store/configStore';
import { alpha } from '@mui/material/styles';

const textos = {
  es: {
    instrucciones: "Apunta la cámara al código QR",
  },
  en: {
    instrucciones: "Point the camera at the QR code",
  }
};

interface EscanerQRProps {
  alEscanear: (textoDescifrado: string) => void;
}

export const EscanerQR = ({ alEscanear }: EscanerQRProps) => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  useEffect(() => {
    const escaner = new Html5QrcodeScanner(
      "lector-qr-billetera",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true
      },
      false
    );

    escaner.render(
      (textoDescifrado) => {
        escaner.clear();
        alEscanear(textoDescifrado);
      },
      (error) => {
        console.warn(error);
      }
    );

    return () => {
      escaner.clear().catch(() => {});
    };
  }, [alEscanear]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {t.instrucciones}
      </Typography>
      <Box 
        id="lector-qr-billetera" 
        sx={{ 
          width: '100%', 
          maxWidth: '350px',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '2px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
          '& button': {
            backgroundColor: 'primary.main',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '10px'
          },
          '& select': {
            padding: '8px',
            borderRadius: '8px',
            marginBottom: '10px',
            width: '100%'
          },
          '& a': {
            display: 'none'
          }
        }} 
      />
    </Box>
  );
};