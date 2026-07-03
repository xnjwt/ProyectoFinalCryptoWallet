import { useEffect, useState } from "react";
import { auth } from "../../FirebaseConfig";

export const Dashboard = () => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const res = await fetch(
            `http://localhost:3000/api/users/${user.uid}`,
          );
          const data = await res.json();
          setWallet(data);
        } catch (err) {
          console.error("Error al traer wallet:", err);
        }
      }
    };
    fetchWallet();
  }, []);

  return (
    <div className="space-y-6">
      {/* Tarjeta de Billetera Real */}
      <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
        <p className="text-gray-400 text-sm">Tu dirección de Solana</p>
        <p className="font-mono text-purple-400 break-all text-lg font-bold">
          {wallet ? wallet.publicKey : "Cargando..."}
        </p>
      </div>

      {}
      <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Tus Activos</h3>
        {}
      </div>
    </div>
  );
};
