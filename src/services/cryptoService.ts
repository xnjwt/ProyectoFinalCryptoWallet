
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'; 
import { proveedorSolana} from './../prooveedoresRpc';
import { obtenerClavesPublicas } from './walletService';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const EsMainNet = false;

export const buildCryptoUri = (network: string, address: string, amount?: string, token?: string): string => { 
  const baseScheme = network.toLowerCase(); 
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { 
    return `${baseScheme}:${address}`; 
  } 
  const tokenQuery = token ? `&spl-token=${token}` : ''; 
  return `${baseScheme}:${address}?amount=${amount}${tokenQuery}`; 
};

// --- Conexión a la red de pruebas (Devnet) de Solana ---
const connection = proveedorSolana;

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

const TOKENS_SOL: Record<string, { mainnet: string; devnet: string }> = {
    USDT: {
        mainnet: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        devnet: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4'
    },
    USDC: {
        mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
    }
};
function obtenerDireccionToken(simbolo: string): string {
    const entorno = EsMainNet ? 'mainnet' : 'devnet';
    const direccion = TOKENS_SOL[simbolo.toUpperCase()]?.[entorno];
    
    if (!direccion) throw new Error("Token no soportado en la configuración");
    return direccion;
}

export async function obtenerSaldo(simboloMoneda: string): Promise<number> {
    const miDireccion = obtenerClavesPublicas('solana') as string;
    const pubkey = new PublicKey(miDireccion);

    if (simboloMoneda.toUpperCase() === 'SOL') {
        try {
            const balanceLamports = await proveedorSolana.getBalance(pubkey);
            return balanceLamports / 1000000000;
        } catch {
            return 0;
        }
    }

    try {
        const mintPubkey = new PublicKey(obtenerDireccionToken(simboloMoneda));
        const ata = await getAssociatedTokenAddress(mintPubkey, pubkey);
        const balance = await proveedorSolana.getTokenAccountBalance(ata);
        return balance.value.uiAmount ?? 0;
    } catch {
        return 0;
    }
}

// --- Saldo de tokens SPL (como USDC) ---
const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';




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