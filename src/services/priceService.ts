export const getCryptoPrices = async () => {
  try {
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd&include_24hr_change=true'
    );
    return await response.json();
  } catch (error) {
    console.error("Error al obtener precios:", error);
    return null;
  }
};
