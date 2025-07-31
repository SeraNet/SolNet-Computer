import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  LaptopMinimal,
  Wrench,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  BarChart3,
  MapPin,
  Settings,
  TrendingUp,
  User,
  Receipt,
  DollarSign,
  Globe,
  Brain
} from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { useAuth } from "@/hooks/useAuth";

// Navigation items with role-based access control
const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "technician", "sales"] },
  { name: "Device Registration", href: "/device-registration", icon: LaptopMinimal, roles: ["admin", "technician"] },
  { name: "Repair Tracking", href: "/repair-tracking", icon: Wrench, roles: ["admin", "technician"] },
  { name: "Point of Sale", href: "/point-of-sale", icon: ShoppingCart, roles: ["admin", "sales"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin", "technician", "sales"] },
  { name: "Smart Predictions", href: "/inventory-predictions", icon: TrendingUp, roles: ["admin"] },
  { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "technician", "sales"] },
  { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["admin", "technician", "sales"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin"] },
  { name: "Advanced Analytics", href: "/advanced-analytics", icon: Brain, roles: ["admin"] },
  { name: "Expenses", href: "/expenses", icon: DollarSign, roles: ["admin"] },
  { name: "Loan Invoices", href: "/loan-invoices", icon: Receipt, roles: ["admin", "sales"] },
  { name: "Workers", href: "/workers", icon: Users, roles: ["admin"] },
  { name: "Service Management", href: "/service-management", icon: Settings, roles: ["admin"] },
  { name: "Locations", href: "/locations", icon: MapPin, roles: ["admin"] },
  { name: "Owner Profile", href: "/owner-profile", icon: User, roles: ["admin"] },
  { name: "Customer Portal", href: "/customer-portal", icon: Globe, roles: ["admin", "technician", "sales"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, hasRole } = useAuth();

  // Filter navigation items based on user role
  // Admin users can see all items, others are filtered by role
  const visibleItems = user?.role === 'admin' 
    ? navigationItems 
    : navigationItems.filter(item => !item.roles || hasRole(item.roles));

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="bg-primary text-white p-2 rounded-lg">
              <LaptopMinimal className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">LeulNet</h1>
              <p className="text-sm text-gray-500">
                {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel` : 'Computer Management'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 px-4">
          <LocationSelector />
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-2">
            {visibleItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    ${isActive 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}>
                    <Icon className={`
                      mr-3 h-5 w-5
                      ${isActive ? 'text-primary' : 'text-gray-400'}
                    `} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 group block">
            <div className="flex items-center">
              <div className="inline-block h-9 w-9 rounded-full bg-gray-300"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName || user?.username || 'User'}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Role'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
