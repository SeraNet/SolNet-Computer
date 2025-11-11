import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Optimized query with caching
export function useOptimizedQuery<T>(
  key: string[],
  url: string,
  options?: {
    ttl?: number;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<T> => {
      // Check cache first
      const cacheKey = key.join(':');
      const cached = cache.get<T>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Fetch from API
      const data = await apiRequest<T>(url);
      
      // Cache the result
      cache.set(cacheKey, data, options?.ttl || CACHE_TTL.MEDIUM);
      
      return data;
    },
    staleTime: options?.staleTime || CACHE_TTL.MEDIUM,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Optimized mutation with cache invalidation
export function useOptimizedMutation<T, V>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: {
    invalidateQueries?: string[][];
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: V): Promise<T> => {
      return apiRequest<T>(url, method, variables);
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Clear cache for invalidated queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          const cacheKey = queryKey.join(':');
          cache.delete(cacheKey);
        });
      }
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

// Predefined optimized hooks for common entities
export function useCustomers() {
  return useOptimizedQuery(
    [CACHE_KEYS.CUSTOMERS],
    '/api/customers',
    { ttl: CACHE_TTL.MEDIUM }
  );
}

export function useDevices() {
  return useOptimizedQuery(
    [CACHE_KEYS.DEVICES],
    '/api/devices',
    { ttl: CACHE_TTL.SHORT }
  );
}

export function useInventory() {
  return useOptimizedQuery(
    [CACHE_KEYS.INVENTORY],
    '/api/inventory',
    { ttl: CACHE_TTL.MEDIUM }
  );
}

export function useBusinessProfile() {
  return useOptimizedQuery(
    [CACHE_KEYS.BUSINESS_PROFILE],
    '/api/business-profile',
    { ttl: CACHE_TTL.LONG }
  );
}

export function useSettings() {
  return useOptimizedQuery(
    [CACHE_KEYS.SETTINGS],
    '/api/settings',
    { ttl: CACHE_TTL.VERY_LONG }
  );
}