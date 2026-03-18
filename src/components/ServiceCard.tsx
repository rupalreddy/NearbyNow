import { Star, MapPin, Clock, Phone } from 'lucide-react';
import { categoryInfo, type Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const catInfo = categoryInfo[service.category];

  return (
    <div
      className="bg-card rounded-lg border border-border p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-10 h-10 rounded-lg ${catInfo.colorClass} flex items-center justify-center text-lg`}>
            {catInfo.icon}
          </span>
          <div>
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {service.name}
            </h3>
            <span className="text-xs text-muted-foreground font-medium">{catInfo.label}</span>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {service.distance}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>

      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(service.rating) ? 'fill-star text-star' : 'text-border'}
          />
        ))}
        <span className="text-sm font-medium text-foreground ml-1">{service.rating}</span>
        <span className="text-xs text-muted-foreground">({service.reviewCount})</span>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-primary" />
          <span>{service.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-primary" />
          <span>{service.hours}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone size={12} className="text-primary" />
          <span>{service.phone}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {service.tags.map((tag) => (
          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ServiceCard;
