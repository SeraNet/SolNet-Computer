import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout/page-layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Zap,
  Shield,
  AlertCircle,
  Brain,
  Users,
  Wrench,
  ShoppingCart,
  Package,
  Activity,
  Globe,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Bell,
  Info,
  Lightbulb,
  TrendingUpIcon,
  BarChart4,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Import existing analytics components
import Analytics from "./analytics";
import AdvancedAnalytics from "./advanced-analytics";

// Import extracted analytics modules
import { ExpenseAnalyticsModule } from "./analytics/expense-analytics-module";
import { AnalyticsModule } from "./analytics/analytics-module-card";
import { AnalyticsData, AnalyticsState } from "./analytics/types";
import { MissingAnalyticsModule } from "./analytics/missing-analytics-module";

// Main Analytics Hub Component
export default function AnalyticsHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState("overview");

  // Enhanced state management
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    isRealTime: false,
    autoRefresh: false,
    refreshInterval: 30000, // 30 seconds
    showInsights: true,
    compactView: false,
    lastUpdate: new Date(),
    notifications: [],
  });

  // Real-time updates effect
  useEffect(() => {
    if (!analyticsState.autoRefresh) return;

    const interval = setInterval(() => {
      setAnalyticsState((prev) => ({
        ...prev,
        lastUpdate: new Date(),
      }));
      refetchOverview();
    }, analyticsState.refreshInterval);

    return () => clearInterval(interval);
  }, [analyticsState.autoRefresh, analyticsState.refreshInterval]);

  // Add notification helper
  const addNotification = (
    type: "info" | "warning" | "success" | "error",
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };

    setAnalyticsState((prev) => ({
      ...prev,
      notifications: [...prev.notifications, notification].slice(-5), // Keep last 5
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAnalyticsState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter(
          (n) => n.id !== notification.id
        ),
      }));
    }, 5000);
  };

  // Check permissions for different analytics modules
  const canViewExpenseAnalytics = user && user.role === "admin";
  const canViewGeneralAnalytics =
    user &&
    (user.role === "admin" ||
      user.role === "technician" ||
      user.role === "sales");
  const canViewAdvancedAnalytics = user && user.role === "admin";

  // Fetch overview data
  const {
    data: overviewData,
    isLoading: overviewLoading,
    refetch: refetchOverview,
    error: overviewError,
  } = useQuery<AnalyticsData>({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiRequest("/api/analytics", "GET"),
  });

  // Handle overview error
  React.useEffect(() => {
    if (overviewError) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    }
  }, [overviewError, toast]);

  // Fetch forecast data for revenue projections
  const { data: forecastData } = useQuery({
    queryKey: ["analytics", "forecast"],
    queryFn: () => apiRequest("/api/analytics/forecast", "GET"),
  });

  // Fetch system status
  const { data: systemStatus } = useQuery({
    queryKey: ["system", "status"],
    queryFn: async () => {
      try {
        await apiRequest("/api/auth/verify", "GET");
        return { database: "Connected", api: "Online", analytics: "Active" };
      } catch (error) {
        return { database: "Error", api: "Offline", analytics: "Inactive" };
      }
    },
  });

  return (
    <PageLayout
      title="Analytics Hub"
      subtitle="Comprehensive analytics and reporting dashboard with real-time insights"
      icon={BarChart4}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchOverview();
              addNotification("info", "Data refreshed successfully");
            }}
            disabled={overviewLoading}
            aria-label="Refresh analytics data"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                overviewLoading ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />
            {overviewLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setAnalyticsState((prev) => ({
                ...prev,
                autoRefresh: !prev.autoRefresh,
              }))
            }
            className={
              analyticsState.autoRefresh
                  ? "bg-green-50 border-green-200 text-green-700"
                  : ""
              }
            aria-label={analyticsState.autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
            aria-pressed={analyticsState.autoRefresh}
            >
              <Activity className="h-4 w-4 mr-2" aria-hidden="true" />
              {analyticsState.autoRefresh ? "Auto On" : "Auto Off"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAnalyticsState((prev) => ({
                  ...prev,
                  showInsights: !prev.showInsights,
                }))
              }
              className={
                analyticsState.showInsights
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : ""
              }
              aria-label={analyticsState.showInsights ? "Hide insights" : "Show insights"}
              aria-pressed={analyticsState.showInsights}
            >
              {analyticsState.showInsights ? (
                <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              Insights
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Export all analytics data"
              onClick={() => {
                // Comprehensive export functionality
                const exportData = {
                  timestamp: new Date().toISOString(),
                  overview: overviewData,
                  forecast: forecastData,
                  expenseAnalytics: canViewExpenseAnalytics
                    ? "Available"
                    : "Not accessible",
                  generalAnalytics: canViewGeneralAnalytics
                    ? "Available"
                    : "Not accessible",
                  advancedAnalytics: canViewAdvancedAnalytics
                    ? "Available"
                    : "Not accessible",
                  systemStatus: systemStatus,
                  exportInfo: {
                    timestamp: new Date().toISOString(),
                    user: user?.email,
                    userRole: user?.role,
                    activeModule: activeModule,
                  },
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analytics-hub-export-${
                  new Date().toISOString().split("T")[0]
                }.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                addNotification(
                  "success",
                  "Analytics data exported successfully"
                );
                toast({
                  title: "Success",
                  description: "Analytics data exported successfully",
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export All
            </Button>
          </div>
      }
    >
      {/* Status Bar */}
      <Card className="card-elevated mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.database === "Connected"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                Database: {systemStatus?.database || "Checking..."}
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.api === "Online" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                API: {systemStatus?.api || "Checking..."}
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    analyticsState.autoRefresh ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-600"
                  }`}
                ></div>
                Auto-refresh: {analyticsState.autoRefresh ? "On" : "Off"}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Last updated: {analyticsState.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {analyticsState.notifications.length > 0 && (
        <div className="space-y-2 mb-6">
          {analyticsState.notifications.map((notification) => (
            <Alert
              key={notification.id}
              className={`border-l-4 ${
                notification.type === "success"
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600"
                  : notification.type === "warning"
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600"
                  : notification.type === "error"
                  ? "border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600"
                  : "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
              }`}
            >
              <AlertDescription className="flex items-center justify-between">
                <span className="text-slate-900 dark:text-slate-100">{notification.message}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}


      {/* Enhanced Module Navigation */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6" role="navigation" aria-label="Analytics modules">
        <Card
          className={`card-elevated cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 ${
            activeModule === "overview"
              ? "ring-2 ring-blue-500 dark:ring-blue-400"
              : ""
          }`}
          onClick={() => setActiveModule("overview")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveModule("overview");
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Overview module"
          aria-pressed={activeModule === "overview"}
        >
          <CardContent className="p-6 bg-white dark:bg-slate-900">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              {activeModule === "overview" && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Active
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Overview
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Key metrics and performance indicators
            </p>
          </CardContent>
        </Card>

        {canViewExpenseAnalytics && (
          <Card
            className={`card-elevated cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-green-500 ${
              activeModule === "expenses"
                ? "ring-2 ring-green-500 dark:ring-green-400"
                : ""
            }`}
            onClick={() => setActiveModule("expenses")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveModule("expenses");
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Expense analytics module"
            aria-pressed={activeModule === "expenses"}
          >
            <CardContent className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                {activeModule === "expenses" && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Active
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                Expense Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Budget analysis and cash flow projections
              </p>
            </CardContent>
          </Card>
        )}

        {canViewGeneralAnalytics && (
          <Card
            className={`card-elevated cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-purple-500 ${
              activeModule === "general"
                ? "ring-2 ring-purple-500 dark:ring-purple-400"
                : ""
            }`}
            onClick={() => setActiveModule("general")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveModule("general");
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="General analytics module"
            aria-pressed={activeModule === "general"}
          >
            <CardContent className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                {activeModule === "general" && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Active
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                General Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sales, repairs, and customer metrics
              </p>
            </CardContent>
          </Card>
        )}

        {canViewAdvancedAnalytics && (
          <Card
            className={`card-elevated cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-orange-500 ${
              activeModule === "advanced"
                ? "ring-2 ring-orange-500 dark:ring-orange-400"
                : ""
            }`}
            onClick={() => setActiveModule("advanced")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveModule("advanced");
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Advanced analytics module"
            aria-pressed={activeModule === "advanced"}
          >
            <CardContent className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                {activeModule === "advanced" && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                    Active
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Deep insights and predictive analytics
              </p>
            </CardContent>
          </Card>
        )}

        {canViewGeneralAnalytics && (
          <Card
            className={`card-elevated cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-teal-500 ${
              activeModule === "missing"
                ? "ring-2 ring-teal-500 dark:ring-teal-400"
                : ""
            }`}
            onClick={() => setActiveModule("missing")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveModule("missing");
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Missing analytics module"
            aria-pressed={activeModule === "missing"}
          >
            <CardContent className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                {activeModule === "missing" && (
                  <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    Active
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                Additional Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Previously unused real data analytics
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module Content */}
      <div className="min-h-[600px]">
        {activeModule === "overview" && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(overviewData?.totalRevenue || 0)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span
                        className={
                          overviewData?.revenueChange &&
                          overviewData.revenueChange >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {overviewData?.revenueChange &&
                        overviewData.revenueChange >= 0
                          ? "+"
                          : ""}
                        {overviewData?.revenueChange || 0}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Active Repairs
                    </CardTitle>
                    <Wrench className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {overviewData?.activeRepairs || 0}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span
                        className={
                          overviewData?.repairsChange &&
                          overviewData.repairsChange >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {overviewData?.repairsChange &&
                        overviewData.repairsChange >= 0
                          ? "+"
                          : ""}
                        {overviewData?.repairsChange || 0}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Total Sales
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {overviewData?.totalSales || 0}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span
                        className={
                          overviewData?.salesChange &&
                          overviewData.salesChange >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {overviewData?.salesChange &&
                        overviewData.salesChange >= 0
                          ? "+"
                          : ""}
                        {overviewData?.salesChange || 0}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      New Customers
                    </CardTitle>
                    <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {overviewData?.newCustomers || 0}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span
                        className={
                          overviewData?.customersChange &&
                          overviewData.customersChange >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {overviewData?.customersChange &&
                        overviewData.customersChange >= 0
                          ? "+"
                          : ""}
                        {overviewData?.customersChange || 0}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Additional Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Completion Rate
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {overviewData?.completionRate || 0}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Repairs completed successfully
                  </p>
                  {analyticsState.showInsights &&
                    overviewData?.completionRate &&
                    overviewData.completionRate > 90 && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Excellent performance!
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Avg Repair Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {overviewData?.avgRepairTime || 0} days
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Average time to complete repairs
                  </p>
                  {analyticsState.showInsights &&
                    overviewData?.avgRepairTime &&
                    overviewData.avgRepairTime < 3 && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Fast turnaround time
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Avg Transaction
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(overviewData?.avgTransaction || 0)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Average transaction value
                  </p>
                  {analyticsState.showInsights &&
                    overviewData?.avgTransaction &&
                    overviewData.avgTransaction > 100 && (
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 p-2 rounded">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        High-value transactions
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Revenue Projection
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(forecastData?.revenueProjection || 0)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span
                      className={
                        forecastData?.revenueGrowthRate &&
                        forecastData.revenueGrowthRate >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {forecastData?.revenueGrowthRate &&
                      forecastData.revenueGrowthRate >= 0
                        ? "+"
                        : ""}
                      {forecastData?.revenueGrowthRate || 0}%
                    </span>{" "}
                    growth rate
                  </p>
                  {analyticsState.showInsights &&
                    forecastData?.revenueGrowthRate &&
                    forecastData.revenueGrowthRate > 10 && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <TrendingUpIcon className="h-3 w-3 inline mr-1" />
                        Strong growth trajectory
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* New Enhanced Metrics Row */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Profit Margin
                  </CardTitle>
                  <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {overviewData?.profitMargin || 0}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Current profit margin
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Customer Satisfaction
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {overviewData?.customerSatisfaction || 0}/5
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Average customer rating
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Inventory Turnover
                  </CardTitle>
                  <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {overviewData?.inventoryTurnover || 0}x
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Annual inventory turnover
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Employee Productivity
                  </CardTitle>
                  <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {overviewData?.employeeProductivity || 0}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Average productivity score
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <AnalyticsModule title="Quick Actions" icon={Settings}>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start hover:bg-blue-50 hover:border-blue-200"
                    variant="outline"
                    onClick={() => {
                      // Use the same comprehensive export as the header button
                      const exportData = {
                        timestamp: new Date().toISOString(),
                        overview: overviewData,
                        forecast: forecastData,
                        expenseAnalytics: canViewExpenseAnalytics
                          ? "Available"
                          : "Not accessible",
                        generalAnalytics: canViewGeneralAnalytics
                          ? "Available"
                          : "Not accessible",
                        advancedAnalytics: canViewAdvancedAnalytics
                          ? "Available"
                          : "Not accessible",
                        systemStatus: systemStatus,
                        exportInfo: {
                          timestamp: new Date().toISOString(),
                          user: user?.email,
                          userRole: user?.role,
                          activeModule: activeModule,
                        },
                      };

                      const blob = new Blob(
                        [JSON.stringify(exportData, null, 2)],
                        {
                          type: "application/json",
                        }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `analytics-hub-export-${
                        new Date().toISOString().split("T")[0]
                      }.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);

                      addNotification(
                        "success",
                        "Analytics data exported successfully"
                      );
                      toast({
                        title: "Success",
                        description: "Analytics data exported successfully",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                  <Button
                    className="w-full justify-start hover:bg-purple-50 hover:border-purple-200"
                    variant="outline"
                    onClick={() => setActiveModule("general")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                  <Button
                    className="w-full justify-start hover:bg-green-50 hover:border-green-200"
                    variant="outline"
                    onClick={() => {
                      // Schedule reports functionality
                      addNotification(
                        "info",
                        "Scheduled reports feature coming soon!"
                      );
                      toast({
                        title: "Schedule Reports",
                        description:
                          "This feature will allow you to automatically generate and email reports on a schedule. Coming soon!",
                      });
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Reports
                  </Button>
                  {canViewExpenseAnalytics && (
                    <Button
                      className="w-full justify-start hover:bg-emerald-50 hover:border-emerald-200"
                      variant="outline"
                      onClick={() => setActiveModule("expenses")}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Expense Analytics
                    </Button>
                  )}
                  {canViewAdvancedAnalytics && (
                    <Button
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-200"
                      variant="outline"
                      onClick={() => setActiveModule("advanced")}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Advanced Analytics
                    </Button>
                  )}
                  {canViewGeneralAnalytics && (
                    <Button
                      className="w-full justify-start hover:bg-teal-50 hover:border-teal-200"
                      variant="outline"
                      onClick={() => setActiveModule("missing")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Additional Analytics
                    </Button>
                  )}
                  <Button
                    className="w-full justify-start hover:bg-yellow-50 hover:border-yellow-200"
                    variant="outline"
                    onClick={() => {
                      setAnalyticsState((prev) => {
                        const newState = {
                          ...prev,
                          autoRefresh: !prev.autoRefresh,
                        };
                        addNotification(
                          prev.autoRefresh ? "info" : "success",
                          prev.autoRefresh
                            ? "Auto-refresh disabled"
                            : "Auto-refresh enabled"
                        );
                        return newState;
                      });
                    }}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        analyticsState.autoRefresh ? "animate-spin" : ""
                      }`}
                    />
                    {analyticsState.autoRefresh
                      ? "Disable Auto-refresh"
                      : "Enable Auto-refresh"}
                  </Button>
                </div>
              </AnalyticsModule>

              <AnalyticsModule title="User Info" icon={Users}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current User</span>
                    <Badge variant="outline" className="capitalize">
                      {user?.role || "Unknown"}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {user?.email || "Unknown"}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Access:{" "}
                    {[
                      canViewExpenseAnalytics && "Expenses",
                      canViewGeneralAnalytics && "General",
                      canViewAdvancedAnalytics && "Advanced",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </AnalyticsModule>

              <AnalyticsModule title="Enhanced Metrics" icon={TrendingUp}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue per Repair</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(overviewData?.revenuePerRepair || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Retention</span>
                    <span className="text-sm font-medium">
                      {overviewData?.customerRetentionRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Repairs</span>
                    <span className="text-sm font-medium">
                      {overviewData?.pendingRepairs || 0}
                    </span>
                  </div>
                  {overviewData?.dataQuality && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Data Quality</span>
                        <Badge
                          variant={
                            overviewData.dataQuality.hasHistoricalData &&
                            overviewData.dataQuality.hasCompletionData
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {overviewData.dataQuality.hasHistoricalData &&
                          overviewData.dataQuality.hasCompletionData
                            ? "Complete"
                            : "Partial"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </AnalyticsModule>

              <AnalyticsModule title="System Status" icon={Activity}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Health</span>
                    <Badge
                      className={
                        systemStatus?.database === "Connected" &&
                        systemStatus?.api === "Online" &&
                        systemStatus?.analytics === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {systemStatus?.database === "Connected" &&
                      systemStatus?.api === "Online" &&
                      systemStatus?.analytics === "Active"
                        ? "All Systems Operational"
                        : "Issues Detected"}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Database: {systemStatus?.database || "Checking..."} • API:{" "}
                    {systemStatus?.api || "Checking..."} • Analytics:{" "}
                    {systemStatus?.analytics || "Checking..."}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Last updated:{" "}
                    {analyticsState.lastUpdate.toLocaleTimeString()}
                  </div>
                  {analyticsState.showInsights && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <Info className="h-3 w-3 inline mr-1" />
                        Real-time monitoring active
                      </div>
                    </div>
                  )}
                </div>
              </AnalyticsModule>
            </div>

            {/* Performance Insights Section */}
            {analyticsState.showInsights && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg p-6 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                    Performance Insights
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {overviewData?.completionRate &&
                    overviewData.completionRate > 90 && (
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            High Completion Rate
                          </span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          Your {overviewData.completionRate}% completion rate
                          indicates excellent service quality.
                        </p>
                      </div>
                    )}

                  {overviewData?.revenueChange &&
                    overviewData.revenueChange > 10 && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Strong Revenue Growth
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          {overviewData.revenueChange}% revenue increase shows
                          positive business momentum.
                        </p>
                      </div>
                    )}

                  {overviewData?.avgRepairTime &&
                    overviewData.avgRepairTime < 3 && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            Fast Turnaround
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          {overviewData.avgRepairTime} day average repair time
                          demonstrates operational efficiency.
                        </p>
                      </div>
                    )}

                  {overviewData?.customerSatisfaction &&
                    overviewData.customerSatisfaction > 4 && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            High Customer Satisfaction
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          {overviewData.customerSatisfaction}/5 rating shows
                          excellent customer experience.
                        </p>
                      </div>
                    )}

                  {overviewData?.profitMargin &&
                    overviewData.profitMargin > 20 && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                            Healthy Profit Margin
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400">
                          {overviewData.profitMargin}% profit margin indicates
                          strong financial performance.
                        </p>
                      </div>
                    )}

                  {overviewData?.inventoryTurnover &&
                    overviewData.inventoryTurnover > 6 && (
                      <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span className="text-sm font-medium text-teal-800 dark:text-teal-300">
                            Efficient Inventory
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 dark:text-teal-400">
                          {overviewData.inventoryTurnover}x turnover rate shows
                          optimal inventory management.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === "expenses" && canViewExpenseAnalytics && (
          <ExpenseAnalyticsModule />
        )}

        {activeModule === "general" && canViewGeneralAnalytics && (
          <Analytics />
        )}

        {activeModule === "advanced" && canViewAdvancedAnalytics && (
          <AdvancedAnalytics />
        )}

        {activeModule === "missing" && canViewGeneralAnalytics && (
          <MissingAnalyticsModule />
        )}
      </div>
    </PageLayout>
  );
}
