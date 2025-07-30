import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Wrench, 
  ShoppingCart,
  Calendar,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: analytics = {}, isLoading } = useQuery({
    queryKey: ["/api/analytics", { dateRange, startDate, endDate }],
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/analytics/sales", { dateRange, startDate, endDate }],
  });

  const { data: repairData = [], isLoading: repairLoading } = useQuery({
    queryKey: ["/api/analytics/repairs", { dateRange, startDate, endDate }],
  });

  const { data: topItems = [], isLoading: topItemsLoading } = useQuery({
    queryKey: ["/api/analytics/top-items", { dateRange, startDate, endDate }],
  });

  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/analytics/revenue", { dateRange, startDate, endDate }],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      registered: "bg-blue-100 text-blue-800",
      diagnosed: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      waiting_parts: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      ready_for_pickup: "bg-emerald-100 text-emerald-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">View business performance metrics and reports</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="date-range">Period:</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span>to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : formatCurrency(analytics.totalRevenue || 0)}
                </p>
                {!isLoading && analytics.revenueChange !== undefined && (
                  <p className={`text-xs ${analytics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.revenueChange)} from last period
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Repairs</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : analytics.activeRepairs || 0}
                </p>
                {!isLoading && analytics.repairsChange !== undefined && (
                  <p className={`text-xs ${analytics.repairsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.repairsChange)} from last period
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : analytics.totalSales || 0}
                </p>
                {!isLoading && analytics.salesChange !== undefined && (
                  <p className={`text-xs ${analytics.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.salesChange)} from last period
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : analytics.newCustomers || 0}
                </p>
                {!isLoading && analytics.customersChange !== undefined && (
                  <p className={`text-xs ${analytics.customersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.customersChange)} from last period
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ) : revenueData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No revenue data available</p>
            ) : (
              <div className="space-y-4">
                {revenueData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm text-gray-600">{item.date}</span>
                    <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topItemsLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : topItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {topItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} sold</p>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Repair Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Repair Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repairLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : repairData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No repair data available</p>
            ) : (
              <div className="space-y-3">
                {repairData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    </div>
                    <span className="font-semibold">{item.count} devices</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Completion Rate</span>
                </div>
                <span className="font-semibold">
                  {isLoading ? "..." : `${analytics.completionRate || 0}%`}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Avg. Repair Time</span>
                </div>
                <span className="font-semibold">
                  {isLoading ? "..." : `${analytics.avgRepairTime || 0} days`}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Appointments Today</span>
                </div>
                <span className="font-semibold">
                  {isLoading ? "..." : analytics.appointmentsToday || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm">Avg. Transaction</span>
                </div>
                <span className="font-semibold">
                  {isLoading ? "..." : formatCurrency(analytics.avgTransaction || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
