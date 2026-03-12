import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Loader2 } from 'lucide-react';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: Coords | null;
  onChange: (coords: Coords | null) => void;
}

const BRASILIA_CENTER: [number, number] = [-15.7801, -47.9292];

const pickerIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;position:relative;display:flex;align-items:center;justify-content:center">
    <span style="position:absolute;inset:0;border-radius:50%;background:#e11d48;opacity:0.4;animation:fire-ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></span>
    <span style="width:100%;height:100%;border-radius:50%;background:#e11d48;border:2px solid rgba(255,255,255,0.6);position:relative;z-index:1"></span>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickHandler({ onClick }: { onClick: (coords: Coords) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [geoLoading, setGeoLoading] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 200 }}>
        <MapContainer
          center={value ? [value.lat, value.lng] : BRASILIA_CENTER}
          zoom={value ? 14 : 11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ClickHandler onClick={(coords) => onChange(coords)} />
          {value && <Marker position={[value.lat, value.lng]} icon={pickerIcon} />}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading}
          className="flex items-center space-x-1.5 text-[10px] font-bold text-fire-muted hover:text-white transition-colors"
        >
          {geoLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Navigation className="w-3 h-3" />
          )}
          <span>Usar Minha Localiza&ccedil;&atilde;o</span>
        </button>
        {value && (
          <span className="text-[10px] text-fire-muted">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
    </div>
  );
}
