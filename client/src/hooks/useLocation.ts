import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";

export function useLocationData() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations", "active"],
  });

  return { locations, isLoading };
}

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations", "active"],
  });

  useEffect(() => {
    // Try to get saved location from localStorage
    const savedLocationId = localStorage.getItem("currentLocationId");
    if (savedLocationId && locations.length > 0) {
      const savedLocation = locations.find((loc) => loc.id === savedLocationId);
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

export function useLocation() {
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations", "active"],
  });

  const [selectedLocation, setSelectedLocation] = useState<string>("");

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    } else {
      setSelectedLocation("all");
    }
  }, []);

  const selectedLocationData =
    selectedLocation === "all"
      ? null
      : locations.find((loc) => loc.id === selectedLocation);

  return {
    selectedLocation,
    selectedLocationData,
    locations,
    setSelectedLocation,
  };
}
