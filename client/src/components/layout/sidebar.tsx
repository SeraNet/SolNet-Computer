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
  Settings
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Device Registration", href: "/device-registration", icon: LaptopMinimal },
  { name: "Repair Tracking", href: "/repair-tracking", icon: Wrench },
  { name: "Point of Sale", href: "/point-of-sale", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

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
              <p className="text-sm text-gray-500">Computer Management</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.map((item) => {
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
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
