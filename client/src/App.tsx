import {
  lazy,
  Suspense,
  Component,
  ErrorInfo,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/components/RoleGuard";
import {
  initializePreloading,
  preloadRoutesByRole,
} from "@/utils/preloadRoutes";

// Import these directly (not lazy) to prevent flash issues
import AppLayout from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

// Public pages (lazy loaded)
const PublicLanding = lazy(() => import("@/pages/public-landing"));
const Login = lazy(() => import("@/pages/login"));

// Protected pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const DeviceRegistration = lazy(() => import("@/pages/device-registration"));
const RepairTracking = lazy(() => import("@/pages/repair-tracking"));
const PointOfSale = lazy(() => import("@/pages/point-of-sale"));
const Inventory = lazy(() => import("@/pages/inventory-management"));
const InventoryManagement = lazy(() => import("@/pages/inventory-management"));
const InventoryPredictions = lazy(
  () => import("@/pages/inventory-predictions")
);
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
const ImportExportManagement = lazy(
  () => import("@/pages/import-export-management")
);
const WorkerProfile = lazy(() => import("@/pages/worker-profile"));
const NotificationPreferences = lazy(
  () => import("@/pages/notification-preferences")
);
const Sales = lazy(() => import("@/pages/sales"));
const DesignSystem = lazy(() => import("@/pages/design-system"));

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              An error occurred while loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { isAuthenticated, isLoading, user, isInitialized } = useAuth();
  const [location, setLocation] = useLocation();

  // Authentication state managed internally

  // Initialize preloading strategy
  useEffect(() => {
    initializePreloading();
  }, []);

  // Preload routes based on user role
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      preloadRoutesByRole(user.role);
    }
  }, [isAuthenticated, user?.role]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isAuthenticated && (location === "/login" || location === "/")) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, location, setLocation]);

  // Show loading until authentication is fully initialized
  if (!isInitialized || isLoading) {
    return <PageLoadingSpinner text="Loading application..." />;
  }

  // If trying to access a protected route while not authenticated, show loading briefly
  // This prevents 404 flash when auth state is transitioning
  const protectedRoutes = ['/dashboard', '/device-registration', '/repair-tracking', 
    '/point-of-sale', '/inventory', '/inventory-management', '/customers', '/appointments',
    '/analytics-hub', '/settings', '/workers', '/expenses', '/owner-profile'];
  
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));
  
  if (isProtectedRoute && !isAuthenticated) {
    // Check if we have a token in localStorage - if yes, auth is loading
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
    if (hasToken) {
      return <PageLoadingSpinner text="Authenticating..." />;
    }
  }

  // If not authenticated, show public routes
  // Use key prop to force re-mount when auth state changes
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoadingSpinner text="Loading page..." />}>
        <Switch key="public-routes">
          <Route path="/" component={PublicLanding} />
          <Route path="/landing" component={PublicLanding} />
          <Route path="/login" component={Login} />
          <Route
            path="/basic-test"
            component={() => (
              <div>Basic React Test - If you see this, React is working!</div>
            )}
          />
          <Route
            path="/simple-test"
            component={() => (
              <div className="p-6">
                <h1>Simple Test Page</h1>
                <p>This is a simple test page without any API calls.</p>
                <p>If you can see this, the routing is working.</p>
                <div className="mt-4 p-4 bg-blue-100 rounded">
                  <h2>Current Time:</h2>
                  <p>{new Date().toLocaleString()}</p>
                </div>
              </div>
            )}
          />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // If authenticated, show protected routes
  // Use key prop to force re-mount when auth state changes
  return (
    <AppLayout>
      <Suspense fallback={<PageLoadingSpinner text="Loading page..." />}>
        <Switch key="protected-routes">
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route
            path="/test-simple-dashboard"
            component={() => (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "red",
                  color: "white",
                }}
              >
                <h1>RED TEST PAGE</h1>
                <p>
                  If you can see this red background, the routing is working!
                </p>
                <p>Current time: {new Date().toLocaleString()}</p>
              </div>
            )}
          />
          <Route
            path="/test-dashboard"
            component={() => {
              try {
                return <Dashboard />;
              } catch (error: any) {
                console.error("Dashboard error:", error);
                return (
                  <div className="p-6">
                    <h1>Dashboard Error</h1>
                    <p>
                      Error loading dashboard:{" "}
                      {error?.message || "Unknown error"}
                    </p>
                    <pre>{error?.stack || "No stack trace"}</pre>
                  </div>
                );
              }
            }}
          />

          <Route
            path="/device-registration"
            component={() => (
              <RoleGuard requiredPermissions={["manage_devices"]}>
                <DeviceRegistration />
              </RoleGuard>
            )}
          />
          <Route
            path="/test-device-registration"
            component={DeviceRegistration}
          />
          <Route
            path="/repair-tracking"
            component={() => (
              <RoleGuard
                requiredPermissions={["manage_devices", "update_repairs"]}
              >
                <RepairTracking />
              </RoleGuard>
            )}
          />
          <Route
            path="/point-of-sale"
            component={() => (
              <RoleGuard requiredPermissions={["manage_sales"]}>
                <PointOfSale />
              </RoleGuard>
            )}
          />
          <Route
            path="/sales"
            component={() => (
              <RoleGuard requiredPermissions={["manage_sales"]}>
                <Sales />
              </RoleGuard>
            )}
          />
          <Route
            path="/inventory"
            component={() => (
              <RoleGuard requiredPermissions={["view_inventory"]}>
                <Inventory />
              </RoleGuard>
            )}
          />
          <Route
            path="/inventory-management"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <InventoryManagement />
              </RoleGuard>
            )}
          />

          <Route
            path="/inventory-predictions"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <InventoryPredictions />
              </RoleGuard>
            )}
          />
          <Route
            path="/customers"
            component={() => (
              <RoleGuard requiredPermissions={["view_customers"]}>
                <Customers />
              </RoleGuard>
            )}
          />
          <Route
            path="/appointments"
            component={() => (
              <RoleGuard requiredPermissions={["manage_appointments"]}>
                <Appointments />
              </RoleGuard>
            )}
          />
          <Route
            path="/analytics"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <AnalyticsHub />
              </RoleGuard>
            )}
          />
          <Route
            path="/service-management"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <ServiceManagement />
              </RoleGuard>
            )}
          />
          <Route
            path="/customer-feedback"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <CustomerFeedback />
              </RoleGuard>
            )}
          />

          <Route
            path="/locations"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <Locations />
              </RoleGuard>
            )}
          />
          <Route
            path="/workers"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <Workers />
              </RoleGuard>
            )}
          />
          <Route
            path="/owner-profile"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <OwnerProfile />
              </RoleGuard>
            )}
          />
          <Route
            path="/expenses"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <Expenses />
              </RoleGuard>
            )}
          />
          <Route
            path="/expense-analytics"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <ExpenseAnalytics />
              </RoleGuard>
            )}
          />
          <Route
            path="/analytics-hub"
            component={() => (
              <RoleGuard
                requiredRoles={["admin", "technician", "sales"]}
              >
                <AnalyticsHub />
              </RoleGuard>
            )}
          />
          <Route
            path="/loan-invoices"
            component={() => (
              <RoleGuard
                requiredRoles={["admin", "sales"]}
              >
                <LoanInvoices />
              </RoleGuard>
            )}
          />
          <Route
            path="/settings"
            component={() => (
              <RoleGuard
                requiredRoles={["admin"]}
              >
                <Settings />
              </RoleGuard>
            )}
          />
          <Route path="/customer-portal" component={CustomerPortal} />
          <Route
            path="/advanced-analytics"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <AdvancedAnalytics />
              </RoleGuard>
            )}
          />
          <Route
            path="/system-health"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <SystemHealth />
              </RoleGuard>
            )}
          />
          <Route
            path="/backup-restore"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <BackupRestore />
              </RoleGuard>
            )}
          />
          <Route
            path="/import-export"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <ImportExportManagement />
              </RoleGuard>
            )}
          />
          <Route path="/worker-profile" component={WorkerProfile} />
          <Route
            path="/notification-preferences"
            component={NotificationPreferences}
          />
          <Route
            path="/design-system"
            component={() => (
              <RoleGuard requiredRoles={["admin"]}>
                <DesignSystem />
              </RoleGuard>
            )}
          />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
