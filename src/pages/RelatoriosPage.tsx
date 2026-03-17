import React, { useState } from 'react';
import { FileText, Download, Filter, Search, Eye } from 'lucide-react';
import { IncidentModal } from '../components/IncidentModal';
import { getStatusColor, getSeverityColor } from '../utils/statusColors';
import type { ApiIncident } from '../services/incidents';

const GRAVIDADES = ['Todas', 'Crítica', 'Alta', 'Média', 'Baixa'];
const STATUS_OPTIONS = ['Todos', 'Em Andamento', 'Finalizado', 'Cancelada', 'Arquivado'];

interface RelatoriosPageProps {
  incidents: ApiIncident[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { status: string }) => void;
  userRole?: string;
}

export function RelatoriosPage({ incidents, onDelete, onUpdate, userRole }: RelatoriosPageProps) {
  const [search, setSearch] = useState('');
  const [gravidade, setGravidade] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [selectedIncident, setSelectedIncident] = useState<ApiIncident | null>(null);

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.tipo.toLowerCase().includes(search.toLowerCase()) ||
      inc.bairro.toLowerCase().includes(search.toLowerCase());
    const matchGravidade = gravidade === 'Todas' || inc.gravidade === gravidade;
    const matchStatus = status === 'Todos' || inc.status === status;
    return matchSearch && matchGravidade && matchStatus;
  });

  return (
    <>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Relatórios de Ocorrências</h2>
            <p className="text-xs text-fire-muted uppercase tracking-widest mt-1">Histórico e filtros de incidentes registrados</p>
          </div>
          <button className="flex items-center space-x-2 bg-fire-red hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-fire-red/20">
            <Download className="h-4 w-4" />
            <span className="text-sm">Exportar CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-fire-card border border-white/5 rounded-2xl p-5 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px] sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fire-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, tipo ou bairro..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-fire-muted focus:outline-none focus:border-fire-red"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-fire-muted" />
            <span className="text-xs text-fire-muted uppercase tracking-wider">Gravidade:</span>
            <div className="flex gap-2 flex-wrap">
              {GRAVIDADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGravidade(g)}
                  className={`px-3 py-1 text-[10px] font-black rounded uppercase tracking-wider transition-colors ${
                    gravidade === g ? 'bg-fire-red text-white' : 'bg-black/30 text-fire-muted hover:text-white border border-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-fire-muted uppercase tracking-wider">Status:</span>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 text-[10px] font-black rounded uppercase tracking-wider transition-colors ${
                    status === s ? 'bg-fire-red text-white' : 'bg-black/30 text-fire-muted hover:text-white border border-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-fire-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h5 className="text-xs font-bold uppercase tracking-widest text-fire-muted flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Registros</span>
            </h5>
            <span className="text-[10px] font-bold text-fire-muted">{filtered.length} resultado(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 border-b border-white/5 text-[10px] text-fire-muted font-black uppercase tracking-widest">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Gravidade</th>
                  <th className="px-6 py-4">Bairro</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-fire-muted text-sm">Nenhum registro encontrado.</td>
                  </tr>
                )}
                {filtered.map((incident) => (
                  <tr key={incident.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-fire-red transition-colors">{incident.id}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{incident.tipo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${getSeverityColor(incident.gravidade)}`}>
                        {incident.gravidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{incident.bairro}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="flex items-center space-x-1 text-[10px] font-bold text-fire-muted hover:text-white transition-colors uppercase tracking-wider"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <IncidentModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onDelete={onDelete ? (id) => { onDelete(id); setSelectedIncident(null); } : undefined}
        onUpdate={onUpdate}
        userRole={userRole}
      />
    </>
  );
}
