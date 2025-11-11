import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PrimaryLogoDisplayProps {
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
  fallbackText?: string;
}

export default function PrimaryLogoDisplay({
  className = "",
  width = 100,
  height = 50,
  showFallback = true,
  fallbackText = "SN",
}: PrimaryLogoDisplayProps) {
  const {
    data: logoData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["primary-logo"],
    queryFn: () => apiRequest("/api/public/logo/primary", "GET"),
  });

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
          className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm rounded-lg ${className}`}
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
          className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm rounded-lg ${className}`}
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
      alt="Primary Logo"
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: "contain",
      }}
    />
  );
}
