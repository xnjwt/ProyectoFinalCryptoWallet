import { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";
import {
  Languages,
  Sun,
  Moon,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Download,
  KeyRound,
  Palette
} from "lucide-react";
import { useConfigStore, acentosDisponibles } from "../../store/configStore";
import { getSeedFromStorage, obtenerSemilla } from "../../services/walletService";

const textos = {
  es: {
    tituloIdioma: "Idioma",
    descIdioma: "Elige el idioma en el que quieres ver la aplicación.",
    tituloTema: "Tema",
    descTema: "Cambia entre modo claro y oscuro en toda la aplicación.",
    claro: "Claro",
    oscuro: "Oscuro",
    tituloAcento: "Color de Acento",
    descAcento: "Personaliza el color de énfasis de los botones y componentes.",
    tituloExportar: "Exportar Wallet",
    descExportar:
      "Tu frase semilla es la única forma de recuperar tu wallet. Guárdala en un lugar seguro y jamás la compartas con nadie.",
    advertencia:
      "Cualquier persona con esta frase puede tomar el control total de tu wallet.",
    mostrar: "Mostrar frase semilla",
    ocultar: "Ocultar frase semilla",
    copiar: "Copiar",
    copiado: "¡Copiada!",
    descargar: "Descargar respaldo (.txt)",
    sinSemilla: "No se encontró ninguna wallet configurada en este dispositivo.",
    tituloModal: "Desbloquear Semilla",
    descripcionModal: "Tu dispositivo no soporta biometría o requieres tu contraseña manual para desencriptar la bóveda.",
    labelClave: "Contraseña de Encriptación",
    cancelar: "Cancelar",
    desbloquear: "Desbloquear"
  },
  en: {
    tituloIdioma: "Language",
    descIdioma: "Choose the language you want to use in the app.",
    tituloTema: "Theme",
    descTema: "Switch between light and dark mode across the whole app.",
    claro: "Light",
    oscuro: "Dark",
    tituloAcento: "Accent Color",
    descAcento: "Customize the emphasis color of buttons and components.",
    tituloExportar: "Export Wallet",
    descExportar:
      "Your seed phrase is the only way to recover your wallet. Keep it somewhere safe and never share it with anyone.",
    advertencia:
      "Anyone with this phrase can take full control of your wallet.",
    mostrar: "Show seed phrase",
    ocultar: "Hide seed phrase",
    copiar: "Copy",
    copiado: "Copied!",
    descargar: "Download backup (.txt)",
    sinSemilla: "No wallet configured on this device was found.",
    tituloModal: "Unlock Seed",
    descripcionModal: "Your device does not support biometrics or you need your manual password to decrypt the vault.",
    labelClave: "Encryption Password",
    cancelar: "Cancel",
    desbloquear: "Unlock"
  },
};

export const Configuracion = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const modo = useConfigStore((state) => state.modo);
  const colorAcento = useConfigStore((state) => state.colorAcento);
  
  const cambiarIdioma = useConfigStore((state) => state.cambiarIdioma);
  const actualizarConfiguracionGlobal = useConfigStore((state) => state.actualizarConfiguracionGlobal);

  const t = textos[idioma] || textos.es;
  // Estados de la Semilla
  const [semilla, setSemilla] = useState<string | null>(null);
  const [semillaVisible, setSemillaVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  
  // Estados del Modal Plan B
  const [modalAbierto, setModalAbierto] = useState(false);
  const [claveManual, setClaveManual] = useState("");

  // Comprobar silenciosamente si existe la llave en localStorage (sin desencriptarla aún)
  const existeRespaldo = !!localStorage.getItem("_seguro_wallet_seed");

  const manejarMostrarSemilla = async () => {
    // Si ya está visible, solo la ocultamos y limpiamos la memoria RAM por seguridad
    if (semillaVisible) {
      setSemillaVisible(false);
      setSemilla(null);
      setErrorAcceso(null);
      return;
    }

    // Intentamos desencriptar
    setIsDecrypting(true);
    setErrorAcceso(null);

    try {
      const semillaDesencriptada = await obtenerSemilla();
      if (semillaDesencriptada) {
        setSemilla(semillaDesencriptada);
        setSemillaVisible(true);
      }
    } catch (error: any) {
      // Si el orquestador lanza nuestro error o pide clave obligatoria, abrimos el modal
      if (error.message === 'FALLO_BIOMETRIA' || error.message === 'REQUIERE_CLAVE_MANUAL') {
        setModalAbierto(true);
      } else {
        setErrorAcceso(error.message);
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  const procesarClaveManual = async () => {
    setIsDecrypting(true);
    setErrorAcceso(null);
    try {
      const semillaDesencriptada = await obtenerSemilla(claveManual);
      if (semillaDesencriptada) {
        setSemilla(semillaDesencriptada);
        setSemillaVisible(true);
        setModalAbierto(false);
        setClaveManual(""); // Limpiamos el input
      }
    } catch (error: any) {
      setErrorAcceso("Contraseña incorrecta o " + error.message.toLowerCase());
    } finally {
      setIsDecrypting(false);
    }
  };

  const copiarSemilla = () => {
    if (!semilla) return;
    navigator.clipboard.writeText(semilla);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const descargarSemilla = () => {
    if (!semilla) return;
    const blob = new Blob([semilla], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "wallet-backup-semilla.txt";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: '720px', margin: '0 auto', p: { xs: 1, sm: 3 } }}>
      
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <Languages size={18} />
          <Typography variant="h6" fontWeight="bold">
            {t.tituloIdioma}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descIdioma}
        </Typography>
        <ToggleButtonGroup
          value={idioma}
          exclusive
          onChange={(_, valor) => valor && cambiarIdioma(valor)}
          fullWidth
          color="primary"
        >
          <ToggleButton value="es" sx={{ fontWeight: 600 }}>Español</ToggleButton>
          <ToggleButton value="en" sx={{ fontWeight: 600 }}>English</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          {modo === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          <Typography variant="h6" fontWeight="bold">
            {t.tituloTema}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descTema}
        </Typography>
        <ToggleButtonGroup
          value={modo}
          exclusive
          onChange={(_, valor: PaletteMode) => valor && actualizarConfiguracionGlobal(valor, colorAcento)}
          fullWidth
          color="primary"
        >
          <ToggleButton value="light" sx={{ fontWeight: 600 }}>
            <Sun size={16} style={{ marginRight: 8 }} /> {t.claro}
          </ToggleButton>
          <ToggleButton value="dark" sx={{ fontWeight: 600 }}>
            <Moon size={16} style={{ marginRight: 8 }} /> {t.oscuro}
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <Palette size={18} />
          <Typography variant="h6" fontWeight="bold">
            {t.tituloAcento}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descAcento}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
        >
          {acentosDisponibles.map((acento) => {
            const esSeleccionado = colorAcento === acento.codigo;
            return (
              <Button
                key={acento.codigo}
                variant={esSeleccionado ? "contained" : "outlined"}
                onClick={() => actualizarConfiguracionGlobal(modo, acento.codigo)}
                startIcon={esSeleccionado && <Check size={16} />}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: esSeleccionado ? '#fff' : acento.codigo,
                  borderColor: acento.codigo,
                  backgroundColor: esSeleccionado ? acento.codigo : 'transparent',
                  '&:hover': {
                    borderColor: acento.codigo,
                    backgroundColor: esSeleccionado 
                      ? acento.codigo 
                      : alpha(acento.codigo, 0.08),
                  },
                }}
              >
                {acento.nombre}
              </Button>
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <KeyRound size={18} />
          <Typography variant="h6" fontWeight="bold">
            {t.tituloExportar}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descExportar}
        </Typography>

        {!existeRespaldo ? (
          <Alert severity="info" sx={{ width: '100%', borderRadius: '12px', mt: 2 }}>
            {t.sinSemilla}
          </Alert>
        ) : (
          <>
            <Alert 
              severity="warning" 
              icon={<ShieldAlert size={20} />} 
              sx={{ 
                mb: 3,
                mt: 2,
                borderRadius: '12px',
                color: 'error.main',
                borderColor: 'error.main',
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
                '& .MuiAlert-icon': { color: 'error.main' }
              }}
              variant="outlined"
            >
              {t.advertencia}
            </Alert>

            {errorAcceso && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {errorAcceso}
              </Alert>
            )}

            <Button
              variant="outlined"
              color="primary"
              disabled={isDecrypting}
              startIcon={isDecrypting ? <CircularProgress size={16} color="inherit" /> : (semillaVisible ? <EyeOff size={16} /> : <Eye size={16} />)}
              onClick={manejarMostrarSemilla}
              sx={{ 
                mb: semillaVisible ? 3 : 0,
                py: 1.2,
                px: 3,
                borderRadius: '10px',
                fontWeight: 700
              }}
            >
              {semillaVisible ? t.ocultar : t.mostrar}
            </Button>

            {semillaVisible && semilla && (
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                    gap: 1.5,
                    mb: 4,
                  }}
                >
                  {semilla.split(" ").map((palabra, index) => (
                    <Box
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                        borderRadius: '8px',
                        py: 1.2,
                        px: 1.5,
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.95rem',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.03),
                      }}
                    >
                      <Typography component="span" color="text.secondary" fontWeight={500} fontSize="0.85rem">
                        {index + 1}.
                      </Typography>
                      {palabra}
                    </Box>
                  ))}
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={copiado ? <Check size={16} /> : <Copy size={16} />}
                    onClick={copiarSemilla}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 700,
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark' 
                          ? `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}` 
                          : 'none',
                    }}
                  >
                    {copiado ? t.copiado : t.copiar}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Download size={16} />}
                    onClick={descargarSemilla}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {t.descargar}
                  </Button>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
      <Dialog 
        open={modalAbierto} 
        onClose={(e, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setModalAbierto(false);
          setIsDecrypting(false);
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
          <Button onClick={() => {
            setModalAbierto(false);
            setIsDecrypting(false);
          }} color="secondary">
            {t.cancelar}
          </Button>
          <Button 
            variant="contained"
            disabled={claveManual.length < 4 || isDecrypting}
            onClick={procesarClaveManual}
          >
             {isDecrypting ? <CircularProgress size={24} color="inherit" /> : t.desbloquear}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};