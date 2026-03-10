import React, { useState } from 'react';
import { Bell, Shield, Wifi, Users, Save, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-fire-red' : 'bg-white/10'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-5' : 'left-0.5'}`}></div>
    </button>
  );
}

interface ConfiguracoesPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ConfiguracoesPage({ isDarkMode, onToggleDarkMode }: ConfiguracoesPageProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    alertSom: true,
    alertPopup: true,
    alertEmail: false,
    autoRefresh: true,
    sateliteGOES: true,
    notifCritica: true,
    notifAlta: true,
    notifMedia: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Configurações</h2>
          <p className="text-xs text-fire-muted uppercase tracking-widest mt-1">Preferências do sistema e do usuário</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg ${
            saved ? 'bg-fire-green text-white shadow-fire-green/20' : 'bg-fire-red hover:bg-red-700 text-white shadow-fire-red/20'
          }`}
        >
          <Save className="h-4 w-4" />
          <span className="text-sm">{saved ? 'Salvo!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Notificações */}
        <div className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-fire-red/20 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-fire-red" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Notificações</h3>
          </div>

          {[
            { key: 'alertSom' as const, label: 'Alerta Sonoro', desc: 'Som ao receber novos chamados' },
            { key: 'alertPopup' as const, label: 'Popup de Alertas', desc: 'Notificação visual em tempo real' },
            { key: 'alertEmail' as const, label: 'Envio por E-mail', desc: 'Resumo diário de ocorrências' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-[10px] text-fire-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={settings[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>

        {/* Sistema */}
        <div className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-fire-red/20 p-2 rounded-lg">
              <Wifi className="w-5 h-5 text-fire-red" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Sistema</h3>
          </div>

          {[
            { key: 'autoRefresh' as const, label: 'Atualização Automática', desc: 'Dados atualizados a cada 30s' },
            { key: 'sateliteGOES' as const, label: 'Satélite GOES-16', desc: 'Sincronização com dados de satélite' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-[10px] text-fire-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={settings[key]} onChange={() => toggle(key)} />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Modo Escuro</p>
              <p className="text-[10px] text-fire-muted mt-0.5">Interface com tema escuro</p>
            </div>
            <Toggle checked={isDarkMode} onChange={onToggleDarkMode} />
          </div>
        </div>

        {/* Nível de Alerta */}
        <div className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-fire-red/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-fire-red" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Nível de Alerta</h3>
          </div>

          {[
            { key: 'notifCritica' as const, label: 'Gravidade Crítica', desc: 'Sempre receber alertas críticos' },
            { key: 'notifAlta' as const, label: 'Gravidade Alta', desc: 'Alertas de alta prioridade' },
            { key: 'notifMedia' as const, label: 'Gravidade Média', desc: 'Alertas de prioridade média' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-[10px] text-fire-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={settings[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>

        {/* Perfil do Usuário */}
        <div className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-fire-red/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-fire-red" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Perfil do Usuário</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Nome</label>
              <input
                defaultValue={user?.nome || ''}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Cargo</label>
              <input
                defaultValue={user?.cargo || ''}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">E-mail</label>
              <input
                defaultValue={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-fire-muted focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-1">Role</label>
              <input
                value={user?.role || ''}
                readOnly
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-fire-muted focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <button className="w-full flex items-center justify-between px-4 py-3 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-colors">
            <span className="text-xs font-bold text-fire-muted">Alterar Senha</span>
            <ChevronRight className="w-4 h-4 text-fire-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
