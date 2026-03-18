export type ServiceCategory = 'hospital' | 'food' | 'repair' | 'education' | 'transport' | 'shopping' | 'hotel' | 'grocery';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
  tags: string[];
  source?: 'osm' | 'user'; // track if from API or user-submitted
}

export const categoryInfo: Record<ServiceCategory, { label: string; icon: string; colorClass: string }> = {
  hospital: { label: 'Healthcare', icon: '🏥', colorClass: 'bg-category-health' },
  food: { label: 'Food & Dining', icon: '🍽️', colorClass: 'bg-category-food' },
  repair: { label: 'Repairs', icon: '🔧', colorClass: 'bg-category-repair' },
  education: { label: 'Education', icon: '📚', colorClass: 'bg-category-education' },
  transport: { label: 'Transport', icon: '🚌', colorClass: 'bg-category-transport' },
  shopping: { label: 'Shopping', icon: '🛒', colorClass: 'bg-category-shopping' },
  hotel: { label: 'Hotels', icon: '🏨', colorClass: 'bg-category-hotel' },
  grocery: { label: 'Grocery', icon: '🛍️', colorClass: 'bg-category-grocery' },
};

export const services: Service[] = [
  // === HEALTHCARE ===
  {
    id: '1', name: 'NewYork-Presbyterian Lower Manhattan Hospital', category: 'hospital',
    description: 'Full-service acute care hospital with 24/7 emergency department, cardiology, orthopedics, and maternity services.',
    address: '170 William St, New York, NY 10038', distance: '0.6 km', rating: 4.2, reviewCount: 1843,
    hours: 'Open 24/7', phone: '+1 212-312-5000', lat: 40.7094, lng: -74.0061, tags: ['Emergency', '24/7', 'Maternity'],
  },
  {
    id: '2', name: 'CityMD Downtown Urgent Care', category: 'hospital',
    description: 'Walk-in urgent care clinic for non-emergency medical needs including X-rays, lab tests, and vaccinations.',
    address: '138 Fulton St, New York, NY 10038', distance: '0.4 km', rating: 4.5, reviewCount: 672,
    hours: '8 AM – 9 PM', phone: '+1 212-390-0480', lat: 40.7098, lng: -74.0052, tags: ['Walk-in', 'X-Ray', 'Vaccinations'],
  },
  {
    id: '3', name: 'Bellevue Hospital Center', category: 'hospital',
    description: 'The oldest public hospital in the US offering trauma care, psychiatric services, and comprehensive medical care.',
    address: '462 1st Ave, New York, NY 10016', distance: '4.8 km', rating: 4.0, reviewCount: 3215,
    hours: 'Open 24/7', phone: '+1 212-562-4141', lat: 40.7390, lng: -73.9751, tags: ['Trauma Center', 'Psychiatric', '24/7'],
  },

  // === FOOD & DINING ===
  {
    id: '5', name: 'Shake Shack – Fulton Street', category: 'food',
    description: 'Popular fast-casual chain serving premium burgers, crinkle-cut fries, and hand-spun milkshakes.',
    address: '200 Broadway, New York, NY 10038', distance: '0.3 km', rating: 4.4, reviewCount: 4521,
    hours: '10:30 AM – 11 PM', phone: '+1 646-435-0135', lat: 40.7107, lng: -74.0078, tags: ['Burgers', 'Fast-Casual', 'Milkshakes'],
  },
  {
    id: '7', name: 'Nobu Downtown', category: 'food',
    description: 'World-renowned Japanese-Peruvian fusion restaurant by Chef Nobu Matsuhisa.',
    address: '195 Broadway, New York, NY 10007', distance: '0.4 km', rating: 4.5, reviewCount: 2756,
    hours: '11:30 AM – 11 PM', phone: '+1 212-219-0500', lat: 40.7109, lng: -74.0076, tags: ['Fine Dining', 'Japanese', 'Reservations'],
  },

  // === REPAIRS ===
  {
    id: '9', name: 'uBreakiFix by Asurion – Lower Manhattan', category: 'repair',
    description: 'Professional electronics repair for smartphones, tablets, laptops, and gaming consoles with same-day service.',
    address: '87 Nassau St, New York, NY 10038', distance: '0.4 km', rating: 4.6, reviewCount: 487,
    hours: '10 AM – 7 PM', phone: '+1 212-732-3049', lat: 40.7103, lng: -74.0068, tags: ['Phone Repair', 'Same-Day', 'Laptops'],
  },

  // === EDUCATION ===
  {
    id: '13', name: 'New York Public Library – Battery Park', category: 'education',
    description: 'Public library branch with free computer access, reading programs, community events, and study spaces.',
    address: '175 Greenwich St, New York, NY 10007', distance: '0.5 km', rating: 4.6, reviewCount: 890,
    hours: '10 AM – 6 PM', phone: '+1 212-790-3499', lat: 40.7118, lng: -74.0121, tags: ['Library', 'Free WiFi', 'Study Space'],
  },
  {
    id: '14', name: 'Pace University – NYC Campus', category: 'education',
    description: 'Private university in Lower Manhattan offering undergraduate and graduate programs.',
    address: '1 Pace Plaza, New York, NY 10038', distance: '0.2 km', rating: 4.1, reviewCount: 2340,
    hours: '8 AM – 10 PM', phone: '+1 212-346-1200', lat: 40.7112, lng: -74.0049, tags: ['University', 'Business', 'Arts'],
  },

  // === TRANSPORT ===
  {
    id: '15', name: 'Fulton Street Station (MTA)', category: 'transport',
    description: 'Major subway hub serving A, C, J, Z, 2, 3, 4, 5 lines.',
    address: 'Fulton St & Broadway, New York, NY 10038', distance: '0.1 km', rating: 4.0, reviewCount: 5670,
    hours: 'Open 24/7', phone: '+1 511', lat: 40.7102, lng: -74.0069, tags: ['Subway', 'Accessible', 'Multiple Lines'],
  },
  {
    id: '17', name: 'Staten Island Ferry – Whitehall Terminal', category: 'transport',
    description: 'Free 25-minute ferry ride between Manhattan and Staten Island.',
    address: '4 Whitehall St, New York, NY 10004', distance: '1.0 km', rating: 4.7, reviewCount: 12450,
    hours: '24/7 (every 30 min)', phone: '+1 311', lat: 40.7013, lng: -74.0129, tags: ['Ferry', 'Free', 'Scenic'],
  },

  // === SHOPPING ===
  {
    id: '18', name: 'Westfield World Trade Center', category: 'shopping',
    description: 'Premium shopping mall inside the Oculus featuring 100+ stores.',
    address: '185 Greenwich St, New York, NY 10007', distance: '0.4 km', rating: 4.4, reviewCount: 8920,
    hours: '10 AM – 9 PM', phone: '+1 212-284-9982', lat: 40.7115, lng: -74.0115, tags: ['Mall', 'Fashion', 'Apple Store'],
  },
  {
    id: '19', name: 'Century 21 – Financial District', category: 'shopping',
    description: 'Iconic NYC discount department store offering designer brands at 40-65% off.',
    address: '22 Cortlandt St, New York, NY 10007', distance: '0.3 km', rating: 4.3, reviewCount: 6750,
    hours: '10 AM – 9 PM', phone: '+1 212-227-9092', lat: 40.7100, lng: -74.0097, tags: ['Designer Deals', 'Fashion', 'Accessories'],
  },

  // === HOTELS ===
  {
    id: '22', name: 'The Beekman, A Thompson Hotel', category: 'hotel',
    description: 'Luxury boutique hotel in a restored 1881 landmark with a stunning 9-story Victorian atrium.',
    address: '123 Nassau St, New York, NY 10038', distance: '0.3 km', rating: 4.6, reviewCount: 3200,
    hours: 'Check-in 3 PM / Check-out 12 PM', phone: '+1 212-233-2300', lat: 40.7108, lng: -74.0063, tags: ['Luxury', 'Boutique', 'Historic'],
  },
  {
    id: '23', name: 'Club Quarters Hotel, Wall Street', category: 'hotel',
    description: 'Business-friendly hotel near the NYSE with comfortable rooms and a private club lounge.',
    address: '52 William St, New York, NY 10005', distance: '0.5 km', rating: 4.2, reviewCount: 1850,
    hours: 'Check-in 3 PM / Check-out 12 PM', phone: '+1 212-269-6400', lat: 40.7072, lng: -74.0090, tags: ['Business', 'Lounge', 'Central'],
  },

  // === GROCERY ===
  {
    id: '24', name: 'Whole Foods Market – TriBeCa', category: 'grocery',
    description: 'Premium grocery store with organic produce, artisan bakery, prepared foods bar, and Amazon Prime deals.',
    address: '270 Greenwich St, New York, NY 10007', distance: '0.6 km', rating: 4.3, reviewCount: 3210,
    hours: '7 AM – 10 PM', phone: '+1 212-349-6555', lat: 40.7148, lng: -74.0113, tags: ['Organic', 'Prime Deals', 'Bakery'],
  },
  {
    id: '25', name: 'Gristedes – Financial District', category: 'grocery',
    description: 'Local grocery chain with everyday essentials, deli counter, fresh produce, and household items.',
    address: '71 Broadway, New York, NY 10006', distance: '0.4 km', rating: 3.8, reviewCount: 920,
    hours: '7 AM – 9 PM', phone: '+1 212-363-5100', lat: 40.7078, lng: -74.0120, tags: ['Deli', 'Fresh Produce', 'Essentials'],
  },
];
