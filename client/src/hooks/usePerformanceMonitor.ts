import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    mounted.current = true;
    startTime.current = Date.now();

    return () => {
      if (mounted.current) {
        const loadTime = Date.now() - startTime.current;
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 ${componentName} loaded in ${loadTime}ms`);
        }

        // Store metrics for analysis
        const metrics: PerformanceMetrics = {
          componentName,
          loadTime,
          timestamp: Date.now()
        };

        // Store in localStorage for development analysis
        if (process.env.NODE_ENV === 'development') {
          const existingMetrics = JSON.parse(
            localStorage.getItem('performance-metrics') || '[]'
          );
          existingMetrics.push(metrics);
          
          // Keep only last 100 entries
          if (existingMetrics.length > 100) {
            existingMetrics.splice(0, existingMetrics.length - 100);
          }
          
          localStorage.setItem('performance-metrics', JSON.stringify(existingMetrics));
        }
      }
    };
  }, [componentName]);

  return {
    getLoadTime: () => Date.now() - startTime.current
  };
}

// Hook for measuring route transitions
export function useRoutePerformance(routeName: string) {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    
    return () => {
      const loadTime = Date.now() - startTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🛣️ Route ${routeName} rendered in ${loadTime}ms`);
      }
    };
  }, [routeName]);
}

// Utility to get performance metrics
export function getPerformanceMetrics(): PerformanceMetrics[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('performance-metrics') || '[]');
  } catch {
    return [];
  }
}

// Utility to clear performance metrics
export function clearPerformanceMetrics() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('performance-metrics');
}

