import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
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

const ECPair = ECPairFactory(ecc);

const ES_MAINNET = false; 
const RED_BITCOIN = ES_MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
const LIMITE_POLVO_BTC = 546;

async function obtenerUtxosDisponibles(direccion: string): Promise<any[]> {
    const networkPath = ES_MAINNET ? '' : 'testnet/';
    const respuesta = await fetch(`https://mempool.space/${networkPath}api/address/${direccion}/utxo`);
    if (!respuesta.ok) return [];
    return await respuesta.json();
}

async function obtenerPrecioByte(): Promise<number> {
    const networkPath = ES_MAINNET ? '' : 'testnet/';
    const respuesta = await fetch(`https://mempool.space/${networkPath}api/v1/fees/recommended`);
    if (!respuesta.ok) return 20;
    const tarifas = await respuesta.json();
    return tarifas.halfHourFee;
}

function calcularComisionEstimada(cantidadUtxos: number, precioByte: number): number {
    const tamañoAproximadoBytes = (cantidadUtxos * 148) + (2 * 34) + 10;
    
    // Devolvemos la comisión en SATOSHIS enteros, no en BTC decimales
    return tamañoAproximadoBytes * precioByte; 
}

function construirPayload(solicitud: SolicitudTransferencia, utxos: any[], comisionSatoshis: number): any {
    const psbt = new bitcoin.Psbt({ network: RED_BITCOIN });
    let acumuladoUtxos = 0;
    const cantidadSatoshisAEnviar = Math.floor(solicitud.cantidad * 100000000); 

    for (const utxo of utxos) {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            nonWitnessUtxo: Buffer.from(utxo.rawTxHex || '', 'hex') 
        });
        acumuladoUtxos += utxo.value;
        if (acumuladoUtxos >= (cantidadSatoshisAEnviar + comisionSatoshis)) break;
    }

    // APLICAMOS BigInt PARA SOLUCIONAR EL ERROR DE TIPOS
    psbt.addOutput({
        address: solicitud.clavePublicaDestinatario,
        value: BigInt(cantidadSatoshisAEnviar)
    });

    const cambio = acumuladoUtxos - cantidadSatoshisAEnviar - comisionSatoshis;
    if (cambio > LIMITE_POLVO_BTC) {
        // APLICAMOS BigInt AQUÍ TAMBIÉN
        psbt.addOutput({
            address: solicitud.clavePublicaRemitente,
            value: BigInt(Math.floor(cambio))
        });
    }

    return psbt;
}

export interface RpcBitcoin {
    sendRawTransaction(txSerializada: string): Promise<string>;
}

export class BtcService implements IServicioRedCripto {
    private proveedorRpc: RpcBitcoin;

    constructor(proveedorRpc: RpcBitcoin) {
        this.proveedorRpc = proveedorRpc;
    }

    public async construir(solicitud: SolicitudTransferencia): Promise<ResultadoConstruccion> {
        try {
            bitcoin.address.toOutputScript(solicitud.clavePublicaDestinatario, RED_BITCOIN);
        } catch {
            return { exito: false, mensajeErrorAmigable: "La dirección de destino parece tener un error de escritura. Por favor, revísala bien." };
        }

        const cantidadSatoshis = Math.floor(solicitud.cantidad * 100000000);
        if (cantidadSatoshis < LIMITE_POLVO_BTC) {
            return { exito: false, mensajeErrorAmigable: "El monto que intentas enviar es demasiado pequeño y la red lo rechazaría. Intenta enviar una cantidad mayor." };
        }

        const utxosDisponibles = await obtenerUtxosDisponibles(solicitud.clavePublicaRemitente);
        const saldoTotalSatoshis = utxosDisponibles.reduce((acumulador, utxo) => acumulador + utxo.value, 0);

        if (saldoTotalSatoshis < cantidadSatoshis) {
            return { exito: false, mensajeErrorAmigable: "No tienes suficientes Bitcoin para realizar este envío." };
        }

        const precioPorByte = await obtenerPrecioByte();
        
        // AQUÍ USAMOS LA FUNCIÓN CORRECTAMENTE
        const comisionCalculadaSatoshis = calcularComisionEstimada(utxosDisponibles.length, precioPorByte);

        if (saldoTotalSatoshis < (cantidadSatoshis + comisionCalculadaSatoshis)) {
            return { exito: false, mensajeErrorAmigable: "Tienes suficientes fondos para el envío, pero te falta un poco más para cubrir la comisión de la red." };
        }

        const datosCrudos = construirPayload(solicitud, utxosDisponibles, comisionCalculadaSatoshis);
        
        // Convertimos a BTC solo al final para mostrarlo en la interfaz (ResultadoConstruccion)
        const comisionEnBtc = comisionCalculadaSatoshis / 100000000;

        return { 
            exito: true, 
            transaccionCruda: {
                red: 'BITCOIN',
                datosCrudos: datosCrudos,
                comisionDeRedEstimada: comisionEnBtc
            },
            comisionEstimada: comisionEnBtc
        };
    }

    public async firmar(tx: TransaccionNoFirmada, clavePrivada: string): Promise<ResultadoFirma> {
        try {
            const parDeClaves = ECPair.fromWIF(clavePrivada, RED_BITCOIN);
            
            tx.datosCrudos.signAllInputs(parDeClaves);
            tx.datosCrudos.finalizeAllInputs();

            const transaccionHex = tx.datosCrudos.extractTransaction().toHex();

            return { exito: true, transaccionSerializada: transaccionHex };
        } catch (error) {
            return { exito: false, mensajeErrorAmigable: "La clave WIF es inválida o no es la dueña de los fondos que intentas gastar." };
        }
    }

    public async transmitir(txFirmada: TransaccionFirmada): Promise<ResultadoTransmision> {
        if (!hayConexionAInternet()) {
            return { exito: false, mensajeErrorAmigable: "Sin conexión a internet. Intenta conectarte para hacer el envío." };
        }

        try {
            const txHash = await this.proveedorRpc.sendRawTransaction(txFirmada.transaccionSerializada);
            return { exito: true, hashTransaccion: txHash };
        } catch (error: any) {
            const mensajeError = error.message || "";

            if (mensajeError.includes('bad-txns-inputs-spent') || mensajeError.includes('txn-mempool-conflict')) {
                return { exito: false, mensajeErrorAmigable: "Los fondos que intentas usar ya se están procesando en otro envío. Espera a que se confirme la transacción anterior." };
            }

            if (mensajeError.includes('mempool min fee not met')) {
                return { exito: false, mensajeErrorAmigable: "La red de Bitcoin se congestionó de repente y tu comisión se quedó corta. Vuelve a intentar para recalcular el costo." };
            }

            return { exito: false, mensajeErrorAmigable: "La red de Bitcoin rechazó la transacción por un problema de validación interna." };
        }
    }
}