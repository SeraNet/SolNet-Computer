import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DeviceRegistration from "@/pages/device-registration";
import RepairTracking from "@/pages/repair-tracking";
import PointOfSale from "@/pages/point-of-sale";
import Inventory from "@/pages/inventory";
import InventoryManagement from "@/pages/inventory-management";
import Customers from "@/pages/customers";
import Appointments from "@/pages/appointments";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import ServiceManagement from "@/pages/service-management";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/device-registration" component={DeviceRegistration} />
        <Route path="/repair-tracking" component={RepairTracking} />
        <Route path="/point-of-sale" component={PointOfSale} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory-management" component={InventoryManagement} />
        <Route path="/customers" component={Customers} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/service-management" component={ServiceManagement} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
