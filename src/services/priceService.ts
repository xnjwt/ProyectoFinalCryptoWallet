const TTL_CACHE_MS = 12000; 

let cachePrecios: any = null;
let timestampCache = 0;
let peticionEnCurso: Promise<any> | null = null;

export const getCryptoPrices = async () => {
  const ahora = Date.now();

  if (cachePrecios && ahora - timestampCache < TTL_CACHE_MS) {
    return cachePrecios;
  }

  if (peticionEnCurso) {
    return peticionEnCurso;
  }

  peticionEnCurso = (async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,usd-coin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true'
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch crypto prices (${response.status})`);
      }
      const data = await response.json();
      cachePrecios = data;
      timestampCache = Date.now();
      return data;
    } finally {
      peticionEnCurso = null;
    }
  })();

  return peticionEnCurso;
};