import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Public pages
import PublicLanding from "@/pages/public-landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Protected pages
import Dashboard from "@/pages/dashboard";
import DeviceRegistration from "@/pages/device-registration-fixed";
import RepairTracking from "@/pages/repair-tracking";
import PointOfSale from "@/pages/point-of-sale";
import Inventory from "@/pages/inventory-complete";
import InventoryManagement from "@/pages/inventory-management";
import InventoryPredictions from "@/pages/inventory-predictions";
import Customers from "@/pages/customers";
import Appointments from "@/pages/appointments";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import ServiceManagement from "@/pages/service-management";
import Locations from "@/pages/locations";
import Workers from "@/pages/workers";
import OwnerProfile from "@/pages/owner-profile";
import Expenses from "@/pages/expenses";
import LoanInvoices from "@/pages/loan-invoices";
import CustomerPortal from "@/pages/customer-portal";
import AdvancedAnalytics from "@/pages/advanced-analytics";
import AppLayout from "@/components/layout/app-layout";

function Router() {
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
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      {isAuthenticated ? (
        <AppLayout>
          <Switch>
            <Route path="/">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            
            <Route path="/dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>

            <Route path="/device-registration">
              <ProtectedRoute requiredPermissions={["manage_devices"]}>
                <DeviceRegistration />
              </ProtectedRoute>
            </Route>

            <Route path="/repair-tracking">
              <ProtectedRoute requiredPermissions={["manage_devices", "update_repairs"]}>
                <RepairTracking />
              </ProtectedRoute>
            </Route>

            <Route path="/point-of-sale">
              <ProtectedRoute requiredPermissions={["manage_sales"]}>
                <PointOfSale />
              </ProtectedRoute>
            </Route>

            <Route path="/inventory">
              <ProtectedRoute requiredPermissions={["view_inventory"]}>
                <Inventory />
              </ProtectedRoute>
            </Route>

            <Route path="/inventory-management">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_inventory"]}>
                <InventoryManagement />
              </ProtectedRoute>
            </Route>

            <Route path="/inventory-predictions">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_inventory"]}>
                <InventoryPredictions />
              </ProtectedRoute>
            </Route>

            <Route path="/customers">
              <ProtectedRoute requiredPermissions={["view_customers"]}>
                <Customers />
              </ProtectedRoute>
            </Route>

            <Route path="/appointments">
              <ProtectedRoute requiredPermissions={["manage_appointments"]}>
                <Appointments />
              </ProtectedRoute>
            </Route>

            <Route path="/analytics">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["view_analytics"]}>
                <Analytics />
              </ProtectedRoute>
            </Route>

            <Route path="/service-management">
              <ProtectedRoute requiredRoles={["admin"]}>
                <ServiceManagement />
              </ProtectedRoute>
            </Route>

            <Route path="/locations">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_locations"]}>
                <Locations />
              </ProtectedRoute>
            </Route>

            <Route path="/workers">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_users"]}>
                <Workers />
              </ProtectedRoute>
            </Route>

            <Route path="/owner-profile">
              <ProtectedRoute requiredRoles={["admin"]}>
                <OwnerProfile />
              </ProtectedRoute>
            </Route>

            <Route path="/expenses">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_expenses"]}>
                <Expenses />
              </ProtectedRoute>
            </Route>

            <Route path="/loan-invoices">
              <ProtectedRoute requiredRoles={["admin", "sales"]} requiredPermissions={["create_invoices"]}>
                <LoanInvoices />
              </ProtectedRoute>
            </Route>

            <Route path="/settings">
              <ProtectedRoute requiredRoles={["admin"]} requiredPermissions={["manage_settings"]}>
                <Settings />
              </ProtectedRoute>
            </Route>

            <Route path="/customer-portal">
              <CustomerPortal />
            </Route>

            <Route path="/advanced-analytics">
              <ProtectedRoute requiredRoles={["admin"]}>
                <AdvancedAnalytics />
              </ProtectedRoute>
            </Route>

            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      ) : (
        /* Public Landing Page for non-authenticated users */
        <Route path="/" component={PublicLanding} />
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
