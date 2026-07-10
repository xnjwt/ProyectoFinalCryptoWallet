import { useState } from 'react';
import { Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowLeft, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useSendStore } from '../../store/sendStore';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: {
    resumen: "Resumen de la transacción",
    de: "De:",
    para: "Para:",
    red: "Red:",
    monto: "Monto a enviar:",
    comisionTotal: "Comisión Total",
    comisionRed: "Comisión de la red:",
    comisionApp: "Comisión de la app:",
    total: "Total a debitar:",
    desliza: "Desliza para confirmar",
    exitoTitulo: "¡Pago exitoso!",
    exitoSubtitulo: "Tu transacción ha sido procesada correctamente.",
    numPedido: "Número de operación",
    btnVolver: "Volver al inicio"
  },
  en: {
    resumen: "Transaction Summary",
    de: "From:",
    para: "To:",
    red: "Network:",
    monto: "Amount to send:",
    comisionTotal: "Total Fee",
    comisionRed: "Network fee:",
    comisionApp: "App fee:",
    total: "Total to deduct:",
    desliza: "Swipe to confirm",
    exitoTitulo: "Payment successful!",
    exitoSubtitulo: "Your transaction has been successfully processed.",
    numPedido: "Operation number",
    btnVolver: "Return to home"
  }
};

// ------
const BotonDeslizante = ({ alConfirmar, texto }: { alConfirmar: () => void, texto: string }) => {
  const theme = useTheme();
  const [valor, setValor] = useState(0);
  const [desbloqueado, setDesbloqueado] = useState(false);

  // Maneja el movimiento de la barra
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (desbloqueado) return;
    setValor(Number(e.target.value));
  };

  // Se ejecuta cuando el usuario suelta el click / dedo
  const manejarSoltar = () => {
    if (desbloqueado) return;
    // Si llega a más del 85% de la barra, lo damos por confirmado
    if (valor > 85) {
      setValor(100);
      setDesbloqueado(true);
      alConfirmar();
    } else {
      // Si no llegó al final, regresa suavemente a 0
      setValor(0);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '64px',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        borderRadius: '32px',
        overflow: 'hidden',
        // Aquí declaramos la animación de rebote para la flecha
        '@keyframes reboteDerecha': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' } // Se mueve 6px a la derecha y vuelve
        }
      }}
    >
      {/* 1. Texto de fondo estático */}
      <Typography
        sx={{
          position: 'absolute',
          width: '100%',
          lineHeight: '64px',
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
          fontWeight: 600,
          letterSpacing: '0.05em',
          zIndex: 1,
          userSelect: 'none'
        }}
      >
        {desbloqueado ? "Confirmando..." : texto}
      </Typography>

      {/* 2. Barra de color (Se expande) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          // Al soltar el dedo, hacemos que la transición sea suave. Al arrastrar, es instantánea.
          transition: valor === 0 || valor === 100 ? 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          // Fórmula matemática que calcula el ancho: inicia en 64px (un círculo) y crece hasta 100%
          width: `calc(64px + (100% - 64px) * (${valor} / 100))`,
          bgcolor: 'primary.main',
          borderRadius: '32px',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: '20px' // Centra perfectamente el icono dentro del borde derecho curvo
        }}
      >
        <ChevronRight 
          color="#ffffff" 
          size={24} 
          style={{ 
            animation: desbloqueado ? 'none' : 'reboteDerecha 0.8s infinite ease-in-out' 
          }} 
        />
      </Box>

      {/* 3. Input invisible que detecta la interacción nativa */}
      <input
        type="range"
        min="0"
        max="100"
        value={valor}
        onChange={manejarCambio}
        onMouseUp={manejarSoltar}
        onTouchEnd={manejarSoltar}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0,
          zIndex: 3,
          cursor: desbloqueado ? 'default' : 'grab',
          margin: 0,
        }}
        disabled={desbloqueado}
      />
    </Box>
  );
};
// ------

