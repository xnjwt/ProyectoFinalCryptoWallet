import { Paper, Typography, Box } from '@mui/material';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: { titulo: 'Actividad Reciente', vacio: 'Aún no has realizado ninguna transacción' },
  en: { titulo: 'Recent Activity', vacio: "You haven't made any transactions yet" },
};

export const RecentActivity = () => {
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        {t.titulo}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
        <Typography color="text.secondary" fontStyle="italic" align="center" variant="body2">
          {t.vacio}
        </Typography>
      </Box>
    </Paper>
  );
};