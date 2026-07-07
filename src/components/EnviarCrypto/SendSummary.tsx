import { Box, Typography, Button, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowLeft, ChevronDown, QrCode } from 'lucide-react';
import { useSendStore } from '../../store/sendStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    resumen: "Resumen de la transacción",
    de: "De:",
    para: "Para:",
    red: "Red:",
    monto: "Monto a enviar:",
    comisionTotal: "Comisión Total",
    comisionRed: "Comisión de la red:",
    comisionApp: "Comisión de la app:",
    total: "Total a debitar:",
    btnConfirmar: "Confirmar y validar",
  },
  en: {
    resumen: "Transaction Summary",
    de: "From:",
    para: "To:",
    red: "Network:",
    monto: "Amount to send:",
    comisionTotal: "Total Fee",
    comisionRed: "Network fee:",
    comisionApp: "App fee:",
    total: "Total to deduct:",
    btnConfirmar: "Confirm and validate",
  }
};

export const SendSummary = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const { redSeleccionada, monto, tokenSeleccionado, direccionDestino, setFaseActual } = useSendStore();

  const comisionRed = 0.00005;
  const comisionApp = 0.50;
  
  const totalConComisionApp = parseFloat(monto) + comisionApp;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={() => setFaseActual('FORM')}
          sx={{ color: 'text.secondary', p: 0.5 }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {t.resumen}
        </Typography>
      </Box>

      <Box sx={{ 
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.5), 
        p: 2.5, 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary" variant="body2">{t.red}</Typography>
          <Typography fontWeight={600} color="primary.main">{redSeleccionada}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary" variant="body2">{t.de}</Typography>
          <Typography fontWeight={600} fontFamily="monospace">Mi Billetera Principal</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary" variant="body2">{t.para}</Typography>
          <Typography fontWeight={600} fontFamily="monospace" sx={{ maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}>
            {direccionDestino}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary" variant="body2">{t.monto}</Typography>
          <Typography fontWeight={700}>
            {monto} {tokenSeleccionado}
          </Typography>
        </Box>
      </Box>

      <Accordion 
        elevation={0}
        sx={{
          bgcolor: 'transparent',
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px !important',
        }}
      >
        <AccordionSummary expandIcon={<ChevronDown size={18} color="inherit" />}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
            <Typography fontWeight={600} color="text.primary">{t.comisionTotal}</Typography>
            <Typography fontWeight={600} color="error.main">
              ~ {comisionApp} {tokenSeleccionado}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">{t.comisionRed}</Typography>
            <Typography variant="body2" fontFamily="monospace">{comisionRed} {redSeleccionada === 'Solana' ? 'SOL' : 'NATIVO'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">{t.comisionApp}</Typography>
            <Typography variant="body2" fontFamily="monospace">{comisionApp} {tokenSeleccionado}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">{t.total}</Typography>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          {totalConComisionApp.toFixed(4)} {tokenSeleccionado}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        endIcon={<QrCode size={18} />}
        sx={{
          mt: 2,
          py: 1.8,
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`
              : 'none',
        }}
      >
        {t.btnConfirmar}
      </Button>
    </Box>
  );
};