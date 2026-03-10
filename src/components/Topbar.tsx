import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Topbar({ title = 'Dashboard de Incidências de Fogo - Comando Geral', subtitle = 'Interface de Missão e Controle', isDarkMode = true, onToggleTheme }: TopbarProps) {
  return (
    <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 flex-shrink-0">
      <div className="min-w-0">
        <h2 className="text-base md:text-xl font-bold truncate">{title}</h2>
        <p className="text-[10px] text-fire-muted uppercase tracking-widest font-semibold hidden md:block">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-3 md:space-x-8">
        <div className="relative w-40 md:w-64 hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-fire-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-fire-card border-none rounded-lg text-sm focus:ring-fire-red focus:bg-fire-card placeholder-fire-muted text-white"
            placeholder="Buscar ocorrência..."
          />
        </div>
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
            <p className="text-xs font-bold leading-none">Cel. Marcos Silva</p>
            <p className="text-[10px] text-fire-muted">Comandante de Operações</p>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6JPZh1fScSYBBRw0T6OtxE0E5z74oilMOHdFnYPCSa5uuHWUFOJAqQajDr3YOXUFvscALLkFKA_7uZj-tTuzJ35VUZvSafWVGg19SGqmEd6Fx_nvsKG01gG7AFheV_kDzHhkUgid0rMX0zbDglg2Tp6nJFb8Huheh2ywJM7LIvALD9ifhkErF6zAIk-p7CjXOGGTGGgKIEtyV8ZjQzMSvO8GavdawhooFPx_jCpJoPjW_qZjCCsxolEdlAByTAK7KO_ldsvCKuqaq"
            alt="User Profile"
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
          />
        </div>
      </div>
    </header>
  );
}
