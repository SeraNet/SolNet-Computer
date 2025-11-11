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
  Globe,
  Brain,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Bell,
  ChevronRight,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Palette,
} from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { useAuth } from "@/hooks/useAuth";
import PrimaryLogoDisplay from "@/components/primary-logo-display";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Standalone Dashboard item (not in a category)
const dashboardItem = {
  name: "Dashboard",
  href: "/",
  icon: LayoutDashboard,
  roles: ["admin", "technician", "sales"],
  description: "Overview and key metrics",
};

// Navigation items with role-based access control and categories
const navigationItems = [
  {
    category: "Operations",
    items: [
      {
        name: "Device Registration",
        href: "/device-registration",
        icon: LaptopMinimal,
        roles: ["admin", "technician"],
        description: "Register new devices",
      },
      {
        name: "Repair Tracking",
        href: "/repair-tracking",
        icon: Wrench,
        roles: ["admin", "technician"],
        description: "Track repair progress",
      },
      {
        name: "Point of Sale",
        href: "/point-of-sale",
        icon: ShoppingCart,
        roles: ["admin", "sales"],
        description: "Process sales transactions",
      },
    ],
  },
  {
    category: "Management",
    items: [
      {
        name: "Inventory",
        href: "/inventory",
        icon: Package,
        roles: ["admin", "technician", "sales"],
        description: "Manage stock and items",
      },
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["admin", "technician", "sales"],
        description: "Customer database",
      },
      {
        name: "Appointments",
        href: "/appointments",
        icon: Calendar,
        roles: ["admin", "technician", "sales"],
        description: "Schedule management",
      },
    ],
  },
  {
    category: "Analytics",
    items: [
      {
        name: "Analytics Hub",
        href: "/analytics-hub",
        icon: BarChart3,
        roles: ["admin", "technician", "sales"],
        description: "Business intelligence",
      },
      {
        name: "Smart Predictions",
        href: "/inventory-predictions",
        icon: TrendingUp,
        roles: ["admin"],
        description: "AI-powered inventory insights",
      },
      {
        name: "Expenses",
        href: "/expenses",
        icon: FileText,
        roles: ["admin"],
        description: "Financial tracking",
      },
      {
        name: "Loan Invoices",
        href: "/loan-invoices",
        icon: Receipt,
        roles: ["admin", "sales"],
        description: "Invoice management",
      },
    ],
  },
  {
    category: "Administration",
    items: [
      {
        name: "Workers",
        href: "/workers",
        icon: Users,
        roles: ["admin"],
        description: "Staff management",
      },
      {
        name: "My Profile",
        href: "/worker-profile",
        icon: User,
        roles: ["admin", "technician", "sales"],
        description: "Personal settings",
      },
      {
        name: "Customer Feedback",
        href: "/customer-feedback",
        icon: MessageSquare,
        roles: ["admin"],
        description: "Customer reviews",
      },
      {
        name: "Service Management",
        href: "/service-management",
        icon: Settings,
        roles: ["admin"],
        description: "Service configuration",
      },
      {
        name: "Import/Export",
        href: "/import-export",
        icon: FileSpreadsheet,
        roles: ["admin"],
        description: "Data management",
      },
      {
        name: "Locations",
        href: "/locations",
        icon: MapPin,
        roles: ["admin"],
        description: "Location settings",
      },
      {
        name: "Owner Profile",
        href: "/owner-profile",
        icon: User,
        roles: ["admin"],
        description: "Business owner settings",
      },
      {
        name: "Notification Preferences",
        href: "/notification-preferences",
        icon: Bell,
        roles: ["admin", "technician", "sales"],
        description: "Alert settings",
      },
      {
        name: "Customer Portal",
        href: "/customer-portal",
        icon: Globe,
        roles: ["admin", "technician", "sales"],
        description: "Public interface",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
        description: "System configuration",
      },
      // Design System - Disabled until fully implemented
      // {
      //   name: "Design System",
      //   href: "/design-system",
      //   icon: Palette,
      //   roles: ["admin"],
      //   description: "UI/UX design documentation",
      //   shortcut: "⌘Y",
      // },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, hasRole, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update CSS custom property for sidebar width
  useEffect(() => {
    const sidebarWidth = isCollapsed ? '4rem' : '18rem'; // 16px = 1rem, so 64px = 4rem, 288px = 18rem
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isCollapsed]);

  // Filter navigation items based on user role
  const visibleCategories = navigationItems
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        user?.role === "admin" ? true : hasRole(item.roles)
      ),
    }))
    .filter((category) => category.items.length > 0);

  // Auto-expand category if current page is in it
  useEffect(() => {
    const currentCategory = visibleCategories.find((category) =>
      category.items.some((item) => item.href === location)
    );

    if (currentCategory && !expandedCategory) {
      setExpandedCategory(currentCategory.category);
    }
  }, [location, visibleCategories, expandedCategory]);

  // Keyboard shortcuts - Sidebar collapse/expand only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Collapse/expand sidebar with Ctrl+B or Cmd+B
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const isCategoryExpanded = (categoryName: string) =>
    expandedCategory === categoryName;

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Get category item count for badge
  const getCategoryItemCount = (categoryName: string) => {
    const category = visibleCategories.find(
      (cat) => cat.category === categoryName
    );
    return category?.items.length || 0;
  };

  const renderNavigationItem = (item: any, index: number, category: string) => {
    const isActive = location === item.href;
    const Icon = item.icon;

    return (
      <TooltipProvider key={item.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                // Staggered animation for items
                isCategoryExpanded(category) && "animate-fade-in-scale"
              )}
              style={{
                animationDelay: isCategoryExpanded(category)
                  ? `${index * 50}ms`
                  : "0ms",
              }}
            >
              {/* Icon with background */}
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-semibold",
                  isActive ? "text-white" : ""
                )}>{item.name}</div>
                {!isCollapsed && item.description && (
                  <div
                    className={cn(
                      "text-xs truncate",
                      isActive
                        ? "text-white/80"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  >
                    {item.description}
                  </div>
                )}
              </div>

            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <TooltipProvider>
      <>
        {/* Mobile Menu Button - Enhanced */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 md:hidden hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            )}
          </button>
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40",
            "transform transition-transform duration-300 ease-in-out",
            isMobile
              ? isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          )}
        >
          <div
            className={cn(
              "flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-slate-950/50 transition-all duration-300",
              isCollapsed ? "w-16" : "w-72"
            )}
          >
            {/* Header - Enhanced */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <PrimaryLogoDisplay
                    width={44}
                    height={44}
                    className="rounded-xl shadow-sm ring-1 ring-slate-200/50"
                    showFallback={true}
                    fallbackText="SN"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      SolNet
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                      {user?.role
                        ? `${
                            user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)
                          } Portal`
                        : "Management System"}
                    </p>
                  </div>
                )}
              </div>
              {!isMobile && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="h-8 w-8 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      {isCollapsed ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeft className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Location Selector - Enhanced */}
            {!isCollapsed && (
              <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <LocationSelector />
              </div>
            )}

            {/* Navigation - Professional Enhanced */}
            <div className="flex-grow overflow-y-auto sidebar-scrollbar px-3 py-4 min-h-0">
              <nav className="space-y-1">
                {/* Dashboard - Standalone */}
                {(user?.role === "admin" || hasRole(dashboardItem.roles)) && (
                  <>
                    {renderNavigationItem(dashboardItem, 0, "standalone")}
                    {/* Separator */}
                    <div className="my-4 border-t border-slate-200 dark:border-slate-800"></div>
                  </>
                )}
                
                {visibleCategories.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider rounded-lg transition-all duration-200 group",
                        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30",
                        "hover:text-blue-600 dark:hover:text-blue-400",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                        isCategoryExpanded(category.category) &&
                          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{category.category}</span>
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-bold">
                          {getCategoryItemCount(category.category)}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-all duration-300",
                          isCategoryExpanded(category.category) &&
                            "rotate-180"
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "space-y-1 overflow-hidden transition-all duration-500 ease-in-out category-items-scrollbar",
                        isCategoryExpanded(category.category)
                          ? "max-h-[400px] opacity-100 overflow-y-auto"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      {category.items.map((item, index) =>
                        renderNavigationItem(item, index, category.category)
                      )}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Quick Logout Button - Clean & Professional */}
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400",
                      "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-all">
                      <LogOut className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                      <span className="font-semibold">Sign Out</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Sign out of your account
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </>
    </TooltipProvider>
  );
}
