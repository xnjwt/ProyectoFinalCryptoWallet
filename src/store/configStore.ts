import { create } from 'zustand';
import { createTheme, Theme, PaletteMode } from '@mui/material/styles';

type IdiomaSoportado = 'es' | 'en';

export type VistaApp = 
  | 'AUTENTICACION'
  | 'MENU_BILLETERA'
  | 'GENERAR_SEMILLA'
  | 'VERIFICAR_SEMILLA'
  | 'IMPORTAR_SEMILLA'
  | 'DASHBOARD'
  | 'CONFIGURACION'
  | 'RECIBIR_CRYPTO';

export interface AcentoConfig {
  nombre: string;
  codigo: string;
}

export const acentosDisponibles: AcentoConfig[] = [
  { nombre: 'Púrpura', codigo: '#970FFA' },
  { nombre: 'Cian', codigo: '#00E5FF' },
  { nombre: 'Esmeralda', codigo: '#00E676' },
  { nombre: 'Fuego', codigo: '#FF6D00' },
  { nombre: 'Rosa Neo', codigo: '#FF007F' },
];

interface EstadoApp {
  idioma: IdiomaSoportado;
  modo: PaletteMode;
  colorAcento: string;
  tema: Theme;
  vistaActual: VistaApp;
  actualizarConfiguracionGlobal: (nuevoModo: PaletteMode, nuevoColorAcento: string) => void;
  cambiarIdioma: (nuevoIdioma: IdiomaSoportado) => void;
  cambiarVista: (nuevaVista: VistaApp) => void;
}

const obtenerConfiguracionTema = (modo: PaletteMode, colorPrimario: string): Theme => createTheme({
  palette: {
    mode: modo,
    primary: {
      main: colorPrimario,
    },
    secondary: {
      main: '#b0bec5',
    },
    background: {
      default: modo === 'dark' ? '#0a0e17' : '#f4f6f9',
      paper: modo === 'dark' ? 'rgba(16, 24, 40, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          border: `1px solid ${modo === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '16px',
        },
      },
      
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          letterSpacing: '0.5px',
        },
      },
    },
  },
});

export const useConfigStore = create<EstadoApp>((set, get) => ({
  idioma: 'es',
  modo: 'dark',
  colorAcento: '#970FFA',
  tema: obtenerConfiguracionTema('dark', '#970FFA'),
  vistaActual: 'AUTENTICACION',
  actualizarConfiguracionGlobal: (nuevoModo, nuevoColorAcento) => {
    set({ modo: nuevoModo, colorAcento: nuevoColorAcento });
    set({ tema: obtenerConfiguracionTema(nuevoModo, nuevoColorAcento) });
  },

  cambiarIdioma: (nuevoIdioma) => {
    set({ idioma: nuevoIdioma });
  },
  cambiarVista: (nuevaVista) => {
    console.log(`Cambiando vista de ${get().vistaActual} a ${nuevaVista}`);
    set({ vistaActual: nuevaVista });
  },

}));