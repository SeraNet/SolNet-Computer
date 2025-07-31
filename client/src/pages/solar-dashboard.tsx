import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { 
  Sun, Battery, Zap, DollarSign, TrendingUp, TrendingDown, 
  Gauge, AlertTriangle, Leaf, Home, Activity, MapPin
} from "lucide-react";

interface SolarSystem {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentOutput: number;
  efficiency: number;
  status: 'active' | 'maintenance' | 'offline';
  batteryLevel: number;
  dailyProduction: number;
  monthlyProduction: number;
  co2Saved: number;
  lastUpdate: string;
}

interface EnergyData {
  time: string;
  production: number;
  consumption: number;
  gridExport: number;
  batteryCharge: number;
}

export default function SolarDashboard() {
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("today");

  // Fetch solar systems data
  const { data: solarSystems } = useQuery({
    queryKey: ['/api/solar/systems'],
  });

  const { data: energyData } = useQuery({
    queryKey: ['/api/solar/energy-data', selectedSystem, timeRange],
  });

  // Sample data for demonstration
  const systems: SolarSystem[] = [
    {
      id: "sys-001",
      name: "Main Building Array",
      location: "Rooftop North",
      capacity: 50.5,
      currentOutput: 42.3,
      efficiency: 87.2,
      status: 'active',
      batteryLevel: 78,
      dailyProduction: 245.6,
      monthlyProduction: 7420.8,
      co2Saved: 142.5,
      lastUpdate: "2025-07-31T12:55:00Z"
    },
    {
      id: "sys-002", 
      name: "Parking Canopy Array",
      location: "Parking Lot",
      capacity: 35.2,
      currentOutput: 28.7,
      efficiency: 91.5,
      status: 'active',
      batteryLevel: 65,
      dailyProduction: 180.4,
      monthlyProduction: 5615.2,
      co2Saved: 108.3,
      lastUpdate: "2025-07-31T12:55:00Z"
    },
    {
      id: "sys-003",
      name: "Warehouse Array",
      location: "Building South",
      capacity: 28.8,
      currentOutput: 0,
      efficiency: 0,
      status: 'maintenance',
      batteryLevel: 23,
      dailyProduction: 0,
      monthlyProduction: 4280.1,
      co2Saved: 82.6,
      lastUpdate: "2025-07-31T09:30:00Z"
    }
  ];

  const todayEnergyData: EnergyData[] = [
    { time: "06:00", production: 2.1, consumption: 12.5, gridExport: 0, batteryCharge: 45 },
    { time: "08:00", production: 18.4, consumption: 15.2, gridExport: 3.2, batteryCharge: 52 },
    { time: "10:00", production: 42.8, consumption: 18.6, gridExport: 24.2, batteryCharge: 68 },
    { time: "12:00", production: 68.2, consumption: 22.1, gridExport: 46.1, batteryCharge: 85 },
    { time: "14:00", production: 71.0, consumption: 19.8, gridExport: 51.2, batteryCharge: 92 },
    { time: "16:00", production: 45.6, consumption: 25.3, gridExport: 20.3, batteryCharge: 88 },
    { time: "18:00", production: 12.8, consumption: 32.1, gridExport: 0, batteryCharge: 72 },
    { time: "20:00", production: 0, consumption: 28.5, gridExport: 0, batteryCharge: 58 },
  ];

  const monthlyData = [
    { month: "Jan", production: 185.2, consumption: 220.5, savings: 1420 },
    { month: "Feb", production: 195.8, consumption: 198.2, savings: 1580 },
    { month: "Mar", production: 242.1, consumption: 205.6, savings: 1890 },
    { month: "Apr", production: 268.5, consumption: 188.9, savings: 2140 },
    { month: "May", production: 285.7, consumption: 192.3, savings: 2380 },
    { month: "Jun", production: 295.2, consumption: 215.8, savings: 2520 },
    { month: "Jul", production: 298.6, consumption: 235.2, savings: 2580 },
  ];

  const totalCapacity = systems.reduce((sum, sys) => sum + sys.capacity, 0);
  const totalCurrentOutput = systems.filter(s => s.status === 'active').reduce((sum, sys) => sum + sys.currentOutput, 0);
  const averageEfficiency = systems.filter(s => s.status === 'active').reduce((sum, sys) => sum + sys.efficiency, 0) / systems.filter(s => s.status === 'active').length;
  const totalDailyProduction = systems.reduce((sum, sys) => sum + sys.dailyProduction, 0);
  const totalCO2Saved = systems.reduce((sum, sys) => sum + sys.co2Saved, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const kpiCards = [
    {
      title: "Total Output",
      value: `${totalCurrentOutput.toFixed(1)} kW`,
      subtitle: `of ${totalCapacity.toFixed(1)} kW capacity`,
      change: "+12.5%",
      trend: "up",
      icon: Zap,
      color: "text-blue-600"
    },
    {
      title: "System Efficiency",
      value: `${averageEfficiency.toFixed(1)}%`,
      subtitle: "Average across active systems",
      change: "+2.1%",
      trend: "up", 
      icon: Gauge,
      color: "text-green-600"
    },
    {
      title: "Daily Production",
      value: `${totalDailyProduction.toFixed(0)} kWh`,
      subtitle: "Today's total generation",
      change: "+8.3%",
      trend: "up",
      icon: Sun,
      color: "text-yellow-600"
    },
    {
      title: "CO₂ Saved Today",
      value: `${totalCO2Saved.toFixed(0)} kg`,
      subtitle: "Environmental impact",
      change: "+15.2%",
      trend: "up",
      icon: Leaf,
      color: "text-green-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SolNet@D Dashboard</h1>
          <p className="text-gray-600">Solar Energy Monitoring & Management System</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <select 
            value={selectedSystem} 
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Systems</option>
            {systems.map(sys => (
              <option key={sys.id} value={sys.id}>{sys.name}</option>
            ))}
          </select>
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
                    <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="production">Energy Production</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Energy Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Energy Flow</CardTitle>
              <CardDescription>Current energy production, consumption, and grid interaction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={todayEnergyData.slice(-8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} kW`, '']} />
                  <Area type="monotone" dataKey="production" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} name="Production" />
                  <Area type="monotone" dataKey="consumption" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Consumption" />
                  <Area type="monotone" dataKey="gridExport" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Grid Export" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {systems.map((system) => (
              <Card key={system.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{system.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {system.location}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(system.status)} text-white`}>
                      {system.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Output</span>
                      <span className="font-medium">{system.currentOutput} kW</span>
                    </div>
                    <Progress value={(system.currentOutput / system.capacity) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 kW</span>
                      <span>{system.capacity} kW</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Battery Level</span>
                      <span className="font-medium">{system.batteryLevel}%</span>
                    </div>
                    <Progress value={system.batteryLevel} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Daily Production</p>
                      <p className="font-medium">{system.dailyProduction} kWh</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="font-medium">{system.efficiency}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Energy Production</CardTitle>
                <CardDescription>Hourly breakdown of solar energy generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={todayEnergyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kW`, '']} />
                    <Line type="monotone" dataKey="production" stroke="#f59e0b" strokeWidth={3} name="Solar Production" />
                    <Line type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="Consumption" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Production Trend</CardTitle>
                <CardDescription>Energy production and savings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="production" fill="#10b981" name="Production (kWh)" />
                    <Bar dataKey="consumption" fill="#6b7280" name="Consumption (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Energy Balance Summary</CardTitle>
              <CardDescription>Production vs consumption analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Sun className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">2,080 kWh</p>
                  <p className="text-sm text-gray-600">Total Production (Jul)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">1,645 kWh</p>
                  <p className="text-sm text-gray-600">Total Consumption (Jul)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">$435</p>
                  <p className="text-sm text-gray-600">Energy Savings (Jul)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Comparison</CardTitle>
                <CardDescription>Efficiency metrics across all solar arrays</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systems.map((system, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{system.name}</span>
                        <span className="text-sm text-gray-600">{system.efficiency}%</span>
                      </div>
                      <Progress value={system.efficiency} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Carbon footprint reduction metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">CO₂ Reduction</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">2.8 tons</p>
                  <p className="text-sm text-green-700">This month</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Trees Equivalent</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">127 trees</p>
                  <p className="text-sm text-blue-700">Carbon offset equivalent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Active maintenance and performance alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Maintenance Required</span>
                  </div>
                  <p className="text-sm text-yellow-700">Warehouse Array - Scheduled cleaning overdue</p>
                  <p className="text-xs text-yellow-600 mt-1">System ID: sys-003</p>
                </div>
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Performance Notice</span>
                  </div>
                  <p className="text-sm text-blue-700">Main Building Array - Efficiency slightly below target</p>
                  <p className="text-xs text-blue-600 mt-1">Current: 87.2% | Target: 90%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming maintenance activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Panel Cleaning</p>
                    <p className="text-sm text-gray-600">Main Building Array</p>
                  </div>
                  <Badge variant="outline">Aug 5</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Inverter Inspection</p>
                    <p className="text-sm text-gray-600">Parking Canopy Array</p>
                  </div>
                  <Badge variant="outline">Aug 12</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Battery Check</p>
                    <p className="text-sm text-gray-600">All Systems</p>
                  </div>
                  <Badge variant="outline">Aug 15</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}