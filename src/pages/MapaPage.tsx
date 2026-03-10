import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Radio } from 'lucide-react';
import type { ApiIncident } from '../services/incidents';

const BRASILIA_CENTER: [number, number] = [-15.7801, -47.9292];

interface MapIncident {
  id: string;
  tipo: string;
  bairro: string;
  gravidade: string;
  lat: number;
  lng: number;
}

interface MapaPageProps {
  incidents: ApiIncident[];
}

const layerOptions = ['Focos de Incêndio', 'Viaturas em Campo', 'Zonas de Risco', 'Hidrantes'] as const;

function gravityColor(gravidade: string) {
  switch (gravidade) {
    case 'Crítica': return '#e11d48';
    case 'Alta':    return '#f59e0b';
    case 'Média':   return '#eab308';
    case 'Baixa':   return '#10b981';
    default:        return '#9ca3af';
  }
}

function createIncidentIcon(gravidade: string, selected: boolean) {
  const color = gravityColor(gravidade);
  const size = selected ? 26 : 18;
  return L.divIcon({
    className: '',
    html: `<div class="fire-marker-wrap" style="width:${size}px;height:${size}px;--mc:${color}">
      <span class="fire-marker-ping"></span>
      <span class="fire-marker-dot"></span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 6],
  });
}

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export function MapaPage({ incidents: rawIncidents }: MapaPageProps) {
  // Filter incidents that have lat/lng
  const incidents = useMemo<MapIncident[]>(() => {
    return rawIncidents
      .filter((inc) => inc.latitude != null && inc.longitude != null)
      .map((inc) => ({
        id: inc.id,
        tipo: inc.tipo,
        bairro: inc.bairro,
        gravidade: inc.gravidade,
        lat: Number(inc.latitude),
        lng: Number(inc.longitude),
      }));
  }, [rawIncidents]);

  const [selected, setSelected] = useState<MapIncident | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    'Focos de Incêndio': true,
    'Viaturas em Campo': true,
    'Zonas de Risco': false,
    'Hidrantes': false,
  });
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const handleSidePanelClick = (inc: MapIncident) => {
    if (selected?.id === inc.id) {
      setSelected(null);
      setFlyTarget(null);
      return;
    }
    setSelected(inc);
    setFlyTarget([inc.lat, inc.lng]);
    setTimeout(() => {
      markerRefs.current[inc.id]?.openPopup();
    }, 1300);
  };

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getGravityStyle = (gravidade: string) => {
    switch (gravidade) {
      case 'Crítica': return 'text-fire-red bg-fire-red/20';
      case 'Alta':    return 'text-fire-orange bg-fire-orange/20';
      case 'Média':   return 'text-yellow-500 bg-yellow-500/20';
      case 'Baixa':   return 'text-fire-green bg-fire-green/20';
      default:        return 'text-slate-400 bg-slate-400/20';
    }
  };

  return (
    <div className="p-8 space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-black text-white">Vista do Mapa</h2>
        <p className="text-xs text-fire-muted uppercase tracking-widest mt-1">
          Monitoramento geográfico em tempo real
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden relative min-h-[500px] border border-white/5">
          <MapContainer
            center={BRASILIA_CENTER}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <FlyToLocation position={flyTarget} />

            {activeLayers['Focos de Incêndio'] &&
              incidents.map((inc) => (
                <Marker
                  key={inc.id}
                  position={[inc.lat, inc.lng]}
                  icon={createIncidentIcon(inc.gravidade, selected?.id === inc.id)}
                  ref={(r) => { markerRefs.current[inc.id] = r; }}
                  eventHandlers={{
                    click: () => {
                      setSelected((prev) => prev?.id === inc.id ? null : inc);
                    },
                  }}
                >
                  <Popup>
                    <p className="text-[10px] font-black text-fire-muted uppercase tracking-widest">{inc.id}</p>
                    <p className="text-xs font-bold text-white mt-1">{inc.tipo}</p>
                    <p className="text-[10px] text-fire-muted mt-0.5">{inc.bairro}</p>
                    <span className={`mt-2 inline-block px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${getGravityStyle(inc.gravidade)}`}>
                      {inc.gravidade}
                    </span>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Monitoring badge overlay */}
          <div className="absolute top-4 left-4 map-overlay-badge p-4 rounded-xl z-[1000] w-64 pointer-events-none">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-fire-red mb-3">
              Monitoramento em Tempo Real
            </h5>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-fire-red rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white">Focos Ativos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-white">Controlados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 flex flex-col gap-4 min-h-0">
          {/* Incident list */}
          <div className="bg-fire-card border border-white/5 rounded-2xl p-5 flex flex-col min-h-0 flex-1">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-fire-muted mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Focos Ativos no Mapa</span>
              </span>
              <span className="bg-fire-red/20 text-fire-red px-2 py-0.5 rounded text-[9px] font-black">{incidents.length}</span>
            </h5>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {incidents.length === 0 && (
                <p className="text-xs text-fire-muted text-center py-4">Nenhum incidente com coordenadas.</p>
              )}
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => handleSidePanelClick(inc)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?.id === inc.id
                      ? 'bg-fire-red/10 border-fire-red/40'
                      : 'bg-black/20 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-fire-muted">{inc.id}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${getGravityStyle(inc.gravidade)}`}>
                      {inc.gravidade}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{inc.tipo}</p>
                  <p className="text-[10px] text-fire-muted mt-0.5">{inc.bairro}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Layer controls */}
          <div className="bg-fire-card border border-white/5 rounded-2xl p-5 flex-shrink-0">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-fire-muted mb-4 flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Camadas do Mapa</span>
            </h5>
            <div className="space-y-2">
              {layerOptions.map((layer) => (
                <label
                  key={layer}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <span className="text-xs text-zinc-300">{layer}</span>
                  <button
                    onClick={() => toggleLayer(layer)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      activeLayers[layer] ? 'bg-fire-red' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                        activeLayers[layer] ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
