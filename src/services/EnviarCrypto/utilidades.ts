export function hayConexionAInternet(): boolean {
    // navigator.onLine es una variable nativa de los navegadores (Chrome, Firefox, Safari)
    // que devuelve true si el usuario tiene Wi-Fi/Datos, y false si está desconectado.
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        return navigator.onLine; 
    }

    return true; 
}