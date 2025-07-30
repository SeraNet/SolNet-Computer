import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface Location {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export function useLocationData() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations/active"],
  });

  return { locations, isLoading };
}

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations/active"],
  });

  useEffect(() => {
    // Try to get saved location from localStorage
    const savedLocationId = localStorage.getItem("currentLocationId");
    if (savedLocationId && locations.length > 0) {
      const savedLocation = locations.find(loc => loc.id === savedLocationId);
      if (savedLocation) {
        setCurrentLocation(savedLocation);
        return;
      }
    }

    // If no saved location or saved location not found, use first active location
    if (locations.length > 0 && !currentLocation) {
      setCurrentLocation(locations[0]);
      localStorage.setItem("currentLocationId", locations[0].id);
    }
  }, [locations, currentLocation]);

  const changeLocation = (location: Location) => {
    setCurrentLocation(location);
    localStorage.setItem("currentLocationId", location.id);
  };

  return {
    currentLocation,
    changeLocation,
    locations,
    isLoading: !locations.length && currentLocation === null,
  };
}