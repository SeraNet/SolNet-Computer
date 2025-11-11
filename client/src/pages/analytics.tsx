import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  Calendar,
  Wrench,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";

export default function Analytics() {
  // Fetch real analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiRequest("/api/analytics", "GET"),
  });

  // Debug: Log analytics data
  React.useEffect(() => {
    if (analyticsData) {
      console.log("General Analytics Data:", analyticsData);
      console.log("Total Revenue:", analyticsData.totalRevenue);
      console.log("Active Repairs:", analyticsData.activeRepairs);
      console.log("Completed Today:", analyticsData.completedToday);
      console.log("Customer Satisfaction:", analyticsData.customerSatisfaction);
    }
  }, [analyticsData]);

  const { data: monthlyData } = useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: () => apiRequest("/api/analytics/organized/revenue", "GET"),
  });

  const { data: technicianData } = useQuery({
    queryKey: ["analytics", "technician-efficiency"],
    queryFn: () => apiRequest("/api/analytics/organized/performance", "GET"),
  });

  const { data: satisfactionData } = useQuery({
    queryKey: ["analytics", "satisfaction"],
    queryFn: () => apiRequest("/api/analytics/organized/satisfaction", "GET"),
  });

  // Debug: Log other data sources
  React.useEffect(() => {
    if (monthlyData) {
      console.log("Monthly Revenue Data:", monthlyData);
    }
    if (technicianData) {
      console.log("Technician Efficiency Data:", technicianData);
    }
    if (satisfactionData) {
      console.log("Customer Satisfaction Data:", satisfactionData);
    }
  }, [monthlyData, technicianData, satisfactionData]);

  // Prepare monthly chart data
  const monthlyChartData = monthlyData?.totalRevenue?.slice(-6) || [];

  // Prepare technician efficiency data
  const efficiencyData = technicianData?.efficiency?.slice(-6) || [];

  // Debug: Log chart data
  React.useEffect(() => {
    console.log("Monthly Chart Data:", monthlyChartData);
    console.log("Efficiency Data:", efficiencyData);
  }, [monthlyChartData, efficiencyData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(analyticsData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {analyticsData?.revenueChange > 0 ? "+" : ""}
              {analyticsData?.revenueChange || 0}% from last month
            </p>
            {analyticsData?.debug && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <div>Sales: {formatCurrency(analyticsData.debug.salesRevenue || 0)}</div>
                <div>Repairs: {formatCurrency(analyticsData.debug.repairRevenue || 0)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Active Repairs
            </CardTitle>
            <Wrench className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {analyticsData?.activeRepairs || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Currently in progress
            </p>
            {analyticsData?.repairsChange !== undefined && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {analyticsData.repairsChange > 0 ? "+" : ""}
                {analyticsData.repairsChange}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Completed Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {analyticsData?.completedToday || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Repairs completed today
            </p>
            {analyticsData?.completionRate !== undefined && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {analyticsData.completionRate}% completion rate
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Customer Satisfaction
            </CardTitle>
            <Star className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {satisfactionData?.overall?.[0]?.value || analyticsData?.customerSatisfaction || "N/A"}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Average rating</p>
            {satisfactionData?.overall?.[0]?.count && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Based on {satisfactionData.overall[0].count} reviews
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Monthly Revenue Overview</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Last 6 months revenue trend</p>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data available</p>
                  <p className="text-sm">Add some sales or completed repairs to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Technician Efficiency</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Performance over time</p>
          </CardHeader>
          <CardContent>
            {efficiencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No efficiency data available</p>
                  <p className="text-sm">Complete some repairs to see technician performance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
