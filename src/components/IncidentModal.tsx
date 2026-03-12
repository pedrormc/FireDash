import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Info, Trash2, Pencil, Loader2, Save } from 'lucide-react';
import type { ApiIncident } from '../services/incidents';

const STATUS_OPTIONS = ['Em Andamento', 'Finalizado', 'Cancelada'] as const;

interface IncidentModalProps {
  incident: ApiIncident | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { status: string }) => void;
  userRole?: string;
}

export function IncidentModal({ incident, onClose, onDelete, onUpdate, userRole }: IncidentModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Reset state when incident changes or modal closes
  useEffect(() => {
    setConfirmDelete(false);
    setEditing(false);
    setEditStatus(incident?.status ?? '');
    setSaving(false);
    setSaveError('');
  }, [incident]);

  if (!incident) return null;

  const canEdit = onUpdate && (userRole === 'admin' || userRole === 'operador');

  const getSeverityColor = (gravidade: string) => {
    switch (gravidade.toLowerCase()) {
      case 'crítica': return 'text-fire-red bg-fire-red/20 border-fire-red';
      case 'alta':    return 'text-fire-orange bg-fire-orange/20 border-fire-orange';
      case 'média':   return 'text-fire-yellow bg-fire-yellow/20 border-fire-yellow';
      case 'baixa':   return 'text-fire-green bg-fire-green/20 border-fire-green';
      default:        return 'text-slate-400 bg-slate-400/20 border-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em andamento': return 'text-fire-blue bg-fire-blue/20';
      case 'finalizado':   return 'text-fire-green bg-fire-green/20';
      case 'cancelada':    return 'text-fire-red bg-fire-red/20';
      default:             return 'text-slate-400 bg-slate-400/20';
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(incident.id);
      onClose();
    }
  };

  const handleSave = async () => {
    if (!onUpdate || editStatus === incident.status) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      onUpdate(incident.id, { status: editStatus });
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-fire-card border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${getSeverityColor(incident.gravidade)}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{incident.id}</h3>
              <p className="text-xs font-bold text-fire-muted uppercase tracking-wider">Detalhes da Ocorrência</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-fire-muted hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-fire-muted mb-2">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tipo</span>
              </div>
              <p className="text-sm font-bold text-white">{incident.tipo}</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-fire-muted mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Bairro</span>
              </div>
              <p className="text-sm font-bold text-white">{incident.bairro}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-fire-muted mb-2">Gravidade</span>
              <span className={`px-3 py-1 text-xs font-black rounded uppercase tracking-wider ${getSeverityColor(incident.gravidade)}`}>
                {incident.gravidade}
              </span>
            </div>
            <div className="flex-1 bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-fire-muted mb-2">Status</span>
              {editing ? (
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditStatus(s)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider transition-colors ${
                        editStatus === s
                          ? getStatusColor(s)
                          : 'bg-white/5 text-fire-muted hover:text-white border border-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className={`px-3 py-1 text-xs font-black rounded uppercase tracking-wider ${getStatusColor(incident.status)}`}>
                  {incident.status}
                </span>
              )}
            </div>
            <div className="flex-1 bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-fire-muted mb-2">Data</span>
              <span className="text-xs font-bold text-white">
                {incident.data}{incident.hora !== undefined ? ` · ${String(incident.hora).padStart(2,'0')}h` : ''}
              </span>
            </div>
          </div>

          {incident.descricao && (
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-fire-muted block mb-2">Descrição</span>
              <p className="text-sm text-zinc-300 leading-relaxed">{incident.descricao}</p>
            </div>
          )}

          {saveError && (
            <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl px-4 py-3 text-fire-red text-xs font-medium">
              {saveError}
            </div>
          )}

          {/* Delete confirmation inline */}
          {onDelete && confirmDelete && (
            <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Confirmar exclusão de {incident.id}?</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-bold bg-fire-red hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {onDelete && !confirmDelete && !editing && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center space-x-1.5 px-4 py-2 text-fire-red hover:bg-fire-red/10 border border-fire-red/30 font-bold rounded-xl transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            )}
            {canEdit && !editing && !confirmDelete && (
              <button
                onClick={() => { setEditing(true); setEditStatus(incident.status); }}
                className="flex items-center space-x-1.5 px-4 py-2 text-fire-blue hover:bg-fire-blue/10 border border-fire-blue/30 font-bold rounded-xl transition-colors text-sm"
              >
                <Pencil className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-fire-green hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Salvar</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
