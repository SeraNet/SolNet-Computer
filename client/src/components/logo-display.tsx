import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LogoDisplayProps {
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
  fallbackText?: string;
}

export default function LogoDisplay({ 
  className = "", 
  width = 100, 
  height = 50, 
  showFallback = true,
  fallbackText = "LOGO"
}: LogoDisplayProps) {
  const { data: logoData, isLoading } = useQuery({
    queryKey: ['logo'],
    queryFn: () => apiRequest('/api/logo', 'GET'),
  });

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
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
      alt="Company Logo"
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        objectFit: 'contain'
      }}
    />
  );
}
