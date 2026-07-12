import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: { instrucciones: "Apunta la cámara al código QR" },
  en: { instrucciones: "Point the camera at the QR code" }
};

interface EscanerQRProps {
  alEscanear: (textoDescifrado: string) => void;
}

export const EscanerQR = ({ alEscanear }: EscanerQRProps) => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const alEscanearRef = useRef(alEscanear);

  useEffect(() => {
    alEscanearRef.current = alEscanear;
  }, [alEscanear]);

  useEffect(() => {
    const escaner = new Html5Qrcode("lector-qr-billetera");
    let desmontado = false; // La bandera vital contra la cámara zombie

    escaner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
      (textoDescifrado) => {
        if (desmontado) return;
        
        // Si el usuario escanea, apagamos y disparamos la acción
        escaner.stop().then(() => escaner.clear()).catch(() => {});
        alEscanearRef.current(textoDescifrado);
      },
      () => {} 
    ).then(() => {
      // LA MAGIA AQUÍ: Si la cámara termina de encenderse, pero nos damos cuenta 
      // de que el usuario cerró el modal mientras esperaba, la asesinamos al instante.
      if (desmontado) {
        escaner.stop().catch(() => {});
      }
    }).catch(() => {});

    // Esta función se ejecuta cuando le das a Cancelar o sales de la vista
    return () => {
      desmontado = true; // Le avisamos a la promesa que el componente murió
      
      // Si la cámara ya estaba totalmente encendida y trabajando, la apagamos normal
      if (escaner.isScanning) {
        escaner.stop().then(() => escaner.clear()).catch(() => {});
      }
    };
  }, []);

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
          '& video': {
            width: '100% !important',
            borderRadius: '14px' 
          }
        }} 
      />
    </Box>
  );
};