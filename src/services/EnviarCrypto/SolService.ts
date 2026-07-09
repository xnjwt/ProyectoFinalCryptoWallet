import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import { 
    IServicioRedCripto, 
    SolicitudTransferencia, 
    ResultadoConstruccion, 
    TransaccionNoFirmada, 
    ResultadoFirma, 
    TransaccionFirmada, 
    ResultadoTransmision 
} from './interfaces';
import { hayConexionAInternet } from './utilidades';

const ES_MAINNET = false; 

const DICCIONARIO_TOKENS_SOL: Record<string, { mainnet: string; devnet: string }> = {
    USDT: {
        mainnet: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        devnet: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4'
    },
    USDC: {
        mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        devnet: '4zMMC9srt5Ri5X14YGwaPNcgY61mNnQ6CgH9R9f7rG2C'
    }
};

function obtenerDireccionToken(simboloMoneda: string): string {
    const simbolo = simboloMoneda.toUpperCase();
    const entorno = ES_MAINNET ? 'mainnet' : 'devnet';
    const direccion = DICCIONARIO_TOKENS_SOL[simbolo]?.[entorno];

    if (!direccion) throw new Error(`El token ${simbolo} no tiene un Mint configurado para Solana.`);
    return direccion;
}

async function obtenerSaldoToken(direccion: string, mintToken: string, connection: Connection): Promise<number> {
    try {
        const direccionMint = new PublicKey(mintToken);
        const direccionAta = await getAssociatedTokenAddress(direccionMint, new PublicKey(direccion));
        const balance = await connection.getTokenAccountBalance(direccionAta);
        return balance.value.uiAmount ?? 0;
    } catch {
        return 0; 
    }
}

async function destinatarioRequiereAta(direccion: string, mintToken: string, connection: Connection): Promise<boolean> {
    try {
        const direccionMint = new PublicKey(mintToken);
        const direccionAta = await getAssociatedTokenAddress(direccionMint, new PublicKey(direccion));
        const infoCuenta = await connection.getAccountInfo(direccionAta);
        return infoCuenta === null; 
    } catch {
        return true;
    }
}

async function obtenerCostoRentaAta(connection: Connection): Promise<number> {
    const lamportsRenta = await connection.getMinimumBalanceForRentExemption(165);
    return lamportsRenta / 1000000000; 
}

async function construirPayload(
    solicitud: SolicitudTransferencia, 
    requiereAta: boolean, 
    mintToken: string, 
    connection: Connection
): Promise<any> {
    const tx = new Transaction();
    const origenPubkey = new PublicKey(solicitud.clavePublicaRemitente);
    const destinoPubkey = new PublicKey(solicitud.clavePublicaDestinatario);
    const mintPubkey = new PublicKey(mintToken);

    const ataOrigen = await getAssociatedTokenAddress(mintPubkey, origenPubkey);
    const ataDestino = await getAssociatedTokenAddress(mintPubkey, destinoPubkey);

    if (requiereAta) {
        tx.add(createAssociatedTokenAccountInstruction(origenPubkey, ataDestino, destinoPubkey, mintPubkey));
    }

    tx.add(createTransferInstruction(ataOrigen, ataDestino, origenPubkey, solicitud.cantidad * 1000000));
    
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = origenPubkey;

    return tx;
}

export class SolService implements IServicioRedCripto {
    private proveedorRpc: Connection;

    constructor(proveedorRpc: Connection) {
        this.proveedorRpc = proveedorRpc;
    }

