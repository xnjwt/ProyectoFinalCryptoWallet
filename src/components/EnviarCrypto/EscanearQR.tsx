import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
    const escaner = new Html5Qrcode("lector-qr-billetera");

    const apagarHardware = () => {
      if (escaner.isScanning) {
        escaner.stop().then(() => {
          escaner.clear();
        }).catch(() => {});
      } else {
        escaner.clear();
      }
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(() => {}); 
      }
    };

    const onScanSuccess = (textoDescifrado: string) => {
      apagarHardware(); 
      alEscanear(textoDescifrado);
    };

    escaner.start(
      { facingMode: "environment" },
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1
      },
      onScanSuccess,
      () => {}
    ).catch(() => {});

    return () => {
      apagarHardware(); 
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
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.3)
        }} 
      />
    </Box>
  );
};