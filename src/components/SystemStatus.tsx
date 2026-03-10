import React from 'react';

export function SystemStatus() {
  return (
    <section className="grid grid-cols-3 gap-6">
      <div className="bg-fire-card p-5 rounded-2xl border border-white/5 flex items-center space-x-6">
        <div className="flex flex-col">
          <h6 className="text-[9px] font-black uppercase tracking-widest text-fire-muted mb-1">Viaturas em Campo</h6>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-black">42</span>
            <span className="bg-fire-green/20 text-fire-green text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Operacional</span>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10"></div>
        <div className="flex flex-col">
          <h6 className="text-[9px] font-black uppercase tracking-widest text-fire-muted mb-1">Brigadistas Ativos</h6>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-black">156</span>
            <span className="bg-fire-green/20 text-fire-green text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Operacional</span>
          </div>
        </div>
      </div>
      
      <div className="col-span-2 flex items-center justify-end pr-4">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black uppercase tracking-widest text-fire-muted mb-1">Status do Sistema</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold">Sincronizado com <span className="text-fire-green">Satélite GOES-16</span></span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fire-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fire-green"></span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
