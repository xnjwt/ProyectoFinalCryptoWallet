import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  createFilterOptions
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import * as bip39 from "bip39";
import { Lock } from 'lucide-react';

import { useWalletStore } from "../../store/walletStore";
import { useConfigStore } from "../../store/configStore";

const filtroBip39 = createFilterOptions<string>({
  matchFrom: 'start',
  limit: 5,
});

const textos = {
  es: {
    tituloImportar: "Importar Wallet",
    descImportar: "Ingresa tu frase semilla de 12 palabras.",
    labelPalabra: "Palabra",
    errorPalabra: "Palabra no válida",
    contadorPalabras: "palabras válidas",
    errorInvalida: "La frase semilla no es válida según el estándar BIP39 o el orden es incorrecto.",
    volver: "VOLVER AL MENÚ",
    importar: "IMPORTAR WALLET",
    tituloModal: "Seguridad Alternativa",
    descripcionModal: "Tu dispositivo no soporta biometría o la acción fue cancelada. Crea una contraseña segura para encriptar tu billetera importada.",
    labelClave: "Contraseña de Encriptación",
    cancelar: "Cancelar",
    proteger: "Proteger Billetera"
  },
  en: {
    tituloImportar: "Import wallet",
    descImportar: "Enter your 12-word seed phrase.",
    labelPalabra: "Word",
    errorPalabra: "Invalid word",
    contadorPalabras: "valid words",
    errorInvalida: "The seed phrase is not valid according to the BIP39 standard or the order is incorrect.",
    volver: "BACK TO MENU",
    importar: "IMPORT WALLET",
    tituloModal: "Alternative Security",
    descripcionModal: "Your device does not support biometrics or the action was canceled. Create a secure password to encrypt your imported wallet.",
    labelClave: "Encryption Password",
    cancelar: "Cancel",
    proteger: "Protect Wallet"
  },
};

