import { useState, FormEvent } from "react";
import { Box, Typography, Button, Paper, Alert, TextField, CircularProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useWalletStore } from "../../store/walletStore";
import { useConfigStore } from "../../store/configStore";

const textos = {
  es: {
    appTitulo: "Wallet-Crypto",
    loginTitulo: "Iniciar Sesión",
    registroTitulo: "Crear Cuenta",
    labelIdentificador: "CORREO ELECTRÓNICO O USUARIO",
    placeholderIdentificador: "tu@correo.com o tu_usuario",
    labelCorreo: "CORREO ELECTRÓNICO",
    placeholderCorreo: "tu@correo.com",
    labelUsuario: "NOMBRE DE USUARIO",
    placeholderUsuario: "ejemplo123",
    labelContrasena: "CONTRASEÑA",
    btnProcesando: "PROCESANDO...",
    btnEntrar: "ENTRAR",
    btnRegistrarse: "REGISTRARSE",
    irARegistro: "¿NO TIENES CUENTA? REGÍSTRATE AQUÍ",
    irALogin: "¿YA TIENES CUENTA? INICIA SESIÓN",
    errorCredenciales: "Credenciales incorrectas.",
    errorUsername: "El nombre de usuario es obligatorio y no puede contener espacios.",
    errorExiste: "Este nombre de usuario ya está en uso. Elige otro.",
    errorNoExiste: "El nombre de usuario no existe."
  },
  en: {
    appTitulo: "Wallet-Crypto",
    loginTitulo: "Sign In",
    registroTitulo: "Create Account",
    labelIdentificador: "EMAIL OR USERNAME",
    placeholderIdentificador: "you@email.com or your_username",
    labelCorreo: "EMAIL ADDRESS",
    placeholderCorreo: "you@email.com",
    labelUsuario: "USERNAME",
    placeholderUsuario: "example123",
    labelContrasena: "PASSWORD",
    btnProcesando: "PROCESSING...",
    btnEntrar: "SIGN IN",
    btnRegistrarse: "REGISTER",
    irARegistro: "DON'T HAVE AN ACCOUNT? REGISTER HERE",
    irALogin: "ALREADY HAVE AN ACCOUNT? SIGN IN",
    errorCredenciales: "Incorrect credentials.",
    errorUsername: "Username is required and cannot contain spaces.",
    errorExiste: "This username is already taken. Choose another one.",
    errorNoExiste: "Username does not exist."
  }
};

interface FormularioAccesoProps {
  onAuthSuccess: (user: User) => void;
}

export const Autenticacion = ({ onAuthSuccess }: FormularioAccesoProps) => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;


  const [esModoLogin, setEsModoLogin] = useState(true);
  const [identificador, setIdentificador] = useState("");
  const [username, setUsername] = useState("");
  const [correoRegistro, setCorreoRegistro] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [mensajeError, setMensajeError] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarAutenticacion = async (evento: FormEvent) => {
    evento.preventDefault();
    setMensajeError("");
    setEstaCargando(true);

    try {
      if (esModoLogin) {
        let emailParaLogin = identificador;
        if (!identificador.includes("@")) {
          const respuesta = await fetch(
            `http://localhost:3000/api/users/get-email/${identificador}`
          );
          const datos = await respuesta.json();
          if (!respuesta.ok || !datos.correo) throw new Error(t.errorNoExiste);
          emailParaLogin = datos.correo;
        }
        
        const credenciales = await signInWithEmailAndPassword(
          auth,
          emailParaLogin,
          contrasena
        );
        onAuthSuccess(credenciales.user);
      } else {
        if (username.trim() === "" || username.includes(" ")) {
          throw new Error(t.errorUsername);
        }
        
        const verificarUser = await fetch(
          `http://localhost:3000/api/users/check-username/${username}`
        );
        const dataVerificacion = await verificarUser.json();
        if (dataVerificacion.existe) throw new Error(t.errorExiste);

        const credenciales = await createUserWithEmailAndPassword(
          auth,
          correoRegistro,
          contrasena
        );
        const uid = credenciales.user.uid;

        await fetch("http://localhost:3000/api/users/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            correo: correoRegistro,
            username,
          }),
        });
        
        setStep(1);
        onAuthSuccess(credenciales.user);
      }
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        setMensajeError(t.errorCredenciales);
      } else {
        setMensajeError(error.message);
      }
    } finally {
      setEstaCargando(false);
    }
  };

  const alternarModo = () => {
    setEsModoLogin(!esModoLogin);
    setMensajeError("");
    setIdentificador("");
    setCorreoRegistro("");
    setContrasena("");
    setUsername("");
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        color="primary.main"
        sx={{
          fontWeight: 800,
          mb: 4,
          letterSpacing: '1px',
          textShadow: (theme) =>
            theme.palette.mode === 'dark' 
              ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}` 
              : 'none',
        }}
      >
        {t.appTitulo}
      </Typography>

      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: '440px',
          width: '100%',
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          color="text.primary"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
          }}
        >
          {esModoLogin ? t.loginTitulo : t.registroTitulo}
        </Typography>

        <Box component="form" onSubmit={manejarAutenticacion} noValidate>
          {esModoLogin ? (
            <TextField
              margin="normal"
              required
              fullWidth
              label={t.labelIdentificador}
              placeholder={t.placeholderIdentificador}
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value.trim())}
              disabled={estaCargando}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ) : (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                type="email"
                label={t.labelCorreo}
                placeholder={t.placeholderCorreo}
                value={correoRegistro}
                onChange={(e) => setCorreoRegistro(e.target.value.trim())}
                disabled={estaCargando}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label={t.labelUsuario}
                placeholder={t.placeholderUsuario}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={estaCargando}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            type="password"
            label={t.labelContrasena}
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={estaCargando}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 3 }}
          />

          {mensajeError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                width: '100%',
                mt: 2,
                mb: 2,
                borderRadius: '12px',
                fontWeight: 600,
                color: 'error.main',
                borderColor: 'error.main',
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
              }}
            >
              {mensajeError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={estaCargando}
            sx={{
              py: 1.8,
              mt: 2,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' && !estaCargando
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`
                  : 'none',
            }}
          >
            {estaCargando ? (
              <CircularProgress size={24} color="inherit" />
            ) : esModoLogin ? (
              t.btnEntrar
            ) : (
              t.btnRegistrarse
            )}
          </Button>
        </Box>

        <Button
          fullWidth
          onClick={alternarModo}
          sx={{
            mt: 4,
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.5px',
            color: 'secondary.main',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'transparent',
            },
          }}
        >
          {esModoLogin ? t.irARegistro : t.irALogin}
        </Button>
      </Paper>
    </Box>
  );
};