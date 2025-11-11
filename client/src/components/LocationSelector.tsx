import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export function LocationSelector() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Fetch locations based on user role
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => apiRequest("/api/locations", "GET"),
    enabled: user?.role === "admin", // Only admins can see all locations
  });

  // Fetch user's assigned location if not admin
  const { data: userLocation } = useQuery<Location>({
    queryKey: ["locations", user?.locationId],
    queryFn: () => apiRequest(`/api/locations/${user?.locationId}`, "GET"),
    enabled: user?.role !== "admin" && !!user?.locationId,
  });

  useEffect(() => {
    if (user?.role === "admin" && locations.length > 0) {
      // Admin: default to "All Locations" or previously selected
      const savedLocation = localStorage.getItem("selectedLocation");
      if (savedLocation && locations.find((loc) => loc.id === savedLocation)) {
        setSelectedLocation(savedLocation);
      } else {
        // Default to "All Locations" (special value for no filter)
        setSelectedLocation("all");
      }
    } else if (user?.role !== "admin" && userLocation) {
      // Non-admin: use assigned location
      setSelectedLocation(userLocation.id);
    }
  }, [user?.role, locations, userLocation]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    if (user?.role === "admin") {
      if (locationId === "all") {
        localStorage.removeItem("selectedLocation");
      } else {
        localStorage.setItem("selectedLocation", locationId);
      }
    }
    // Trigger a custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("locationChanged", { detail: locationId })
    );

    // Refresh the page to apply location filtering
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Don't show selector for non-admin users with assigned location
  if (user?.role !== "admin" && userLocation) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          {userLocation.name} - {userLocation.city}
        </span>
      </div>
    );
  }

  // Don't show selector if no locations available
  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="h-4 w-4 text-gray-500" />
      <Select value={selectedLocation} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Location">
            {selectedLocation === "all"
              ? "🌍 All Locations"
              : selectedLocation
              ? locations.find((loc) => loc.id === selectedLocation)?.name
              : "Select Location"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">🌍 All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              📍 {location.name} - {location.city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
