import { useState } from 'react'; 
import { Box, Typography, Button, Paper, Alert, CircularProgress, DialogContentText, TextField, DialogContent, DialogTitle, DialogActions, Dialog } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useWalletStore } from '../../store/walletStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    tituloVerificar: "Verifica tu Semilla",
    exito: "¡Orden correcto! Preparando tu billetera...",
    error: "El orden es incorrecto. Inténtalo de nuevo.",
    volver: "VOLVER A ANOTAR",
    validar: "VALIDAR",
    tituloModal: "Seguridad Alternativa",
    descripcionModal: "Tu dispositivo no soporta biometría o la acción fue cancelada. Crea una contraseña segura para encriptar tu billetera.",
    labelClave: "Contraseña de Encriptación",
    cancelar: "Cancelar",
    proteger: "Proteger Billetera"
  },
  en: {
    tituloVerificar: "Verify your Seed",
    exito: "Correct order! Preparing your wallet...",
    error: "Incorrect order. Try again.",
    volver: "BACK TO WRITE",
    validar: "VALIDATE",
    tituloModal: "Alternative Security",
    descripcionModal: "Your device does not support biometrics or the action was canceled. Create a secure password to encrypt your wallet.",
    labelClave: "Encryption Password",
    cancelar: "Cancel",
    proteger: "Protect Wallet"
  },
};

export const VerificarFrase = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const availableWords = useWalletStore((state) => state.availableWords);
  const selectedWords = useWalletStore((state) => state.selectedWords);
  const validationResult = useWalletStore((state) => state.validationResult);

  const selectWord = useWalletStore((state) => state.selectWord);
  const deselectWord = useWalletStore((state) => state.deselectWord);

  const verifySeed = useWalletStore((state) => state.verifySeed);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const isVerifying = useWalletStore((state) => state.isVerifying);

  const [errorBiometrico, setErrorBiometrico] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [claveManual, setClaveManual] = useState("");

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: '640px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h2" color="primary.main" 
        sx={{
          fontWeight: 700,
          mb: 3
        }}
        >
          {t.tituloVerificar}
        </Typography>

        <Box
        sx={{
            minHeight: '120px',
            p: 2,
            border: '2px dashed',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
            borderRadius: '12px',
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            contentStart: 'start',
            alignItems: 'flex-start',
            gap: 1,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
        }}
        >
        {selectedWords.map((palabra, indice) => (
            <Button
            key={`selected-${palabra}-${indice}`}
            variant="contained"
            onClick={() => deselectWord(palabra)}
            sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2,
                py: 0.8,
            }}
            >
            {palabra}
            </Button>
        ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            mb: 4,
          }}
        >
          {availableWords.map((palabra, indice) => (
            <Button
              key={`available-${palabra}-${indice}`}
              variant="outlined"
              onClick={() => selectWord(palabra)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {palabra}
            </Button>
          ))}
        </Box>

        {(validationResult !== null || errorBiometrico !== null) && (
          <Alert
            severity={errorBiometrico ? 'error' : (validationResult ? 'success' : 'error')}
            variant="outlined"
            sx={{
              width: '100%',
              mt: 3,
              mb: 3,
              borderRadius: '12px',
              fontWeight: 600,
              boxSizing: 'border-box',
              color: (theme) => (errorBiometrico || !validationResult ? 'error.main' : 'success.main'),
              borderColor: (theme) => (errorBiometrico || !validationResult ? 'error.main' : 'success.main'),
              backgroundColor: (theme) =>
                alpha(errorBiometrico || !validationResult ? theme.palette.error.main : theme.palette.success.main, 0.05),
              '& .MuiAlert-icon': {
                color: (theme) => (errorBiometrico || !validationResult ? 'error.main' : 'success.main'),
              },
            }}
          >
            {errorBiometrico ? errorBiometrico : (validationResult ? t.exito : t.error)}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => cambiarVista('GENERAR_SEMILLA')}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.5px',
              color: 'secondary.main',
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.5),
              '&:hover': {
                borderColor: 'secondary.main',
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.05),
              },
            }}
          >
            {t.volver}
          </Button>

          <Button
            variant="contained"
            fullWidth
            disabled={selectedWords.length !== 12 || validationResult === true}
            onClick={
              async () => {
                setErrorBiometrico(null); 
                try {
                    // Primer intento: sin contraseña, forzando la biometría
                    await verifySeed(() => {
                        cambiarVista('DASHBOARD');
                    });
                } catch (error: any) {
                    // Si falla por biometría, levantamos el plan B
                    if (error.message === 'FALLO_BIOMETRIA') {
                        setModalAbierto(true);
                    } else {
                        // Cualquier otro error grave lo mostramos en la alerta
                        setErrorBiometrico(error.message);
                    }
                }
              }
            }
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' && selectedWords.length === 12 && validationResult !== true
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`
                  : 'none',
            }}
          >
            {isVerifying ? (
                <CircularProgress size={24} color="inherit" />
            ) : (
                t.validar
            )}
          </Button>
        </Box>
      </Paper>
      <Dialog 
        open={modalAbierto} 
        onClose={(event, reason) => {
          // Evita que se cierre al hacer clic fuera o presionar Escape
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
            disabled={claveManual.length < 4 || isVerifying}
            onClick={async () => {
              setErrorBiometrico(null);
              try {
                // Segundo intento: pasamos la clave manual a Zustand
                await verifySeed(() => {
                    setModalAbierto(false);
                    cambiarVista('DASHBOARD');
                }, claveManual); 
              } catch (error: any) {
                setModalAbierto(false);
                setErrorBiometrico(error.message);
              }
            }}
          >
             {isVerifying ? <CircularProgress size={24} color="inherit" /> : t.proteger}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};