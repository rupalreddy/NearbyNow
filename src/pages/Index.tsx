import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navigation, MapPin, Locate, LocateOff, Loader2, RefreshCw, Wifi, WifiOff, User, LogOut } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ServiceCard from '@/components/ServiceCard';
import LeafletMap from '@/components/LeafletMap';
import AddBusinessDialog from '@/components/AddBusinessDialog';
import AuthDialog from '@/components/AuthDialog';
import { services as fallbackServices, type ServiceCategory, type Service } from '@/data/services';
import { useUserLocation, getDistance, formatDistance } from '@/hooks/use-location';
import { fetchNearbyServices } from '@/lib/overpass-api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [showMap, setShowMap] = useState(true);
  const { location, loading: locLoading, error: locError, isReal, requestLocation, resetToDefault } = useUserLocation();

  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [userBusinesses, setUserBusinesses] = useState<Service[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [radius, setRadius] = useState(3000);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch user-submitted businesses
  const fetchUserBusinesses = useCallback(async () => {
    const { data } = await supabase
      .from('user_businesses')
      .select('*')
      .eq('status', 'approved');

    if (data) {
      setUserBusinesses(data.map((b) => ({
        id: `ub-${b.id}`,
        name: b.name,
        category: b.category as ServiceCategory,
        description: b.description,
        address: b.address,
        distance: formatDistance(getDistance(location.lat, location.lng, b.lat, b.lng)),
        rating: 4.0,
        reviewCount: 0,
        hours: b.hours || 'Hours not listed',
        phone: b.phone || 'Not listed',
        lat: b.lat,
        lng: b.lng,
        tags: b.tags || [],
        source: 'user' as const,
      })));
    }
  }, [location.lat, location.lng]);

  useEffect(() => {
    fetchUserBusinesses();
  }, [fetchUserBusinesses]);

  const loadLiveServices = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const results = await fetchNearbyServices(location.lat, location.lng, radius);
      setLiveServices(results);
      setIsLive(true);
    } catch (err: any) {
      console.error('Overpass API error:', err);
      setApiError('Could not load live data — showing pre-loaded services.');
      setIsLive(false);
    } finally {
      setApiLoading(false);
    }
  }, [location.lat, location.lng, radius]);

  useEffect(() => {
    if (isReal) {
      loadLiveServices();
    }
  }, [isReal, location.lat, location.lng]);

  const baseServices = useMemo(() => {
    const live = isLive ? liveServices : fallbackServices;
    return [...live, ...userBusinesses];
  }, [isLive, liveServices, userBusinesses]);

  const enriched = useMemo(() => {
    return baseServices.map((s) => ({
      ...s,
      distanceKm: getDistance(location.lat, location.lng, s.lat, s.lng),
      distance: formatDistance(getDistance(location.lat, location.lng, s.lat, s.lng)),
    }));
  }, [baseServices, location]);

  const filtered = useMemo(() => {
    return enriched
      .filter((s) => {
        const matchesCategory = !selectedCategory || s.category === selectedCategory;
        const matchesQuery =
          !query ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          s.description.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [enriched, query, selectedCategory]);

  const handleUseLocation = () => {
    if (isReal) {
      resetToDefault();
      setIsLive(false);
      setLiveServices([]);
    } else {
      requestLocation();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Signed out');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Navigation size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-foreground leading-tight">NearbyNow</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Smart Service Discovery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border border-border">
              {isLive ? (
                <>
                  <Wifi size={10} className="text-primary" />
                  <span className="text-primary">LIVE</span>
                </>
              ) : (
                <>
                  <WifiOff size={10} className="text-muted-foreground" />
                  <span className="text-muted-foreground">DEMO</span>
                </>
              )}
            </div>

            <button
              onClick={handleUseLocation}
              disabled={locLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {locLoading ? (
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isReal ? (
                <LocateOff size={13} className="text-muted-foreground" />
              ) : (
                <Locate size={13} className="text-primary" />
              )}
              <span className="hidden sm:inline">{isReal ? 'Use Default' : '📍 My Location'}</span>
            </button>

            {/* Add Business */}
            {user ? (
              <AddBusinessDialog
                userLocation={isReal ? { lat: location.lat, lng: location.lng } : null}
                onAdded={fetchUserBusinesses}
              />
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <User size={13} />
                <span className="hidden sm:inline">Sign In to Add</span>
              </button>
            )}

            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => {}} />

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Errors */}
        {(locError || apiError) && (
          <div className="bg-accent/10 border border-accent/30 text-accent rounded-lg px-4 py-2 text-sm text-center">
            {locError || apiError}
          </div>
        )}

        {/* Hero */}
        <div className="text-center space-y-2 py-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Find Services <span className="text-primary">Near You</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {isLive
              ? `Showing real services within ${radius >= 1000 ? (radius / 1000) + ' km' : radius + ' m'} of your location.`
              : 'Enable your location to discover real services nearby, or browse demo data.'}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar query={query} onQueryChange={setQuery} />
        </div>

        {/* Radius selector (only when live) */}
        {isReal && (
          <div className="flex justify-center items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Radius:</span>
            {[1000, 2000, 3000, 5000].map((r) => (
              <button
                key={r}
                onClick={() => { setRadius(r); }}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  radius === r
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {r >= 1000 ? `${r / 1000} km` : `${r} m`}
              </button>
            ))}
            <button
              onClick={loadLiveServices}
              disabled={apiLoading}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {apiLoading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Refresh
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="flex justify-center">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Loading state */}
        {apiLoading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching for real services near you…</p>
          </div>
        )}

        {/* Map toggle + Map */}
        {!apiLoading && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> services found
                {isLive ? ' near your location' : ' (demo data)'}
              </p>
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-primary font-medium hover:underline"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && (
              <LeafletMap
                services={filtered}
                userLocation={[location.lat, location.lng]}
              />
            )}

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>

            {filtered.length === 0 && !apiLoading && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No services found matching your search.</p>
                <button
                  onClick={() => { setQuery(''); setSelectedCategory(null); }}
                  className="mt-3 text-primary font-medium hover:underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>NearbyNow — Powered by OpenStreetMap</p>
      </footer>
    </div>
  );
};

export default Index;
