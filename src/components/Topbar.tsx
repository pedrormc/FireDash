import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  userName?: string;
  userRole?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function Topbar({
  title = 'Dashboard de Incidências de Fogo - Comando Geral',
  subtitle = 'Interface de Missão e Controle',
  isDarkMode = true,
  onToggleTheme,
  userName,
  userRole,
}: TopbarProps) {
  const displayName = userName || 'Usuário';
  const displayRole = userRole || '';
  const initials = getInitials(displayName);

  return (
    <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 flex-shrink-0">
      <div className="min-w-0">
        <h2 className="text-base md:text-xl font-bold truncate">{title}</h2>
        <p className="text-[10px] text-fire-muted uppercase tracking-widest font-semibold hidden md:block">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-3 md:space-x-8">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="p-2 text-fire-muted hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
        <button className="relative p-2 text-fire-muted hover:text-white transition-colors">
          <Bell className="h-5 w-5 md:h-6 md:w-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-fire-red rounded-full border-2 border-fire-dark"></span>
        </button>
        <div className="hidden md:flex items-center space-x-3 border-l border-white/10 pl-8">
          <div className="text-right">
            <p className="text-xs font-bold leading-none">{displayName}</p>
            {displayRole && <p className="text-[10px] text-fire-muted">{displayRole}</p>}
          </div>
          <div className="w-10 h-10 rounded-full border border-white/20 bg-fire-red/20 flex items-center justify-center">
            <span className="text-sm font-black text-fire-red">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
