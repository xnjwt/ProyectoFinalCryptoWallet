import * as bip39 from 'bip39';
export const generateSeedPhrase = (): string => {
  return bip39.generateMnemonic(128);
};
export const saveSeedToStorage = (seed: string): void => {
  localStorage.setItem('wallet_seed', seed);
};
export const getSeedFromStorage = (): string | null => {
  return localStorage.getItem('wallet_seed');
};
export const clearSeedFromStorage = (): void => {
  localStorage.removeItem('wallet_seed');
};
export const validateSeedOrder = (originalSeed: string, inputtedSeed: string[]): boolean => {
  return originalSeed === inputtedSeed.join(' ');
};
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};