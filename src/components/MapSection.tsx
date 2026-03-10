import React from 'react';
import { Plus, Minus, MapPin } from 'lucide-react';

export function MapSection() {
  return (
    <div className="col-span-2 bg-fire-card rounded-2xl overflow-hidden relative shadow-2xl border border-white/5 map-container">
      <div className="absolute top-6 left-6 map-overlay-badge p-4 rounded-xl z-10 w-72">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-fire-red mb-3">Monitoramento em Tempo Real</h5>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-fire-red rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold">Focos Ativos</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-[10px] font-bold">Controlados</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-10">
        <button className="w-10 h-10 bg-fire-card hover:bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
          <Plus className="h-5 w-5" />
        </button>
        <button className="w-10 h-10 bg-fire-card hover:bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
          <Minus className="h-5 w-5" />
        </button>
        <button className="w-10 h-10 bg-fire-red hover:bg-red-700 rounded-lg flex items-center justify-center border border-white/10 shadow-lg mt-2">
          <MapPin className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
