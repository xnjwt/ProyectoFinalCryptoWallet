
type RedSoportada = 'SOLANA' | 'ETHEREUM' | 'BITCOIN';
const ES_MAINNET =  false;

export interface SolicitudTransferencia {
    red: RedSoportada;
    clavePublicaRemitente: string;
    clavePublicaDestinatario: string;
    simboloMoneda: string;
    cantidad: number;
    decimalesMoneda: number;
}


export interface TransaccionNoFirmada {
    red: RedSoportada;
    datosCrudos: any;
    comisionDeRedEstimada: number;
}


export interface TransaccionFirmada {
    red: RedSoportada;
    transaccionSerializada: any;
}

export interface ReciboTransaccion {
    exito: boolean;
    hashTransaccion: string;
}

export interface ResultadoConstruccion {
    exito: boolean;
    transaccionCruda?: any;
    comisionEstimada?: number;
    mensajeErrorAmigable?: string; 
}

export interface ResultadoFirma {
    exito: boolean;
    transaccionSerializada?: any;
    mensajeErrorAmigable?: string;
}

export interface ResultadoTransmision {
    exito: boolean;
    hashTransaccion?: string; 
    mensajeErrorAmigable?: string;
}

export interface IServicioRedCripto {
    construir(solicitud: SolicitudTransferencia): Promise<ResultadoConstruccion>;
    firmar(txCruda: TransaccionNoFirmada, clavePrivada: string): Promise<ResultadoFirma>;
    transmitir(txFirmada: TransaccionFirmada): Promise<ResultadoTransmision>;
}