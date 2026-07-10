import { Keypair } from '@solana/web3.js';

import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { ethers } from 'ethers';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export const generarFraseSemilla = (): string => {
  return bip39.generateMnemonic(128);
};

export const importarBilletera = async (seedPhrase: string, password?: string): Promise<boolean> => {
    // 1. Validar la frase estructuralmente contra el estándar BIP39
    const esValida = bip39.validateMnemonic(seedPhrase);
    if (!esValida) {
        throw new Error("BIP39_INVALIDO");
    }

    await guardarSemilla(seedPhrase, password);


    const direccionesPublicas = derivarSemilla(seedPhrase);
    guardarClavesPublicas(direccionesPublicas);

    return true;
};

interface ClavesPublicas {
    solana: string;
    bitcoin: string;
    ethereum: string;
}

type RedCripto = 'solana' | 'bitcoin' | 'ethereum';

export const guardarClavesPublicas = (direcciones: ClavesPublicas): void => {
    localStorage.setItem('wallet_public_keys', JSON.stringify(direcciones));
};

export function obtenerClavesPublicas(): ClavesPublicas;
export function obtenerClavesPublicas(red: RedCripto): string;
export function obtenerClavesPublicas(red: RedCripto | null): ClavesPublicas | string;
export function obtenerClavesPublicas(red: RedCripto | null = null): ClavesPublicas | string {
    const datos = localStorage.getItem('wallet_public_keys');
    
    if (!datos) {
        return red ? '' : { solana: '', bitcoin: '', ethereum: '' };
    }

    const claves: ClavesPublicas = JSON.parse(datos);

    if (!red) {
        return claves;
    }

    const redNormalizada = red.toLowerCase() as RedCripto;
    return claves[redNormalizada] || '';
}

export const derivarSemilla = (mnemonic: string): ClavesPublicas => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    const pathSolana = "m/44'/501'/0'/0'";
    const derivedKeySolana = derivePath(pathSolana, seed.toString('hex')).key;
    const solana = Keypair.fromSeed(derivedKeySolana).publicKey.toBase58();

    const rootBtc = bip32.fromSeed(seed);
    const childBtc = rootBtc.derivePath("m/84'/0'/0'/0/0");
    const bitcoinAddress = bitcoin.payments.p2wpkh({ pubkey: childBtc.publicKey }).address as string;

    const ethereum = ethers.Wallet.fromPhrase(mnemonic).address;

    return {
        solana,
        bitcoin: bitcoinAddress,
        ethereum
    };
};

export const saveSeedToStorage = (seed: string): void => {
  localStorage.setItem('wallet_seed', seed);
};
export const getSeedFromStorage = (): string | null => {
  return localStorage.getItem('wallet_seed');
};

export const guardarSemilla = async (seed: string, password?: string): Promise<boolean> => {
    if (password) {
        return await guardarConClave('wallet_seed', seed, password);
    }

    try {
        return await guardarEncriptado('wallet_seed', seed);
    } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.message.includes('NotAllowedError')) {
            throw new Error('FALLO_BIOMETRIA');
        }
        throw error;
    }
};

export const obtenerSemilla = async (password?: string): Promise<string | null> => {
    const metadatosString = localStorage.getItem('_seguro_wallet_seed');
    
    if (!metadatosString) {
        return null;
    }

    const metadatos = JSON.parse(metadatosString);

    if (metadatos.metodo === 'clave') {
        if (!password) {
            throw new Error('REQUIERE_CLAVE_MANUAL');
        }
        return await obtenerConClave('wallet_seed', password);
    }

    try {
        return await obtenerEncriptado('wallet_seed');
    } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.message.includes('NotAllowedError')) {
            throw new Error('FALLO_BIOMETRIA');
        }
        throw error;
    }
};
async function guardarConClave(clave: string, valor: string, contrasena: string): Promise<boolean> {
    try {
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contrasena));
        const claveCrypto = await crypto.subtle.importKey(
            "raw",
            hash,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        const vectorInicializacion = crypto.getRandomValues(new Uint8Array(12));
        const datosCodificados = new TextEncoder().encode(valor);

        const bufferEncriptado = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: vectorInicializacion },
            claveCrypto,
            datosCodificados
        );

        const metadatosCifrados = {
            metodo: "clave",
            idCredencial: "",
            datos: btoa(String.fromCharCode(...new Uint8Array(bufferEncriptado))),
            iv: btoa(String.fromCharCode(...vectorInicializacion))
        };

        localStorage.setItem(`_seguro_${clave}`, JSON.stringify(metadatosCifrados));
        return true;
    } catch (error: any) {
        throw new Error(`Error al guardar con clave '${clave}': ${error.message}`);
    }
}

