import { useState } from 'react';
import { Box, TextField, MenuItem, Button, InputAdornment, IconButton, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { ScanLine, Send } from 'lucide-react';
import { useSendStore } from '../../store/sendStore';
import { useConfigStore } from '../../store/configStore';
import { alpha } from '@mui/material/styles';
import { EscanerQR } from './EscanearQR';
import { parseCryptoUri } from '../../services/cryptoService';

const textos = {
  es: {
    labelRed: "Red",
    labelMonto: "Monto",
    labelToken: "Moneda",
    labelDestino: "Dirección de destino",
    btnEnviar: "Continuar",
    tituloEscaneo: "Escanear Dirección",
    btnCerrar: "Cancelar"
  },
  en: {
    labelRed: "Network",
    labelMonto: "Amount",
    labelToken: "Currency",
    labelDestino: "Destination address",
    btnEnviar: "Continue",
    tituloEscaneo: "Scan Address",
    btnCerrar: "Cancel"
  }
};

const redesDisponibles = ['Solana', 'Bitcoin', 'Ethereum'];
const tokensPorRed: Record<string, string[]> = {
  Solana: ['USDC', 'SOL', 'USDT'],
  Bitcoin: ['BTC'],
  Ethereum: ['USDT', 'ETH', 'USDC']
};

export const SendForm = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const [escanerAbierto, setEscanerAbierto] = useState(false);

  const {
    redSeleccionada,
    monto,
    tokenSeleccionado,
    direccionDestino,
    setRed,
    setMonto,
    setToken,
    setDireccionDestino,
    setFaseActual,
    cargarDatosDesdeQR
  } = useSendStore();

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (monto && direccionDestino) {
      setFaseActual('SUMMARY');
    }
  };

  const procesarDatosEscaneados = (datosCrudos: string) => {
    setEscanerAbierto(false);

    const { direccion, monto: montoExtraido, token, red } = parseCryptoUri(
      datosCrudos,
      redesDisponibles
    );

    cargarDatosDesdeQR(direccion, montoExtraido, token, red);
  };

  return (
    <>
      <Box component="form" onSubmit={manejarEnvio} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          select
          label={t.labelRed}
          value={redSeleccionada}
          onChange={(e) => {
            setRed(e.target.value);
            setToken(tokensPorRed[e.target.value][0]);
          }}
          fullWidth
          variant="outlined"
        >
          {redesDisponibles.map((red) => (
            <MenuItem key={red} value={red}>{red}</MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label={t.labelMonto}
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            fullWidth
            inputProps={{ min: 0, step: "any" }}
            sx={{ flex: 2 }}
          />
          <TextField
            select
            label={t.labelToken}
            value={tokenSeleccionado}
            onChange={(e) => setToken(e.target.value)}
            sx={{ flex: 1 }}
          >
            {tokensPorRed[redSeleccionada]?.map((tk) => (
              <MenuItem key={tk} value={tk}>{tk}</MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          variant="outlined"
          label={t.labelDestino}
          value={direccionDestino}
          onChange={(e) => setDireccionDestino(e.target.value)}
          required
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setEscanerAbierto(true)} color="primary">
                    <ScanLine size={20} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={<Send size={18} />}
          disabled={!monto || !direccionDestino}
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
          {t.btnEnviar}
        </Button>
      </Box>

      <Dialog 
        open={escanerAbierto} 
        onClose={() => setEscanerAbierto(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: 'primary.main' }}>
          {t.tituloEscaneo}
        </DialogTitle>
        <DialogContent>
          <EscanerQR alEscanear={procesarDatosEscaneados} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
          <Button 
            onClick={() => setEscanerAbierto(false)}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {t.btnCerrar}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};