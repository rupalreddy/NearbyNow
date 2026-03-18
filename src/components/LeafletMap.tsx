import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Service, categoryInfo } from '@/data/services';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColors: Record<string, string> = {
  hospital: '#e53e3e',
  food: '#dd6b20',
  repair: '#3182ce',
  education: '#805ad5',
  transport: '#2f855a',
  shopping: '#d53f8c',
  hotel: '#c07d20',
  grocery: '#38a169',
};

function createCategoryIcon(category: string) {
  const color = categoryColors[category] || '#2f855a';
  const emoji = categoryInfo[category as keyof typeof categoryInfo]?.icon || '📍';
  return L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

interface LeafletMapProps {
  services: Service[];
  userLocation: [number, number] | null;
}

const LeafletMap = ({ services, userLocation }: LeafletMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = userLocation || [40.7135, -74.006];
    const map = L.map(containerRef.current).setView(center, 14);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and bounds when services or location change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#0ea5e9;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(14,165,233,0.3),0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('📍 Your Location');
      L.circle(userLocation, { radius: 300, color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08, weight: 1 }).addTo(map);
    }

    // Service markers
    const bounds: [number, number][] = userLocation ? [userLocation] : [];
    services.forEach((service) => {
      const cat = categoryInfo[service.category];
      const color = categoryColors[service.category];
      bounds.push([service.lat, service.lng]);

      const popupContent = `
        <div style="min-width:200px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="font-size:16px;">${cat.icon}</span>
            <strong style="font-size:13px;">${service.name}</strong>
          </div>
          <p style="font-size:11px;color:#666;margin:0 0 6px;">${service.description.substring(0, 100)}${service.description.length > 100 ? '…' : ''}</p>
          <div style="font-size:11px;color:#666;">
            <div>📍 ${service.address}</div>
            <div>🕐 ${service.hours}</div>
            ${service.phone !== 'Not listed' ? `<div>📞 ${service.phone}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
            <span style="font-size:12px;font-weight:600;color:${color};">${service.distance} away</span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}" target="_blank" rel="noopener" style="font-size:11px;color:#0ea5e9;text-decoration:none;font-weight:600;">Get Directions →</a>
          </div>
        </div>
      `;

      L.marker([service.lat, service.lng], { icon: createCategoryIcon(service.category) })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Fit bounds
    if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [services, userLocation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] rounded-lg border border-border overflow-hidden shadow-sm"
    />
  );
};

export default LeafletMap;
