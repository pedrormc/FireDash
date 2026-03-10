import React, { useMemo } from 'react';
import type { Incident } from '../data/mockData';

interface ZoneStatusProps {
  incidents: Incident[];
}

function ringColor(pct: number): string {
  if (pct >= 70) return '#10b981'; // green
  if (pct >= 40) return '#f59e0b'; // orange
  return '#e11d48';                 // red
}

function CircularRing({ pct, size = 88 }: { pct: number; size?: number }) {
  const r       = size * 0.36;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - pct / 100);
  const color   = ringColor(pct);
  const cx = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={size * 0.1}
        />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.1}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-black text-white leading-none">{pct}%</span>
      </div>
    </div>
  );
}

export function ZoneStatus({ incidents }: ZoneStatusProps) {
  const zones = useMemo(() => {
    const map: Record<string, { total: number; finalized: number }> = {};
    incidents.forEach((inc) => {
      if (!map[inc.bairro]) map[inc.bairro] = { total: 0, finalized: 0 };
      map[inc.bairro].total++;
      if (inc.status === 'Finalizado') map[inc.bairro].finalized++;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8)
      .map(([bairro, stats]) => ({
        bairro,
        total:      stats.total,
        finalized:  stats.finalized,
        pct:        Math.round((stats.finalized / stats.total) * 100),
      }));
  }, [incidents]);

  if (zones.length === 0) return null;

  return (
    <div className="bg-fire-card border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-fire-green shrink-0" />
        <h5 className="text-sm font-bold text-white">Contenção por Zona</h5>
        <span className="ml-auto text-[10px] text-fire-muted">% ocorrências finalizadas</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {zones.map(({ bairro, total, finalized, pct }) => (
          <div key={bairro} className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-fire-muted text-center leading-tight line-clamp-2 max-w-[90px]">
              {bairro}
            </p>
            <CircularRing pct={pct} />
            <p className="text-[9px] text-fire-muted text-center">
              {finalized} OK / {total} total
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
