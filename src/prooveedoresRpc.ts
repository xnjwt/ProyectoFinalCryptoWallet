import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { ServicioTransferencia } from './services/EnviarCrypto/SendService';
import { EvmService } from './services/EnviarCrypto/EvmService';
import { SolService } from './services/EnviarCrypto/SolService';
import { BtcService } from './services/EnviarCrypto/BtcService';

const proveedorEvm = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY");
const proveedorSolana = new Connection("https://mainnet.helius-rpc.com/?api-key=TU_API_KEY");

const rpcBitcoinAdapter = {
    sendRawTransaction: async (txHex: string): Promise<string> => {
        const respuesta = await fetch('https://mempool.space/api/tx', {
            method: 'POST',
            body: txHex
        });
        if (!respuesta.ok) throw new Error(await respuesta.text());
        return await respuesta.text();
    }
};

export const orquestadorBilletera = new ServicioTransferencia(
    new EvmService(proveedorEvm),
    new SolService(proveedorSolana),
    new BtcService(rpcBitcoinAdapter) 
);

export { proveedorEvm, proveedorSolana };