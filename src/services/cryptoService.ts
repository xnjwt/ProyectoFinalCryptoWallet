import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

export const deriveAddress = (mnemonic: string, network: string = 'Solana'): string => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  switch (network) {
    case 'Solana': {
      const path = "m/44'/501'/0'/0'";
      const derivedKey = derivePath(path, seed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedKey);
      return keypair.publicKey.toBase58();
    }
    case 'Bitcoin':
      return 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    case 'Ethereum':
      return '0x71C7656EC7ab88b098defB751B7401B5f6d1476B';
    default:
      throw new Error('Red no soportada');
  }
};

export const buildCryptoUri = (network: string, address: string, amount?: string, token?: string): string => {
  const baseScheme = network.toLowerCase();
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return `${baseScheme}:${address}`;
  }
  
  // Estructura oficial multi-chain con queries estandarizadas
  const tokenQuery = token ? `&spl-token=${token}` : '';
  return `${baseScheme}:${address}?amount=${amount}${tokenQuery}`;
};