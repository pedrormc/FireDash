import React from 'react';
import { Flame, LayoutDashboard, FileText, Map, Settings, PlusCircle } from 'lucide-react';

interface Alert {
  id: string;
  location: string;
  time: string;
  title: string;
  status: string;
  statusColor: string;
}

type Page = 'dashboard' | 'relatorios' | 'mapa' | 'configuracoes';

interface SidebarProps {
  alerts: Alert[];
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onNovoAlerta: () => void;
}

export function Sidebar({ alerts, currentPage, onNavigate, onNovoAlerta }: SidebarProps) {
  const navItem = (page: Page, icon: React.ReactNode, label: string, extraClass = '') => {
    const active = currentPage === page;
    return (
      <button
        onClick={() => onNavigate(page)}
        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-left ${extraClass} ${
          active
            ? 'bg-white/5 text-fire-red border-l-4 border-fire-red pl-[8px]'
            : 'text-fire-muted hover:bg-white/5 hover:text-white border-l-4 border-transparent pl-[8px]'
        }`}
      >
        {icon}
        <span className={active ? 'font-medium' : ''}>{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-fire-sidebar flex flex-col border-r border-white/5 h-full">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-fire-red p-2 rounded-lg">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-black text-sm tracking-tighter leading-none">CORPO DE</h1>
          <h1 className="font-light text-xs tracking-widest text-fire-muted uppercase">Bombeiros</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItem('dashboard', <LayoutDashboard className="h-5 w-5" />, 'Dashboard')}
        {navItem('relatorios', <FileText className="h-5 w-5" />, 'Relatórios')}
        {navItem('mapa', <Map className="h-5 w-5" />, 'Vista do Mapa')}
        {navItem('configuracoes', <Settings className="h-5 w-5" />, 'Configurações', 'mt-4')}

        <div className="mt-8">
          <h3 className="px-3 text-[10px] font-bold text-fire-muted uppercase tracking-widest mb-4">Alertas Recentes</h3>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-3 bg-fire-card border-l-2 rounded-r-lg ${alert.statusColor === 'fire-red' ? 'border-fire-red' : alert.statusColor === 'fire-orange' ? 'border-fire-orange' : 'border-fire-green opacity-60'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-fire-muted">{alert.id} - {alert.location}</span>
                  <span className="text-[10px] text-fire-muted">{alert.time}</span>
                </div>
                <p className="text-xs font-bold leading-tight mb-2">{alert.title}</p>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${alert.statusColor === 'fire-red' ? 'bg-fire-red/20 text-fire-red' : alert.statusColor === 'fire-orange' ? 'bg-fire-orange/20 text-fire-orange' : 'bg-fire-green/20 text-fire-green'}`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={onNovoAlerta}
          className="w-full bg-fire-red hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-fire-red/20"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Emitir Novo Alerta</span>
        </button>
      </div>
    </aside>
  );
}
