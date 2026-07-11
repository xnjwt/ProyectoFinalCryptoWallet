import { useState } from 'react';
import { Box, MenuItem, Button, InputAdornment, IconButton, Dialog, DialogContent, DialogTitle, DialogActions,  Typography, Select, OutlinedInput, useTheme, Alert, CircularProgress } from '@mui/material';
import { QrCode, Send } from 'lucide-react';
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
  const theme = useTheme(); 

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
    cargarDatosDesdeQR,
    isProcessing,   
    errorEnvio,         
    prepararTransaccion
  } = useSendStore();

  const [modalExito, setModalExito] = useState(false);
  const [hashFinal, setHashFinal] = useState("");

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monto && direccionDestino) {
       await prepararTransaccion();
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

  // --- ESTILOS MODERNOS ---
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
      border: `2px solid ${theme.palette.primary.main}`, // <-- Usando tu primary.main
    },
    '& .MuiSelect-icon': {
      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
    },
    '& input[type=number]': {
      MozAppearance: 'textfield', // Solución para Firefox
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none', // Solución para Chrome, Safari, Edge y Opera
      margin: 0,
    },
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
<>
      <Box component="form" onSubmit={manejarEnvio} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* ELIMINADO: Quitamos el <TextField select> y lo separamos en <Typography> y <Select> */}
        <Box>
          <Typography sx={labelStyle}>{t.labelRed}</Typography>
          <Select
            fullWidth
            value={redSeleccionada}
            onChange={(e) => {
              setRed(e.target.value);
              setToken(tokensPorRed[e.target.value][0]);
            }}
            // Le inyectamos nuestro estilo sin bordes
            input={<OutlinedInput sx={modernInputStyle} />}
          >
            {redesDisponibles.map((red) => (
              <MenuItem key={red} value={red}>{red}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 7 }}>
            <Typography sx={labelStyle}>{t.labelMonto}</Typography>
            <OutlinedInput
              fullWidth
              type="number"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              inputProps={{ min: 0, step: "any" }}
              sx={modernInputStyle}
              endAdornment={
                <InputAdornment position="end">
                  <Typography 
                    sx={{ 
                      fontWeight: 600, 
                      // Le damos un tono más opaco y sutil dependiendo de tu tema
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                      userSelect: 'none' // Evita que el usuario seleccione este texto por accidente
                    }}
                  >
                    {tokenSeleccionado}
                  </Typography>
                </InputAdornment>
              }
            />
          </Box>
          <Box sx={{ flex: 5 }}>
            <Typography sx={labelStyle}>{t.labelToken}</Typography>
            <Select
              fullWidth
              value={tokenSeleccionado}
              onChange={(e) => setToken(e.target.value)}
              input={<OutlinedInput sx={modernInputStyle} />}
            >
              {tokensPorRed[redSeleccionada]?.map((tk) => (
                <MenuItem key={tk} value={tk}>{tk}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* MODIFICADO: Dirección de destino */}
        <Box>
          <Typography sx={labelStyle}>{t.labelDestino}</Typography>
          <OutlinedInput
            fullWidth
            placeholder="Introduce la dirección"
            value={direccionDestino}
            onChange={(e) => setDireccionDestino(e.target.value)}
            required
            sx={modernInputStyle}
            // Mantenemos tu Adornment del QR
            endAdornment={
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setEscanerAbierto(true)} 
                  sx={{ color: theme.palette.primary.main, '&:hover': { opacity: 0.8 } }}
                >
                  <QrCode size={20} />
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>

        {errorEnvio && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: '12px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
              color: theme.palette.mode === 'dark' ? '#ffb4ab' : 'error.main'
            }}
          >
            {errorEnvio}
          </Alert>
        )}
        
        <Box sx={{ mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth

            endIcon={!isProcessing && <Send size={18} style={{ }} />}
            // Bloqueamos el botón para evitar doble clic mientras carga
            disabled={!monto || !direccionDestino || isProcessing}
            sx={{
              py: 2,
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              // Agregamos el halo (glow) de luz de color primary.main debajo del botón
              boxShadow: theme.palette.mode === 'dark'
                ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
              '& .MuiButton-endIcon': {
                transition: 'transform 0.3s ease-in-out',
              },  
                
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.5)}`
                  : 'none',
              },

              '&:hover .MuiButton-endIcon': {
                transform: 'translate(4px, -4px)',
              },
              
              '&.Mui-disabled': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
              }
            }}
          >
            {isProcessing ? <CircularProgress size={24} color="inherit" /> : t.btnEnviar}
          </Button>
        </Box>
      </Box>

      <Dialog 
        open={escanerAbierto} 
        onClose={() => setEscanerAbierto(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '32px',
            bgcolor: theme.palette.mode === 'dark' ? '#1b1e2b' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
            m: 2,
          }
        }}
      >
{/* Unificamos todo en un Box con padding generoso para los márgenes internos */}
        <Box sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827', letterSpacing: '-0.02em', mb: 1 }}>
              {t.tituloEscaneo}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Apunta la cámara al código QR
            </Typography>
          </Box>

          {/* Envolvemos tu componente EscanerQR en un "marco" moderno para disimular sus bordes crudos */}
{/* Envolvemos tu componente EscanerQR en un "marco" moderno */}
          <Box sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            p: 2, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center', // Centra cualquier texto rebelde
            minHeight: '250px',
            width: '100%', // Aseguramos que la caja ocupe todo el ancho disponible
            
            // --- NUEVO: Forzamos al componente interno a centrar su contenido ---
            '& > *': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            },
            // Si el escáner genera una etiqueta de video o imagen, la centramos también
            '& video, & img, & svg': {
              margin: '0 auto',
              display: 'block'
            }
          }}>
            <EscanerQR alEscanear={procesarDatosEscaneados} />
          </Box>
          {/* Botón de Cancelar estilo "Glassmorphism" sutil */}
          <Button 
            onClick={() => setEscanerAbierto(false)}
            fullWidth
            sx={{
              mt: 1,
              py: 2,
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
              }
            }}
          >
            {t.btnCerrar}
          </Button>
          
        </Box>
      </Dialog>
    </>
  );
};