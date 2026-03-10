import React from 'react';
import { Flame, Shield, Clock, AlertTriangle } from 'lucide-react';

type KpiColor = 'orange' | 'blue' | 'green' | 'red';

interface Kpi {
  title:    string;
  value:    string;
  subtitle: string;
  icon:     string;
  color:    KpiColor;
}

interface KpiCardsProps {
  kpis: Kpi[];
}

const COLOR_MAP: Record<KpiColor, { bar: string; icon: string }> = {
  orange: { bar: 'from-orange-400 to-yellow-300',  icon: 'text-orange-400' },
  blue:   { bar: 'from-blue-500 to-indigo-400',    icon: 'text-blue-400'   },
  green:  { bar: 'from-emerald-500 to-teal-400',   icon: 'text-emerald-400'},
  red:    { bar: 'from-rose-500 to-orange-400',    icon: 'text-rose-400'   },
};
// Tailwind v4 uses bg-linear-to-r, applied via inline style fallback below

function KpiIcon({ name, className }: { name: string; className: string }) {
  const cls = `h-9 w-9 ${className}`;
  switch (name) {
    case 'Flame':         return <Flame         className={cls} />;
    case 'Shield':        return <Shield        className={cls} />;
    case 'Clock':         return <Clock         className={cls} />;
    case 'AlertTriangle': return <AlertTriangle className={cls} />;
    default:              return null;
  }
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {kpis.map((kpi, idx) => {
        const c = COLOR_MAP[kpi.color];
        return (
          <div key={idx} className="bg-fire-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            {/* Colored top bar */}
            <div className={`h-[3px] w-full bg-linear-to-r ${c.bar}`} />

            <div className="p-5 flex flex-col flex-1">
              {/* Icon + label row */}
              <div className="flex items-start justify-between mb-3">
                <KpiIcon name={kpi.icon} className={c.icon} />
                <span className="text-[10px] font-black uppercase tracking-widest text-fire-muted text-right leading-tight max-w-[110px]">
                  {kpi.title}
                </span>
              </div>

              {/* Value */}
              <span className="text-4xl font-black text-white leading-none">
                {kpi.value}
              </span>

              {/* Subtitle */}
              <span className="mt-1.5 text-[11px] text-fire-muted leading-tight">
                {kpi.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
