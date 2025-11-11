interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private storage = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.storage.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.has(key) && !this.isExpired(key);
  }

  private isExpired(key: string): boolean {
    const item = this.storage.get(key);
    if (!item) return true;
    
    return Date.now() - item.timestamp > item.ttl;
  }
}

export const cache = new Cache();

// Cache keys
export const CACHE_KEYS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  DEVICES: 'devices',
  INVENTORY: 'inventory',
  SETTINGS: 'settings',
  BUSINESS_PROFILE: 'business_profile',
  LOCATIONS: 'locations',
  DEVICE_TYPES: 'device_types',
  BRANDS: 'brands',
  MODELS: 'models',
  SERVICE_TYPES: 'service_types'
} as const;

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000 // 1 hour
} as const;