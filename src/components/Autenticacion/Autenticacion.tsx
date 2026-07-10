import { useState, FormEvent } from "react";
import { Box, Typography, Button, Paper, Alert, TextField, CircularProgress, LinearProgress, InputAdornment, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useWalletStore } from "../../store/walletStore";
import { useConfigStore } from "../../store/configStore";
import { passwordStrength } from "check-password-strength"; 
import { registrarNuevoUsuario } from "../../services/authService";
import { iniciarSesionConIdentificador } from "../../services/authService";
import logoApp from "../../assets/logo_lux_wallet.png";

const textos = {
  es: {
    appTitulo: "Lux Wallet",
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
    errorNoExiste: "El nombre de usuario no existe.",
    errorRed: "No se pudo conectar con el servidor. Verifica tu conexión.",
    errorServidor: "Ocurrió un error inesperado. Intenta más tarde.",
    contrasenasNoCoinciden: "Las contraseñas no coinciden. Verifícalas.",
    labelConfirmarContrasena: "CONFIRMAR CONTRASEÑA *",
    placeholderConfirmarContrasena: "Repite tu contraseña",
    contrasenaDebil: "La contraseña es muy débil. Usa mayúsculas, números y símbolos.",
    errorRegistro: "No se pudo completar el registro. Inténtalo de nuevo.",
    fuerzaDebil: "Débil",
    fuerzaMedio: "Medio",
    fuerzaFuerte: "Fuerte",
    faltaRequisitos: "Te falta: ",
    reqMinusculas: "minúsculas",
    reqMayusculas: "mayúsculas",
    reqNumeros: "números",
    reqSimbolos: "símbolos",
    reqLongitud: "mínimo 6 caracteres",
    contrasenasCoinciden: "Las contraseñas coinciden correctamente.",
    contrasenasNoCoincidenInline: "Las contraseñas aún no coinciden.",
  },
  en: {
    appTitulo: "Lux Wallet",
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
    errorNoExiste: "Username does not exist.",
    errorRed: "Could not connect to the server. Check your connection.",
    errorServidor: "An unexpected error occurred. Try again later.",
    contrasenasNoCoinciden: "Passwords do not match. Please verify them.",
    labelConfirmarContrasena: "CONFIRM PASSWORD *",
    placeholderConfirmarContrasena: "Repeat your password",
    contrasenaDebil: "The password is too weak. Use uppercase letters, numbers, and symbols.",
    errorRegistro: "Could not complete registration. Please try again.",
    fuerzaDebil: "Weak",
    fuerzaMedio: "Medium",
    fuerzaFuerte: "Strong",
    faltaRequisitos: "Missing: ",
    reqMinusculas: "lowercase",
    reqMayusculas: "uppercase",
    reqNumeros: "numbers",
    reqSimbolos: "symbols",
    reqLongitud: "minimum 6 characters",
    contrasenasCoinciden: "Passwords match successfully.",
    contrasenasNoCoincidenInline: "Passwords do not match yet.",
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
  const [confirmarContrasena, setConfirmarContrasena] = useState(""); // Nuevo estado para confirmación

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarAutenticacion = async (evento: FormEvent) => {
    evento.preventDefault();
    setMensajeError("");

    // Validación local: Verificar que las contraseñas coincidan antes de procesar en el servidor
    if (!esModoLogin && contrasena !== confirmarContrasena) {
      setMensajeError(t.contrasenasNoCoinciden);
      return;
    }

    setEstaCargando(true);

    try {
      if (esModoLogin) {
        const credenciales = await iniciarSesionConIdentificador(identificador, contrasena);
        onAuthSuccess(credenciales.user);
      } else {
        const credenciales = await registrarNuevoUsuario(correoRegistro, contrasena, username);
        onAuthSuccess(credenciales.user);
      }
    } catch (error: any) {
      switch (error.message) {
        case "USER_NOT_FOUND":
          setMensajeError(t.errorNoExiste);
          break;
        case "INVALID_USERNAME_FORMAT":
          setMensajeError(t.errorUsername);
          break;
        case "USERNAME_TAKEN":
          setMensajeError(t.errorExiste);
          break;
        case "ERROR_VINCULACION_BACKEND":
          setMensajeError(t.errorRegistro);
          break;
        default:
          if (error.code === "auth/invalid-credential") {
            setMensajeError(t.errorCredenciales);
          } else if (error instanceof TypeError) {
            setMensajeError(t.errorRed);
          } else {
            setMensajeError(t.errorServidor);
          }
          break;
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
    setConfirmarContrasena("");
    setUsername("");
    setMostrarContrasena(false);         // Reiniciar visibilidad
    setMostrarConfirmarContrasena(false); // Reiniciar visibilidad
  };

  //Derivamos la evaluación completa de la contraseña
  const evaluacionContrasena = passwordStrength(contrasena);

  //Mapeamos estilos visuales
  const obtenerEstilosFuerza = (id: number) => {
    if (id <= 1) return { progreso: (id + 1) * 25, color: "error" as const, textoFuerza: t.fuerzaDebil };
    if (id === 2) return { progreso: 75, color: "warning" as const, textoFuerza: t.fuerzaMedio };
    return { progreso: 100, color: "success" as const, textoFuerza: t.fuerzaFuerte };
  };

  const { progreso, color, textoFuerza } = obtenerEstilosFuerza(evaluacionContrasena.id);

  //Generamos dinámicamente un mensaje indicando qué tipos de caracteres faltan
  const obtenerSugerenciaFuerza = () => {
    if (evaluacionContrasena.id === 3) return "";
    
    const faltantes: string[] = [];
    if (contrasena.length < 6) faltantes.push(t.reqLongitud);
    if (!evaluacionContrasena.contains.includes("lowercase")) faltantes.push(t.reqMinusculas);
    if (!evaluacionContrasena.contains.includes("uppercase")) faltantes.push(t.reqMayusculas);
    if (!evaluacionContrasena.contains.includes("number")) faltantes.push(t.reqNumeros);
    if (!evaluacionContrasena.contains.includes("symbol")) faltantes.push(t.reqSimbolos);

    return faltantes.length > 0 ? `${t.faltaRequisitos}${faltantes.join(", ")}.` : "";
  };

  const mensajeSugerencia = obtenerSugerenciaFuerza();
  // Validación en tiempo real para el campo de confirmación
  const lasContrasenasCoinciden = contrasena === confirmarContrasena;
  const mostrarValidacionConfirmacion = !esModoLogin && confirmarContrasena.length > 0;

  const handleToggleMostrarContrasena = () => setMostrarContrasena(!mostrarContrasena);
  const handleToggleMostrarConfirmarContrasena = () => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena);

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
      {/*contenedor para el Logo */}
      <Box
        component="img"
        src={logoApp}
        alt="Lux Wallet Logo"
        sx={{
          width: 150,          // Ajusta el ancho del logo
          height: 'auto',     // Mantiene la proporción original de la imagen
          mt: -25,             //margen negativo para mandarlo hacia arriba al logo
          mb: 1,              // Margen inferior para separarlo del título
          filter: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' 
              : 'none'
        }}
      />
      <Typography
        variant="h3"
        component="h1"
        color="primary.main"
        sx={{
          fontWeight: 800,
          mb: 2, //4
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
          borderRadius: '16px', 
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.8) 
              : theme.palette.background.paper,
          
          // Sombra dinámica y difuminada
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 16px 50px -8px ${alpha(theme.palette.primary.main, 0.25)}, 
                 0 0 30px -2px ${alpha(theme.palette.primary.main, 0.15)}`
              : `0 24px 50px -10px ${alpha(theme.palette.primary.main, 0.15)}`,
          
          //Un borde milimétrico semi-transparente que mejora el desenfoque en modo oscuro
          border: (theme) => 
            theme.palette.mode === 'dark' 
              ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` 
              : 'none',
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
            type={mostrarContrasena ? "text" : "password"} // Cambia dinámicamente
            label={t.labelContrasena}
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={estaCargando}
            slotProps={{
              inputLabel: { shrink: true },
              input: { // Inserta el ícono al final del input
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cambiar visibilidad de contraseña"
                      onClick={handleToggleMostrarContrasena}
                      edge="end"
                    >
                      {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: esModoLogin ? 3 : 1 }}
          />

          {!esModoLogin && contrasena && (
            <Box sx={{ mb: 2, px: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progreso}
                color={color}
                sx={{ height: 4, borderRadius: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: '75%' }}>
                  {mensajeSugerencia}
                </Typography>
                <Typography variant="caption" color={`${color}.main`} sx={{ fontWeight: "bold" }}>
                  {textoFuerza}
                </Typography>
              </Box>
            </Box>
          )}

          {!esModoLogin && (
            <Box sx={{ mb: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                type={mostrarConfirmarContrasena ? "text" : "password"} // Cambia dinámicamente
                label={t.labelConfirmarContrasena}
                placeholder={t.placeholderConfirmarContrasena}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={estaCargando}
                error={mostrarValidacionConfirmacion && !lasContrasenasCoinciden}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="cambiar visibilidad de confirmación de contraseña"
                          onClick={handleToggleMostrarConfirmarContrasena}
                          edge="end"
                        >
                          {mostrarConfirmarContrasena ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 0.5 }}
              />
              
              {mostrarValidacionConfirmacion && (
                <Typography
                  variant="caption"
                  color={lasContrasenasCoinciden ? "success.main" : "error.main"}
                  sx={{ display: "block", pl: 1, fontWeight: "bold" }}
                >
                  {lasContrasenasCoinciden ? `✓ ${t.contrasenasCoinciden}` : `✗ ${t.contrasenasNoCoincidenInline}`}
                </Typography>
              )}
            </Box>
          )}

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