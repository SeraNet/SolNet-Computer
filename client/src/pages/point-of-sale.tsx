import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import POSModal from "@/components/pos-modal";
import BarcodeScannerModal from "@/components/barcode-scanner-modal";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
import {
  ShoppingCart,
  Package,
  History,
  CreditCard,
  Barcode,
  TrendingUp,
  DollarSign,
  Activity,
  Receipt,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PointOfSale() {
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const toNumber = (value: any): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return isNaN(value) ? 0 : value;
    if (typeof value === "string") {
      const n = parseFloat(value);
      return isNaN(n) ? 0 : n;
    }
    try {
      const s = String(value);
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  };

  // Fetch today's sales (no items included)
  const { data: todaysSales = [], isLoading: isLoadingToday } = useQuery({
    queryKey: ["sales", "today"],
    queryFn: async () => await apiRequest<any[]>("/api/sales/today"),
  });

  // Fetch all sales (includes items). We'll compute today's items sold from this.
  const { data: allSalesWithItems = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["sales", "all"],
    queryFn: async () => await apiRequest<any[]>("/api/sales"),
  });

  const {
    totalSalesAmountETB,
    transactionsCount,
    itemsSoldToday,
    recentActivity,
  } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalSalesAmount = (todaysSales || []).reduce(
      (sum: number, s: any) => sum + toNumber(s.totalAmount),
      0
    );

    const transactions = (todaysSales || []).length || 0;

    const itemsSold = (allSalesWithItems || [])
      .filter((s: any) => {
        const created = s.createdAt ? new Date(s.createdAt) : null;
        return created && created >= startOfToday;
      })
      .reduce((sum: number, s: any) => {
        if (Array.isArray(s.items)) {
          const qtySum = s.items.reduce(
            (acc: number, it: any) => acc + toNumber(it.quantity),
            0
          );
          return sum + qtySum;
        }
        if (typeof s.itemCount === "number") return sum + s.itemCount;
        return sum;
      }, 0);

    const recent = (todaysSales || []).slice(0, 5);

    return {
      totalSalesAmountETB: formatCurrency(totalSalesAmount),
      totalSalesAmountRaw: totalSalesAmount,
      transactionsCount: transactions,
      itemsSoldToday: itemsSold,
      recentActivity: recent,
    };
  }, [todaysSales, allSalesWithItems]);

  // Chart Data - Sales by Hour (Real data only)
  const salesByHourData = useMemo(() => {
    if (!todaysSales || todaysSales.length === 0) return [];

    const hourlyData: { [key: number]: { sales: number; revenue: number } } = {};
    
    todaysSales.forEach((sale: any) => {
      if (sale.createdAt) {
        const hour = new Date(sale.createdAt).getHours();
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sales: 0, revenue: 0 };
        }
        hourlyData[hour].sales += 1;
        hourlyData[hour].revenue += toNumber(sale.totalAmount);
      }
    });

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: `${hour}:00`,
        sales: data.sales,
        revenue: data.revenue,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [todaysSales]);

  // Chart Data - Payment Methods (Real data only)
  const paymentMethodData = useMemo(() => {
    if (!todaysSales || todaysSales.length === 0) return [];

    const methods: { [key: string]: { count: number; amount: number } } = {};
    
    todaysSales.forEach((sale: any) => {
      const method = sale.paymentMethod || "Cash";
      if (!methods[method]) {
        methods[method] = { count: 0, amount: 0 };
      }
      methods[method].count += 1;
      methods[method].amount += toNumber(sale.totalAmount);
    });

    return Object.entries(methods).map(([name, data]) => ({
      name,
      value: data.amount,
      count: data.count,
    }));
  }, [todaysSales]);

  const hasChartData = salesByHourData.length > 0 || paymentMethodData.length > 0;

  const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-slate-600 dark:text-slate-400">
              {entry.name === "revenue" ? "Revenue" : entry.name}: <span className="font-bold">
                {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout
      icon={ShoppingCart}
      title="Point of Sale"
      subtitle="Process sales and manage transactions with our modern POS system"
      actions={
        <Button
          onClick={() => setShowBarcodeModal(true)}
          variant="outline"
          className="h-10"
        >
          <Barcode className="w-4 h-4 mr-2" />
          Scan Barcode
        </Button>
      }
    >
      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="group card-elevated hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-blue-500/20 dark:from-blue-600/10 dark:to-blue-700/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Sales Terminal
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-base">
                Open the sales terminal to process customer transactions quickly
                and efficiently
              </p>
              <Button
                onClick={() => setShowPOSModal(true)}
                size="lg"
                className="w-full py-6 rounded-xl font-semibold transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Open POS Terminal
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group card-elevated hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-green-500/20 dark:from-emerald-600/10 dark:to-green-700/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Inventory Management
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-base">
                Manage inventory items and quick sales with real-time stock
                tracking
              </p>
              <Button
                onClick={() => (window.location.href = "/inventory")}
                size="lg"
                variant="secondary"
                className="w-full py-6 rounded-xl font-semibold transform hover:scale-105"
              >
                <Package className="w-5 h-5 mr-2" />
                Go to Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Today's Sales
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {isLoadingToday
                    ? "Loading..."
                    : `${transactionsCount} transactions`}
                </p>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {isLoadingToday ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ) : (
                totalSalesAmountETB
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="group card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Items Sold</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Across all sales today</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {isLoadingAll ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ) : (
                itemsSoldToday
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="group card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Recent Activity
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Latest transactions</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {isLoadingToday ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ) : (
                recentActivity.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infographics Section - Charts in ONE ROW - Only show if there's data */}
      {hasChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales by Hour - Line Chart */}
          {salesByHourData.length > 0 && (
            <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sales by Hour</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Today's hourly performance</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesByHourData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis 
                      dataKey="hour" 
                      className="text-xs"
                      tick={{ fill: '#64748b' }}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      className="text-xs"
                      tick={{ fill: '#64748b' }}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                      tick={{ fill: '#64748b' }}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods - Pie Chart */}
          {paymentMethodData.length > 0 && (
            <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payment Methods</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue by payment type</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelStyle={{ fontSize: '12px', fill: '#64748b' }}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b',
                        fontSize: '12px',
                      }}
                      labelStyle={{
                        color: '#1e293b',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity Details */}
      <Card className="card-elevated bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-8">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 rounded-xl shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Recent Sales Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoadingToday ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <span className="font-medium">Loading recent activity...</span>
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-4">
                <Receipt className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                No recent sales yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base">
                Start processing transactions to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((s: any, index: number) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between p-5 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl hover:from-slate-100 hover:to-slate-200/50 dark:hover:from-slate-800 dark:hover:to-slate-700/50 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {s.customerName || "Walk-in Customer"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleTimeString()
                          : "Recent"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-1">
                      {formatCurrency(toNumber(s.totalAmount))}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                      {Array.isArray(s.items)
                        ? s.items.reduce(
                            (acc: number, it: any) =>
                              acc + toNumber(it.quantity),
                            0
                          )
                        : s.itemCount || 0}{" "}
                      items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <POSModal open={showPOSModal} onOpenChange={setShowPOSModal} />
      <BarcodeScannerModal
        open={showBarcodeModal}
        onOpenChange={setShowBarcodeModal}
      />
    </PageLayout>
  );
}
