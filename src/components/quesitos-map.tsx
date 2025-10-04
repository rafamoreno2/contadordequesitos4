'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Quesito } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from 'next/image';

// SOLUCIÓN DEFINITIVA: Usar URLs de un CDN público para los iconos.
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// "Geocoding" mejorado pero todavía simulado.
const geocodeLocation = (locationName: string): [number, number] | null => {
    if (!locationName || typeof locationName !== 'string') {
        return null;
    }
    const hash = locationName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const lat = 40.416775 + (parseInt(hash.toString().substring(1, 3)) / 50) * (Math.random() - 0.5);
    const lng = -3.703790 + (parseInt(hash.toString().substring(3, 5)) / 50) * (Math.random() - 0.5);
    
    // Mapeo simple para lugares conocidos para hacerlo más realista
    if (locationName.toLowerCase().includes('barcelona')) return [41.3851, 2.1734];
    if (locationName.toLowerCase().includes('sevilla')) return [37.3886, -5.9953];
    if (locationName.toLowerCase().includes('valencia')) return [39.4699, -0.3763];
    if (locationName.toLowerCase().includes('retiro')) return [40.4154, -3.6844];
    if (locationName.toLowerCase().includes('sol')) return [40.4170, -3.7035];


    // Por defecto, una ubicación aleatoria alrededor de Madrid
    return [lat, lng];
}

type QuesitosMapProps = {
  quesitos: Quesito[];
};

type StreetViewQuesito = Quesito & {
  streetViewImage: string;
};


export default function QuesitosMap({ quesitos }: QuesitosMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedQuesito, setSelectedQuesito] = useState<StreetViewQuesito | null>(null);

  // Efecto para inicializar el mapa UNA VEZ
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([40.416775, -3.703790], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    }
    
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  // Efecto para actualizar marcadores cuando cambian los quesitos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    quesitos.forEach((quesito, index) => {
        const position = geocodeLocation(quesito.location);
        if (position) {
            const popupContent = `
                <div class="font-semibold">${quesito.name}</div>
                <div>Visto en: ${quesito.location}</div>
                <div class="text-xs text-muted-foreground">Añadido por: ${quesito.addedBy.username}</div>
            `;
            
            const streetViewImage = `https://source.unsplash.com/800x600/?street,${quesito.location.split(',')[0]}&${index}`;

            const marker = L.marker(position, { icon: defaultIcon })
                .addTo(map)
                .bindPopup(popupContent)
                .on('click', () => {
                    setSelectedQuesito({...quesito, streetViewImage});
                });
            
            markersRef.current.push(marker);
        }
    });

  }, [quesitos]);

  return (
    <>
      <div ref={mapContainerRef} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }} />
      <Dialog open={!!selectedQuesito} onOpenChange={(open) => !open && setSelectedQuesito(null)}>
        <DialogContent className="max-w-3xl p-0">
          {selectedQuesito && (
            <>
            <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold">{selectedQuesito.name}</DialogTitle>
                <DialogDescription>
                    Visto en {selectedQuesito.location}. Añadido por {selectedQuesito.addedBy.username}.
                </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-[4/3] w-full">
                 <Image 
                    src={selectedQuesito.streetViewImage}
                    alt={`Vista de calle para ${selectedQuesito.location}`}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                        className="relative w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl"
                        style={{
                            transform: `translate(${Math.random() * 40 - 20}px, ${Math.random() * 20 + 30}px) rotate(${Math.random() * 20 - 10}deg)`
                        }}
                    >
                        <Image 
                           src="https://em-content.zobj.net/source/samsung/383/cheese-wedge_1f9c0.png"
                           alt="Queso"
                           fill
                           className="object-contain"
                        />
                    </div>
                </div>
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
