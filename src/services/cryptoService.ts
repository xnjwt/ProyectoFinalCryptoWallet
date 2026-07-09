import * as bip39 from 'bip39'; 
import { derivePath } from 'ed25519-hd-key'; 
import { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'; 

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
  const tokenQuery = token ? `&spl-token=${token}` : ''; 
  return `${baseScheme}:${address}?amount=${amount}${tokenQuery}`; 
};

// --- Conexión a la red de pruebas (Devnet) de Solana ---
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const getSolanaBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error al obtener saldo de Solana:', error);
    return 0;
  }
};

// --- Saldo de tokens SPL (como USDC) ---
const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export const getSplTokenBalance = async (
  ownerAddress: string,
  mintAddress: string
): Promise<number> => {
  try {
    const owner = new PublicKey(ownerAddress);
    const mint = new PublicKey(mintAddress);

    const cuentas = await connection.getParsedTokenAccountsByOwner(owner, { mint });

    if (cuentas.value.length === 0) return 0;

    const total = cuentas.value.reduce((acumulado, cuenta) => {
      const monto = cuenta.account.data.parsed.info.tokenAmount.uiAmount || 0;
      return acumulado + monto;
    }, 0);

    return total;
  } catch (error) {
    console.error('Error al obtener saldo del token SPL:', error);
    return 0;
  }
};

export const getUsdcBalance = (ownerAddress: string): Promise<number> => {
  return getSplTokenBalance(ownerAddress, USDC_DEVNET_MINT);
};

export const parseCryptoUri = (uri: string, redesDisponibles: string[]) => {
  try {
    if (!uri.includes(':')) {
      return { direccion: uri };
    }

    const url = new URL(uri);
    const redProtocolo = url.protocol.replace(':', '');
    const params = new URLSearchParams(url.search);

    const redMapeada = redesDisponibles.find(
      (r) => r.toLowerCase() === redProtocolo.toLowerCase()
    );

    return {
      direccion: url.pathname,
      monto: params.get('amount') || undefined,
      token: params.get('spl-token') || undefined,
      red: redMapeada
    };
  } catch {
    return { direccion: uri };
  }
};