import React, { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { AnalyticsModule } from "./analytics-module-card";
import { ExpenseTypeAnalytics, BudgetAnalysis, CashFlowProjections, COLORS } from "./types";
import { getStatusColor, getStatusIcon } from "./utils";

/**
 * Expense Analytics Module Component
 * Handles expense tracking, budget analysis, and cash flow projections
 */
export function ExpenseAnalyticsModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [distributionPeriod, setDistributionPeriod] = useState<"monthly" | "yearly">("monthly");

  const [distributionSort, setDistributionSort] = useState<"value" | "alpha">("value");
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Fetch expense analytics data
  const { data: expenseTypeData, isLoading: expenseTypeLoading } = useQuery<ExpenseTypeAnalytics>({
    queryKey: ["analytics", "expense-types"],
    queryFn: () => apiRequest("/api/analytics/expense-types", "GET"),
  });


  const { data: budgetData, isLoading: budgetLoading } = useQuery<BudgetAnalysis>({
    queryKey: ["analytics", "budget-analysis"],
    queryFn: () => apiRequest("/api/analytics/budget-analysis", "GET"),
  });

  const { data: cashFlowData, isLoading: cashFlowLoading } = useQuery<CashFlowProjections>({
    queryKey: ["analytics", "cash-flow-projections"],
    queryFn: () => apiRequest("/api/analytics/cash-flow-projections", "GET"),
  });

  // Prepare chart data
  const expenseTypeChartData = expenseTypeData?.typeBreakdown
    ? Object.entries(expenseTypeData.typeBreakdown).map(([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        monthly: typeof data.monthly.total === 'string' ? parseFloat(data.monthly.total) : data.monthly.total,
        yearly: typeof data.yearly.total === 'string' ? parseFloat(data.yearly.total) : data.yearly.total,
        average: parseFloat(data.averagePerMonth),
        count: data.monthly.count,
      }))
    : [];

  const expenseTypeChartDataByPeriod = expenseTypeChartData.map((d) => ({
    name: d.name,
    amount: distributionPeriod === "yearly" ? d.yearly : d.monthly,
  }));

  const expenseDistributionData = expenseTypeData?.typeBreakdown
    ? Object.entries(expenseTypeData.typeBreakdown)
        .map(([type, data]) => {
          const base = distributionPeriod === "yearly" ? data.yearly.total : data.monthly.total;
          return {
            key: type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: base,
            color: COLORS[type as keyof typeof COLORS] || "#6B7280",
          };
        })
        .sort((a, b) =>
          distributionSort === "value" ? b.value - a.value : a.name.localeCompare(b.name)
        )
    : [];

  const expenseDistributionTotal = expenseDistributionData.reduce((sum, d) => sum + (d.value || 0), 0);
  const expenseDistributionChartData = expenseDistributionData
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      pct: expenseDistributionTotal ? (d.value / expenseDistributionTotal) * 100 : 0,
    }));

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

  const cashFlowChartData = cashFlowData?.projections?.map(projection => ({
    ...projection,
    predictable: parseFloat(projection.predictable),
    yearly: parseFloat(projection.yearly),
    unpredictable: parseFloat(projection.unpredictable),
    total: parseFloat(projection.total),
  })) || [];
  

  if (expenseTypeLoading || budgetLoading || cashFlowLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Monthly Expenses</p>
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(expenseTypeData?.cashFlowImpact.total || 0)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              All expenses this month
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Predictable Expenses</p>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(expenseTypeData?.cashFlowImpact.predictable || 0)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Recurring expenses only
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Budget Status</p>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold">
              {budgetData?.totalAnalysis.status === "over" ? (
                <span className="text-red-600 dark:text-red-400">Over Budget</span>
              ) : budgetData?.totalAnalysis.status === "under" ? (
                <span className="text-green-600 dark:text-green-400">Under Budget</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">On Track</span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {budgetData?.totalAnalysis.percentage}% variance
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Monthly Projection</p>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(parseFloat(cashFlowData?.insights.averageMonthly || "0"))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Next 12 months</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Types
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AnalyticsModule title="Expense Distribution" icon={PieChartIcon}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Tabs
                    value={distributionPeriod}
                    onValueChange={(v) => setDistributionPeriod(v as "monthly" | "yearly")}
                  >
                    <TabsList className="grid grid-cols-2 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <TabsTrigger value="monthly" className="py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm">
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger value="yearly" className="py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm">
                        Yearly
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total: {formatCurrency(expenseDistributionTotal)} ({distributionPeriod})
                    <br />
                    <span className="text-xs">
                      Data points: {expenseDistributionChartData.length}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDistributionSort((prev) => (prev === "value" ? "alpha" : "value"))}
                >
                  {distributionSort === "value" ? "By Value" : "A-Z"}
                </Button>
              </div>
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={expenseDistributionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      minAngle={2}
                      labelLine={false}
                      label={({ percent }) => (percent && percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : "")}
                      onMouseEnter={(_, index) => setHoveredSlice(index)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      dataKey="value"
                    >
                      {expenseDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, props) => {
                        const payload: any = props?.payload || {};
                        const pct = payload.pct || (payload.percent ? payload.percent * 100 : 0);
                        return [`${formatCurrency(value as number)} (${pct.toFixed(0)}%)`, payload.name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredSlice !== null && expenseDistributionChartData[hoveredSlice] ? (
                    <>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {expenseDistributionChartData[hoveredSlice].name}
                      </div>
                      <div className="text-lg font-semibold">{`${expenseDistributionChartData[hoveredSlice].pct.toFixed(0)}%`}</div>
                    </>
                  ) : (
                    <>
                      {expenseDistributionChartData[0] ? (
                        <>
                          <div className="text-xs text-slate-600 dark:text-slate-400">{expenseDistributionChartData[0].name}</div>
                          <div className="text-sm font-semibold">{`${expenseDistributionChartData[0].pct.toFixed(0)}%`}</div>
                          <div className="text-sm">{formatCurrency(expenseDistributionChartData[0].value)}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                          <div className="text-lg font-semibold">{formatCurrency(expenseDistributionTotal)}</div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              {expenseDistributionChartData.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Breakdown by Type
                  </div>
                  {expenseDistributionChartData.map((d) => {
                    const pct = Math.round(d.pct || 0);
                    return (
                      <div key={d.key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                          <span className="text-sm font-medium">{d.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatCurrency(d.value)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AnalyticsModule>

            <AnalyticsModule title="Cash Flow Impact" icon={TrendingUp}>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Predictable</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(expenseTypeData?.cashFlowImpact.predictable || 0)}
                    </span>
                  </div>
                  <Progress
                    value={
                      expenseTypeData?.cashFlowImpact.total
                        ? (expenseTypeData.cashFlowImpact.predictable / expenseTypeData.cashFlowImpact.total) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Unpredictable</span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(expenseTypeData?.cashFlowImpact.unpredictable || 0)}
                    </span>
                  </div>
                  <Progress
                    value={
                      expenseTypeData?.cashFlowImpact.total
                        ? (expenseTypeData.cashFlowImpact.unpredictable / expenseTypeData.cashFlowImpact.total) * 100
                        : 0
                    }
                    className="h-2 bg-red-100"
                  />
                </div>
              </div>
            </AnalyticsModule>
          </div>

          <AnalyticsModule title={`${distributionPeriod === "yearly" ? "Yearly" : "Monthly"} Expense Breakdown`} icon={BarChart3}>
            {expenseTypeChartDataByPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseTypeChartDataByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="amount" fill="#3B82F6" name={distributionPeriod === "yearly" ? "Yearly Total" : "Monthly Total"} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add some expenses to see the breakdown</p>
                </div>
              </div>
            )}
          </AnalyticsModule>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgetVarianceData.map((item) => (
              <Card key={item.name} className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm text-slate-900 dark:text-slate-100">
                    {item.name}
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(item.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(item.actual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <span className={`font-medium ${item.variance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                      {item.variance > 0 ? "+" : ""}
                      {formatCurrency(item.variance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AnalyticsModule title="Budget Variance Chart" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVarianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="budget" fill="#10B981" name="Budget" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsModule>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Average Monthly</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(parseFloat(cashFlowData?.insights.averageMonthly || "0"))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Based on actual data ({(cashFlowData?.insights as any)?.actualData?.monthsPassed || 0} months)
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Current Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(parseFloat(cashFlowData?.insights.highestMonth.amount || "0"))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {cashFlowData?.insights.highestMonth.month} (actual)
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Predictable %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {cashFlowData?.insights.predictablePercentage}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Of current month expenses (actual)
                </p>
              </CardContent>
            </Card>
          </div>

          <AnalyticsModule title="12-Month Cash Flow Projections" icon={LineChartIcon}>
            {cashFlowChartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cashFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value as number), name]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area type="monotone" dataKey="predictable" stackId="1" stroke="#10B981" fill="#10B981" name="Predictable" />
                    <Area type="monotone" dataKey="yearly" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Yearly" />
                    <Area type="monotone" dataKey="unpredictable" stackId="1" stroke="#EF4444" fill="#EF4444" name="Unpredictable" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Projections based on historical data with seasonal variations
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <LineChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No projection data available</p>
                  <p className="text-sm">Add some expenses to see cash flow projections</p>
                </div>
              </div>
            )}
          </AnalyticsModule>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseTypeData?.typeBreakdown &&
              Object.entries(expenseTypeData.typeBreakdown).map(([type, data]) => (
                <Card key={type} className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[type as keyof typeof COLORS] }} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(data.monthly.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Count:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{data.monthly.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>% of Total:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{data.monthly.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg/Month:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(parseFloat(data.averagePerMonth))}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <AnalyticsModule title="Expense Type Comparison" icon={BarChart3}>
            {expenseTypeChartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value as number), name]}
                      labelFormatter={(label) => `Type: ${label}`}
                    />
                    <Bar dataKey="monthly" fill="#3B82F6" name="Monthly" />
                    <Bar dataKey="yearly" fill="#10B981" name="Yearly" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Monthly: Current month expenses | Yearly: Annual totals
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add some expenses to see the comparison</p>
                </div>
              </div>
            )}
          </AnalyticsModule>
        </TabsContent>
      </Tabs>
    </div>
  );
}

