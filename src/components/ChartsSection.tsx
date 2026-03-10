import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import type { Incident } from '../data/mockData';

type Periodo = 'hoje' | 'semana' | 'mes';

interface ChartsSectionProps {
  incidents: Incident[];
  periodo: Periodo;
  today?: string;
}

const TooltipBase = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ color: '#9ca3af', fontSize: 10, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const AXIS_TICK = { fill: '#9ca3af', fontSize: 9, fontWeight: 700 };
const GRID = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />;

export function ChartsSection({ incidents, periodo, today: todayProp }: ChartsSectionProps) {
  const TODAY = todayProp || new Date().toISOString().split('T')[0];

  // Normalize incident date (API may return ISO timestamp)
  const normalizeDate = (d: string) => (typeof d === 'string' ? d.split('T')[0] : d);

  // ── Left chart: temporal flow (area) ──────────────────────────
  const areaData = useMemo(() => {
    if (periodo === 'hoje') {
      const counts: Record<number, number> = {};
      incidents.forEach((inc) => {
        if (normalizeDate(inc.data) === TODAY && inc.hora !== undefined)
          counts[inc.hora] = (counts[inc.hora] || 0) + 1;
      });
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${String(h).padStart(2, '0')}h`,
        ocorrencias: counts[h] || 0,
      }));
    }
    if (periodo === 'semana') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(TODAY);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
          label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
          ocorrencias: incidents.filter((inc) => normalizeDate(inc.data) === dateStr).length,
        };
      });
    }
    // mes
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        ocorrencias: incidents.filter((inc) => normalizeDate(inc.data) === dateStr).length,
      };
    });
  }, [incidents, periodo, TODAY]);

  // ── Right chart: by type (bar) ─────────────────────────────────
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((inc) => {
      const key = inc.tipo
        .replace('Incêndio ', 'Inc. ')
        .replace('Acidente de Trânsito', 'Trânsito')
        .replace('Vazamento de Gás', 'Gás');
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tipo, total]) => ({ tipo, total }));
  }, [incidents]);

  const periodoLabel =
    periodo === 'hoje' ? 'Hoje (por hora)' :
    periodo === 'semana' ? 'Últimos 7 dias' : 'Últimos 30 dias';

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Area chart — temporal flow */}
      <div className="bg-fire-card border border-white/5 rounded-2xl p-5 flex flex-col min-h-[340px]">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-fire-orange shrink-0" />
          <h5 className="text-sm font-bold text-white">
            Ocorrências por Período
          </h5>
          <span className="ml-auto text-[10px] text-fire-muted">{periodoLabel}</span>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradFire" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              {GRID}
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                interval={periodo === 'mes' ? 4 : periodo === 'semana' ? 0 : 3}
              />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBase />} />
              <Area
                type="monotone"
                dataKey="ocorrencias"
                name="Ocorrências"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#areaGradFire)"
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart — by type */}
      <div className="bg-fire-card border border-white/5 rounded-2xl p-5 flex flex-col min-h-[340px]">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <h5 className="text-sm font-bold text-white">
            Incidências por Tipo
          </h5>
          <span className="ml-auto text-[10px] text-fire-muted">{incidents.length} total</span>
        </div>
        {barData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-fire-muted text-xs">
            Nenhum dado para o filtro selecionado.
          </div>
        ) : (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                {GRID}
                <XAxis
                  dataKey="tipo"
                  tick={{ ...AXIS_TICK, fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={52}
                />
                <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipBase />} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </section>
  );
}
