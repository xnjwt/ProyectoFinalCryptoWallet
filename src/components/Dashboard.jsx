export const Dashboard = () => {
  // Mock Data: Información estática para armar el diseño
  const cryptoAssets = [
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      balance: "0.045",
      price: "$65,430.00",
      value: "$2,944.35",
      color: "text-orange-400",
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      balance: "1.2",
      price: "$3,450.00",
      value: "$4,140.00",
      color: "text-blue-400",
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      balance: "24.5",
      price: "$145.20",
      value: "$3,557.40",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjeta de Balance Total */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Efecto de brillo de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <p className="text-gray-300 font-medium mb-1">Balance Total</p>
        <h2 className="text-5xl font-extrabold text-white tracking-tight mb-6">
          $10,641.75{" "}
          <span className="text-xl text-gray-400 font-normal">USD</span>
        </h2>

        {/* Botones de Acción Rápida */}
        <div className="flex gap-4">
          <button className="flex-1 bg-white text-indigo-950 font-bold py-3 rounded-xl hover:bg-gray-100 transition">
            Depositar
          </button>
          <button className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition backdrop-blur-md border border-white/10">
            Enviar
          </button>
          <button className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition backdrop-blur-md border border-white/10">
            Intercambiar
          </button>
        </div>
      </div>

      {/* Lista de Activos (Portafolio) */}
      <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Tus Activos</h3>
        <div className="space-y-3">
          {cryptoAssets.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-800 transition border border-transparent hover:border-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Ícono circular simulado */}
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold">
                  {coin.symbol[0]}
                </div>
                <div>
                  <h4 className="text-white font-bold">{coin.name}</h4>
                  <p className="text-sm text-gray-400">{coin.price}</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-white font-bold">{coin.value}</h4>
                <p className={`text-sm font-medium ${coin.color}`}>
                  {coin.balance} {coin.symbol}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