async function obtenerConClave(clave: string, contrasena: string): Promise<string | null> {
    const datosEstructurales = localStorage.getItem(`_seguro_${clave}`);
    if (!datosEstructurales) {
        return null;
    }

    try {
        const metadatos = JSON.parse(datosEstructurales);
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contrasena));
        const claveCrypto = await crypto.subtle.importKey(
            "raw",
            hash,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        const datosEncriptados = new Uint8Array(atob(metadatos.datos).split("").map(c => c.charCodeAt(0)));
        const vectorInicializacion = new Uint8Array(atob(metadatos.iv).split("").map(c => c.charCodeAt(0)));

        const bufferDesencriptado = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: vectorInicializacion },
            claveCrypto,
            datosEncriptados
        );

        return new TextDecoder().decode(bufferDesencriptado);
    } catch (error: any) {
        throw new Error(`No se pudo desencriptar con clave '${clave}': ${error.message}`);
    }
}
export const clearSeedFromStorage = (): void => {
  localStorage.removeItem('wallet_seed');
};
export const validarOrdenSemilla = (originalSeed: string, inputtedSeed: string[]): boolean => {
  return originalSeed === inputtedSeed.join(' ');
};
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
export const existeSemillaGuardada = (): boolean => {
    return !!localStorage.getItem('_seguro_wallet_seed');
};

interface MetadatosCifrados {
    idCredencial: string;
    datos: string;
    iv: string;
}

// Forzamos un arreglo de exactamente 32 bytes (Requisito estricto de WebAuthn PRF)
const CONTEXTO_SEMILLA = new Uint8Array(32);
CONTEXTO_SEMILLA.set(new TextEncoder().encode("llave_maestra_billetera"));

async function guardarEncriptado(clave: string, valor: string): Promise<boolean> {
    try {
        const opcionesRegistro: CredentialCreationOptions = {
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(16)),
                rp: { name: "Sistema Biometrico Simplificado" },
                user: {
                    id: crypto.getRandomValues(new Uint8Array(16)),
                    name: clave,
                    displayName: clave
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },   
                    { type: "public-key", alg: -257 }  
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                extensions: { 
                    prf: {
                        eval: { first: CONTEXTO_SEMILLA }
                    }
                } as any
            }
        };

        // 1. Intentamos registrar la credencial
        const credencial = await navigator.credentials.create(opcionesRegistro) as PublicKeyCredential;
        const extensionesExtendidas = credencial.getClientExtensionResults() as any;
        const prfSoportado = extensionesExtendidas?.prf?.enabled;

        if (!prfSoportado) {
            throw new Error("El navegador o dispositivo no soporta el cifrado por hardware (PRF).");
        }

        let bytesSemillaOriginales = extensionesExtendidas.prf?.results?.first;

        // 2. EL SALVAVIDAS: Si el emulador (o un hardware real) aceptó el PRF pero no ejecutó 
        // el cálculo durante la creación, lo forzamos haciendo una lectura inmediata.
        if (!bytesSemillaOriginales) {
            const opcionesLecturaForzada: CredentialRequestOptions = {
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(16)),
                    allowCredentials: [{ id: credencial.rawId, type: "public-key" }],
                    userVerification: "required",
                    extensions: {
                        prf: {
                            eval: { first: CONTEXTO_SEMILLA }
                        }
                    } as any
                }
            };
            
            const asercionFuerza = await navigator.credentials.get(opcionesLecturaForzada) as PublicKeyCredential;
            bytesSemillaOriginales = (asercionFuerza.getClientExtensionResults() as any)?.prf?.results?.first;
        }

        if (!bytesSemillaOriginales) {
            throw new Error("No se pudo extraer la la clave. Asegúrate de tener configurado un método biométrico en tu dispositivo y de que el navegador soporte WebAuthn PRF.");
        }

        // 3. Garantizar clave de 32 bytes (256 bits) para AES-256
        const bytesSemillaFijos = new Uint8Array(32);
        const fuenteBytes = new Uint8Array(bytesSemillaOriginales);
        bytesSemillaFijos.set(fuenteBytes.subarray(0, 32));

        const claveCrypto = await crypto.subtle.importKey(
            "raw",
            bytesSemillaFijos,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        const vectorInicializacion = crypto.getRandomValues(new Uint8Array(12));
        const datosCodificados = new TextEncoder().encode(valor);

        const bufferEncriptado = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: vectorInicializacion },
            claveCrypto,
            datosCodificados
        );

        const metadatosCifrados: MetadatosCifrados = {
            idCredencial: btoa(String.fromCharCode(...new Uint8Array(credencial.rawId))),
            datos: btoa(String.fromCharCode(...new Uint8Array(bufferEncriptado))),
            iv: btoa(String.fromCharCode(...vectorInicializacion))
        };

        localStorage.setItem(`_seguro_${clave}`, JSON.stringify(metadatosCifrados));
        return true;

    } catch (error: any) {
        const mensajeError = error.message?.toLowerCase() || '';
        const nombreError = error.name || '';

        // Buscamos el nombre técnico o fragmentos clave del mensaje real que tira el navegador
        if (
            nombreError === 'NotAllowedError' || 
            mensajeError.includes('notallowederror') ||
            mensajeError.includes('not allowed by the user agent') ||
            mensajeError.includes('denied permission') ||
            mensajeError.includes('user verification')
        ) {
            throw new Error('FALLO_BIOMETRIA');
        }
        
        throw error;
    }
  }

