import { useState, useEffect } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

const DEFAULT_LOCATION: UserLocation = {
  lat: 40.7135,
  lng: -74.006,
  label: 'Downtown, NYC (default)',
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReal, setIsReal] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your Location',
        });
        setIsReal(true);
        setLoading(false);
      },
      (err) => {
        setError('Location access denied — using default');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resetToDefault = () => {
    setLocation(DEFAULT_LOCATION);
    setIsReal(false);
    setError(null);
  };

  return { location, loading, error, isReal, requestLocation, resetToDefault };
}

// Haversine distance in km
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
