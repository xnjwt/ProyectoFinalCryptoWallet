import { ethers } from 'ethers';
import { 
    IServicioRedCripto, 
    SolicitudTransferencia, 
    ResultadoConstruccion, 
    TransaccionNoFirmada, 
    ResultadoFirma, 
    TransaccionFirmada, 
    ResultadoTransmision,
} from './interfaces';

import { hayConexionAInternet } from './utilidades';

const ES_MAINNET = false; // Ajustar según tu entorno o variable de entorno

const DICCIONARIO_TOKENS_EVM: Record<string, { mainnet: string; devnet: string }> = {
    USDT: {
        mainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        devnet: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
    },
    USDC: {
        mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        devnet: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
};

function obtenerDireccionToken(simboloMoneda: string): string {
    const simbolo = simboloMoneda.toUpperCase();
    const entorno = ES_MAINNET ? 'mainnet' : 'devnet';
    const direccion = DICCIONARIO_TOKENS_EVM[simbolo]?.[entorno];

    if (!direccion) throw new Error(`El token ${simbolo} no tiene un contrato configurado para EVM.`);
    return direccion;
}

async function esContratoInteligente(direccion: string, provider: ethers.JsonRpcProvider): Promise<boolean> {
    try {
        const codigo = await provider.getCode(direccion);
        return codigo !== '0x' && codigo !== '0x00';
    } catch {
        return false;
    }
}

async function contratoAceptaFondos(direccion: string, provider: ethers.JsonRpcProvider): Promise<boolean> {
    try {
        await provider.call({
            to: direccion,
            value: ethers.parseEther("0.00001") 
        });
        return true;
    } catch {
        return false;
    }
}

async function estimarCostoGasEvm(
    solicitud: SolicitudTransferencia, 
    provider: ethers.JsonRpcProvider, 
    contratoToken: string
): Promise<number> {
    const tarifaPorGas = await provider.getFeeData();
    const precioGas = tarifaPorGas.gasPrice ?? ethers.parseUnits('20', 'gwei');

    if (solicitud.simboloMoneda.toUpperCase() === 'ETH') {
        const unidadesGas = await provider.estimateGas({
            from: solicitud.clavePublicaRemitente,
            to: solicitud.clavePublicaDestinatario,
            value: ethers.parseEther(solicitud.cantidad.toString())
        });
        return Number(ethers.formatEther(unidadesGas * precioGas));
    }

    const interfazToken = new ethers.Interface(['function transfer(address to, uint256 amount)']);
    const datosContrato = interfazToken.encodeFunctionData('transfer', [
        solicitud.clavePublicaDestinatario,
        ethers.parseUnits(solicitud.cantidad.toString(), 6)
    ]);

    const unidadesGasToken = await provider.estimateGas({
        from: solicitud.clavePublicaRemitente,
        to: contratoToken,
        data: datosContrato
    });

    return Number(ethers.formatEther(unidadesGasToken * precioGas));
}

function construirPayloadEvm(
    solicitud: SolicitudTransferencia, 
    contratoToken: string, 
    nonce: number
): any {
    if (solicitud.simboloMoneda.toUpperCase() === 'ETH') {
        return {
            to: solicitud.clavePublicaDestinatario,
            value: ethers.parseEther(solicitud.cantidad.toString()).toString(),
            nonce: nonce,
            chainId: 1 
        };
    }

    const interfazToken = new ethers.Interface(['function transfer(address to, uint256 amount)']);
    
    return {
        to: contratoToken,
        data: interfazToken.encodeFunctionData('transfer', [
            solicitud.clavePublicaDestinatario,
            ethers.parseUnits(solicitud.cantidad.toString(), 6)
        ]),
        nonce: nonce,
        chainId: 1
    };
}

export class EvmService implements IServicioRedCripto {
    private proveedorRpcEvm: ethers.JsonRpcProvider;

    constructor(proveedorRpcEvm: ethers.JsonRpcProvider) {
        this.proveedorRpcEvm = proveedorRpcEvm;
    }

    public async construir(solicitud: SolicitudTransferencia): Promise<ResultadoConstruccion> {
        if (!ethers.isAddress(solicitud.clavePublicaDestinatario)) {
            return { exito: false, mensajeErrorAmigable: "La dirección debe empezar con '0x' y tener el formato correcto de Ethereum." };
        }

        const esContrato = await esContratoInteligente(solicitud.clavePublicaDestinatario, this.proveedorRpcEvm);
        const aceptaFondos = esContrato ? await contratoAceptaFondos(solicitud.clavePublicaDestinatario, this.proveedorRpcEvm) : true;

        if (!aceptaFondos) {
            return { exito: false, mensajeErrorAmigable: "Estás intentando enviar fondos a un contrato inteligente que no está programado para recibirlos. Podrías perder tu dinero." };
        }

        const contratoToken = obtenerDireccionToken(solicitud.simboloMoneda);
        const costoDelGasEstimado = await estimarCostoGasEvm(solicitud, this.proveedorRpcEvm, contratoToken);
        const saldoETHCrudo = await this.proveedorRpcEvm.getBalance(solicitud.clavePublicaRemitente);
        const saldoETH = Number(ethers.formatEther(saldoETHCrudo));

        if (saldoETH < costoDelGasEstimado) {
            return { exito: false, mensajeErrorAmigable: "Te has quedado sin ETH suficiente para pagar la tarifa del gas. Recarga un poco de ETH para mover tus tokens." };
        }
        
        const nonce = await this.proveedorRpcEvm.getTransactionCount(solicitud.clavePublicaRemitente);
        const datosCrudos = construirPayloadEvm(solicitud, contratoToken, nonce);

        return { 
            exito: true, 
            transaccionCruda: {
                red: 'ETHEREUM',
                datosCrudos: datosCrudos,
                comisionDeRedEstimada: costoDelGasEstimado
            },
            comisionEstimada: costoDelGasEstimado
        };
    }

    public async firmar(tx: TransaccionNoFirmada, clavePrivada: string): Promise<ResultadoFirma> {
        try {
            const billetera = new ethers.Wallet(clavePrivada);

            if (tx.datosCrudos.from && billetera.address.toLowerCase() !== tx.datosCrudos.from.toLowerCase()) {
                return { exito: false, mensajeErrorAmigable: "La clave privada ingresada no corresponde a la billetera desde la que intentas enviar los fondos." };
            }

            const payloadLimpio = { ...tx.datosCrudos };
            delete payloadLimpio.from;

            const transaccionFirmada = await billetera.signTransaction(payloadLimpio);
            
            return { exito: true, transaccionSerializada: transaccionFirmada };
        } catch (error) {
            return { exito: false, mensajeErrorAmigable: "La clave privada es inválida o ocurrió un error matemático al firmar en Ethereum." };
        }
    }

    public async transmitir(txFirmada: TransaccionFirmada): Promise<ResultadoTransmision> {
        if (!hayConexionAInternet()) {
            return { exito: false, mensajeErrorAmigable: "Revisa tu conexión a internet para poder transmitir la transacción." };
        }

        try {
            // La corrección técnica de ethers v6
            const respuestaTx = await this.proveedorRpcEvm.broadcastTransaction(txFirmada.transaccionSerializada);
            return { exito: true, hashTransaccion: respuestaTx.hash };
        } catch (error: any) {
            const mensajeError = error.message || "";

            // Tus validaciones originales restauradas (¡No dejes que nadie las quite, son genial UX!)
            if (mensajeError.includes('nonce too low')) {
                return { exito: false, mensajeErrorAmigable: "Parece que esta transacción ya fue enviada a la red o está en proceso. Revisa tu historial." };
            }

            if (mensajeError.includes('replacement transaction underpriced')) {
                return { exito: false, mensajeErrorAmigable: "Hay una transacción anterior atascada. Para destrabarla, necesitas enviar esta con una comisión de red más alta." };
            }

            return { exito: false, mensajeErrorAmigable: "El nodo de Ethereum no pudo procesar el envío. Inténtalo más tarde." };
        }
    }
}