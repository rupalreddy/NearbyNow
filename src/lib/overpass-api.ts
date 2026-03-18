import { type ServiceCategory, type Service, categoryInfo } from '@/data/services';
import { getDistance, formatDistance } from '@/hooks/use-location';

// Maps our categories to OpenStreetMap Overpass API tags
const categoryToOsmTags: Record<ServiceCategory, string[]> = {
  hospital: [
    'node["amenity"="hospital"]',
    'node["amenity"="clinic"]',
    'node["amenity"="doctors"]',
    'node["amenity"="pharmacy"]',
    'way["amenity"="hospital"]',
  ],
  food: [
    'node["amenity"="restaurant"]',
    'node["amenity"="cafe"]',
    'node["amenity"="fast_food"]',
    'node["amenity"="food_court"]',
  ],
  repair: [
    'node["shop"="car_repair"]',
    'node["shop"="electronics_repair"]',
    'node["craft"="plumber"]',
    'node["craft"="electrician"]',
    'node["shop"="bicycle"]',
  ],
  education: [
    'node["amenity"="school"]',
    'node["amenity"="university"]',
    'node["amenity"="library"]',
    'node["amenity"="college"]',
    'way["amenity"="university"]',
    'way["amenity"="school"]',
  ],
  transport: [
    'node["public_transport"="station"]',
    'node["amenity"="bus_station"]',
    'node["railway"="station"]',
    'node["amenity"="ferry_terminal"]',
  ],
  shopping: [
    'node["shop"="mall"]',
    'node["shop"="department_store"]',
    'node["shop"="clothes"]',
    'way["shop"="mall"]',
  ],
  hotel: [
    'node["tourism"="hotel"]',
    'node["tourism"="motel"]',
    'node["tourism"="guest_house"]',
    'node["tourism"="hostel"]',
    'way["tourism"="hotel"]',
  ],
  grocery: [
    'node["shop"="supermarket"]',
    'node["shop"="convenience"]',
    'node["shop"="greengrocer"]',
    'node["shop"="bakery"]',
    'node["shop"="butcher"]',
  ],
};

const categoryTagLabels: Record<ServiceCategory, string[]> = {
  hospital: ['Medical', 'Healthcare', 'Clinic'],
  food: ['Dining', 'Takeout', 'Dine-in'],
  repair: ['Service', 'Repair', 'Maintenance'],
  education: ['Learning', 'Campus', 'Study'],
  transport: ['Transit', 'Commute', 'Public'],
  shopping: ['Retail', 'Mall', 'Fashion'],
  hotel: ['Stay', 'Lodging', 'Rooms'],
  grocery: ['Groceries', 'Fresh', 'Daily Needs'],
};

function guessCategory(tags: Record<string, string>): ServiceCategory {
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'doctors' || tags.amenity === 'pharmacy') return 'hospital';
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food' || tags.amenity === 'food_court') return 'food';
  if (tags.shop === 'car_repair' || tags.shop === 'electronics_repair' || tags.craft === 'plumber' || tags.craft === 'electrician') return 'repair';
  if (tags.amenity === 'school' || tags.amenity === 'university' || tags.amenity === 'library' || tags.amenity === 'college') return 'education';
  if (tags.public_transport || tags.railway || tags.amenity === 'bus_station' || tags.amenity === 'ferry_terminal') return 'transport';
  if (tags.tourism === 'hotel' || tags.tourism === 'motel' || tags.tourism === 'guest_house' || tags.tourism === 'hostel') return 'hotel';
  if (tags.shop === 'supermarket' || tags.shop === 'convenience' || tags.shop === 'greengrocer' || tags.shop === 'bakery' || tags.shop === 'butcher') return 'grocery';
  if (tags.shop === 'mall' || tags.shop === 'department_store' || tags.shop === 'clothes') return 'shopping';
  return 'shopping';
}

function buildDescription(tags: Record<string, string>, category: ServiceCategory): string {
  const parts: string[] = [];
  if (tags.cuisine) parts.push(`Cuisine: ${tags.cuisine.replace(/;/g, ', ')}`);
  if (tags.healthcare) parts.push(`Healthcare: ${tags.healthcare}`);
  if (tags.operator) parts.push(`Operated by ${tags.operator}`);
  if (tags.brand) parts.push(tags.brand);
  if (tags.stars) parts.push(`${tags.stars}-star`);
  if (tags.description) return tags.description;
  if (parts.length > 0) return parts.join('. ') + '.';
  const cat = categoryInfo[category];
  return `${cat.label} service located nearby.`;
}

function buildHours(tags: Record<string, string>): string {
  if (tags.opening_hours) {
    const h = tags.opening_hours;
    if (h === '24/7') return 'Open 24/7';
    return h.length > 40 ? h.substring(0, 40) + '…' : h;
  }
  return 'Hours not listed';
}

export async function fetchNearbyServices(
  lat: number,
  lng: number,
  radiusMeters: number = 3000,
  categories?: ServiceCategory[]
): Promise<Service[]> {
  const catsToFetch = categories && categories.length > 0
    ? categories
    : (Object.keys(categoryToOsmTags) as ServiceCategory[]);

  const queries = catsToFetch.flatMap((cat) => categoryToOsmTags[cat]);
  const overpassQuery = `
    [out:json][timeout:15];
    (
      ${queries.map((q) => `${q}(around:${radiusMeters},${lat},${lng});`).join('\n      ')}
    );
    out center body 50;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(overpassQuery)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();

  const services: Service[] = data.elements
    .filter((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      return elLat && elLng && el.tags?.name;
    })
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const tags = el.tags || {};
      const category = guessCategory(tags);
      const dist = getDistance(lat, lng, elLat, elLng);

      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
      ].filter(Boolean).join(', ') || tags['addr:full'] || 'Address not available';

      return {
        id: `osm-${el.id}`,
        name: tags.name,
        category,
        description: buildDescription(tags, category),
        address,
        distance: formatDistance(dist),
        rating: tags.stars ? parseFloat(tags.stars) : (3.5 + Math.random() * 1.4),
        reviewCount: Math.floor(20 + Math.random() * 500),
        hours: buildHours(tags),
        phone: tags.phone || tags['contact:phone'] || 'Not listed',
        lat: elLat,
        lng: elLng,
        tags: categoryTagLabels[category].slice(0, 2).concat(
          tags.cuisine ? [tags.cuisine.split(';')[0]] : [],
          tags.brand ? [tags.brand] : [],
          tags.wheelchair === 'yes' ? ['Accessible'] : [],
        ).slice(0, 4),
        source: 'osm' as const,
        _distanceKm: dist,
      } as Service & { _distanceKm: number };
    })
    .sort((a: any, b: any) => a._distanceKm - b._distanceKm);

  return services;
}
