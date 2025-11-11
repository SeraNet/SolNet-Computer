import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Package,
  RefreshCw,
  Calendar,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Brain,
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Download,
  Settings,
  Search,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb,
  LineChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

export default function InventoryPredictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"predictions" | "alerts" | "insights" | "settings">(
    "predictions"
  );
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("risk");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [predictionSettings, setPredictionSettings] = useState({
    autoUpdate: true,
    alertThreshold: 0.2,
    forecastDays: 30,
    confidenceLevel: 0.85,
    enableML: true,
    enableSeasonality: true,
  });

  // Track previous values for percentage calculations
  const [previousValues, setPreviousValues] = useState({
    criticalItems: 0,
    highRiskItems: 0,
    inventoryValue: 0,
    itemsTracked: 0,
  });

  // Export functionality
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There is no data available to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  const exportPredictions = () => {
    const exportData = filteredPredictions.map((p: any) => ({
      'Item Name': p.name || 'Unknown Item',
      'SKU': p.sku || 'N/A',
      'Current Stock': p.currentStock || 0,
      'Risk Level': p.riskLevel || 'Unknown',
      'Days Until Stockout': p.daysUntilStockout || 'N/A',
      'Average Daily Sales': p.avgDailySales || 0,
      'Suggested Reorder Quantity': p.suggestedReorderQuantity || 0,
      'Unit Price (ETB)': formatCurrencyETB(p.unitPrice || 0),
      'Total Value (ETB)': formatCurrencyETB((p.currentStock || 0) * (p.unitPrice || 0)),
    }));
    exportToCSV(exportData, `inventory-predictions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAlerts = () => {
    const exportData = alerts.map((a: any) => ({
      'Item Name': a.itemName || 'Unknown Item',
      'Alert Type': a.alertType ? a.alertType.replace('_', ' ').toUpperCase() : 'Unknown',
      'Priority': a.priority || 'Unknown',
      'Message': a.message || 'No message',
      'Created At': formatDate(a.createdAt),
      'Acknowledged': a.acknowledged ? 'Yes' : 'No',
    }));
    exportToCSV(exportData, `inventory-alerts-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["inventory", "predictions"],
    queryFn: () => apiRequest("/api/inventory/predictions", "GET"),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["inventory", "alerts"],
    queryFn: () => apiRequest("/api/inventory/alerts", "GET"),
  });

  const { data: aiInsights = null, isLoading: insightsLoading } = useQuery({
    queryKey: ["inventory", "ai-insights"],
    queryFn: () => apiRequest("/api/inventory/ai-insights", "GET"),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: settingsData = null, isLoading: settingsLoading } = useQuery({
    queryKey: ["inventory", "prediction-settings"],
    queryFn: () => apiRequest("/api/inventory/prediction-settings", "GET"),
  });

  // Update settings when data is loaded from backend
  useEffect(() => {
    if (settingsData) {
      setPredictionSettings(prev => ({
        ...prev,
        ...settingsData
      }));
    }
  }, [settingsData]);

  const updatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/inventory/update-predictions", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to update predictions");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Updated",
        description:
          "Inventory predictions have been recalculated based on recent sales data.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "predictions"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await apiRequest(
        `/api/inventory/alerts/${alertId}/acknowledge`,
        "POST"
      );
      if (!response) {
        throw new Error("Failed to acknowledge alert");
      }
      return response;
    },
    onSuccess: (_, alertId) => {
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Acknowledge Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("/api/inventory/prediction-settings", "PUT", settings);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "prediction-settings"] });
      toast({
        title: "Settings Saved",
        description: "Prediction settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save prediction settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "low_stock":
        return <Package className="h-4 w-4" />;
      case "predicted_stockout":
        return <Clock className="h-4 w-4" />;
      case "reorder_required":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Enhanced data processing
  const filteredPredictions = useMemo(() => {
    let filtered = predictions;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p: any) => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter((p: any) => p.riskLevel === riskFilter);
    }
    
    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "risk":
          const riskOrder: { [key: string]: number } = { critical: 4, high: 3, medium: 2, low: 1 };
          return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
        case "name":
          return (a.name || '').localeCompare(b.name || '');
        case "stock":
          return (b.currentStock || 0) - (a.currentStock || 0);
        case "sales":
          return (b.avgDailySales || 0) - (a.avgDailySales || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [predictions, searchTerm, riskFilter, sortBy]);

  const criticalPredictions = filteredPredictions.filter(
    (p: any) => p.riskLevel === "critical"
  );
  const highRiskPredictions = filteredPredictions.filter(
    (p: any) => p.riskLevel === "high"
  );
  const criticalAlerts = alerts.filter((a: any) => a.priority === "critical");
  const highPriorityAlerts = alerts.filter((a: any) => a.priority === "high");

  // Enhanced analytics
  const totalInventoryValue = useMemo(() => {
    return predictions.reduce((sum: number, p: any) => sum + (p.currentStock * p.unitPrice || 0), 0);
  }, [predictions]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    const currentCritical = criticalPredictions.length;
    const currentHighRisk = highRiskPredictions.length;
    const currentInventoryValue = totalInventoryValue;
    const currentItemsTracked = predictions.length;

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      criticalItems: calculatePercentageChange(currentCritical, previousValues.criticalItems),
      highRiskItems: calculatePercentageChange(currentHighRisk, previousValues.highRiskItems),
      inventoryValue: calculatePercentageChange(currentInventoryValue, previousValues.inventoryValue),
      itemsTracked: calculatePercentageChange(currentItemsTracked, previousValues.itemsTracked),
    };
  }, [criticalPredictions.length, highRiskPredictions.length, totalInventoryValue, predictions.length, previousValues]);

  // Update previous values when data changes
  useEffect(() => {
    if (predictions.length > 0) {
      setPreviousValues({
        criticalItems: criticalPredictions.length,
        highRiskItems: highRiskPredictions.length,
        inventoryValue: totalInventoryValue,
        itemsTracked: predictions.length,
      });
    }
  }, [criticalPredictions.length, highRiskPredictions.length, totalInventoryValue, predictions.length]);

  // Format currency in ETB
  const formatCurrencyETB = (amount: number): string => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const averageRiskScore = useMemo(() => {
    if (predictions.length === 0) return 0;
    const riskScores: { [key: string]: number } = { critical: 4, high: 3, medium: 2, low: 1 };
    const totalScore = predictions.reduce((sum: number, p: any) => sum + (riskScores[p.riskLevel] || 0), 0);
    return totalScore / predictions.length;
  }, [predictions]);

  const stockoutRisk = useMemo(() => {
    const criticalCount = criticalPredictions.length;
    const highCount = highRiskPredictions.length;
    const total = predictions.length;
    return total > 0 ? ((criticalCount + highCount) / total) * 100 : 0;
  }, [criticalPredictions, highRiskPredictions, predictions]);

  // Enhanced chart data processing
  const riskLevelData = useMemo(() => {
    const riskCounts = predictions.reduce((acc: any, p: any) => {
      acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate trend based on risk level distribution
    const totalItems = predictions.length;
    const criticalPercentage = totalItems > 0 ? ((riskCounts.critical || 0) / totalItems) * 100 : 0;
    const highPercentage = totalItems > 0 ? ((riskCounts.high || 0) / totalItems) * 100 : 0;
    
    // Determine trend based on critical and high risk percentages
    const getTrend = (count: number, total: number) => {
      if (total === 0) return 'stable';
      const percentage = (count / total) * 100;
      if (percentage > 20) return 'critical';
      if (percentage > 10) return 'high';
      if (percentage > 5) return 'medium';
      return 'low';
    };
    
    const riskTrendData = [
      { 
        level: 'Low', 
        count: riskCounts.low || 0, 
        trend: getTrend(riskCounts.low || 0, totalItems),
        percentage: totalItems > 0 ? ((riskCounts.low || 0) / totalItems) * 100 : 0
      },
      { 
        level: 'Medium', 
        count: riskCounts.medium || 0, 
        trend: getTrend(riskCounts.medium || 0, totalItems),
        percentage: totalItems > 0 ? ((riskCounts.medium || 0) / totalItems) * 100 : 0
      },
      { 
        level: 'High', 
        count: riskCounts.high || 0, 
        trend: getTrend(riskCounts.high || 0, totalItems),
        percentage: totalItems > 0 ? ((riskCounts.high || 0) / totalItems) * 100 : 0
      },
      { 
        level: 'Critical', 
        count: riskCounts.critical || 0, 
        trend: getTrend(riskCounts.critical || 0, totalItems),
        percentage: totalItems > 0 ? ((riskCounts.critical || 0) / totalItems) * 100 : 0
      }
    ];
    
    return riskTrendData;
  }, [predictions]);

  const alertTypeData = useMemo(() => {
    const typeCounts = alerts.reduce((acc: any, a: any) => {
      acc[a.alertType] = (acc[a.alertType] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: count as number,
      fill: type === 'low_stock' ? '#ef4444' : 
            type === 'predicted_stockout' ? '#f97316' : 
            type === 'reorder_required' ? '#3b82f6' : '#6b7280'
    }));
  }, [alerts]);


  const hasChartData = riskLevelData.length > 0 || alertTypeData.length > 0;

  if (predictionsLoading || alertsLoading) {
    return (
      <PageLayout
        title="Smart Inventory Predictions"
        subtitle="AI-powered inventory forecasting and intelligent stock alerts"
        icon={Brain}
        actions={
          <Button
            onClick={() => updatePredictionsMutation.mutate()}
            disabled={updatePredictionsMutation.isPending}
            variant="default"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                updatePredictionsMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Update Predictions
          </Button>
        }
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Smart Inventory Predictions"
      subtitle="AI-powered inventory forecasting and intelligent stock alerts for optimal inventory management"
      icon={Brain}
      actions={
          <Button
            onClick={() => updatePredictionsMutation.mutate()}
            disabled={updatePredictionsMutation.isPending}
          variant="default"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                updatePredictionsMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Update Predictions
          </Button>
      }
    >

        {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="card-elevated bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/30 border-red-200/60 dark:border-red-800/60 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Critical Items
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600/70">
                    {percentageChanges.criticalItems >= 0 ? '+' : ''}{percentageChanges.criticalItems.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-1">
              {criticalPredictions.length}
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Require immediate attention
            </p>
            <div className="mt-3">
              <Progress value={stockoutRisk} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border-orange-200/60 dark:border-orange-800/60 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">High Risk</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600/70">
                    {percentageChanges.highRiskItems >= 0 ? '+' : ''}{percentageChanges.highRiskItems.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-1">
              {highRiskPredictions.length}
            </div>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Stock running low</p>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-600/70">Risk Score: {averageRiskScore.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/60 dark:border-blue-800/60 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Inventory Value
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUpIcon className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600/70">
                    {percentageChanges.inventoryValue >= 0 ? '+' : ''}{percentageChanges.inventoryValue.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
              {formatCurrencyETB(totalInventoryValue)}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Total inventory value</p>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600/70">Avg: {formatCurrencyETB(totalInventoryValue / predictions.length || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30 border-green-200/60 dark:border-green-800/60 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Items Tracked
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUpIcon className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600/70">
                    {percentageChanges.itemsTracked >= 0 ? '+' : ''}{percentageChanges.itemsTracked.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">
              {predictions.length}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Total inventory items</p>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600/70">AI Monitoring Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls */}
      <Card className="card-elevated mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Level</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="stock">Stock Level</SelectItem>
                  <SelectItem value="sales">Sales Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportPredictions}
                disabled={filteredPredictions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Predictions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAlerts}
                disabled={alerts.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Alerts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Analytics */}
      {hasChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
             <Card className="card-elevated">
               <CardHeader className="pb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                     <LineChart className="w-5 h-5 text-white" />
                   </div>
                   <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                     Risk Distribution Trend
                   </CardTitle>
                 </div>
               </CardHeader>
               <CardContent>
                 <ResponsiveContainer width="100%" height={250}>
                   <RechartsLineChart data={riskLevelData}>
                     <defs>
                       <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                     <XAxis 
                       dataKey="level" 
                       stroke="#64748b"
                       fontSize={12}
                       tickLine={false}
                       axisLine={false}
                     />
                     <YAxis 
                       stroke="#64748b"
                       fontSize={12}
                       tickLine={false}
                       axisLine={false}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'white',
                         border: '1px solid #e2e8f0',
                         borderRadius: '8px',
                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                       }}
                       formatter={(value: any, name: string) => [
                         `${value} items`,
                         'Risk Count'
                       ]}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="count" 
                       stroke="#3b82f6" 
                       strokeWidth={3}
                       fill="url(#riskGradient)"
                       dot={{ 
                         fill: '#3b82f6', 
                         strokeWidth: 2, 
                         r: 5,
                         stroke: '#ffffff'
                       }}
                       activeDot={{ 
                         r: 7, 
                         stroke: '#3b82f6', 
                         strokeWidth: 3,
                         fill: '#ffffff'
                       }}
                     />
                   </RechartsLineChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Alert Types
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={alertTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {alertTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Tabs */}
      <Card className="card-elevated">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "predictions" | "alerts" | "insights" | "settings")}>
          <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 px-6 py-4">
            <TabsList className="inline-flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-1.5">
              <TabsTrigger
                value="predictions"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-blue-700 data-[state=active]:scale-105"
              >
                <Target className="h-4 w-4" />
                <span className="font-semibold">Stock Predictions</span>
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filteredPredictions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-blue-700 data-[state=active]:scale-105"
              >
                <Zap className="h-4 w-4" />
                <span className="font-semibold">Stock Alerts</span>
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                    {alerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-blue-700 data-[state=active]:scale-105"
              >
                <Brain className="h-4 w-4" />
                <span className="font-semibold">AI Insights</span>
                <Badge variant="outline" className="ml-1 px-1.5 py-0.5 text-xs">
                  New
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-blue-700 data-[state=active]:scale-105"
              >
                <Settings className="h-4 w-4" />
                <span className="font-semibold">Settings</span>
              </TabsTrigger>
            </TabsList>
            </div>

          <TabsContent value="predictions" className="p-6">
          <div className="space-y-6">
            {criticalAlerts.length > 0 && (
                <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Critical Alert:</strong> {criticalAlerts.length} items
                  require immediate attention
                </AlertDescription>
              </Alert>
            )}

              <div className="space-y-4">
                <div className="space-y-4">
                  {filteredPredictions.map((prediction: any) => (
                    <div
                      key={prediction.itemId}
                        className="card-elevated p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {prediction.name}
                              </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                SKU: {prediction.sku}
                              </p>
                            </div>
                            <Badge
                              variant={
                                getRiskBadgeColor(prediction.riskLevel) as any
                              }
                              className="text-xs px-3 py-1 font-medium"
                            >
                              {prediction.riskLevel.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/60">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {prediction.currentStock}
                              </div>
                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">
                                Current Stock
                              </div>
                            </div>
                              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200/60 dark:border-orange-800/60">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                {prediction.daysUntilStockout > 0
                                  ? prediction.daysUntilStockout
                                  : "N/A"}
                              </div>
                                <div className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">
                                Days Until Stockout
                              </div>
                              </div>
                              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/60 dark:border-green-800/60">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                  {parseFloat(prediction.avgDailySales).toFixed(2)}
                                </div>
                                <div className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">
                                Avg Daily Sales
                              </div>
                            </div>
                              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/60">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                {prediction.suggestedReorderQuantity}
                              </div>
                                <div className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">
                                Suggested Reorder
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPredictions.length === 0 && (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <Package className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                      </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No Predictions Available
                      </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Click "Update Predictions" to generate AI-powered forecasts
                      </p>
                      <Button
                        onClick={() => updatePredictionsMutation.mutate()}
                        disabled={updatePredictionsMutation.isPending}
                          variant="default"
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            updatePredictionsMutation.isPending
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                        Generate Predictions
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="p-6">
            <div className="space-y-6">
              {insightsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading AI insights...</span>
                </div>
              ) : aiInsights ? (
                <>
                  <Card className="card-elevated">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          AI Recommendations
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiInsights && aiInsights.optimization && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                  {aiInsights.optimization.title}
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {aiInsights.optimization.message}
                                </p>
                                {aiInsights.optimization.items && aiInsights.optimization.items.length > 0 && (
                                  <div className="mt-2 text-xs text-blue-600/70">
                                    Top items: {aiInsights.optimization.items.slice(0, 3).map((item: any) => item.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {aiInsights && aiInsights.growth && (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                  {aiInsights.growth.title}
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  {aiInsights.growth.message}
                                </p>
                                <div className="mt-1 text-xs text-green-600/70">
                                  Category: {aiInsights.growth.category} | Value: {formatCurrencyETB(aiInsights.growth.totalValue)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Risk Analysis
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiInsights && aiInsights.risk && (
                          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <span className="font-semibold text-red-900 dark:text-red-100">
                                {aiInsights.risk.title}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                              {aiInsights.risk.message}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">
                                  {aiInsights.risk.criticalCount}
                                </div>
                                <div className="text-xs text-red-600/70 dark:text-red-400/70">Critical</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                  {aiInsights.risk.highRiskCount}
                                </div>
                                <div className="text-xs text-orange-600/70 dark:text-orange-400/70">High Risk</div>
                              </div>
                              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                  {aiInsights.risk.riskLevel}
                                </div>
                                <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Overall Risk</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {aiInsights && aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Additional Recommendations</h4>
                            {aiInsights.recommendations.map((rec: any, index: number) => (
                              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    rec.priority === 'high' ? 'bg-red-500' : 
                                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}></div>
                                  <div>
                                    <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                                      {rec.title}
                                    </h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                      {rec.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                      Action: {rec.action}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No AI Insights Available
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    AI insights will appear here once inventory data is available
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-6">
            <div className="space-y-6">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading settings...</span>
                </div>
              ) : (
                <Card className="card-elevated">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Prediction Settings
                      </CardTitle>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure how the AI analyzes your inventory and generates predictions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="auto-update" className="text-sm font-medium">
                                Auto Update Predictions
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Automatically refresh predictions every hour
                              </p>
                            </div>
                            <Switch
                              id="auto-update"
                              checked={predictionSettings.autoUpdate}
                              onCheckedChange={(checked) => 
                                setPredictionSettings(prev => ({ ...prev, autoUpdate: checked }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enable-ml" className="text-sm font-medium">
                                Enable Machine Learning
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Use advanced ML algorithms for predictions
                              </p>
                            </div>
                            <Switch
                              id="enable-ml"
                              checked={predictionSettings.enableML}
                              onCheckedChange={(checked) => 
                                setPredictionSettings(prev => ({ ...prev, enableML: checked }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enable-seasonality" className="text-sm font-medium">
                                Enable Seasonality Analysis
                              </Label>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Consider seasonal patterns in predictions
                              </p>
                            </div>
                            <Switch
                              id="enable-seasonality"
                              checked={predictionSettings.enableSeasonality}
                              onCheckedChange={(checked) => 
                                setPredictionSettings(prev => ({ ...prev, enableSeasonality: checked }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="alert-threshold" className="text-sm font-medium">
                              Alert Threshold
                            </Label>
                            <Input
                              id="alert-threshold"
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={predictionSettings.alertThreshold}
                              onChange={(e) => 
                                setPredictionSettings(prev => ({ ...prev, alertThreshold: parseFloat(e.target.value) }))
                              }
                              className="mt-1"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Threshold for generating alerts (0.0 - 1.0)
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="forecast-days" className="text-sm font-medium">
                              Forecast Days
                            </Label>
                            <Input
                              id="forecast-days"
                              type="number"
                              min="7"
                              max="365"
                              value={predictionSettings.forecastDays}
                              onChange={(e) => 
                                setPredictionSettings(prev => ({ ...prev, forecastDays: parseInt(e.target.value) }))
                              }
                              className="mt-1"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Number of days to forecast ahead
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="confidence-level" className="text-sm font-medium">
                              Confidence Level
                            </Label>
                            <Input
                              id="confidence-level"
                              type="number"
                              min="0.5"
                              max="0.99"
                              step="0.01"
                              value={predictionSettings.confidenceLevel}
                              onChange={(e) => 
                                setPredictionSettings(prev => ({ ...prev, confidenceLevel: parseFloat(e.target.value) }))
                              }
                              className="mt-1"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Confidence level for predictions (0.5 - 0.99)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            if (settingsData) {
                              setPredictionSettings(settingsData);
                            }
                          }}
                        >
                          Reset to Defaults
                        </Button>
                        <Button 
                          onClick={() => updateSettingsMutation.mutate(predictionSettings)}
                          disabled={updateSettingsMutation.isPending}
                        >
                          {updateSettingsMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Settings'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="p-6">
          <div className="space-y-6">
              <Card className="card-elevated">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Stock Alerts
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div
                      key={alert.id}
                        className={`card-elevated p-6 cursor-pointer transition-all duration-300 ${
                        selectedAlert === alert.id
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-md"
                            : "hover:shadow-lg"
                      }`}
                      onClick={() =>
                        setSelectedAlert(
                          alert.id === selectedAlert ? null : alert.id
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mt-1">
                            {getAlertIcon(alert.alertType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {alert.itemName}
                              </h4>
                              <Badge
                                variant={
                                  getPriorityBadgeColor(alert.priority) as any
                                }
                                className="text-xs px-3 py-1 font-medium"
                              >
                                {alert.priority.toUpperCase()}
                              </Badge>
                            </div>
                              <p className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                              {alert.message}
                            </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(alert.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {alert.alertType
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                              className="ml-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeAlertMutation.mutate(alert.id);
                            }}
                            disabled={acknowledgeAlertMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            {acknowledgeAlertMutation.isPending
                              ? "Acknowledging..."
                              : "Acknowledge"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {alerts.length === 0 && (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                      </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        All Clear!
                      </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                        All inventory levels are within normal ranges
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
      </Card>
    </PageLayout>
  );
}
