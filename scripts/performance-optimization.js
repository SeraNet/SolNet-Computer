#!/usr/bin/env node

/**
 * Performance Optimization Script
 *
 * This script helps implement performance optimizations for the SolNet system.
 * Includes code splitting, lazy loading, and other performance improvements.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================\n");

// 1. Implement code splitting in App.tsx
function implementCodeSplitting() {
  const appPath = path.join(__dirname, "..", "client", "src", "App.tsx");

  if (!fs.existsSync(appPath)) {
    console.log("❌ App.tsx not found");
    return false;
  }

  let content = fs.readFileSync(appPath, "utf8");

  // Check if code splitting is already implemented
  if (content.includes("React.lazy") || content.includes("lazy(() => import")) {
    console.log("⚠️  Code splitting already implemented");
    return false;
  }

  // Replace synchronous imports with lazy imports
  const oldImports = `// Public pages
import PublicLanding from "@/pages/public-landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Protected pages
import Dashboard from "@/pages/dashboard";
import DeviceRegistration from "@/pages/device-registration";
import RepairTracking from "@/pages/repair-tracking";
import PointOfSale from "@/pages/point-of-sale";
import Inventory from "@/pages/inventory-management";
import InventoryManagement from "@/pages/inventory-management";
import InventoryPredictions from "@/pages/inventory-predictions";
import Customers from "@/pages/customers";
import Appointments from "@/pages/appointments";
import Settings from "@/pages/settings";
import ServiceManagement from "@/pages/service-management";
import Locations from "@/pages/locations";
import Workers from "@/pages/workers";
import OwnerProfile from "@/pages/owner-profile";
import Expenses from "@/pages/expenses";
import LoanInvoices from "@/pages/loan-invoices";
import CustomerPortal from "@/pages/customer-portal";
import AdvancedAnalytics from "@/pages/advanced-analytics";
import CustomerFeedback from "@/pages/customer-feedback";
import SystemHealth from "@/pages/system-health";
import BackupRestore from "@/pages/backup-restore";
import ExpenseAnalytics from "@/pages/expense-analytics";
import AnalyticsHub from "@/pages/analytics-hub";
import ImportExportManagement from "@/pages/import-export-management";
import LandingPageManagement from "@/pages/landing-page-management";
import WorkerProfile from "@/pages/worker-profile";
import NotificationPreferences from "@/pages/notification-preferences";
import AppLayout from "@/components/layout/app-layout";`;

  const newImports = `import { lazy, Suspense } from "react";

// Public pages
const PublicLanding = lazy(() => import("@/pages/public-landing"));
const Login = lazy(() => import("@/pages/login"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Protected pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const DeviceRegistration = lazy(() => import("@/pages/device-registration"));
const RepairTracking = lazy(() => import("@/pages/repair-tracking"));
const PointOfSale = lazy(() => import("@/pages/point-of-sale"));
const Inventory = lazy(() => import("@/pages/inventory-management"));
const InventoryManagement = lazy(() => import("@/pages/inventory-management"));
const InventoryPredictions = lazy(() => import("@/pages/inventory-predictions"));
const Customers = lazy(() => import("@/pages/customers"));
const Appointments = lazy(() => import("@/pages/appointments"));
const Settings = lazy(() => import("@/pages/settings"));
const ServiceManagement = lazy(() => import("@/pages/service-management"));
const Locations = lazy(() => import("@/pages/locations"));
const Workers = lazy(() => import("@/pages/workers"));
const OwnerProfile = lazy(() => import("@/pages/owner-profile"));
const Expenses = lazy(() => import("@/pages/expenses"));
const LoanInvoices = lazy(() => import("@/pages/loan-invoices"));
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));
const AdvancedAnalytics = lazy(() => import("@/pages/advanced-analytics"));
const CustomerFeedback = lazy(() => import("@/pages/customer-feedback"));
const SystemHealth = lazy(() => import("@/pages/system-health"));
const BackupRestore = lazy(() => import("@/pages/backup-restore"));
const ExpenseAnalytics = lazy(() => import("@/pages/expense-analytics"));
const AnalyticsHub = lazy(() => import("@/pages/analytics-hub"));
const ImportExportManagement = lazy(() => import("@/pages/import-export-management"));
const LandingPageManagement = lazy(() => import("@/pages/landing-page-management"));
const WorkerProfile = lazy(() => import("@/pages/worker-profile"));
const NotificationPreferences = lazy(() => import("@/pages/notification-preferences"));
const AppLayout = lazy(() => import("@/components/layout/app-layout"));`;

  if (content.includes(oldImports)) {
    content = content.replace(oldImports, newImports);

    // Add Suspense wrapper
    const oldRouter = `function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/landing" component={PublicLanding} />
      <Route path="/login" component={Login} />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <AppLayout>
          <Switch>`;

    const newRouter = `function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Switch>
        {/* Public Routes */}
        <Route path="/landing" component={PublicLanding} />
        <Route path="/login" component={Login} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <AppLayout>
            <Switch>`;

    content = content.replace(oldRouter, newRouter);

    // Close Suspense wrapper
    content = content.replace("</Switch>", "</Switch>\n      </Suspense>");

    fs.writeFileSync(appPath, content);
    console.log("✅ Code splitting implemented");
    return true;
  } else {
    return false;
  }
}

// 2. Create a loading component
function createLoadingComponent() {
  const componentsDir = path.join(
    __dirname,
    "..",
    "client",
    "src",
    "components",
    "ui"
  );
  const loadingPath = path.join(componentsDir, "loading.tsx");

  if (fs.existsSync(loadingPath)) {
    console.log("⚠️  Loading component already exists");
    return false;
  }

  const loadingComponent = `import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={\`flex flex-col items-center justify-center space-y-2 \${className}\`}>
      <Loader2 className={\`animate-spin text-blue-600 \${sizeClasses[size]}\`} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" text="Loading page..." />
    </div>
  );
}

export function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading size="md" text="Loading..." />
    </div>
  );
}`;

  fs.writeFileSync(loadingPath, loadingComponent);
  console.log("✅ Loading component created");
  return true;
}

