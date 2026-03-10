import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, FileText, Map, Settings, Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { KpiCards } from './components/KpiCards';
import { ChartsSection } from './components/ChartsSection';
import { ZoneStatus } from './components/ZoneStatus';
import { IncidentTable } from './components/IncidentTable';
import { NovoAlertaModal } from './components/NovoAlertaModal';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { MapaPage } from './pages/MapaPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { alerts, kpis, emergencyIncidents, TIPOS_OCORRENCIA } from './data/mockData';
import type { Incident } from './data/mockData';

type Page = 'dashboard' | 'relatorios' | 'mapa' | 'configuracoes' | 'admin';
type Periodo = 'hoje' | 'semana' | 'mes';

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Dashboard de Incidências — Comando Geral', subtitle: 'Interface de Missão e Controle' },
  relatorios:    { title: 'Relatórios de Ocorrências', subtitle: 'Histórico e filtros de incidentes' },
  mapa:          { title: 'Vista do Mapa', subtitle: 'Monitoramento geográfico em tempo real' },
  configuracoes: { title: 'Configurações do Sistema', subtitle: 'Preferências e gerenciamento' },
  admin:         { title: 'Painel Administrativo', subtitle: 'Gerenciamento de usuários e sistema' },
};

// Pages allowed per role
const ROLE_PAGES: Record<string, Page[]> = {
  admin:         ['dashboard', 'relatorios', 'mapa', 'configuracoes', 'admin'],
  operador:      ['dashboard', 'relatorios', 'mapa', 'configuracoes'],
  visualizador:  ['dashboard'],
};

