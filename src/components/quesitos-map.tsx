'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Quesito } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon not showing up in Next.js
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new L.Icon({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

type QuesitosMapProps = {
  quesitos: Quesito[];
};

// Dummy "geocoding" - VERY basic, just to get some coordinates.
// In a real app, you'd use a proper geocoding service.
const geocodeLocation = (locationName: string): [number, number] | null => {
    if (!locationName || typeof locationName !== 'string') {
        return null;
    }
    const hash = locationName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const lat = 40.416775 + (parseInt(hash.toString().substring(1, 3)) / 50) * (Math.random() - 0.5);
    const lng = -3.703790 + (parseInt(hash.toString().substring(3, 5)) / 50) * (Math.random() - 0.5);
    
    // Simple mapping for some known places to make it more realistic
    if (locationName.toLowerCase().includes('barcelona')) return [41.385063, 2.173404];
    if (locationName.toLowerCase().includes('sevilla')) return [37.388630, -5.995340];
    if (locationName.toLowerCase().includes('valencia')) return [39.469907, -0.376288];

    // Default to a random location around Madrid
    return [lat, lng];
}


export default function QuesitosMap({ quesitos }: QuesitosMapProps) {
  const mapCenter: [number, number] = [40.416775, -3.703790]; // Centered on Spain

  const validQuesitos = quesitos.map(q => ({
      ...q,
      position: geocodeLocation(q.location)
  })).filter(q => q.position !== null) as (Quesito & { position: [number, number] })[];


  return (
    <MapContainer center={mapCenter} zoom={6} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validQuesitos.map((quesito) => (
        <Marker key={quesito.id} position={quesito.position}>
          <Popup>
            <div className="font-semibold">{quesito.name}</div>
            <div>Visto en: {quesito.location}</div>
            <div className="text-xs text-muted-foreground">Añadido por: {quesito.addedBy.username}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
