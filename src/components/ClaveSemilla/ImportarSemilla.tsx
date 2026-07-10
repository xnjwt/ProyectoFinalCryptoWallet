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
  createFilterOptions
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import * as bip39 from "bip39";

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: "650px",
          width: "100%",
          textAlign: "center",
          boxShadow: 3,
          borderRadius: "16px"
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          color="primary.main" 
          sx={{ fontWeight: 700, mb: 1 }}
        >
          {t.tituloImportar}
        </Typography>

        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: "450px", mx: "auto" }}
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
            <Autocomplete
              key={index}
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
                    label={`${t.labelPalabra} ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    error={!isValidWord(word)}
                    helperText={!isValidWord(word) ? t.errorPalabra : " "}
                    // 2. NUEVO: Modifica el estilo interno para redondear el borde del TextField
                    sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px", 
                    },
                    }}
                    
                />
              )}
            />
          ))}
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textAlign: "right",
            fontWeight: 600,
            color: palabrasValidasContadas === 12 ? "success.main" : "text.secondary",
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
              borderRadius: "12px",
              fontWeight: 600,
              boxSizing: "border-box",
              color: "error.main",
              borderColor: "error.main",
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
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
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
              color: "secondary.main",
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.5),
              "&:hover": {
                borderColor: "secondary.main",
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.05),
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
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
              boxShadow: (theme) =>
                theme.palette.mode === "dark" && palabrasValidasContadas === 12
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`
                  : "none",
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
      >
        <DialogTitle>{t.tituloModal}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t.descripcionModal}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t.labelClave}
            type="password"
            fullWidth
            variant="outlined"
            value={claveManual}
            onChange={(e) => setClaveManual(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAbierto(false)} color="secondary">
            {t.cancelar}
          </Button>
          <Button
            variant="contained"
            disabled={claveManual.length < 4 || isImporting}
            onClick={() => ejecutarImportacion(claveManual)}
          >
            {isImporting ? <CircularProgress size={24} color="inherit" /> : t.proteger}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};