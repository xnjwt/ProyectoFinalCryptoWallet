import { Box, Typography, Button, Chip, Paper, Alert } from '@mui/material';
import { useSeedVerification } from '../../hooks/useSeedVerification';

interface Props {
  originalSeed: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const SeedPhraseVerification = ({ originalSeed, onSuccess, onBack }: Props) => {
  const {
    availableWords,
    selectedWords,
    validationResult,
    selectWord,
    deselectWord,
    resetVerification,
    verify,
  } = useSeedVerification(originalSeed);

  const handleVerify = () => {
    const isValid = verify();
    if (isValid) {
      setTimeout(onSuccess, 1500);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" color="primary" gutterBottom align="center" fontWeight="bold">
        Verifica tu Semilla
      </Typography>

      <Box
        sx={{
          minHeight: 120,
          p: 2,
          border: '1px dashed rgba(255,255,255,0.3)',
          borderRadius: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: 1,
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      >
        {selectedWords.map((word, index) => (
          <Chip
            key={`selected-${word}-${index}`}
            label={word}
            color="primary"
            onClick={() => deselectWord(word)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4, justifyContent: 'center' }}>
        {availableWords.map((word, index) => (
          <Chip
            key={`available-${word}-${index}`}
            label={word}
            variant="outlined"
            onClick={() => selectWord(word)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {validationResult !== null && (
        <Alert severity={validationResult ? 'success' : 'error'} sx={{ mb: 3 }}>
          {validationResult ? 'Orden correcto' : 'Orden incorrecto'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={onBack} fullWidth>
          Volver a anotar
        </Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          fullWidth
          disabled={selectedWords.length !== 12 || validationResult === true}
        >
          Validar
        </Button>
      </Box>
    </Paper>
  );
};