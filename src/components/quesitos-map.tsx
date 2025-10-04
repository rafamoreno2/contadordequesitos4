'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Quesito } from '@/types';

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

type QuesitosMapProps = {
  quesitos: Quesito[];
};

export default function QuesitosMap({ quesitos }: QuesitosMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Effect for initializing the map ONCE
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) { // Only initialize if ref is available and map is not initialized
      const map = L.map(mapContainerRef.current).setView([40.416775, -3.703790], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    }
    
    // Cleanup function to run when the component is unmounted
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []); // Empty dependency array ensures this runs only once.

  // Effect for updating markers when quesitos data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return; // Don't do anything if map is not ready

    // 1. Clear existing markers from the map and the ref array
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 2. Filter valid quesitos and add new markers
    quesitos.forEach(quesito => {
        const position = geocodeLocation(quesito.location);
        if (position) {
            const popupContent = `
                <div class="font-semibold">${quesito.name}</div>
                <div>Visto en: ${quesito.location}</div>
                <div class="text-xs text-muted-foreground">Añadido por: ${quesito.addedBy.username}</div>
            `;

            const marker = L.marker(position).addTo(map).bindPopup(popupContent);
            markersRef.current.push(marker); // Add new marker to ref
        }
    });

  }, [quesitos]); // This effect re-runs ONLY when the quesitos array changes.

  return <div ref={mapContainerRef} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }} />;
}