// Boundaries for period filter (today = 2026-03-06)
const TODAY       = '2026-03-06';
const WEEK_START  = '2026-02-27'; // 7 days ago
const MONTH_START = '2026-02-04'; // 30 days ago

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage]       = useState<Page>('dashboard');
  const [novoAlertaOpen, setNovoAlertaOpen] = useState(false);

  // ── Theme ──────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fire-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fire-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const isDarkMode = theme === 'dark';

  // Incidents state — abstracted for future API integration
  const [incidents, setIncidents] = useState<Incident[]>(emergencyIncidents);

  // Dashboard filters
  const [periodo,         setPeriodo]         = useState<Periodo>('semana');
  const [filterTipo,      setFilterTipo]      = useState('Todos');
  const [filterGravidade, setFilterGravidade] = useState('Todas');
  const [filterStatus,    setFilterStatus]    = useState('Todos');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (periodo === 'hoje'   && inc.data !== TODAY)       return false;
      if (periodo === 'semana' && inc.data < WEEK_START)    return false;
      if (periodo === 'mes'    && inc.data < MONTH_START)   return false;
      if (filterTipo      !== 'Todos'  && inc.tipo      !== filterTipo)      return false;
      if (filterGravidade !== 'Todas'  && inc.gravidade !== filterGravidade) return false;
      if (filterStatus    !== 'Todos'  && inc.status    !== filterStatus)    return false;
      return true;
    });
  }, [incidents, periodo, filterTipo, filterGravidade, filterStatus]);

  // Abstract delete for future API swap: DELETE /api/incidents/:id
  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  };

  const hasActiveFilters = filterTipo !== 'Todos' || filterGravidade !== 'Todas' || filterStatus !== 'Todos';
  const resetFilters = () => { setFilterTipo('Todos'); setFilterGravidade('Todas'); setFilterStatus('Todos'); };

  // Navigation restricted by role
  const handleNavigate = (page: Page) => {
    const allowed = ROLE_PAGES[user?.role || 'visualizador'] || ROLE_PAGES.visualizador;
    if (allowed.includes(page)) {
      setCurrentPage(page);
    }
  };

  const navItems = [
    { page: 'dashboard'     as Page, icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { page: 'relatorios'    as Page, icon: <FileText        className="h-5 w-5" />, label: 'Relatórios' },
    { page: 'mapa'          as Page, icon: <Map             className="h-5 w-5" />, label: 'Mapa' },
    { page: 'configuracoes' as Page, icon: <Settings        className="h-5 w-5" />, label: 'Config.' },
  ];

  // Filter nav items by role
  const allowedPages = ROLE_PAGES[user?.role || 'visualizador'] || ROLE_PAGES.visualizador;
  const visibleNavItems = navItems.filter((item) => allowedPages.includes(item.page));

  return (
    <div className="bg-fire-dark text-white font-sans h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <Sidebar
            alerts={alerts}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onNovoAlerta={() => setNovoAlertaOpen(true)}
            user={user}
            onLogout={logout}
          />
        </div>

        <main className="flex-1 flex flex-col min-w-0 bg-fire-dark relative">
          <Topbar
            title={PAGE_TITLES[currentPage].title}
            subtitle={PAGE_TITLES[currentPage].subtitle}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />

          {/* Page content — extra bottom padding on mobile for tab bar */}
          <div className="flex-1 overflow-y-auto pb-16 md:pb-0">

            {/* ── DASHBOARD ── */}
            {currentPage === 'dashboard' && (
              <div className="p-4 md:p-8 space-y-6">
                <KpiCards kpis={kpis} />

                {/* Filter bar */}
                <div className="bg-fire-card border border-white/5 rounded-2xl p-4 md:p-5">
                  <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">

                    {/* Período */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fire-muted">Período:</span>
                      <div className="flex gap-1">
                        {(['hoje', 'semana', 'mes'] as Periodo[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors ${
                              periodo === p
                                ? 'bg-fire-red text-white'
                                : 'bg-black/30 text-fire-muted hover:text-white border border-white/10'
                            }`}
                          >
                            {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipo */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fire-muted">Tipo:</span>
                      <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-fire-red"
                      >
                        <option value="Todos">Todos</option>
                        {TIPOS_OCORRENCIA.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gravidade */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fire-muted">Gravidade:</span>
                      <div className="flex gap-1 flex-wrap">
                        {['Todas', 'Crítica', 'Alta', 'Média', 'Baixa'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setFilterGravidade(g)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors ${
                              filterGravidade === g
                                ? 'bg-fire-red text-white'
                                : 'bg-black/30 text-fire-muted hover:text-white border border-white/10'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fire-muted">Status:</span>
                      <div className="flex gap-1">
                        {['Todos', 'Em Andamento', 'Finalizado'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors ${
                              filterStatus === s
                                ? 'bg-fire-red text-white'
                                : 'bg-black/30 text-fire-muted hover:text-white border border-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="text-[10px] font-black text-fire-muted hover:text-white uppercase tracking-wider px-3 py-1 border border-white/10 rounded-lg hover:border-white/30 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <ChartsSection incidents={filteredIncidents} periodo={periodo} />

                <ZoneStatus incidents={filteredIncidents} />

                <IncidentTable
                  incidents={filteredIncidents}
                  onDelete={handleDeleteIncident}
                />
              </div>
            )}

            {currentPage === 'relatorios' && (
              <ProtectedRoute allowedRoles={['admin', 'operador']}>
                <RelatoriosPage />
              </ProtectedRoute>
            )}
            {currentPage === 'mapa' && (
              <ProtectedRoute allowedRoles={['admin', 'operador']}>
                <MapaPage />
              </ProtectedRoute>
            )}
            {currentPage === 'configuracoes' && (
              <ProtectedRoute allowedRoles={['admin', 'operador']}>
                <ConfiguracoesPage isDarkMode={isDarkMode} onToggleDarkMode={toggleTheme} />
              </ProtectedRoute>
            )}
            {currentPage === 'admin' && (
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-4 md:p-8">
                  <div className="bg-fire-card border border-white/5 rounded-2xl p-8 text-center">
                    <Shield className="h-12 w-12 text-fire-muted mx-auto mb-4" />
                    <p className="text-fire-muted text-sm">Painel Admin — será implementado na Fase 4</p>
                  </div>
                </div>
              </ProtectedRoute>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-fire-sidebar border-t border-white/10 z-50 flex">
        {visibleNavItems.map(({ page, icon, label }) => (
          <button
            key={page}
            onClick={() => handleNavigate(page)}
            className={`flex-1 flex flex-col items-center py-3 space-y-1 transition-colors ${
              currentPage === page ? 'text-fire-red' : 'text-fire-muted'
            }`}
          >
            {icon}
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </nav>

      <NovoAlertaModal open={novoAlertaOpen} onClose={() => setNovoAlertaOpen(false)} />
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-fire-dark flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-fire-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
