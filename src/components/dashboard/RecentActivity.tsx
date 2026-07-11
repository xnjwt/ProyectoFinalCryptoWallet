import { Paper, Typography, Box, Avatar } from '@mui/material';
import { ArrowDownLeft } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { useActivityStore } from '../../store/ActivityStore';

const textos = {
  es: { titulo: 'Actividad Reciente', vacio: 'Aún no has realizado ninguna transacción', recibiste: 'Recibiste' },
  en: { titulo: 'Recent Activity', vacio: "You haven't made any transactions yet", recibiste: 'Received' },
};

const formatearFecha = (timestamp: number, idioma: 'es' | 'en') =>
  new Date(timestamp).toLocaleString(idioma === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

export const RecentActivity = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const actividades = useActivityStore((state) => state.actividades);

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        {t.titulo}
      </Typography>

      {actividades.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
          <Typography color="text.secondary" fontStyle="italic" align="center" variant="body2">
            {t.vacio}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {actividades.map((actividad) => (
            <Box key={actividad.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, transition: 'background-color 0.2s', '&:hover': { backgroundColor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                  <ArrowDownLeft size={18} />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" variant="body2">{t.recibiste} {actividad.symbol}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatearFecha(actividad.fecha, idioma)}</Typography>
                </Box>
              </Box>
              <Typography fontWeight="bold" color="success.main" variant="body2">
                +{actividad.cantidad.toFixed(4)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};