    public async construir(solicitud: SolicitudTransferencia): Promise<ResultadoConstruccion> {
        try {
            new PublicKey(solicitud.clavePublicaDestinatario);
        } catch {
            return { exito: false, mensajeErrorAmigable: "Esa no parece ser una dirección válida de Solana. Confirma que la hayas copiado completa." };
        }

        const mintToken = obtenerDireccionToken(solicitud.simboloMoneda);
        const saldoToken = await obtenerSaldoToken(solicitud.clavePublicaRemitente, mintToken, this.proveedorRpc);

        if (saldoToken < solicitud.cantidad) {
            return { exito: false, mensajeErrorAmigable: `No tienes suficientes ${solicitud.simboloMoneda} para hacer este envío.` };
        }

        const saldoSOLInLamports = await this.proveedorRpc.getBalance(new PublicKey(solicitud.clavePublicaRemitente));
        const saldoSOL = saldoSOLInLamports / 1000000000;
        const comisionRedDeFirma = 0.000005; 

        if (saldoSOL < comisionRedDeFirma) {
            return { exito: false, mensajeErrorAmigable: "Necesitas tener una pequeña fracción de SOL en tu billetera para pagar el costo de usar la red de Solana." };
        }

        const necesitaCrearCuentaDestino = await destinatarioRequiereAta(solicitud.clavePublicaDestinatario, mintToken, this.proveedorRpc);
        const costoDeRentaCuenta = necesitaCrearCuentaDestino ? await obtenerCostoRentaAta(this.proveedorRpc) : 0;
        const requerimientoNativoTotal = comisionRedDeFirma + costoDeRentaCuenta;

        if (necesitaCrearCuentaDestino && saldoSOL < requerimientoNativoTotal) {
            return { exito: false, mensajeErrorAmigable: "El destinatario no tiene una cuenta para este token. Necesitas un poco más de SOL en tu saldo para poder activársela y pagar la red." };
        }

        const datosCrudos = await construirPayload(solicitud, necesitaCrearCuentaDestino, mintToken, this.proveedorRpc);

        return { 
            exito: true, 
            transaccionCruda: {
                red: 'SOLANA',
                datosCrudos: datosCrudos,
                comisionDeRedEstimada: requerimientoNativoTotal
            },
            comisionEstimada: requerimientoNativoTotal
        };
    }

    public async firmar(tx: TransaccionNoFirmada, clavePrivada: string): Promise<ResultadoFirma> {
        try {
            const keypairGenerado = Keypair.fromSecretKey(bs58.decode(clavePrivada));
            if (tx.datosCrudos.feePayer && keypairGenerado.publicKey.toBase58() !== tx.datosCrudos.feePayer.toBase58()) {
                return { exito: false, mensajeErrorAmigable: "Esta clave privada pertenece a otra cuenta de Solana, no a la que está enviando los fondos." };
            }
            tx.datosCrudos.sign(keypairGenerado);
            return { exito: true, transaccionSerializada: tx.datosCrudos.serialize() };
        } catch {
            return { exito: false, mensajeErrorAmigable: "La clave privada de Solana es inválida o no tiene el formato correcto (Base58)." };
        }
    }

    public async transmitir(txFirmada: TransaccionFirmada): Promise<ResultadoTransmision> {
        if (!hayConexionAInternet()) {
            return { exito: false, mensajeErrorAmigable: "No tienes conexión a internet. La transacción está firmada y segura en tu dispositivo, pero no podemos enviarla aún." };
        }
        try {
            const txHash = await this.proveedorRpc.sendTransaction(txFirmada.transaccionSerializada);
            return { exito: true, hashTransaccion: txHash };
        } catch (error: any) {
            const mensajeError = error.message || "";
            if (mensajeError.includes('BlockhashNotFound') || mensajeError.includes('expired')) {
                return { exito: false, mensajeErrorAmigable: "Tardaste un poco en confirmar y la red requiere actualizar los datos de seguridad. Cierra esta ventana e intenta el envío de nuevo." };
            }
            if (mensajeError.includes('429')) {
                return { exito: false, mensajeErrorAmigable: "El servidor de la red está saturado recibiendo peticiones. Intenta enviar en unos segundos." };
            }
            return { exito: false, mensajeErrorAmigable: "La red de Solana rechazó el envío. Verifica que tengas suficiente SOL para la transacción." };
        }
    }
}