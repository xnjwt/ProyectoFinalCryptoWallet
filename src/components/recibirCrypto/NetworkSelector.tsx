import { MenuItem, Box, Typography, Select, OutlinedInput, useTheme } from '@mui/material';
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
  const theme = useTheme();

  const selectedNetwork = useReceiveStore((state) => state.selectedNetwork);
  const setNetwork = useReceiveStore((state) => state.setNetwork);

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
    <Box sx={{ mb: 3 }}>
      {/* Etiqueta separada */}
      <Typography sx={labelStyle}>{t.labelRed}</Typography>
      
      {/* Selector moderno */}
      <Select
        value={selectedNetwork}
        onChange={(e) => setNetwork(e.target.value)}
        fullWidth
        input={<OutlinedInput sx={modernInputStyle} />}
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
      </Select>
    </Box>
  );
};