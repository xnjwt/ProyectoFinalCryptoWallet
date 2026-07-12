import { createUserWithEmailAndPassword, signInWithEmailAndPassword,} from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useWalletStore } from "../../store/walletStore";

import { useState, FormEvent } from "react";
import { Box, Typography, Button, Paper, Alert, TextField, CircularProgress, LinearProgress, InputAdornment, IconButton, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { User } from "firebase/auth";
import { useConfigStore } from "../../store/configStore";
import { passwordStrength } from "check-password-strength"; 
import { registrarNuevoUsuario, iniciarSesionConIdentificador } from "../../services/authService";
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
  const theme = useTheme();

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

  // --- ESTILOS MODERNOS ---
  const modernTextFieldStyle = {
    mb: 3,
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
      }
    }
  };

  const labelStyle = {
    fontSize: '0.80rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
    mb: 1,
    ml: 1,
    display: 'block'
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
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Contenedor para el Logo - Más grande y posicionado fluidamente */}
      <Box
        component="img"
        src={logoApp}
        alt="Lux Wallet Logo"
        sx={{
          width: 300, // Más grande
          height: 'auto',
          mb: -5, // Separación con la tarjeta
          filter: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'drop-shadow(0 0 15px rgba(255,255,255,0.15))' 
              : 'none'
        }}
      />
      
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: '460px',
          width: '100%',
          borderRadius: '40px', 
          backgroundColor: 'background.paper',
          
          boxShadow: theme.palette.mode === 'dark'
            ? `0 25px 50px -12px ${alpha(theme.palette.primary.main, 0.25)}, 
               0 0 30px -2px ${alpha(theme.palette.primary.main, 0.15)}`
            : `0 25px 50px -12px rgba(0, 0, 0, 0.1)`,
          
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          color="text.primary"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            mb: 4,
          }}
        >
          {esModoLogin ? t.loginTitulo : t.registroTitulo}
        </Typography>

        <Box component="form" onSubmit={manejarAutenticacion} noValidate>
          {esModoLogin ? (
            <Box>
              <Typography sx={labelStyle}>{t.labelIdentificador}</Typography>
              <TextField
                required
                fullWidth
                placeholder={t.placeholderIdentificador}
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value.trim())}
                disabled={estaCargando}
                sx={modernTextFieldStyle}
              />
            </Box>
          ) : (
            <>
              <Box>
                <Typography sx={labelStyle}>{t.labelCorreo}</Typography>
                <TextField
                  required
                  fullWidth
                  type="email"
                  placeholder={t.placeholderCorreo}
                  value={correoRegistro}
                  onChange={(e) => setCorreoRegistro(e.target.value.trim())}
                  disabled={estaCargando}
                  sx={modernTextFieldStyle}
                />
              </Box>
              <Box>
                <Typography sx={labelStyle}>{t.labelUsuario}</Typography>
                <TextField
                  required
                  fullWidth
                  placeholder={t.placeholderUsuario}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={estaCargando}
                  sx={modernTextFieldStyle}
                />
              </Box>
            </>
          )}

          <Box>
            <Typography sx={labelStyle}>{t.labelContrasena}</Typography>
            <TextField
              required
              fullWidth
              type={mostrarContrasena ? "text" : "password"}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={estaCargando}
              sx={{...modernTextFieldStyle, mb: esModoLogin ? 3 : 1}}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleMostrarContrasena} edge="end" sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {!esModoLogin && contrasena && (
            <Box sx={{ mb: 3, px: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progreso}
                color={color}
                sx={{ height: 6, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: '75%', lineHeight: 1.3 }}>
                  {mensajeSugerencia}
                </Typography>
                <Typography variant="caption" color={`${color}.main`} sx={{ fontWeight: 800 }}>
                  {textoFuerza}
                </Typography>
              </Box>
            </Box>
          )}

          {!esModoLogin && (
            <Box>
              <Typography sx={labelStyle}>{t.labelConfirmarContrasena}</Typography>
              <TextField
                required
                fullWidth
                type={mostrarConfirmarContrasena ? "text" : "password"}
                placeholder={t.placeholderConfirmarContrasena}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={estaCargando}
                sx={{...modernTextFieldStyle, mb: 1}}
                error={mostrarValidacionConfirmacion && !lasContrasenasCoinciden}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleMostrarConfirmarContrasena} edge="end" sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        {mostrarConfirmarContrasena ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {mostrarValidacionConfirmacion && (
                <Typography
                  variant="caption"
                  color={lasContrasenasCoinciden ? "success.main" : "error.main"}
                  sx={{ display: "block", pl: 1, mb: 2, fontWeight: 700 }}
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
                mb: 3,
                borderRadius: '16px',
                fontWeight: 600,
                color: 'error.main',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.4)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(244, 67, 54, 0.05)',
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
              py: 2,
              mt: 1,
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.05em',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: theme.palette.mode === 'dark' && !estaCargando
                ? `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.4)}`
                : 'none',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: theme.palette.mode === 'dark' && !estaCargando
                  ? `0 15px 25px -5px ${alpha(theme.palette.primary.main, 0.5)}`
                  : 'none',
              }
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
            py: 1.5,
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            color: 'secondary.main',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            },
          }}  
        >
          {esModoLogin ? t.irARegistro : t.irALogin}
        </Button>
      </Paper>
    </Box>
  );
};