async function obtenerEncriptado(clave: string): Promise<string | null> {
    const datosEstructurales = localStorage.getItem(`_seguro_${clave}`);
    
    if (!datosEstructurales) {
        return null;
    }

    try {
        const metadatos: MetadatosCifrados = JSON.parse(datosEstructurales);
        
        const idCredencial = new Uint8Array(atob(metadatos.idCredencial).split("").map(c => c.charCodeAt(0)));
        const datosEncriptados = new Uint8Array(atob(metadatos.datos).split("").map(c => c.charCodeAt(0)));
        const vectorInicializacion = new Uint8Array(atob(metadatos.iv).split("").map(c => c.charCodeAt(0)));

        const opcionesAutenticacion: CredentialRequestOptions = {
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(16)),
                allowCredentials: [{ id: idCredencial, type: "public-key" }],
                userVerification: "required",
                extensions: {
                    prf: {
                        eval: { first: CONTEXTO_SEMILLA }
                    }
                } as any
            }
        };

        const asercion = await navigator.credentials.get(opcionesAutenticacion) as PublicKeyCredential;
        const resultadosPRF = (asercion.getClientExtensionResults() as any)?.prf?.results;

        if (!resultadosPRF || !resultadosPRF.first) {
            throw new Error("El hardware no retornó la clave de desbloqueo.");
        }

        const bytesSemillaFijos = new Uint8Array(32);
        const fuenteBytes = new Uint8Array(resultadosPRF.first);
        bytesSemillaFijos.set(fuenteBytes.subarray(0, 32));

        const claveCrypto = await crypto.subtle.importKey(
            "raw",
            bytesSemillaFijos,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        const bufferDesencriptado = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: vectorInicializacion },
            claveCrypto,
            datosEncriptados
        );

        return new TextDecoder().decode(bufferDesencriptado);

    } catch (error: any) {
        const mensajeError = error.message?.toLowerCase() || '';
        const nombreError = error.name || '';

        // Buscamos el nombre técnico o fragmentos clave del mensaje real que tira el navegador
        if (
            nombreError === 'NotAllowedError' || 
            mensajeError.includes('notallowederror') ||
            mensajeError.includes('not allowed by the user agent') ||
            mensajeError.includes('denied permission') ||
            mensajeError.includes('user verification')
        ) {
            throw new Error('FALLO_BIOMETRIA');
        }
        
        throw error;
    }
}