export const SendSummary = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const theme = useTheme(); // Obtenemos el tema para los colores dinámicos

  const cambiarVista = useConfigStore((state) => state.cambiarVista);

  const { redSeleccionada, monto, tokenSeleccionado, direccionDestino, setFaseActual, setMonto, setDireccionDestino} = useSendStore();

  const [modalExito, setModalExito] = useState(false);

  const comisionRed = 0.00005;
  const comisionApp = 0.50;
  const totalConComisionApp = parseFloat(monto) + comisionApp;

  const procesarConfirmacion = () => {
    setTimeout(() => {
      setModalExito(true);
    }, 450);
  };

  const manejarVolver = () => {
    setModalExito(false);
    // Limpiamos los campos del store para la próxima transacción
    setMonto("");
    setDireccionDestino("");
    setFaseActual('FORM');
    
    // NUEVO: Esto le dice a Zustand que vuelva al inicio y cierre el panel lateral
    cambiarVista('DASHBOARD');
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const labelStyle = {
    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
    fontSize: '0.95rem',
    fontWeight: 500
  };

  const valueStyle = {
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
    fontSize: '0.95rem',
    fontWeight: 600
  };

  return (
    <>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
{/* HEADER: Botón Atrás y Título */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton 
          onClick={() => setFaseActual('FORM')}
          sx={{ color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563', p: 0.5 }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151' }}>
          {t.resumen}
        </Typography>
      </Box>

      {/* CUADRO 1: Resumen de la transacción */}
      <Box sx={{ 
        // Lógica de color que me pediste: Más oscuro que el de abajo en modo claro, más claro en modo oscuro.
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.09)',
        p: 3, 
        borderRadius: '16px', // Radio moderno
        border: 'none', // Sin bordes
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={rowStyle}>
          <Typography sx={labelStyle}>{t.red}</Typography>
          <Typography sx={valueStyle}>{redSeleccionada}</Typography>
        </Box>
        <Box sx={rowStyle}>
          <Typography sx={labelStyle}>{t.de}</Typography>
          <Typography sx={valueStyle}>Mi Billetera Principal</Typography>
        </Box>
        <Box sx={rowStyle}>
          <Typography sx={labelStyle}>{t.para}</Typography>
          <Typography sx={{ ...valueStyle, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {direccionDestino}
          </Typography>
        </Box>
        <Box sx={rowStyle}>
          <Typography sx={labelStyle}>{t.monto}</Typography>
          <Typography sx={valueStyle}>
            {monto} {tokenSeleccionado}
          </Typography>
        </Box>
      </Box>

      {/* CUADRO 2: Comisión (Acordeón expandible) */}
      <Accordion 
        disableGutters 
        elevation={0}
        sx={{
          // Color base para el cuadro inferior (siempre más suave que el de arriba)
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
          borderRadius: '16px !important',
          border: 'none', // Sin bordes de tu código anterior
          boxShadow: 'none',
          '&:before': { display: 'none' }, // Oculta el divisor por defecto de MUI
          '& .MuiAccordionSummary-root': {
            borderRadius: '16px',
            '&:focus, &:focus-visible': {
              backgroundColor: 'transparent',
              outline: 'none', // Elimina el marco al hacer clic
            }
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ChevronDown size={20} color={theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563'} />}
          sx={{ p: 3, m: 0, minHeight: 'auto', '& .MuiAccordionSummary-content': { m: 0 } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Typography sx={labelStyle}>{t.comisionTotal}</Typography>
            <Typography sx={valueStyle}>
              ~ {comisionApp} {tokenSeleccionado}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={rowStyle}>
            <Typography sx={{...labelStyle, fontSize: '0.85rem'}}>{t.comisionRed}</Typography>
            <Typography sx={{...valueStyle, fontSize: '0.85rem'}}>{comisionRed} {redSeleccionada === 'Solana' ? 'SOL' : 'NATIVO'}</Typography>
          </Box>
          <Box sx={rowStyle}>
            <Typography sx={{...labelStyle, fontSize: '0.85rem'}}>{t.comisionApp}</Typography>
            <Typography sx={{...valueStyle, fontSize: '0.85rem'}}>{comisionApp} {tokenSeleccionado}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SECCIÓN FINAL: Total y Botón */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 500, color: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151' }}>
            {t.total}
          </Typography>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827' }}>
            {totalConComisionApp.toFixed(4)} {tokenSeleccionado}
          </Typography>
        </Box>

      <BotonDeslizante 
          texto={t.desliza} 
          alConfirmar={procesarConfirmacion} 
        />
      </Box>
    </Box>

  <Dialog 
        open={modalExito}
        // Descomenta la siguiente línea si quieres obligar al usuario a presionar el botón para salir
        // onClose={(event, reason) => { if (reason !== 'backdropClick') setModalExito(false) }}
        PaperProps={{
          sx: {
            borderRadius: '32px',
            bgcolor: theme.palette.mode === 'dark' ? '#1b1e2b' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
            width: '100%',
            maxWidth: '420px',
            m: 2
          }
        }}
      >
      <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>  
        {/* Círculo Verde con Check */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box 
            sx={{
              width: 90, 
              height: 90, 
              borderRadius: '50%',
              bgcolor: '#22c55e', // Verde brillante
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)' // Resplandor verde suave
            }}
          >
            <Check color="white" size={48} strokeWidth={3} />
          </Box>
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827', letterSpacing: '-0.02em' }}>
          {t.exitoTitulo}
        </Typography>
        
        <Typography sx={{ fontSize: '1rem', color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', mb: 4 }}>
          {t.exitoSubtitulo}
        </Typography>

        {/* Cuadro del Número de Operación */}
        <Box sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
          borderRadius: '20px', 
          p: 2.5, 
          mb: 4
        }}>
          <Typography sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563', mb: 0.5 }}>
            {t.numPedido}
          </Typography>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.05em' }}>
            #TX-{Math.floor(10000 + Math.random() * 90000)}
          </Typography>
        </Box>

        {/* Botón de Retorno */}
        <Button
          fullWidth
          variant="contained"
          onClick={manejarVolver}
          sx={{
            py: 2,
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: theme.palette.mode === 'dark'
              ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.3)}`
              : 'none',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.5)}`
                : 'none',
            }
          }}
        >
          {t.btnVolver}
        </Button>
      </Box>
      </Dialog>
    </>
  );
};