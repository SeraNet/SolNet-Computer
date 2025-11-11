import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface IconLogoDisplayProps {
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
  fallbackText?: string;
}

export default function IconLogoDisplay({
  className = "",
  width = 100,
  height = 50,
  showFallback = true,
  fallbackText = "SN",
}: IconLogoDisplayProps) {
  // First try to get icon logo
  const {
    data: iconLogoData,
    isLoading: iconLoading,
    error: iconError,
  } = useQuery({
    queryKey: ["icon-logo"],
    queryFn: () => apiRequest("/api/logo/icon", "GET"),
  });

  // If no icon logo, fallback to primary logo
  const {
    data: primaryLogoData,
    isLoading: primaryLoading,
    error: primaryError,
  } = useQuery({
    queryKey: ["primary-logo"],
    queryFn: () => apiRequest("/api/logo/primary", "GET"),
    enabled: !iconLogoData?.logo?.data, // Only fetch if no icon logo
  });

  const isLoading =
    iconLoading || (primaryLoading && !iconLogoData?.logo?.data);
  const logoData = iconLogoData?.logo?.data ? iconLogoData : primaryLogoData;
  const error = iconError && primaryError;

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  if (error) {
    // Show fallback on error
    if (showFallback) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-gray-600 font-bold text-sm ${className}`}
          style={{ width: `${width}px`, height: `${height}px` }}
          title="Logo loading error"
        >
          {fallbackText}
        </div>
      );
    }
    return null;
  }

  if (!logoData?.logo?.data) {
    if (showFallback) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-gray-600 font-bold text-sm ${className}`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {fallbackText}
        </div>
      );
    }
    return null;
  }

  return (
    <img
      src={logoData.logo.data}
      alt="Icon Logo"
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: "contain",
      }}
    />
  );
}
