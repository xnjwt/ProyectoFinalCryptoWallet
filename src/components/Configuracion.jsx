import { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Button,
  Chip,
  Box,
} from "@mui/material";
import {
  Languages,
  Sun,
  Moon,
  DollarSign,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Download,
  KeyRound,
} from "lucide-react";
import { useSettingsStore, monedasDisponibles } from "../store/settingsStore";
import { getSeedFromStorage } from "../services/walletService";

const textos = {
  es: {
    tituloIdioma: "Idioma",
    descIdioma: "Elige el idioma en el que quieres ver la aplicación.",
    tituloTema: "Tema",
    descTema: "Cambia entre modo claro y oscuro en toda la aplicación.",
    claro: "Claro",
    oscuro: "Oscuro",
    tituloMoneda: "Moneda de visualización",
    descMoneda: "Selecciona la moneda en la que quieres ver tus montos.",
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
  },
  en: {
    tituloIdioma: "Language",
    descIdioma: "Choose the language you want to use in the app.",
    tituloTema: "Theme",
    descTema: "Switch between light and dark mode across the whole app.",
    claro: "Light",
    oscuro: "Dark",
    tituloMoneda: "Display currency",
    descMoneda: "Choose the currency used to display your amounts.",
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
  },
};

export const Configuracion = () => {
  const idioma = useSettingsStore((state) => state.idioma);
  const tema = useSettingsStore((state) => state.tema);
  const moneda = useSettingsStore((state) => state.moneda);
  const setIdioma = useSettingsStore((state) => state.setIdioma);
  const setTema = useSettingsStore((state) => state.setTema);
  const setMoneda = useSettingsStore((state) => state.setMoneda);

  const [semillaVisible, setSemillaVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const t = textos[idioma];
  // Se lee en cada render para reflejar si ya existe (o no) una wallet
  // configurada en este dispositivo.
  const semilla = getSeedFromStorage();

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
    <Stack spacing={3}>
      {/* Idioma */}
      <Paper elevation={0} sx={{ p: 3 }}>
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
          onChange={(_, valor) => valor && setIdioma(valor)}
          fullWidth
          color="primary"
        >
          <ToggleButton value="es">Español</ToggleButton>
          <ToggleButton value="en">English</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Tema: este es el control que, junto al ThemeProvider global, cambia
          el modo de MUI (palette.mode) en TODA la app, no solo aquí. */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          {tema === "oscuro" ? <Moon size={18} /> : <Sun size={18} />}
          <Typography variant="h6" fontWeight="bold">
            {t.tituloTema}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descTema}
        </Typography>
        <ToggleButtonGroup
          value={tema}
          exclusive
          onChange={(_, valor) => valor && setTema(valor)}
          fullWidth
          color="primary"
        >
          <ToggleButton value="claro">
            <Sun size={16} style={{ marginRight: 8 }} /> {t.claro}
          </ToggleButton>
          <ToggleButton value="oscuro">
            <Moon size={16} style={{ marginRight: 8 }} /> {t.oscuro}
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Moneda */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <DollarSign size={18} />
          <Typography variant="h6" fontWeight="bold">
            {t.tituloMoneda}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descMoneda}
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="moneda-label">{t.tituloMoneda}</InputLabel>
          <Select
            labelId="moneda-label"
            value={moneda}
            label={t.tituloMoneda}
            onChange={(e) => setMoneda(e.target.value)}
          >
            {monedasDisponibles.map((m) => (
              <MenuItem key={m.codigo} value={m.codigo}>
                {m.simbolo} {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Exportar wallet */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <KeyRound size={18} />
          <Typography variant="h6" fontWeight="bold">
            {t.tituloExportar}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.descExportar}
        </Typography>

        {!semilla ? (
          <Alert severity="info">{t.sinSemilla}</Alert>
        ) : (
          <>
            <Alert severity="warning" icon={<ShieldAlert size={20} />} sx={{ mb: 2 }}>
              {t.advertencia}
            </Alert>

            <Button
              variant="outlined"
              color="primary"
              startIcon={semillaVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setSemillaVisible((v) => !v)}
              sx={{ mb: semillaVisible ? 2 : 0 }}
            >
              {semillaVisible ? t.ocultar : t.mostrar}
            </Button>

            {semillaVisible && (
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {semilla.split(" ").map((palabra, index) => (
                    <Chip
                      key={index}
                      label={`${index + 1}. ${palabra}`}
                      sx={{ fontFamily: "monospace", justifyContent: "flex-start" }}
                    />
                  ))}
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={copiado ? <Check size={16} /> : <Copy size={16} />}
                    onClick={copiarSemilla}
                  >
                    {copiado ? t.copiado : t.copiar}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Download size={16} />}
                    onClick={descargarSemilla}
                  >
                    {t.descargar}
                  </Button>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Stack>
  );
};
