import { Box, Switch, Typography, TextField, MenuItem, Alert } from '@mui/material';
import { useReceiveStore } from '../../store/receiveStore';

const tokensByNetwork: Record<string, string[]> = {
  Solana: ['USDC', 'SOL', 'USDT'],
  Bitcoin: ['BTC'],
  Ethereum: ['USDT', 'ETH', 'USDC']
};

export const ReceiveForm = () => {
  const smartQrActive = useReceiveStore((state) => state.smartQrActive);
  const receiveAmount = useReceiveStore((state) => state.receiveAmount);
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const selectedToken = useReceiveStore((state) => state.selectedToken);
  
  const setSmartQrActive = useReceiveStore((state) => state.setSmartQrActive);
  const setReceiveAmount = useReceiveStore((state) => state.setReceiveAmount);
  const setToken = useReceiveStore((state) => state.setToken);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 2 }}>
        <Box>
          <Typography fontWeight="bold" sx={{ color: '#00e5ff', mb: 0.5 }}>
            QR Inteligente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
            {smartQrActive
              ? "Si hay algún error en la app externa, prueba desactivando este modo."
              : "Permite transferencias crudas sin montos fijos."}
          </Typography>
        </Box>
        <Switch
          checked={smartQrActive}
          onChange={(e) => setSmartQrActive(e.target.checked)}
          color="primary"
        />
      </Box>

      {!smartQrActive && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2, py: 0.5, color: '#ffb74d', borderColor: '#ffb74d' }}>
          Asegúrate de enviar los fondos mediante la red {selectedNetwork}.
        </Alert>
      )}

      {smartQrActive && (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <TextField
            variant="outlined"
            label="Monto (Opcional)"
            type="number"
            value={receiveAmount}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val < 0) return; // Validación extra
              setReceiveAmount(e.target.value);
            }}
            onKeyDown={(e) => {
              // Bloquea signos negativos, exponenciales y sumas
              if (e.key === '-' || e.key === 'e' || e.key === '+') {
                e.preventDefault();
              }
            }}
            placeholder="0.00"
            sx={{ 
              flex: 2,
              '& input[type=number]': {
                MozAppearance: 'textfield', // Oculta spinners en Firefox
              },
              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none', // Oculta spinners en Chrome/Safari/Edge
                margin: 0,
              }
            }}
            slotProps={{ htmlInput: { min: 0, step: "any" } }}
          />
          <TextField
            select
            variant="outlined"
            label="Token"
            value={selectedToken}
            onChange={(e) => setToken(e.target.value)}
            sx={{ flex: 1 }}
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