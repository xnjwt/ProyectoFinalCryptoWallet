import { Box, Paper, Typography } from '@mui/material';
import { SendForm } from './SendForm';
import { SendSummary } from './SendSummary';
import { useSendStore } from '../../store/sendStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    titulo: "Enviar Fondos",
  },
  en: {
    titulo: "Send Funds",
  }
};

export const EnviarCrypto = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const faseActual = useSendStore((state) => state.faseActual);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        p: { xs: 1, sm: 3 }
      }}
    >
      <Paper 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          boxShadow: 3,
          borderRadius: '16px'
        }}
      >
        <Typography 
          variant="h5" 
          color="primary.main" 
          align="center" 
          fontWeight={800} 
          sx={{ mb: 4 }}
        >
          {t.titulo}
        </Typography>

        {faseActual === 'FORM' ? <SendForm /> : <SendSummary />}
        
      </Paper>
    </Box>
  );
};