import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocationData, useCurrentLocation } from "@/hooks/useLocation";
import type { Location } from "@shared/schema";

export function LocationSelector() {
  const { locations, isLoading } = useLocationData();
  const { currentLocation, setCurrentLocation } = useCurrentLocation();

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-48">
        <MapPin className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <Button variant="outline" disabled className="w-48">
        <MapPin className="mr-2 h-4 w-4" />
        No locations
      </Button>
    );
  }

  // Auto-select first location if none selected
  if (!currentLocation && locations.length > 0) {
    setCurrentLocation(locations[0]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">
              {currentLocation ? currentLocation.name : "Select Location"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {locations.map((location: Location) => (
          <DropdownMenuItem
            key={location.id}
            onClick={() => setCurrentLocation(location)}
            className={currentLocation?.id === location.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{location.name}</span>
              <span className="text-xs text-muted-foreground">
                {location.code} • {location.city}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}