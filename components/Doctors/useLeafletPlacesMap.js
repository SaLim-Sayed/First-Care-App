'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

import { MINIA_CENTER, PIN } from '@/components/Doctors/constants';

/**
 * Leaflet map lifecycle + marker sync for the doctors/places UI.
 */
export function useLeafletPlacesMap({ loading, error, filtered, isAr, showMap }) {
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (loading || error || !mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, { center: MINIA_CENTER, zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loading, error]);

  useEffect(() => {
    if (showMap && mapRef.current)
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
  }, [showMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const ids = new Set(filtered.map((p) => p.id));
    Object.entries(markersRef.current).forEach(([id, m]) => {
      if (!ids.has(Number(id))) {
        m.remove();
        delete markersRef.current[id];
      }
    });

    filtered.forEach((place) => {
      if (markersRef.current[place.id]) return;
      const icon = PIN[place.category] || PIN.default;
      const label = isAr ? place.name : place.nameEn;
      const popup = `
        <div style="min-width:170px;font-family:sans-serif;direction:${isAr ? 'rtl' : 'ltr'}">
          <strong style="font-size:13px">${label}</strong><br/>
          <span style="font-size:11px;color:#555">${place.address}</span>
          ${place.phone ? `<br/><a href="tel:${place.phone}" style="font-size:11px">📞 ${place.phone}</a>` : ''}
          <br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}"
             target="_blank"
             style="display:inline-block;margin-top:6px;padding:4px 10px;background:#2563eb;color:#fff;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none">
            ${isAr ? 'الاتجاهات' : 'Directions'}
          </a>
        </div>`;
      markersRef.current[place.id] = L.marker([place.lat, place.lon], { icon })
        .bindPopup(popup)
        .addTo(map);
    });
  }, [filtered, isAr]);

  return { mapRef, mapDivRef, markersRef };
}
