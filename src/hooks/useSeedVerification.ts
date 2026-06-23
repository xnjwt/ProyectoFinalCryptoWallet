import { useState, useEffect } from 'react';
import { shuffleArray, validateSeedOrder } from '../services/walletService';

export const useSeedVerification = (originalSeed: string) => {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  useEffect(() => {
    const words = originalSeed.split(' ');
    setAvailableWords(shuffleArray(words));
    setSelectedWords([]);
    setValidationResult(null);
  }, [originalSeed]);

  const selectWord = (word: string) => {
    setAvailableWords((prev) => prev.filter((w) => w !== word));
    setSelectedWords((prev) => [...prev, word]);
  };

  const deselectWord = (word: string) => {
    setSelectedWords((prev) => prev.filter((w) => w !== word));
    setAvailableWords((prev) => [...prev, word]);
  };

  const resetVerification = () => {
    const words = originalSeed.split(' ');
    setAvailableWords(shuffleArray(words));
    setSelectedWords([]);
    setValidationResult(null);
  };

  const verify = () => {
    const isValid = validateSeedOrder(originalSeed, selectedWords);
    setValidationResult(isValid);
    
    if (!isValid) {
      setTimeout(() => {
        resetVerification();
      }, 1500);
    }
    
    return isValid;
  };

  return {
    availableWords,
    selectedWords,
    validationResult,
    selectWord,
    deselectWord,
    resetVerification,
    verify,
  };
};