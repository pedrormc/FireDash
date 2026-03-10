import React, { useState } from 'react';
import { Flame, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, senha);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
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
          <p className="text-fire-muted text-xs tracking-widest uppercase mt-1">Sistema de Monitoramento</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-fire-card border border-white/5 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@bombeiros.gov.br"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted/50 focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-fire-muted mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="********"
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
                <LogIn className="h-5 w-5" />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
