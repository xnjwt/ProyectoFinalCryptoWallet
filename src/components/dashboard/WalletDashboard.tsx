import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AssetTabs } from './AssetTabs';
import RecibirCripto from '../recibirCrypto/RecibirCripto';
import { EnviarCrypto } from '../EnviarCrypto/EnviarCrypto';
import { Configuracion } from './Configuracion';
import { useConfigStore } from '../../store/configStore';
import { RecentActivity } from './RecentActivity';
import { usePortfolioStore } from '../../store/portfolioStore';


const textos = {
  es: { valorTotal: 'Valor Total del Portafolio', enviar: 'Enviar', recibir: 'Recibir' },
  en: { valorTotal: 'Total Portfolio Value', enviar: 'Send', recibir: 'Receive' },
};

interface WalletDashboardProps {
  onLogout: () => void;
}

export const WalletDashboard = ({ onLogout }: WalletDashboardProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const vistaActual = useConfigStore((state) => state.vistaActual);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  const isPanelOpen = vistaActual === 'CONFIGURACION' || vistaActual === 'RECIBIR_CRYPTO' || vistaActual === 'ENVIAR_CRYPTO';

  const totalUsd = usePortfolioStore((state) => state.totalUsd);
  const actualizarPortafolio = usePortfolioStore((state) => state.actualizarPortafolio);

useEffect(() => {
  actualizarPortafolio();
  const intervalId = setInterval(actualizarPortafolio, 15000);
  return () => clearInterval(intervalId);
}, [actualizarPortafolio]);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <Box component="main" sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
          <Header onMenuClick={() => setIsSidebarOpen(true)} onLogout={onLogout} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography color="text.secondary">{t.valorTotal}</Typography>
              <Typography variant="h3" fontWeight="bold">
              ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => cambiarVista('ENVIAR_CRYPTO')}
                sx={{ flex: { xs: 1, sm: 'none' }, px: 4, py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}
              >
                {t.enviar}
              </Button>
              <Button
                variant="outlined"
                onClick={() => cambiarVista('RECIBIR_CRYPTO')}
                sx={{ flex: { xs: 1, sm: 'none' }, px: 4, py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}
              >
                {t.recibir}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Box sx={{ gridColumn: { lg: 'span 2' } }}>
              <AssetTabs />
            </Box>
            <Box>
              <RecentActivity />
           </Box>
          </Box>
        </Box>

        {/* Panel lateral: Configuración o Recibir */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '100%',
            bgcolor: 'background.default',
            zIndex: 20,
            overflowY: 'auto',
            transform: isPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 0 }}>
            <IconButton onClick={() => cambiarVista('DASHBOARD')} color="inherit">
              <ArrowLeft size={22} />
            </IconButton>
          </Box>

          {vistaActual === 'RECIBIR_CRYPTO' && <RecibirCripto />}
          {vistaActual === 'CONFIGURACION' && <Configuracion />}
          {vistaActual === 'ENVIAR_CRYPTO' && <EnviarCrypto />}
        </Box>
      </Box>
    </Box>
  );
};