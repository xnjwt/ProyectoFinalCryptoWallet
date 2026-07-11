import React, { useState } from 'react';
import { User, Copy, Check, ChevronDown, Menu, LogOut } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { obtenerClavesPublicas } from '../../services/walletService';

const textos = {
  es: { usuario: 'Usuario', cerrarSesion: 'Cerrar sesión', copiado: '¡Copiado!' },
  en: { usuario: 'User', cerrarSesion: 'Log out', copiado: 'Copied!' },
};


interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export const Header = ({ onMenuClick, onLogout }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const idioma = useConfigStore((state) => state.idioma);
  const modo = useConfigStore((state) => state.modo);
  const t = textos[idioma] || textos.es;
  const isDark = modo === 'dark';

const solanaAddress = obtenerClavesPublicas('solana') || "";

  const copiarDireccion = async () => {
    if (!solanaAddress) return;
    try {
      await navigator.clipboard.writeText(solanaAddress);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('No se pudo copiar la dirección:', error);
    }
  };

  return (
    <header className={`flex justify-between items-center mb-8 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className={`md:hidden p-2 -ml-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
          <Menu size={24} />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 border rounded-full px-4 py-2 transition-all hover:border-purple-500 ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-orange-500" />
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <div className="w-6 h-6 rounded-full bg-purple-500" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">{acortarDireccion(solanaAddress)}</span>
            <ChevronDown size={16} />
          </button>

          {isOpen && (
            <div className={`absolute top-12 left-0 w-72 border rounded-2xl p-4 shadow-xl z-50 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'
            }`}>
              <NetworkItem
                name="Solana"
                address={acortarDireccion(solanaAddress)}
                isDark={isDark}
                onCopy={copiarDireccion}
                copiado={copiado}
                textoCopiado={t.copiado}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <User size={16} />
            <span className="text-sm font-medium hidden sm:inline">{t.usuario}</span>
          </button>

          {isUserMenuOpen && (
            <div className={`absolute top-12 right-0 w-48 border rounded-2xl p-2 shadow-xl z-50 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'
            }`}>
              <button
                onClick={onLogout}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-400 transition-colors ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">{t.cerrarSesion}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
const acortarDireccion = (addr: string) => {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-6)}`;
};
const NetworkItem = ({
  name,
  address,
  isDark,
  onCopy,
  copiado,
  textoCopiado,
}: {
  name: string;
  address: string;
  isDark: boolean;
  onCopy: () => void;
  copiado: boolean;
  textoCopiado: string;
}) => (
  <div
    onClick={onCopy}
    className={`flex justify-between items-center py-2 px-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
  >
    <div>
      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {copiado ? textoCopiado : address}
      </p>
    </div>
    {copiado ? (
      <Check size={14} className="text-green-500" />
    ) : (
      <Copy size={14} className="text-gray-400" />
    )}
  </div>
);