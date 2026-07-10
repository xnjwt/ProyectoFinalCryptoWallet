import { Box, Typography, Paper, ButtonBase, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Wallet, KeyRound } from "lucide-react";
import { useConfigStore } from "../../store/configStore";

const textos = {
  es: {
    tituloGeneral: "Configura tu Billetera",
    subtitulo: "¿Cómo deseas comenzar tu viaje en la Web3?",
    tituloCrear: "Crear Nueva Billetera",
    descCrear: "Generaremos una frase de seguridad de 12 palabras. Elige esta opción si no tienes una billetera o deseas iniciar una cuenta desde cero.",
    tituloImportar: "Importar Billetera",
    descImportar: "Restaura el acceso a tus fondos existentes ingresando una frase semilla de 12 palabras que ya tengas guardada.",
  },
  en: {
    tituloGeneral: "Set Up Your Wallet",
    subtitulo: "How would you like to start your Web3 journey?",
    tituloCrear: "Create New Wallet",
    descCrear: "We will generate a 12-word security phrase. Choose this option if you don't have a wallet or want to start a fresh account.",
    tituloImportar: "Import Wallet",
    descImportar: "Restore access to your existing funds by entering a 12-word seed phrase you have previously saved.",
  },
};

export const MenuWallet = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const t = textos[idioma] || textos.es;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          color="primary.main"
          sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
        >
          {t.tituloGeneral}
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mb: 6, fontSize: "1.1rem" }}
        >
          {t.subtitulo}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="stretch"
        >
          <ButtonBase
            onClick={() => cambiarVista("GENERAR_SEMILLA")}
            sx={{
              flex: 1,
              borderRadius: "20px",
              textAlign: "left",
              display: "block",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: "20px",
                border: "2px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "primary.main",
                  boxShadow: (theme) =>
                    `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.4)}`,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  mb: 3,
                }}
              >
                <Wallet size={36} strokeWidth={2} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t.tituloCrear}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t.descCrear}
              </Typography>
            </Paper>
          </ButtonBase>

          <ButtonBase
            onClick={() => cambiarVista("IMPORTAR_SEMILLA")}
            sx={{
              flex: 1,
              borderRadius: "20px",
              textAlign: "left",
              display: "block",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: "20px",
                border: "2px solid",
                borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "secondary.main",
                  boxShadow: (theme) =>
                    `0 12px 24px -10px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.02),
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  color: "secondary.main",
                  mb: 3,
                }}
              >
                <KeyRound size={36} strokeWidth={2} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {t.tituloImportar}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t.descImportar}
              </Typography>
            </Paper>
          </ButtonBase>
        </Stack>
      </Box>
    </Box>
  );
};