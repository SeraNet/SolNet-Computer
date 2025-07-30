import { useState, useEffect, createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";

interface LocationContextType {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  locations: Location[];
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

export function useLocationData() {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["/api/locations/active"],
  });

  return { locations, isLoading };
}

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(() => {
    const saved = localStorage.getItem("currentLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const setCurrentLocation = (location: Location | null) => {
    setCurrentLocationState(location);
    if (location) {
      localStorage.setItem("currentLocation", JSON.stringify(location));
    } else {
      localStorage.removeItem("currentLocation");
    }
  };

  return { currentLocation, setCurrentLocation };
}