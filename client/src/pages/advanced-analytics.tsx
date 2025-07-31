import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, Clock, Users, Wrench, DollarSign, 
  AlertTriangle, Target, Calendar, Trophy, Zap, Activity
} from "lucide-react";

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Fetch analytics data
  const { data: performanceData } = useQuery({
    queryKey: ['/api/analytics/performance', timeRange, selectedLocation],
  });

  const { data: forecastData } = useQuery({
    queryKey: ['/api/analytics/forecast', timeRange],
  });

  const { data: technicianData } = useQuery({
    queryKey: ['/api/analytics/technicians', timeRange],
  });

  const { data: customerData } = useQuery({
    queryKey: ['/api/analytics/customers', timeRange],
  });

  // Sample data for demonstration
  const repairTimeData = [
    { device: 'Laptop', avgTime: 4.2, target: 3.5, efficiency: 83 },
    { device: 'Desktop', avgTime: 3.8, target: 3.0, efficiency: 79 },
    { device: 'Phone', avgTime: 2.1, target: 2.0, efficiency: 95 },
    { device: 'Tablet', avgTime: 2.8, target: 2.5, efficiency: 89 },
  ];

  const revenueProjection = [
    { month: 'Jan', actual: 45000, projected: 42000, target: 50000 },
    { month: 'Feb', actual: 52000, projected: 48000, target: 50000 },
    { month: 'Mar', actual: 48000, projected: 51000, target: 50000 },
    { month: 'Apr', actual: 61000, projected: 55000, target: 50000 },
    { month: 'May', actual: null, projected: 58000, target: 50000 },
    { month: 'Jun', actual: null, projected: 62000, target: 50000 },
  ];

  const technicianPerformance = [
    { name: 'John Tech', repairs: 145, avgTime: 3.2, satisfaction: 4.8, efficiency: 92 },
    { name: 'Sarah Fix', repairs: 132, avgTime: 2.9, satisfaction: 4.9, efficiency: 95 },
    { name: 'Mike Service', repairs: 118, avgTime: 3.8, satisfaction: 4.6, efficiency: 87 },
    { name: 'Lisa Repair', repairs: 156, avgTime: 3.1, satisfaction: 4.7, efficiency: 91 },
  ];

  const customerRetention = [
    { segment: 'New Customers', value: 32, color: '#3b82f6' },
    { segment: 'Returning (2-5 visits)', value: 45, color: '#10b981' },
    { segment: 'Loyal (6+ visits)', value: 23, color: '#f59e0b' },
  ];

  const demandForecast = [
    { week: 'Week 1', phones: 25, laptops: 18, desktops: 12, tablets: 8 },
    { week: 'Week 2', phones: 28, laptops: 22, desktops: 15, tablets: 10 },
    { week: 'Week 3', phones: 32, laptops: 20, desktops: 13, tablets: 9 },
    { week: 'Week 4', phones: 30, laptops: 25, desktops: 18, tablets: 12 },
  ];

  const kpiCards = [
    {
      title: "Repair Efficiency",
      value: "87.3%",
      change: "+5.2%",
      trend: "up",
      icon: Zap,
      description: "Avg time vs target"
    },
    {
      title: "Customer Satisfaction",
      value: "4.7/5",
      change: "+0.2",
      trend: "up",
      icon: Trophy,
      description: "Based on 247 reviews"
    },
    {
      title: "Repeat Customers",
      value: "68%",
      change: "+12%",
      trend: "up",
      icon: Users,
      description: "Customer retention rate"
    },
    {
      title: "Avg Repair Time",
      value: "3.2 days",
      change: "-0.4 days",
      trend: "up",
      icon: Clock,
      description: "Faster than last month"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence and forecasting</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Store</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center mt-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="technicians">Team Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Repair Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Repair Time vs Target</CardTitle>
                <CardDescription>Average repair time by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repairTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#3b82f6" name="Actual Time (days)" />
                    <Bar dataKey="target" fill="#10b981" name="Target Time (days)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Projection</CardTitle>
                <CardDescription>Actual vs projected monthly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="projected" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Device Type Efficiency</CardTitle>
              <CardDescription>Performance metrics by repair category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairTimeData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.device}</span>
                      <Badge variant={item.efficiency >= 90 ? "default" : item.efficiency >= 80 ? "secondary" : "destructive"}>
                        {item.efficiency}% Efficient
                      </Badge>
                    </div>
                    <Progress value={item.efficiency} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast</CardTitle>
                <CardDescription>Predicted repair volume by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="phones" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="laptops" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="desktops" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="tablets" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Insights</CardTitle>
                <CardDescription>Historical patterns and predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Peak Season Approaching</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Based on historical data, expect 35% increase in laptop repairs during back-to-school season (Aug-Sep).
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Inventory Alert</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Increase laptop screen inventory by 40% to meet projected demand.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Optimization Opportunity</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Schedule additional technician shifts for projected 25% volume increase next month.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance</CardTitle>
              <CardDescription>Individual performance metrics and workload distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {technicianPerformance.map((tech, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{tech.name}</h3>
                        <p className="text-sm text-gray-600">{tech.repairs} repairs completed</p>
                      </div>
                      <Badge variant={tech.efficiency >= 90 ? "default" : "secondary"}>
                        {tech.efficiency}% Efficient
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Avg Repair Time</p>
                        <p className="font-medium">{tech.avgTime} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer Rating</p>
                        <p className="font-medium">{tech.satisfaction}/5.0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <Progress value={tech.efficiency} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>Customer loyalty and retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerRetention}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerRetention.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key metrics and actionable insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Customer Lifetime Value</span>
                    <span className="font-bold">$347</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Repeat Customer Rate</span>
                    <span className="font-bold">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Time Between Visits</span>
                    <span className="font-bold">8.3 months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="font-bold">4.7/5.0</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Top Recommendations</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Follow up with customers after 6 months for maintenance</li>
                    <li>• Implement loyalty program for 6+ visit customers</li>
                    <li>• Focus on phone repair marketing (highest satisfaction)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}