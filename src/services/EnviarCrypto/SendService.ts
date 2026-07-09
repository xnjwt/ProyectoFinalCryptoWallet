import { 
    IServicioRedCripto, 
    SolicitudTransferencia, 
    ResultadoConstruccion, 
    TransaccionNoFirmada, 
    ResultadoFirma, 
    TransaccionFirmada, 
    ResultadoTransmision 
} from './interfaces';

export class ServicioTransferencia {
    
    private servicios: Record<string, IServicioRedCripto>;

    constructor(
        servicioEvm: IServicioRedCripto,
        servicioSolana: IServicioRedCripto,
        servicioBitcoin: IServicioRedCripto
    ) {
        this.servicios = {
            'ETHEREUM': servicioEvm,
            'SOLANA': servicioSolana,
            'BITCOIN': servicioBitcoin
        };
    }
    
    public async construir(solicitud: SolicitudTransferencia): Promise<ResultadoConstruccion> {
        const servicio = this.servicios[solicitud.red];
        
        if (!servicio) {
            throw new Error("Red no soportada");
        }
        
        return servicio.construir(solicitud);
    }

    public async firmar(transaccionCruda: TransaccionNoFirmada, clavePrivada: string): Promise<ResultadoFirma> {
        const servicio = this.servicios[transaccionCruda.red];
        
        if (!servicio) {
            throw new Error("Red no soportada");
        }
        
        return servicio.firmar(transaccionCruda, clavePrivada);
    }

    public async transmitir(txFirmada: TransaccionFirmada): Promise<ResultadoTransmision> {
        const servicio = this.servicios[txFirmada.red];
        
        if (!servicio) {
            throw new Error("Red no soportada");
        }
        
        return servicio.transmitir(txFirmada);
    }
}