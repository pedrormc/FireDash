import React, { useEffect, useRef } from 'react';
import { X, BellOff, AlertTriangle } from 'lucide-react';
import type { ApiAlert } from '../services/alerts';

interface NotificationPanelProps {
  alerts: ApiAlert[];
  onDismiss: (id: number) => void;
  onDismissAll: () => void;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function severityDot(gravidade: string | null): string {
  switch (gravidade?.toLowerCase()) {
    case 'crítica': return 'bg-fire-red';
    case 'alta':    return 'bg-fire-orange';
    case 'média':   return 'bg-fire-yellow';
    case 'baixa':   return 'bg-fire-green';
    default:        return 'bg-fire-muted';
  }
}

export function NotificationPanel({ alerts, onDismiss, onDismissAll, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed inset-x-0 top-16 mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80
                 bg-fire-card border border-white/10 rounded-2xl shadow-2xl z-[80] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-xs font-black uppercase tracking-widest text-fire-muted flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Notificações
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-fire-muted hover:text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alert list */}
      <div className="max-h-[60vh] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <BellOff className="w-8 h-8 text-fire-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs text-fire-muted">Nenhuma notificação pendente</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDot(alert.incident_gravidade)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {alert.incident_bairro && (
                      <span className="text-[10px] text-fire-muted">{alert.incident_bairro}</span>
                    )}
                    <span className="text-[10px] text-fire-muted/60">{timeAgo(alert.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 text-fire-muted hover:text-fire-red opacity-0 group-hover:opacity-100 transition-all"
                  title="Dispensar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="px-4 py-3 border-t border-white/5">
          <button
            onClick={onDismissAll}
            className="w-full text-center text-[10px] font-black uppercase tracking-widest text-fire-muted hover:text-white transition-colors py-1"
          >
            Dispensar Todos
          </button>
        </div>
      )}
    </div>
  );
}
