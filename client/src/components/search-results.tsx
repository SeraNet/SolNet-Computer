import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Laptop,
  User,
  ShoppingCart,
  Calendar,
  ArrowRight,
  X,
  Package,
  Settings,
  Zap,
  Tag,
} from "lucide-react";

interface SearchResult {
  id: string;
  type:
    | "device"
    | "customer"
    | "sale"
    | "inventory"
    | "brand"
    | "model"
    | "accessory"
    | "service";
  title: string;
  subtitle: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface SearchResultsProps {
  results: {
    devices: SearchResult[];
    customers: SearchResult[];
    sales: SearchResult[];
    inventory: SearchResult[];
    brands: SearchResult[];
    models: SearchResult[];
    accessories: SearchResult[];
    serviceTypes: SearchResult[];
    totalResults: number;
  };
  onClose: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "device":
      return <Laptop className="h-4 w-4" />;
    case "customer":
      return <User className="h-4 w-4" />;
    case "sale":
      return <ShoppingCart className="h-4 w-4" />;
    case "inventory":
      return <Package className="h-4 w-4" />;
    case "brand":
      return <Tag className="h-4 w-4" />;
    case "model":
      return <Settings className="h-4 w-4" />;
    case "accessory":
      return <Zap className="h-4 w-4" />;
    case "service":
      return <Settings className="h-4 w-4" />;
    default:
      return <Laptop className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "device":
      return "bg-blue-100 text-blue-800";
    case "customer":
      return "bg-green-100 text-green-800";
    case "sale":
      return "bg-purple-100 text-purple-800";
    case "inventory":
      return "bg-orange-100 text-orange-800";
    case "brand":
      return "bg-indigo-100 text-indigo-800";
    case "model":
      return "bg-teal-100 text-teal-800";
    case "accessory":
      return "bg-pink-100 text-pink-800";
    case "service":
      return "bg-cyan-100 text-cyan-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "device":
      return "Device";
    case "customer":
      return "Customer";
    case "sale":
      return "Sale";
    case "inventory":
      return "Inventory";
    case "brand":
      return "Brand";
    case "model":
      return "Model";
    case "accessory":
      return "Accessory";
    case "service":
      return "Service";
    default:
      return "Item";
  }
};

const getDetailUrl = (result: SearchResult) => {
  const searchParams = new URLSearchParams({
    searchId: result.id,
    searchType: result.type,
    searchTitle: result.title,
    searchSubtitle: result.subtitle,
  });

  switch (result.type) {
    case "device":
      return `/repair-tracking?${searchParams.toString()}`;
    case "customer":
      return `/customers?${searchParams.toString()}`;
    case "sale":
      return `/point-of-sale?${searchParams.toString()}`;
    case "inventory":
      return `/inventory-management?${searchParams.toString()}`;
    case "brand":
      return `/service-management?tab=brands&${searchParams.toString()}`;
    case "model":
      return `/service-management?tab=models&${searchParams.toString()}`;
    case "accessory":
      return `/service-management?tab=accessories&${searchParams.toString()}`;
    case "service":
      return `/service-management?tab=services&${searchParams.toString()}`;
    default:
      return "/";
  }
};

export function SearchResults({
  results,
  onClose,
  onClearSearch,
  isLoading,
}: SearchResultsProps) {
  const { toast } = useToast();
  const allResults = [
    ...results.devices.map((item) => ({ ...item, category: "Devices" })),
    ...results.customers.map((item) => ({ ...item, category: "Customers" })),
    ...results.sales.map((item) => ({ ...item, category: "Sales" })),
    ...results.inventory.map((item) => ({ ...item, category: "Inventory" })),
    ...results.brands.map((item) => ({ ...item, category: "Brands" })),
    ...results.models.map((item) => ({ ...item, category: "Models" })),
    ...results.accessories.map((item) => ({
      ...item,
      category: "Accessories",
    })),
    ...results.serviceTypes.map((item) => ({ ...item, category: "Services" })),
  ];

  if (isLoading) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Searching...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.totalResults === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Search Results
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No results found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try searching for devices, customers, brands, models, or services
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg max-h-96 overflow-y-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            Search Results ({results.totalResults})
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {allResults.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={getDetailUrl(result)}
              onClick={() => {
                onClose();
                onClearSearch?.();
                toast({
                  title: "Search Result Found!",
                  description: `Navigating to ${getTypeLabel(
                    result.type
                  )} page. The item "${result.title}" will be highlighted.`,
                });
              }}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                  {getTypeIcon(result.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </h4>
                    <Badge
                      className={`text-xs ${getStatusColor(result.status)}`}
                    >
                      {result.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 truncate">
                    {result.subtitle}
                  </p>

                  {result.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {result.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {results.totalResults > 15 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              Showing top 15 results. Refine your search for more specific
              results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
