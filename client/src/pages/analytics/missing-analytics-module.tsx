import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DollarSign,
  ShoppingCart,
  Wrench,
  Package,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  RefreshCw,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";

interface SalesAnalytics {
  date: string;
  total: number;
  count: number;
}

interface RepairAnalytics {
  status: string;
  count: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface CombinedRevenue {
  date: string;
  sales: number;
  repairs: number;
  total: number;
}

interface ProfitData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RepairCostData {
  daily: Array<{
    date: string;
    cost: number;
    count: number;
  }>;
  byService: Array<{
    service: string;
    cost: number;
    count: number;
  }>;
  summary: {
    totalCost: number;
    totalRepairs: number;
    avgCost: number;
  };
}

interface DashboardStats {
  totalRevenue: number;
  totalDevices: number;
  activeRepairs: number;
  completedToday: number;
  customerSatisfaction: number;
  lowStockItems: number;
  todayRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

interface TopService {
  service: string;
  count: number;
  revenue: number;
}

export function MissingAnalyticsModule() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch Sales Analytics
  const { data: salesData, isLoading: salesLoading } = useQuery<SalesAnalytics[]>({
    queryKey: ["analytics", "sales", timeRange],
    queryFn: () => apiRequest(`/api/analytics/sales?dateRange=${timeRange === "30d" ? "30" : timeRange === "7d" ? "7" : "90"}`, "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Repair Analytics
  const { data: repairData, isLoading: repairLoading } = useQuery<RepairAnalytics[]>({
    queryKey: ["analytics", "repairs"],
    queryFn: () => apiRequest("/api/analytics/repairs", "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Top Selling Items
  const { data: topItemsData, isLoading: topItemsLoading } = useQuery<TopItem[]>({
    queryKey: ["analytics", "top-items", timeRange],
    queryFn: () => apiRequest(`/api/analytics/top-items?dateRange=${timeRange === "30d" ? "30" : timeRange === "7d" ? "7" : "90"}`, "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Combined Revenue
  const { data: combinedRevenueData, isLoading: combinedRevenueLoading } = useQuery<CombinedRevenue[]>({
    queryKey: ["analytics", "combined-revenue", timeRange],
    queryFn: () => apiRequest(`/api/analytics/revenue/combined?granularity=daily&range=${timeRange === "30d" ? "30" : timeRange === "7d" ? "7" : "90"}`, "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Profit Analytics
  const { data: profitData, isLoading: profitLoading } = useQuery<ProfitData[]>({
    queryKey: ["analytics", "profit", timeRange],
    queryFn: () => apiRequest(`/api/analytics/profit?granularity=daily&range=${timeRange === "30d" ? "30" : timeRange === "7d" ? "7" : "90"}`, "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Repair Cost Analytics
  const { data: repairCostData, isLoading: repairCostLoading } = useQuery<RepairCostData>({
    queryKey: ["analytics", "repair-costs", timeRange],
    queryFn: () => apiRequest(`/api/analytics/repair-costs?dateRange=${timeRange === "30d" ? "30" : timeRange === "7d" ? "7" : "90"}`, "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Dashboard Stats
  const { data: dashboardStats, isLoading: dashboardStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiRequest("/api/dashboard/stats", "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Recent Activities
  const { data: recentActivities, isLoading: recentActivitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ["dashboard", "recent-activities"],
    queryFn: () => apiRequest("/api/dashboard/recent-activities", "GET"),
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch Top Services
  const { data: topServices, isLoading: topServicesLoading } = useQuery<TopService[]>({
    queryKey: ["dashboard", "top-services"],
    queryFn: () => apiRequest("/api/dashboard/top-services", "GET"),
    retry: 2,
    retryDelay: 1000,
  });


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'diagnosed': return '#3b82f6';
      case 'registered': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'diagnosed': return 'Diagnosed';
      case 'registered': return 'Registered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Additional Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real data analytics that were previously unused
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4}>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full bg-slate-100 dark:bg-slate-800 overflow-x-auto space-x-1 p-1 h-auto min-h-[40px] flex-nowrap">
          <TabsTrigger value="sales" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Sales Trends</TabsTrigger>
          <TabsTrigger value="repairs" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Repair Status</TabsTrigger>
          <TabsTrigger value="top-items" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Top Items</TabsTrigger>
          <TabsTrigger value="revenue" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Combined Revenue</TabsTrigger>
          <TabsTrigger value="profit" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Profit Analysis</TabsTrigger>
          <TabsTrigger value="repair-costs" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Repair Costs</TabsTrigger>
          <TabsTrigger value="dashboard" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Dashboard Stats</TabsTrigger>
          <TabsTrigger value="activities" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Recent Activities</TabsTrigger>
          <TabsTrigger value="services" className="whitespace-nowrap flex-shrink-0 min-w-[100px]">Top Services</TabsTrigger>
        </TabsList>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Trends
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Daily sales revenue and transaction counts
                </p>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : salesData && salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'total' ? formatCurrency(Number(value)) : value,
                          name === 'total' ? 'Revenue' : 'Transactions'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No sales data available</p>
                      <p className="text-sm">Add some sales to see trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transaction Volume
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Number of transactions per day
                </p>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : salesData && salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Transactions']} />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transaction data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Repair Analytics Tab */}
        <TabsContent value="repairs" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Device Status Distribution
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Current status of all devices in the system
                </p>
              </CardHeader>
              <CardContent>
                {repairLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : repairData && repairData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={repairData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count, percent }) => `${getStatusLabel(status)}: ${count} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {repairData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Devices']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No repair data available</p>
                      <p className="text-sm">Add some devices to see status distribution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Status Breakdown
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detailed count by device status
                </p>
              </CardHeader>
              <CardContent>
                {repairLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : repairData && repairData.length > 0 ? (
                  <div className="space-y-3">
                    {repairData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                          <span className="font-medium">{getStatusLabel(item.status)}</span>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No status data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Items Tab */}
        <TabsContent value="top-items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Items
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Best-performing inventory items by revenue and quantity
              </p>
            </CardHeader>
            <CardContent>
              {topItemsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : topItemsData && topItemsData.length > 0 ? (
                <div className="space-y-4">
                  {topItemsData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {item.quantity} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(item.revenue)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No top items data available</p>
                    <p className="text-sm">Add some sales to see top performing items</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Combined Revenue Analysis
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sales revenue vs repair revenue comparison
              </p>
            </CardHeader>
            <CardContent>
              {combinedRevenueLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : combinedRevenueData && combinedRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={combinedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'sales' ? 'Sales Revenue' : name === 'repairs' ? 'Repair Revenue' : 'Total Revenue'
                      ]}
                    />
                    <Bar dataKey="sales" stackId="revenue" fill="#8884d8" name="Sales" />
                    <Bar dataKey="repairs" stackId="revenue" fill="#82ca9d" name="Repairs" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No combined revenue data available</p>
                    <p className="text-sm">Add some sales and repairs to see revenue comparison</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Analysis Tab */}
        <TabsContent value="profit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Profit Analysis
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Revenue vs expenses to show actual profitability
              </p>
            </CardHeader>
            <CardContent>
              {profitLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : profitData && profitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                      ]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No profit data available</p>
                    <p className="text-sm">Add some revenue and expenses to see profit analysis</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repair Costs Tab */}
        <TabsContent value="repair-costs" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Daily Repair Costs
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Repair costs over time
                </p>
              </CardHeader>
              <CardContent>
                {repairCostLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : repairCostData?.daily && repairCostData.daily.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={repairCostData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'cost' ? formatCurrency(Number(value)) : value,
                          name === 'cost' ? 'Cost' : 'Repairs'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No repair cost data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cost by Service Type
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Repair costs breakdown by service
                </p>
              </CardHeader>
              <CardContent>
                {repairCostLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : repairCostData?.byService && repairCostData.byService.length > 0 ? (
                  <div className="space-y-3">
                    {repairCostData.byService.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {service.service}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {service.count} repairs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(service.cost)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total Cost
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No service cost data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          {repairCostData?.summary && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Repair Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(repairCostData.summary.totalCost)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Cost</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {repairCostData.summary.totalRepairs}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Repairs</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(repairCostData.summary.avgCost)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Avg Cost per Repair</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Stats Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Dashboard Statistics
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Key performance indicators and business metrics
              </p>
            </CardHeader>
            <CardContent>
              {dashboardStatsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : dashboardStats ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(dashboardStats.totalRevenue)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Devices</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {dashboardStats.totalDevices}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Active Repairs</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {dashboardStats.activeRepairs}
                        </p>
                      </div>
                      <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Completed Today</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {dashboardStats.completedToday}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Customer Satisfaction</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {dashboardStats.customerSatisfaction}/5
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Today's Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(dashboardStats.todayRevenue)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No dashboard stats available</p>
                    <p className="text-sm">Add some data to see statistics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Latest system activities and user actions
              </p>
            </CardHeader>
            <CardContent>
              {recentActivitiesLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.type}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            by {activity.user}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activities available</p>
                    <p className="text-sm">Activities will appear here as they happen</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Services
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Most popular services by count and revenue
              </p>
            </CardHeader>
            <CardContent>
              {topServicesLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : topServices && topServices.length > 0 ? (
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {service.service}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {service.count} services provided
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(service.revenue)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No service data available</p>
                    <p className="text-sm">Add some services to see analytics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
