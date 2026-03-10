import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Radio } from 'lucide-react';

const BRASILIA_CENTER: [number, number] = [-15.7801, -47.9292];

const incidents = [
  // Originais
  { id: 'BMB-101', tipo: 'Incêndio Estrutural',    bairro: 'Asa Norte',          gravidade: 'Alta',    lat: -15.7441, lng: -47.8825 },
  { id: 'BMB-103', tipo: 'Resgate',                 bairro: 'Taguatinga',         gravidade: 'Crítica', lat: -15.8330, lng: -48.0520 },
  { id: 'BMB-105', tipo: 'Incêndio Florestal',      bairro: 'Planaltina',         gravidade: 'Crítica', lat: -15.6180, lng: -47.6510 },
  { id: 'BMB-110', tipo: 'Incêndio Residencial',    bairro: 'Sobradinho',         gravidade: 'Alta',    lat: -15.6510, lng: -47.7900 },
  // Novos — Plano Piloto e arredores
  { id: 'BMB-111', tipo: 'Vazamento de Gás',        bairro: 'Asa Sul',            gravidade: 'Alta',    lat: -15.8012, lng: -47.8867 },
  { id: 'BMB-112', tipo: 'Incêndio Residencial',    bairro: 'Cruzeiro',           gravidade: 'Média',   lat: -15.7897, lng: -47.9394 },
  { id: 'BMB-113', tipo: 'Acidente de Trânsito',    bairro: 'Sudoeste',           gravidade: 'Baixa',   lat: -15.7965, lng: -47.9315 },
  { id: 'BMB-114', tipo: 'Incêndio Estrutural',     bairro: 'Octogonal',          gravidade: 'Média',   lat: -15.8064, lng: -47.9401 },
  { id: 'BMB-115', tipo: 'Resgate',                 bairro: 'Lago Norte',         gravidade: 'Alta',    lat: -15.7193, lng: -47.8395 },
  { id: 'BMB-116', tipo: 'Inundação',               bairro: 'Lago Sul',           gravidade: 'Média',   lat: -15.8426, lng: -47.8818 },
  { id: 'BMB-117', tipo: 'Incêndio Florestal',      bairro: 'Lago Sul',           gravidade: 'Alta',    lat: -15.8550, lng: -47.8650 },
  { id: 'BMB-118', tipo: 'Desabamento',             bairro: 'Estrutural',         gravidade: 'Crítica', lat: -15.7756, lng: -47.9902 },
  { id: 'BMB-119', tipo: 'Vazamento de Gás',        bairro: 'Guará',              gravidade: 'Alta',    lat: -15.8173, lng: -47.9780 },
  { id: 'BMB-120', tipo: 'Acidente de Trânsito',    bairro: 'SIA',                gravidade: 'Média',   lat: -15.8271, lng: -47.9414 },
  { id: 'BMB-121', tipo: 'Incêndio Residencial',    bairro: 'Noroeste',           gravidade: 'Baixa',   lat: -15.7600, lng: -47.9350 },
  { id: 'BMB-122', tipo: 'Resgate',                 bairro: 'Varjão',             gravidade: 'Alta',    lat: -15.7173, lng: -47.8753 },
  { id: 'BMB-123', tipo: 'Incêndio Estrutural',     bairro: 'SQN 314',            gravidade: 'Crítica', lat: -15.7570, lng: -47.8950 },
  { id: 'BMB-124', tipo: 'Acidente de Trânsito',    bairro: 'EPNB',               gravidade: 'Alta',    lat: -15.8130, lng: -47.8820 },
  { id: 'BMB-125', tipo: 'Inundação',               bairro: 'Park Way',           gravidade: 'Baixa',   lat: -15.8627, lng: -47.9334 },
  // Taguatinga / Ceilândia / Águas Claras
  { id: 'BMB-126', tipo: 'Incêndio Comercial',      bairro: 'Taguatinga Sul',     gravidade: 'Alta',    lat: -15.8450, lng: -48.0460 },
  { id: 'BMB-127', tipo: 'Resgate',                 bairro: 'Ceilândia Norte',    gravidade: 'Crítica', lat: -15.7950, lng: -48.1130 },
  { id: 'BMB-128', tipo: 'Incêndio Residencial',    bairro: 'Ceilândia Sul',      gravidade: 'Alta',    lat: -15.8353, lng: -48.1093 },
  { id: 'BMB-129', tipo: 'Vazamento de Gás',        bairro: 'Águas Claras',       gravidade: 'Média',   lat: -15.8332, lng: -48.0205 },
  { id: 'BMB-130', tipo: 'Desabamento',             bairro: 'Vicente Pires',      gravidade: 'Alta',    lat: -15.8099, lng: -48.0434 },
  { id: 'BMB-131', tipo: 'Incêndio Florestal',      bairro: 'Ceilândia Leste',    gravidade: 'Crítica', lat: -15.8080, lng: -48.0950 },
  { id: 'BMB-132', tipo: 'Acidente de Trânsito',    bairro: 'EPIA Sul',           gravidade: 'Alta',    lat: -15.8700, lng: -48.0100 },
  // Samambaia / Riacho Fundo / Recanto
  { id: 'BMB-133', tipo: 'Incêndio Residencial',    bairro: 'Samambaia Norte',    gravidade: 'Média',   lat: -15.8600, lng: -48.0700 },
  { id: 'BMB-134', tipo: 'Incêndio Florestal',      bairro: 'Samambaia Sul',      gravidade: 'Crítica', lat: -15.8900, lng: -48.0900 },
  { id: 'BMB-135', tipo: 'Resgate',                 bairro: 'Riacho Fundo I',     gravidade: 'Alta',    lat: -15.8806, lng: -47.9972 },
  { id: 'BMB-136', tipo: 'Inundação',               bairro: 'Riacho Fundo II',    gravidade: 'Média',   lat: -15.8980, lng: -48.0250 },
  { id: 'BMB-137', tipo: 'Incêndio Comercial',      bairro: 'Recanto das Emas',   gravidade: 'Alta',    lat: -15.9099, lng: -48.0596 },
  { id: 'BMB-138', tipo: 'Acidente de Trânsito',    bairro: 'Candangolândia',     gravidade: 'Baixa',   lat: -15.8697, lng: -47.9587 },
  { id: 'BMB-139', tipo: 'Vazamento de Gás',        bairro: 'Núcleo Bandeirante', gravidade: 'Média',   lat: -15.8738, lng: -47.9736 },
  // Gama / Santa Maria
  { id: 'BMB-140', tipo: 'Incêndio Estrutural',     bairro: 'Gama Leste',         gravidade: 'Crítica', lat: -16.0100, lng: -48.0500 },
  { id: 'BMB-141', tipo: 'Incêndio Residencial',    bairro: 'Gama Sul',           gravidade: 'Alta',    lat: -16.0300, lng: -48.0700 },
  { id: 'BMB-142', tipo: 'Desabamento',             bairro: 'Santa Maria Norte',  gravidade: 'Alta',    lat: -15.9950, lng: -47.9900 },
  { id: 'BMB-143', tipo: 'Inundação',               bairro: 'Santa Maria Sul',    gravidade: 'Média',   lat: -16.0150, lng: -48.0050 },
  { id: 'BMB-144', tipo: 'Acidente de Trânsito',    bairro: 'DF-290',             gravidade: 'Alta',    lat: -16.0400, lng: -48.0300 },
  // São Sebastião / Paranoá / Itapoã / Jardim Botânico
  { id: 'BMB-145', tipo: 'Incêndio Florestal',      bairro: 'São Sebastião',      gravidade: 'Crítica', lat: -15.9042, lng: -47.7888 },
  { id: 'BMB-146', tipo: 'Resgate',                 bairro: 'Paranoá',            gravidade: 'Alta',    lat: -15.7721, lng: -47.7740 },
  { id: 'BMB-147', tipo: 'Incêndio Residencial',    bairro: 'Itapoã',             gravidade: 'Média',   lat: -15.7428, lng: -47.7709 },
  { id: 'BMB-148', tipo: 'Incêndio Florestal',      bairro: 'Jardim Botânico',    gravidade: 'Alta',    lat: -15.8765, lng: -47.8241 },
  { id: 'BMB-149', tipo: 'Vazamento de Gás',        bairro: 'São Sebastião Sul',  gravidade: 'Alta',    lat: -15.9200, lng: -47.7700 },
  { id: 'BMB-150', tipo: 'Acidente de Trânsito',    bairro: 'DF-463',             gravidade: 'Baixa',   lat: -15.8500, lng: -47.8100 },
  // Sobradinho / Planaltina / Fercal
  { id: 'BMB-151', tipo: 'Incêndio Comercial',      bairro: 'Sobradinho II',      gravidade: 'Alta',    lat: -15.6300, lng: -47.8000 },
  { id: 'BMB-152', tipo: 'Incêndio Florestal',      bairro: 'Fercal',             gravidade: 'Crítica', lat: -15.5559, lng: -47.8783 },
  { id: 'BMB-153', tipo: 'Resgate',                 bairro: 'Planaltina Norte',   gravidade: 'Média',   lat: -15.5900, lng: -47.6200 },
  { id: 'BMB-154', tipo: 'Desabamento',             bairro: 'Arapoanga',          gravidade: 'Alta',    lat: -15.6050, lng: -47.7100 },
  { id: 'BMB-155', tipo: 'Incêndio Florestal',      bairro: 'Vale do Amanhecer',  gravidade: 'Crítica', lat: -15.6400, lng: -47.6800 },
  // Brazlândia / extremo norte
  { id: 'BMB-156', tipo: 'Incêndio Florestal',      bairro: 'Brazlândia',         gravidade: 'Crítica', lat: -15.6735, lng: -48.1921 },
  { id: 'BMB-157', tipo: 'Acidente de Trânsito',    bairro: 'DF-180',             gravidade: 'Alta',    lat: -15.7100, lng: -48.1500 },
  { id: 'BMB-158', tipo: 'Incêndio Residencial',    bairro: 'Brazlândia Sul',     gravidade: 'Média',   lat: -15.6900, lng: -48.1700 },
  // Rodovias / pontos dispersos
  { id: 'BMB-159', tipo: 'Acidente de Trânsito',    bairro: 'BR-020 KM 14',       gravidade: 'Crítica', lat: -15.6500, lng: -47.9200 },
  { id: 'BMB-160', tipo: 'Incêndio Florestal',      bairro: 'APA Cafuringa',      gravidade: 'Alta',    lat: -15.5200, lng: -48.0800 },
];

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

export function MapaPage() {
  const [selected, setSelected] = useState<(typeof incidents)[0] | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    'Focos de Incêndio': true,
    'Viaturas em Campo': true,
    'Zonas de Risco': false,
    'Hidrantes': false,
  });
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const handleSidePanelClick = (inc: typeof incidents[0]) => {
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
