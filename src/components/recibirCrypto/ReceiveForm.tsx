import { FormEvent } from 'react';
import { Box, Switch, Typography, MenuItem, Alert, OutlinedInput, Select, useTheme } from '@mui/material';
import { useReceiveStore } from '../../store/receiveStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    tituloQrInteligente: "QR Inteligente",
    descQrActivo: "Si hay algún error en la app externa, prueba desactivando este modo.",
    descQrInactivo: "Permite transferencias crudas sin montos fijos.",
    advertenciaRed: "Asegúrate de enviar los fondos mediante la red",
    labelMonto: "Monto (Opcional)",
    labelToken: "Token",
  },
  en: {
    tituloQrInteligente: "Smart QR",
    descQrActivo: "If there is any error in the external app, try disabling this mode.",
    descQrInactivo: "Allows raw transfers without fixed amounts.",
    advertenciaRed: "Make sure to send the funds through the network",
    labelMonto: "Amount (Optional)",
    labelToken: "Token",
  }
};

const tokensByNetwork: Record<string, string[]> = {
  Solana: ['USDC', 'SOL', 'USDT'],
  Bitcoin: ['BTC'],
  Ethereum: ['USDT', 'ETH', 'USDC']
};

export const ReceiveForm = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const theme = useTheme();

  const smartQrActive = useReceiveStore((state) => state.smartQrActive);
  const receiveAmount = useReceiveStore((state) => state.receiveAmount);
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const selectedToken = useReceiveStore((state) => state.selectedToken);
  
  const setSmartQrActive = useReceiveStore((state) => state.setSmartQrActive);
  const setReceiveAmount = useReceiveStore((state) => state.setReceiveAmount);
  const setToken = useReceiveStore((state) => state.setToken);

  const modernInputStyle = {
    borderRadius: '16px',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
    transition: 'all 0.3s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    '& .MuiSelect-icon': {
      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
    },
    // Oculta las flechas de los inputs numéricos (Spinner)
    '& input[type=number]': {
      MozAppearance: 'textfield', 
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none', 
      margin: 0,
    }
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
    mb: 1,
    ml: 2,
    display: 'block'
  };

 return (
    <Box sx={{ mb: 2 }}>
      
      {/* Switch QR Inteligente */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Typography fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
            {t.tituloQrInteligente}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4, color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {smartQrActive ? t.descQrActivo : t.descQrInactivo}
          </Typography>
        </Box>
        <Switch
          checked={smartQrActive}
          onChange={(e) => setSmartQrActive(e.target.checked)}
          color="primary"
        />
      </Box>

      {/* Alerta de Red (Modernizada) */}
      {!smartQrActive && (
        <Alert 
          severity="warning" 
          variant="outlined" 
          sx={{ 
            mb: 3, 
            py: 1.5, 
            borderRadius: '16px', // Mismo borde que los inputs
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.06)' : 'rgba(237, 108, 2, 0.06)', // Fondo sutil naranja
            color: 'warning.main',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.3)' : 'rgba(237, 108, 2, 0.4)',
            alignItems: 'center',
            '& .MuiAlert-icon': { color: 'warning.main' }
          }}
        >
          {t.advertenciaRed} <strong>{selectedNetwork}</strong>.
        </Alert>
      )}

      {/* Formulario (Aparece si el QR es inteligente) */}
      {smartQrActive && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          
          {/* Monto */}
          <Box sx={{ flex: 7 }}>
            <Typography sx={labelStyle}>{t.labelMonto}</Typography>
            <OutlinedInput
              fullWidth
              type="number"
              value={receiveAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (val < 0) return;
                setReceiveAmount(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              placeholder="0.00"
              inputProps={{ min: 0, step: "any" }}
              sx={modernInputStyle}
            />
          </Box>

          {/* Token */}
          <Box sx={{ flex: 5 }}>
            <Typography sx={labelStyle}>{t.labelToken}</Typography>
            <Select
              fullWidth
              value={selectedToken}
              onChange={(e) => setToken(e.target.value)}
              input={<OutlinedInput sx={modernInputStyle} />}
            >
              {tokensByNetwork[selectedNetwork]?.map((tk) => (
                <MenuItem key={tk} value={tk}>
                  {tk}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      )}
    </Box>
  );
};