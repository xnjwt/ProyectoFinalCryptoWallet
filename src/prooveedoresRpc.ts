import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { ServicioTransferencia } from './services/EnviarCrypto/SendService';
import { EvmService } from './services/EnviarCrypto/EvmService';
import { SolService } from './services/EnviarCrypto/SolService';
import { BtcService } from './services/EnviarCrypto/BtcService';

const proveedorEvm = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/xGelSHyeEkaRxElMHLm5Z");
const proveedorSolana = new Connection("https://devnet.helius-rpc.com/?api-key=3f1aa3ac-1954-46ec-a1e4-41363d948775", "confirmed");

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