import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MapPin, AlertTriangle, Flame, Loader2 } from 'lucide-react';
import { apiFetch } from '../services/api';
import { createIncident } from '../services/incidents';
import type { ApiIncident } from '../services/incidents';

interface NovoAlertaModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (incident: ApiIncident) => void;
}

const GRAVIDADES = ['Baixa', 'Média', 'Alta', 'Crítica'];

export function NovoAlertaModal({ open, onClose, onCreated }: NovoAlertaModalProps) {
  const [form, setForm] = useState({ tipo: '', gravidade: 'Alta', bairro: '', descricao: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);

  // Fetch tipos from API
  useEffect(() => {
    if (open) {
      apiFetch<{ id: number; nome: string; ativo: boolean }[]>('/tipos')
        .then((data) => setTipos(data.map((t) => t.nome)))
        .catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo || !form.bairro) return;

    setError('');
    setSubmitting(true);

    try {
      // Generate ID: BMB-XXX with timestamp-based suffix
      const id = `BMB-${Date.now().toString().slice(-4)}`;
      const today = new Date().toISOString().split('T')[0];
      const hora = new Date().getHours();

      const newIncident = await createIncident({
        id,
        tipo: form.tipo,
        gravidade: form.gravidade,
        bairro: form.bairro,
        status: 'Em Andamento',
        data: today,
        hora,
        descricao: form.descricao || undefined,
      });

      onCreated?.(newIncident);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ tipo: '', gravidade: 'Alta', bairro: '', descricao: '' });
        onClose();
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar ocorrência');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-fire-card border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="bg-fire-red/20 p-2 rounded-lg border border-fire-red/40">
              <Flame className="w-6 h-6 text-fire-red" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Emitir Novo Alerta</h3>
              <p className="text-xs font-bold text-fire-muted uppercase tracking-wider">Registrar nova ocorrência</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-fire-muted hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-3">
            <div className="bg-fire-green/20 p-4 rounded-full">
              <PlusCircle className="w-10 h-10 text-fire-green" />
            </div>
            <p className="text-lg font-black text-white">Alerta Emitido!</p>
            <p className="text-xs text-fire-muted">A ocorrência foi registrada com sucesso.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-2">
                  Tipo de Ocorrência *
                </label>
                <select
                  required
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fire-red"
                >
                  <option value="">Selecione...</option>
                  {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-2">
                  Gravidade
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRAVIDADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gravidade: g }))}
                      className={`py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors ${
                        form.gravidade === g
                          ? g === 'Crítica' ? 'bg-fire-red text-white'
                          : g === 'Alta' ? 'bg-fire-orange text-white'
                          : g === 'Média' ? 'bg-yellow-500 text-white'
                          : 'bg-fire-green text-white'
                          : 'bg-black/30 border border-white/10 text-fire-muted hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-2">
                <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>Bairro / Localização *</span></span>
              </label>
              <input
                required
                value={form.bairro}
                onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                placeholder="Ex: Asa Norte, Taguatinga..."
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted focus:outline-none focus:border-fire-red"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-fire-muted block mb-2">
                Descrição (opcional)
              </label>
              <textarea
                rows={3}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Detalhes adicionais sobre a ocorrência..."
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted focus:outline-none focus:border-fire-red resize-none"
              />
            </div>

            {error && (
              <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl px-4 py-3 text-fire-red text-xs font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center space-x-2 bg-fire-red hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-fire-red/20"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emitir Alerta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
