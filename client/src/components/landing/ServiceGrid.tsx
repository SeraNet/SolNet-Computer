import { Badge } from "@/components/ui/badge";
import { Clock, Monitor, Package, Shield, Wrench } from "lucide-react";
import { Service, InventoryItem } from "@/pages/landing/types";
import { formatCurrency } from "@/lib/currency";

// Format duration in minutes to human-readable format
const formatDuration = (minutes: number) => {
  if (!minutes || minutes === 0) return '0 min';
  
  const months = Math.floor(minutes / (30 * 24 * 60));
  const days = Math.floor((minutes % (30 * 24 * 60)) / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
  if (mins > 0) parts.push(`${mins} min`);

  return parts.join(' ') || '0 min';
};

interface ServiceGridProps {
  services: Service[];
}

export function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <section className="py-8 md:py-10 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container-fluid">
        <div className="text-center mb-8 md:mb-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-semibold"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Professional Services
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Comprehensive repair services for all your technology needs.
            Fast, reliable, and professional solutions with guaranteed
            quality.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
          {services.length > 0 ? services.map((service: Service, index: number) => {
            const IconComponent = Monitor; // Default icon
            return (
              <div
                key={service.id}
                className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-150 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                {service.imageUrl && (
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 pointer-events-none" />
                  </div>
                )}

                {/* Content */}
                <div className="p-1.5 md:p-2.5">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-2 mb-1">
                    {!service.imageUrl && (
                      <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors duration-150">
                        <IconComponent className="h-4.5 w-4.5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[12px] md:text-sm font-medium text-gray-900 mb-0 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {service.name}
                      </h3>
                      {service.category && (
                        <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                          {service.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  {service.basePrice && (
                    <div className="mb-0.5">
                      <span className="text-[15px] md:text-base font-semibold text-blue-700">
                        {formatCurrency(service.basePrice)}
                      </span>
                    </div>
                  )}

                  {/* Duration (secondary) */}
                  {service.estimatedDuration && (
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-blue-600 mb-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(service.estimatedDuration)}</span>
                    </div>
                  )}

                  {/* Features */}
                  {/* hidden in compact layout */}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">
                No services available at the moment.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface AccessoryGridProps {
  accessories: InventoryItem[];
}

export function AccessoryGrid({ accessories }: AccessoryGridProps) {
  return accessories.length > 0 ? (
    <section className="py-8 md:py-10 bg-gradient-to-br from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container-fluid">
        <div className="text-center mb-8 md:mb-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-4 py-2 text-sm font-semibold"
          >
            <Package className="h-4 w-4 mr-2" />
            Quality Products
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
            Accessories & Equipment
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Quality accessories and equipment for all your technology
            needs. Professional-grade products at competitive prices with
            warranty.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
          {accessories.map((accessory: InventoryItem, index: number) => (
            <div
              key={accessory.id}
              className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-150 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              {accessory.imageUrl && (
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={accessory.imageUrl}
                    alt={accessory.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 pointer-events-none" />
                </div>
              )}

              {/* Content */}
              <div className="p-1.5 md:p-2.5">
                {/* Title */}
                <h3 className="text-[12px] md:text-sm font-medium text-gray-900 mb-0.5 line-clamp-2 group-hover:text-blue-700 transition-colors leading-tight">
                  {accessory.name}
                </h3>

                {/* Price - Prominent */}
                <div className="mb-0.5">
                  <span className="text-base md:text-lg font-semibold text-red-600">
                    {formatCurrency(accessory.salePrice ?? 0)}
                  </span>
                </div>

                {/* Badges Row */}
                {(accessory.category || (accessory.quantity ?? 0) <= (accessory.minStockLevel ?? 0)) && (
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {accessory.category && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {accessory.category}
                      </span>
                    )}
                    {(accessory.quantity ?? 0) <= (accessory.minStockLevel ?? 0) && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">
                        Low Stock
                      </span>
                    )}
                  </div>
                )}

                {/* Description (compact) */}
                {accessory.description && (
                  <p className="text-[12px] text-gray-600 leading-snug mb-0.5 line-clamp-2">
                    {accessory.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                  {accessory.brand && <span>{accessory.brand}</span>}
                  {accessory.warranty && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {accessory.warranty}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : (
    <section className="py-24 bg-gradient-to-br from-white via-green-50 to-emerald-50 relative overflow-hidden">
      <div className="relative container-fluid">
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            No accessories available at the moment.
          </div>
        </div>
      </div>
    </section>
  );
}

