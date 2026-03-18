import { MapPin } from 'lucide-react';
import { type Service, categoryInfo } from '@/data/services';

interface MapViewProps {
  services: Service[];
}

const MapView = ({ services }: MapViewProps) => {
  // Simulated map with positioned pins
  return (
    <div className="relative w-full h-[400px] bg-map-bg rounded-lg border border-border overflow-hidden">
      {/* Grid lines to simulate map */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Simulated roads */}
        <line x1="0" y1="200" x2="100%" y2="200" stroke="hsl(var(--border))" strokeWidth="3" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(var(--border))" strokeWidth="3" />
        <line x1="0" y1="120" x2="100%" y2="280" stroke="hsl(var(--border))" strokeWidth="2" />
      </svg>

      {/* User location */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-lg animate-pulse" />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded-md font-medium">
          You are here
        </div>
      </div>

      {/* Service pins */}
      {services.map((service, i) => {
        // Distribute pins around center
        const angle = (i / services.length) * 2 * Math.PI;
        const radius = 80 + (i % 3) * 50;
        const x = 50 + (Math.cos(angle) * radius) / 4;
        const y = 50 + (Math.sin(angle) * radius) / 4;
        const cat = categoryInfo[service.category];

        return (
          <div
            key={service.id}
            className="absolute group/pin animate-fade-in cursor-pointer"
            style={{
              left: `${Math.min(90, Math.max(10, x))}%`,
              top: `${Math.min(85, Math.max(15, y))}%`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className="relative">
              <div className={`w-7 h-7 ${cat.colorClass} rounded-full flex items-center justify-center text-xs shadow-md border-2 border-card transition-transform group-hover/pin:scale-125`}>
                {cat.icon}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/pin:block">
                <div className="bg-card text-card-foreground text-xs px-2 py-1 rounded-md shadow-lg border border-border whitespace-nowrap font-medium">
                  {service.name}
                  <span className="text-muted-foreground ml-1">• {service.distance}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <p className="text-[10px] text-muted-foreground font-medium mb-1">Simulated Map View</p>
        <div className="flex items-center gap-1">
          <MapPin size={10} className="text-primary" />
          <span className="text-[10px] text-muted-foreground">{services.length} nearby services</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
