import React, { useState } from 'react';
import { Flame, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('O nome completo é obrigatório');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, insira um e-mail válido');
      return;
    }

    if (!role) {
      setError('O perfil de acesso (Role) é obrigatório');
      return;
    }

    if (!senha) {
      setError('A senha é obrigatória');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      await register(nome, email, senha, cargo || undefined, role as 'admin' | 'operador' | 'visualizador');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-fire-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-fire-red p-3 rounded-xl mb-4">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-black text-xl tracking-tight text-white">CORPO DE BOMBEIROS</h1>
          <p className="text-fire-muted text-xs tracking-widest uppercase mt-1">Criar Nova Conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              placeholder="João da Silva"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@bombeiros.gov.br"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Cargo na Corporação <span className="text-fire-muted/50">(opcional)</span>
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Bombeiro Civil, Tenente"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Perfil de Acesso no Sistema
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red transition-colors appearance-none"
            >
              <option value="" disabled className="text-gray-500 bg-fire-dark">Selecione um perfil</option>
              <option value="admin" className="bg-fire-dark">Administrador Geral</option>
              <option value="operador" className="bg-fire-dark">Operador de Despacho</option>
              <option value="visualizador" className="bg-fire-dark">Visualizador (Somente Leitura)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          {error && (
            <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl px-4 py-3 text-fire-red text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-fire-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-fire-red/20"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Criar Conta</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-fire-muted hover:text-white transition-colors"
            >
              Já tem uma conta? <span className="text-fire-red font-bold">Entrar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
