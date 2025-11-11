import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";

interface ExpenseTypeAnalytics {
  typeBreakdown: {
    [key: string]: {
      monthly: { count: number; total: number; percentage: string };
      yearly: { count: number; total: number; percentage: string };
      averagePerMonth: string;
    };
  };
  recurringAnalysis: { monthly: number; percentage: string };
  oneTimeAnalysis: { monthly: number; percentage: string };
  cashFlowImpact: { predictable: number; unpredictable: number; total: number };
}

interface BudgetAnalysis {
  monthlyAverages: { [key: string]: number };
  currentMonthActuals: { [key: string]: number };
  variance: {
    [key: string]: {
      budget: string;
      actual: string;
      difference: string;
      percentage: string;
      status: string;
    };
  };
  totalAnalysis: {
    budget: string;
    actual: string;
    variance: string;
    percentage: string;
    status: string;
  };
}

interface CashFlowProjections {
  projections: Array<{
    month: string;
    predictable: string;
    yearly: string;
    unpredictable: string;
    total: string;
  }>;
  insights: {
    averageMonthly: string;
    highestMonth: { month: string; amount: string };
    lowestMonth: { month: string; amount: string };
    predictablePercentage: string;
  };
}

const COLORS = {
  daily: "#3B82F6",
  monthly: "#10B981",
  yearly: "#F59E0B",
  "one-time": "#EF4444",
  equipment: "#8B5CF6",
  over: "#EF4444",
  under: "#10B981",
  "on-track": "#3B82F6",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "over":
      return "bg-red-100 text-red-800 border-red-200";
    case "under":
      return "bg-green-100 text-green-800 border-green-200";
    case "on-track":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "over":
      return <AlertTriangle className="h-4 w-4" />;
    case "under":
      return <CheckCircle className="h-4 w-4" />;
    case "on-track":
      return <Target className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function ExpenseAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch expense type analytics
  const { data: expenseTypeData, isLoading: expenseTypeLoading } =
    useQuery<ExpenseTypeAnalytics>({
      queryKey: ["analytics", "expense-types"],
      queryFn: () => apiRequest("/api/analytics/expense-types", "GET"),
    });

  // Fetch budget analysis
  const { data: budgetData, isLoading: budgetLoading } =
    useQuery<BudgetAnalysis>({
      queryKey: ["analytics", "budget-analysis"],
      queryFn: () => apiRequest("/api/analytics/budget-analysis", "GET"),
    });

  // Fetch cash flow projections
  const { data: cashFlowData, isLoading: cashFlowLoading } =
    useQuery<CashFlowProjections>({
      queryKey: ["analytics", "cash-flow-projections"],
      queryFn: () => apiRequest("/api/analytics/cash-flow-projections", "GET"),
    });

  // Prepare chart data for expense type breakdown
  const expenseTypeChartData = expenseTypeData?.typeBreakdown
    ? Object.entries(expenseTypeData.typeBreakdown).map(([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        monthly: data.monthly.total,
        yearly: data.yearly.total,
        average: parseFloat(data.averagePerMonth),
        count: data.monthly.count,
      }))
    : [];

  // Prepare pie chart data for expense distribution
  const expenseDistributionData = expenseTypeData?.typeBreakdown
    ? Object.entries(expenseTypeData.typeBreakdown).map(([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: data.monthly.total,
        color: COLORS[type as keyof typeof COLORS] || "#6B7280",
      }))
    : [];

  // Prepare budget variance chart data
  const budgetVarianceData = budgetData?.variance
    ? Object.entries(budgetData.variance).map(([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        budget: parseFloat(data.budget),
        actual: parseFloat(data.actual),
        variance: parseFloat(data.difference),
        percentage: parseFloat(data.percentage),
        status: data.status,
      }))
    : [];

  // Prepare cash flow projection chart data
  const cashFlowChartData = cashFlowData?.projections || [];

  if (expenseTypeLoading || budgetLoading || cashFlowLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Expense Analytics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Loading...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expense Analytics</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Enhanced Analytics
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenseTypeData?.cashFlowImpact.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(expenseTypeData?.cashFlowImpact.total || 0) > 0
                ? "Current month"
                : "No expenses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predictable Expenses
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expenseTypeData?.cashFlowImpact.predictable || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenseTypeData?.recurringAnalysis.percentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetData?.totalAnalysis.status === "over" ? (
                <span className="text-red-600">Over Budget</span>
              ) : budgetData?.totalAnalysis.status === "under" ? (
                <span className="text-green-600">Under Budget</span>
              ) : (
                <span className="text-blue-600">On Track</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetData?.totalAnalysis.percentage}% variance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Monthly Projection
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                parseFloat(cashFlowData?.insights.averageMonthly || "0")
              )}
            </div>
            <p className="text-xs text-muted-foreground">Next 12 months</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget Analysis
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Expense Types
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Expense Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Expense Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cash Flow Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Predictable</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(
                        expenseTypeData?.cashFlowImpact.predictable || 0
                      )}
                    </span>
                  </div>
                  <Progress
                    value={
                      expenseTypeData?.cashFlowImpact.total
                        ? (expenseTypeData.cashFlowImpact.predictable /
                            expenseTypeData.cashFlowImpact.total) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Unpredictable</span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(
                        expenseTypeData?.cashFlowImpact.unpredictable || 0
                      )}
                    </span>
                  </div>
                  <Progress
                    value={
                      expenseTypeData?.cashFlowImpact.total
                        ? (expenseTypeData.cashFlowImpact.unpredictable /
                            expenseTypeData.cashFlowImpact.total) *
                          100
                        : 0
                    }
                    className="h-2 bg-red-100"
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(
                        expenseTypeData?.cashFlowImpact.total || 0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expense Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Expense Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expenseTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="monthly" fill="#3B82F6" name="Monthly Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Analysis Tab */}
        <TabsContent value="budget" className="space-y-6">
          {/* Budget Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Budget vs Actual Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgetVarianceData.map((item) => (
                  <div key={item.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium">
                          {formatCurrency(item.budget)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual:</span>
                        <span className="font-medium">
                          {formatCurrency(item.actual)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance:</span>
                        <span
                          className={`font-medium ${
                            item.variance > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.variance > 0 ? "+" : ""}
                          {formatCurrency(item.variance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>%:</span>
                        <span
                          className={`font-medium ${
                            item.percentage > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.percentage > 0 ? "+" : ""}
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Variance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budget Variance by Expense Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={budgetVarianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="budget" fill="#10B981" name="Budget" />
                  <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          {/* Cash Flow Insights */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Average Monthly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    parseFloat(cashFlowData?.insights.averageMonthly || "0")
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projected average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Highest Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    parseFloat(
                      cashFlowData?.insights.highestMonth.amount || "0"
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cashFlowData?.insights.highestMonth.month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Predictable %
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cashFlowData?.insights.predictablePercentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of total expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Projections Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                12-Month Cash Flow Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Area
                    type="monotone"
                    dataKey="predictable"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    name="Predictable"
                  />
                  <Area
                    type="monotone"
                    dataKey="yearly"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    name="Yearly"
                  />
                  <Area
                    type="monotone"
                    dataKey="unpredictable"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    name="Unpredictable"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Types Tab */}
        <TabsContent value="types" className="space-y-6">
          {/* Detailed Expense Type Analysis */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {expenseTypeData?.typeBreakdown &&
              Object.entries(expenseTypeData.typeBreakdown).map(
                ([type, data]) => (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              COLORS[type as keyof typeof COLORS],
                          }}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly Total:</span>
                          <span className="font-semibold">
                            {formatCurrency(data.monthly.total)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Count:</span>
                          <span className="font-semibold">
                            {data.monthly.count}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>% of Total:</span>
                          <span className="font-semibold">
                            {data.monthly.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Avg/Month:</span>
                          <span className="font-semibold">
                            {formatCurrency(parseFloat(data.averagePerMonth))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
          </div>

          {/* Expense Type Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Expense Type Comparison (Monthly vs Yearly)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expenseTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="monthly" fill="#3B82F6" name="Monthly" />
                  <Bar dataKey="yearly" fill="#10B981" name="Yearly" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
