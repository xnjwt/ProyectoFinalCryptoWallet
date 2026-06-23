import { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, Paper } from '@mui/material';

interface Props {
  seedPhrase: string;
  onNext: () => void;
}

export const SeedPhraseDisplay = ({ seedPhrase, onNext }: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const words = seedPhrase.split(' ');

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" color="primary" gutterBottom align="center" fontWeight="bold">
        Tu Frase Semilla
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Anota estas 12 palabras en orden. Las necesitarás en el siguiente paso.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mb: 4 }}>
        {words.map((word, index) => (
          <Chip
            key={`${word}-${index}`}
            label={`${index + 1}. ${word}`}
            color="primary"
            variant="outlined"
            sx={{ px: 1, py: 2.5, fontSize: '1rem' }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          disabled={secondsLeft > 0}
          onClick={onNext}
          sx={{ width: '100%', py: 1.5, fontWeight: 'bold' }}
        >
          {secondsLeft > 0 ? `Espera ${secondsLeft} segundos...` : 'Siguiente'}
        </Button>
      </Box>
    </Paper>
  );
};