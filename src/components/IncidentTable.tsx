import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { IncidentModal } from './IncidentModal';
import type { ApiIncident } from '../services/incidents';

interface IncidentTableProps {
  incidents: ApiIncident[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { status: string }) => void;
  userRole?: string;
}

type SortKey   = 'id' | 'tipo' | 'gravidade' | 'bairro' | 'status' | 'data';
type SortDir   = 'asc' | 'desc' | null;

const GRAVIDADE_ORDER: Record<string, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 };

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc')  return <ChevronUp   className="w-3 h-3 inline ml-0.5" />;
  if (dir === 'desc') return <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-0.5 opacity-40" />;
}

export function IncidentTable({ incidents, onDelete, onUpdate, userRole }: IncidentTableProps) {
  const [selectedIncident, setSelectedIncident] = useState<ApiIncident | null>(null);
  const [search,  setSearch]  = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('data');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === null) setSortKey('data');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const processed = useMemo(() => {
    const q = search.toLowerCase();
    let rows = q
      ? incidents.filter(
          (inc) =>
            inc.tipo.toLowerCase().includes(q)   ||
            inc.bairro.toLowerCase().includes(q) ||
            inc.status.toLowerCase().includes(q) ||
            inc.id.toLowerCase().includes(q)     ||
            inc.data.includes(q)
        )
      : [...incidents];

    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'gravidade') {
          cmp = (GRAVIDADE_ORDER[a.gravidade] ?? 9) - (GRAVIDADE_ORDER[b.gravidade] ?? 9);
        } else {
          cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [incidents, search, sortKey, sortDir]);

  const getSeverityColor = (g: string) => {
    switch (g.toLowerCase()) {
      case 'crítica': return 'text-fire-red bg-fire-red/20';
      case 'alta':    return 'text-fire-orange bg-fire-orange/20';
      case 'média':   return 'text-fire-yellow bg-fire-yellow/20';
      case 'baixa':   return 'text-fire-green bg-fire-green/20';
      default:        return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'em andamento': return 'text-fire-blue bg-fire-blue/20';
      case 'finalizado':   return 'text-fire-green bg-fire-green/20';
      case 'cancelada':    return 'text-fire-red bg-fire-red/20';
      default:             return 'text-slate-400 bg-slate-400/20';
    }
  };

  const th = (key: SortKey, label: string, extra = '') => (
    <th
      className={`px-5 py-4 cursor-pointer select-none hover:text-white transition-colors ${extra}`}
      onClick={() => handleSort(key)}
    >
      {label}
      <SortIcon dir={sortKey === key ? sortDir : null} />
    </th>
  );

  return (
    <>
      <div className="bg-fire-card border border-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-fire-red shrink-0" />
            <h5 className="text-sm font-bold text-white">Registros Detalhados</h5>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-fire-muted">{processed.length} registro(s)</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fire-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tipo, bairro ou data..."
                className="pl-8 pr-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-fire-muted focus:outline-none focus:border-fire-red w-56"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-[10px] text-fire-muted font-black uppercase tracking-widest">
                {th('id',         'ID')}
                {th('tipo',       'Tipo de Ocorrência')}
                {th('gravidade',  'Gravidade')}
                {th('bairro',     'Bairro / Local')}
                {th('status',     'Status')}
                {th('data',       'Data / Hora')}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processed.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-fire-muted text-sm">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {processed.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-bold text-white group-hover:text-fire-red transition-colors">
                      {inc.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-300 font-medium">
                    {inc.tipo}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${getSeverityColor(inc.gravidade)}`}>
                      {inc.gravidade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-300 font-medium">
                    {inc.bairro}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${getStatusColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-fire-muted">
                    {inc.data}{inc.hora !== undefined ? ` ${String(inc.hora).padStart(2, '0')}h` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
