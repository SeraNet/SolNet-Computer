import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  CheckCircle,
  AlertTriangle,
  Truck,
  XCircle,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useLocation } from "wouter";

interface DashboardStats {
  activeRepairs: number;
  completedToday: number;
  deliveredDevices: number;
  canceledDevices: number;
  lowStockItems: number;
  todayRevenue: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  status?: string;
  createdAt: string;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  console.log("Dashboard component rendering");

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiRequest("/api/dashboard/stats", "GET"),
  });

  // Fetch recent activities
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery<Activity[]>({
    queryKey: ["dashboard-recent-activities"],
    queryFn: () => apiRequest("/api/dashboard/recent-activities", "GET"),
  });

  console.log("Dashboard stats:", { stats, statsLoading, statsError });
  console.log("Recent activities:", {
    activities,
    activitiesLoading,
    activitiesError,
  });

  const handleQuickRegistration = () => {
    setLocation("/device-registration");
  };

  const handleSearchRepairs = () => {
    setLocation("/repair-tracking");
  };

  // Utility function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl">
          Overview of your computer repair business operations and key metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Active Repairs Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Active Repairs
                </p>
                <p className="text-xs text-gray-500">Devices in progress</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats?.activeRepairs || 0
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Today Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Completed Today
                </p>
                <p className="text-xs text-gray-500">Repairs finished</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats?.completedToday || 0
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivered Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-xs text-gray-500">Total delivered</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats?.deliveredDevices || 0
              )}
            </div>
          </CardContent>
        </Card>

        {/* Canceled Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Canceled</p>
                <p className="text-xs text-gray-500">Total canceled</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats?.canceledDevices || 0
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Low Stock Alert
                </p>
                <p className="text-xs text-gray-500">Items need restocking</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats?.lowStockItems || 0
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Today's Revenue
                </p>
                <p className="text-xs text-gray-500">Total revenue today</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                formatCurrency(Number(stats?.todayRevenue || 0))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Quick Registration
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Register a new device for repair services quickly and
                efficiently
              </p>
              <Button
                onClick={handleQuickRegistration}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Register Device
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Search Repairs
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Search and track repair status with real-time updates
              </p>
              <Button
                onClick={handleSearchRepairs}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Repairs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Recent Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  Loading recent activities...
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 rounded-xl inline-block">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activities found</p>
                </div>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 border border-gray-200/50 hover:border-gray-300/50 animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform duration-300"
                      style={{ backgroundColor: activity.color }}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
