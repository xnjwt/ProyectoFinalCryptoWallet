import { MenuItem, TextField, Box } from '@mui/material';
import { useReceiveStore } from '../../store/receiveStore';
import { useConfigStore } from '../../store/configStore';
import { Coins, Flame, Orbit } from 'lucide-react';

const textos = {
  es: {
    labelRed: "Red de Destino",
  },
  en: {
    labelRed: "Destination Network",
  }
};

const networks = [
  { name: 'Solana', icon: Orbit },
  { name: 'Bitcoin', icon: Coins },
  { name: 'Ethereum', icon: Flame }
];

export const NetworkSelector = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const setNetwork = useReceiveStore((state) => state.setNetwork);

  return (
    <TextField
      select
      variant="outlined"
      label={t.labelRed}
      value={selectedNetwork}
      onChange={(e) => setNetwork(e.target.value)}
      fullWidth
      sx={{ mb: 3 }}
      slotProps={{ inputLabel: { shrink: true } }}
    >
      {networks.map((net) => {
        const Icon = net.icon;
        return (
          <MenuItem key={net.name} value={net.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon size={18} />
              {net.name}
            </Box>
          </MenuItem>
        );
      })}
    </TextField>
  );
};