export const ImportarSemilla = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const theme = useTheme();

  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const importarWalletDesdeFrase = useWalletStore((state) => state.importarWalletDesdeFrase);
  const isImporting = useWalletStore((state) => state.isImporting);

  const bip39Words = bip39.wordlists.english;

  // Estados locales
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(""));
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  
  // Estados Plan B (Modal)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [claveManual, setClaveManual] = useState("");

  const handleWordChange = (index: number, value: string) => {
    setErrorValidacion(null);
    const updated = [...seedWords];
    updated[index] = value.toLowerCase().trim();
    setSeedWords(updated);
  };

  const isValidWord = (word: string) => {
    if (word === "") return true;
    return bip39Words.includes(word.toLowerCase());
  };

  // Filtrado estricto: cuenta únicamente las palabras válidas que existen en el diccionario oficial BIP39
  const palabrasValidasContadas = seedWords.filter((w) => w !== "" && bip39Words.includes(w.toLowerCase())).length;
  const fraseCompletaString = seedWords.join(" ");

  const ejecutarImportacion = async (password?: string) => {
    setErrorValidacion(null);
    try {

      await importarWalletDesdeFrase(
        fraseCompletaString, 
        () => {
          setModalAbierto(false);
          cambiarVista('DASHBOARD');
        }, 
        password
      );
    } catch (error: any) {
      if (error.message === 'FALLO_BIOMETRIA') {
        setModalAbierto(true);
      } else if (error.message === 'BIP39_INVALIDO') {
        setErrorValidacion(t.errorInvalida);
      } else {
        setErrorValidacion(error.message);
      }
    }
  };

  // --- ESTILOS MODERNOS REUTILIZABLES ---
  const modernTextFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
      transition: 'all 0.3s ease',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: `2px solid ${theme.palette.primary.main}`,
      },
      // Aplica borde rojo sutil si hay error en la palabra
      '&.Mui-error fieldset': {
        border: `1px solid ${theme.palette.error.main}`,
      }
    },
    // Estilo para el helper text (el mensaje de error que reservará espacio)
    '& .MuiFormHelperText-root': {
      mx: 1,
      mt: 0.5,
      fontWeight: 600,
      fontSize: '0.75rem',
    }
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
    mb: 0.5,
    ml: 1,
    display: 'block'
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: "700px",
          width: "100%",
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          borderRadius: "40px",
          bgcolor: 'background.paper',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          fontWeight={800} 
          sx={{ 
            mb: 1,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}
        >
          {t.tituloImportar}
        </Typography>

       <Typography 
          variant="body1" 
          align="center"
          sx={{ mb: 4, color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', maxWidth: "450px", mx: "auto" }}
        >
          {t.descImportar}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          {seedWords.map((word, index) => (
            <Box key={index}>
              <Typography sx={labelStyle}>{index + 1}. {t.labelPalabra}</Typography>
              <Autocomplete
                autoHighlight
                forcePopupIcon={false}
                filterOptions={filtroBip39}
                options={
                  word.length === 0
                    ? []
                    : bip39Words.filter((w) => w.startsWith(word.toLowerCase())).slice(0, 5)
                }
                inputValue={word}
                onInputChange={(_, newValue) => handleWordChange(index, newValue)}
                onChange={(_, newValue) => handleWordChange(index, newValue || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!isValidWord(word)}
                    helperText={!isValidWord(word) ? t.errorPalabra : " "}
                    sx={modernTextFieldStyle}
                    // Eliminamos el 'label' nativo para que use nuestro Typography superior
                  />
                )}
              />
            </Box>
          ))}
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textAlign: "right",
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: palabrasValidasContadas === 12 ? "#22c55e" : theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
          }}
        >
          {palabrasValidasContadas} / 12 {t.contadorPalabras}
        </Typography>

        {errorValidacion && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              width: "100%",
              mt: 3,
              mb: 1,
              borderRadius: "16px",
              fontWeight: 600,
              color: "error.main",
              borderColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.4)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(244, 67, 54, 0.05)',
              "& .MuiAlert-icon": { color: "error.main" },
            }}
          >
            {errorValidacion}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => cambiarVista('MENU_BILLETERA')}
            sx={{
              py: 2,
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.05em",
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              "&:hover": {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
              },
            }}
          >
            {t.volver}
          </Button>

          <Button
            variant="contained"
            fullWidth
            disabled={palabrasValidasContadas !== 12 || isImporting}
            onClick={() => ejecutarImportacion()}
            sx={{
              py: 2,
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.05em",
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: theme.palette.mode === 'dark' && palabrasValidasContadas === 12
                ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: theme.palette.mode === 'dark' && palabrasValidasContadas === 12
                  ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.5)}`
                  : 'none',
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
              }
            }}
          >
            {isImporting ? <CircularProgress size={24} color="inherit" /> : t.importar}
          </Button>
        </Box>
      </Paper>

      {/* Modal de Respaldo Criptográfico (Plan B) */}
      <Dialog
        open={modalAbierto}
        onClose={(e, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setModalAbierto(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: '32px',
            bgcolor: theme.palette.mode === 'dark' ? '#1b1e2b' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
            maxWidth: '420px',
            width: '100%',
            m: 2
          }
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <Box sx={{ textAlign: 'center' }}>
            {/* Ícono de seguridad estilo insignia */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box 
                sx={{
                  width: 64, height: 64, borderRadius: '20px',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'primary.main'
                }}
              >
                <Lock size={32} />
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827', mb: 1 }}>
              {t.tituloModal}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', lineHeight: 1.5 }}>
              {t.descripcionModal}
            </Typography>
          </Box>

          <Box>
            <Typography sx={labelStyle}>{t.labelClave}</Typography>
            <TextField
              type="password"
              fullWidth
              value={claveManual}
              onChange={(e) => setClaveManual(e.target.value)}
              sx={modernTextFieldStyle}
              // Nos deshacemos del 'label' nativo
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button 
              fullWidth
              onClick={() => setModalAbierto(false)}
              sx={{
                py: 1.5, borderRadius: '16px', fontWeight: 700,
                color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
                }
              }}
            >
              {t.cancelar}
            </Button>
            <Button
              variant="contained"
              fullWidth
              disabled={claveManual.length < 4 || isImporting}
              onClick={() => ejecutarImportacion(claveManual)}
              sx={{
                py: 1.5, borderRadius: '16px', fontWeight: 700, letterSpacing: '0.05em',
                bgcolor: 'primary.main', color: 'primary.contrastText',
                boxShadow: theme.palette.mode === 'dark' && claveManual.length >= 4
                  ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: theme.palette.mode === 'dark' && claveManual.length >= 4
                    ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                }
              }}
            >
              {isImporting ? <CircularProgress size={24} color="inherit" /> : t.proteger}
            </Button>
          </Box>

        </Box>
      </Dialog>
    </Box>
  );
};