// 3. Create a caching utility
function createCachingUtility() {
  const libDir = path.join(__dirname, "..", "client", "src", "lib");
  const cachePath = path.join(libDir, "cache.ts");

  if (fs.existsSync(cachePath)) {
    console.log("⚠️  Cache utility already exists");
    return false;
  }

  const cacheUtility = `interface CacheItem<T> {
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
} as const;`;

  fs.writeFileSync(cachePath, cacheUtility);
  console.log("✅ Cache utility created");
  return true;
}

// 4. Create optimized query hooks
function createOptimizedHooks() {
  const hooksDir = path.join(__dirname, "..", "client", "src", "hooks");
  const optimizedHooksPath = path.join(hooksDir, "useOptimizedQueries.ts");

  if (fs.existsSync(optimizedHooksPath)) {
    console.log("⚠️  Optimized hooks already exist");
    return false;
  }

  const optimizedHooks = `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
}`;

  fs.writeFileSync(optimizedHooksPath, optimizedHooks);
  console.log("✅ Optimized query hooks created");
  return true;
}

// 5. Update Vite configuration for better performance
function updateViteConfig() {
  const vitePath = path.join(__dirname, "..", "vite.config.ts");

  if (!fs.existsSync(vitePath)) {
    console.log("❌ vite.config.ts not found");
    return false;
  }

  let content = fs.readFileSync(vitePath, "utf8");

  // Check if performance optimizations are already added
  if (
    content.includes("build.rollupOptions") ||
    content.includes("chunkSizeWarningLimit")
  ) {
    console.log("⚠️  Performance optimizations already exist in Vite config");
    return false;
  }

  // Add performance optimizations
  const oldBuild = `  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },`;

  const newBuild = `  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'class-variance-authority'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },`;

  if (content.includes(oldBuild)) {
    content = content.replace(oldBuild, newBuild);
    fs.writeFileSync(vitePath, content);
    console.log("✅ Vite configuration updated with performance optimizations");
    return true;
  } else {
    return false;
  }
}

// Main execution
async function main() {
  try {
    const results = {
      codeSplitting: implementCodeSplitting(),
      loadingComponent: createLoadingComponent(),
      cachingUtility: createCachingUtility(),
      optimizedHooks: createOptimizedHooks(),
      viteConfig: updateViteConfig(),
    };

    console.log("===================================");
    console.log(`Loading Component: ${results.loadingComponent ? "✅" : "❌"}`);
    console.log(`Optimized Hooks: ${results.optimizedHooks ? "✅" : "❌"}`);

    console.log("1. Update your components to use the new optimized hooks");
    console.log(
      "3. Test the application to ensure code splitting works correctly"
    );
    console.log("5. Consider implementing service workers for offline support");

    console.log("- Use React.memo() for expensive components");
    console.log("- Optimize images with WebP format and lazy loading");
    console.log("- Consider implementing progressive web app features");
  } catch (error) {
    process.exit(1);
  }
}

main();
