import { MenuItem, TextField, Box } from '@mui/material';
import { useReceiveStore } from '../../store/receiveStore';
import { Coins, Flame, Orbit } from 'lucide-react';

const networks = [
  { name: 'Solana', icon: Orbit },
  { name: 'Bitcoin', icon: Coins },
  { name: 'Ethereum', icon: Flame }
];

export const NetworkSelector = () => {
  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const setNetwork = useReceiveStore((state) => state.setNetwork);

  return (
    <TextField
      select
      variant="outlined"
      label="Red de Destino"
      value={selectedNetwork}
      onChange={(e) => setNetwork(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    >
      {networks.map((net) => {
        const Icon = net.icon;
        return (
          <MenuItem key={net.name} value={net.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon size={18} color="#00e5ff" />
              {net.name}
            </Box>
          </MenuItem>
        );
      })}
    </TextField>
  );
};