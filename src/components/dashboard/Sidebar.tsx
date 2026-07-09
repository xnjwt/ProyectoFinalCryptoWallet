import React from 'react';
import { LayoutDashboard, History, Settings, X } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

const textos = {
  es: { panel: 'Panel Principal', historial: 'Historial', config: 'Configuración' },
  en: { panel: 'Main Panel', historial: 'History', config: 'Settings' },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const vistaActual = useConfigStore((state) => state.vistaActual);
  const cambiarVista = useConfigStore((state) => state.cambiarVista);
  const idioma = useConfigStore((state) => state.idioma);
  const modo = useConfigStore((state) => state.modo);
  const t = textos[idioma] || textos.es;
  const isDark = modo === 'dark';

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 z-30 md:hidden" />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 h-screen w-64 p-6 flex flex-col
          z-40 transform transition-transform duration-300 border-r
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'}
        `}
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg" />
            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              LuxWallet
            </h1>
          </div>
          <button onClick={onClose} className={`md:hidden ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <NavItem icon={<LayoutDashboard size={20} />} label={t.panel} active={vistaActual === 'DASHBOARD'} isDark={isDark}
            onClick={() => { cambiarVista('DASHBOARD'); onClose(); }} />
          <NavItem icon={<History size={20} />} label={t.historial} active={false} isDark={isDark} onClick={() => {}} />
          <NavItem icon={<Settings size={20} />} label={t.config} active={vistaActual === 'CONFIGURACION'} isDark={isDark}
            onClick={() => { cambiarVista('CONFIGURACION'); onClose(); }} />
        </nav>
      </div>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isDark: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, isDark, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
      active
        ? isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
        : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);