/**
 * Route Preloading Strategy
 * Preloads critical routes for better user experience
 */

// Critical routes that should be preloaded
const CRITICAL_ROUTES = [
  '/dashboard',
  '/device-registration', 
  '/repair-tracking',
  '/customers',
  '/inventory'
] as const;

// Secondary routes (preload after critical)
const SECONDARY_ROUTES = [
  '/point-of-sale',
  '/appointments',
  '/settings',
  '/analytics'
] as const;

// Lazy route imports
const routeImports = {
  '/dashboard': () => import('@/pages/dashboard'),
  '/device-registration': () => import('@/pages/device-registration'),
  '/repair-tracking': () => import('@/pages/repair-tracking'),
  '/customers': () => import('@/pages/customers'),
  '/inventory': () => import('@/pages/inventory-management'),
  '/point-of-sale': () => import('@/pages/point-of-sale'),
  '/appointments': () => import('@/pages/appointments'),
  '/settings': () => import('@/pages/settings'),
  '/analytics': () => import('@/pages/analytics-hub'),
} as const;

type RouteKey = keyof typeof routeImports;

/**
 * Preload a specific route
 */
export function preloadRoute(route: RouteKey): Promise<any> {
  const importFn = routeImports[route];
  if (!importFn) {
    console.warn(`Route ${route} not found in preload map`);
    return Promise.resolve();
  }
  
  return importFn().catch(error => {
    console.warn(`Failed to preload route ${route}:`, error);
  });
}

/**
 * Preload critical routes immediately
 */
export function preloadCriticalRoutes(): void {
  if (typeof window === 'undefined') return;
  
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      CRITICAL_ROUTES.forEach(route => {
        preloadRoute(route as RouteKey);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      CRITICAL_ROUTES.forEach(route => {
        preloadRoute(route as RouteKey);
      });
    }, 100);
  }
}

/**
 * Preload secondary routes after a delay
 */
export function preloadSecondaryRoutes(): void {
  if (typeof window === 'undefined') return;
  
  setTimeout(() => {
    SECONDARY_ROUTES.forEach(route => {
      preloadRoute(route as RouteKey);
    });
  }, 2000); // Preload after 2 seconds
}

/**
 * Preload routes based on user role
 */
export function preloadRoutesByRole(userRole: string): void {
  if (typeof window === 'undefined') return;
  
  // Always preload critical routes
  preloadCriticalRoutes();
  
  // Role-specific preloading
  switch (userRole) {
    case 'admin':
      // Admins get all routes preloaded
      preloadSecondaryRoutes();
      break;
      
    case 'technician':
      // Technicians get repair and device routes
      preloadRoute('/repair-tracking');
      preloadRoute('/device-registration');
      break;
      
    case 'sales':
      // Sales get customer and POS routes
      preloadRoute('/customers');
      preloadRoute('/point-of-sale');
      break;
  }
}

/**
 * Preload routes on hover (for navigation links)
 */
export function preloadOnHover(route: RouteKey): () => void {
  let preloadPromise: Promise<any> | null = null;
  
  const handleMouseEnter = () => {
    if (!preloadPromise) {
      preloadPromise = preloadRoute(route);
    }
  };
  
  return handleMouseEnter;
}

/**
 * Initialize preloading strategy
 */
export function initializePreloading(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical routes after initial page load
  window.addEventListener('load', () => {
    preloadCriticalRoutes();
    
    // Preload secondary routes after user interaction
    const handleUserInteraction = () => {
      preloadSecondaryRoutes();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
  });
}

