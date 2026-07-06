import { FormEvent } from 'react';
import { Box, Switch, Typography, TextField, MenuItem, Alert } from '@mui/material';
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

  const smartQrActive = useReceiveStore((state) => state.smartQrActive);
  const receiveAmount = useReceiveStore((state) => state.receiveAmount);
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const selectedToken = useReceiveStore((state) => state.selectedToken);
  
  const setSmartQrActive = useReceiveStore((state) => state.setSmartQrActive);
  const setReceiveAmount = useReceiveStore((state) => state.setReceiveAmount);
  const setToken = useReceiveStore((state) => state.setToken);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Typography fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
            {t.tituloQrInteligente}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            {smartQrActive ? t.descQrActivo : t.descQrInactivo}
          </Typography>
        </Box>
        <Switch
          checked={smartQrActive}
          onChange={(e) => setSmartQrActive(e.target.checked)}
          color="primary"
        />
      </Box>

      {!smartQrActive && (
        <Alert 
          severity="warning" 
          variant="outlined" 
          sx={{ 
            mb: 3, 
            py: 1, 
            borderRadius: '12px',
            color: 'warning.main',
            borderColor: 'warning.main',
            '& .MuiAlert-icon': { color: 'warning.main' }
          }}
        >
          {t.advertenciaRed} {selectedNetwork}.
        </Alert>
      )}

      {smartQrActive && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <TextField
            variant="outlined"
            label={t.labelMonto}
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
            sx={{ 
              flex: 2,
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none', 
                margin: 0,
              }
            }}
            slotProps={{ 
              htmlInput: { min: 0, step: "any" },
              inputLabel: { shrink: true } 
            }}
          />
          <TextField
            select
            variant="outlined"
            label={t.labelToken}
            value={selectedToken}
            onChange={(e) => setToken(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {tokensByNetwork[selectedNetwork]?.map((tk) => (
              <MenuItem key={tk} value={tk}>
                {tk}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    </Box>
  );
};