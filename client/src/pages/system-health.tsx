import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import {
  Server,
  Database,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Wrench,
  RefreshCw,
  FileText,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSystemWebSocket } from "@/hooks/useSystemWebSocket";
import { SystemPerformanceTrends } from "@/components/system-performance-trends";
import { SystemHealthSummary } from "@/components/system-health-summary";
import ReportGenerator from "@/components/report-generator";

interface SystemStatus {
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connections: number;
  };
  storage: {
    used: number;
    total: number;
    status: "healthy" | "warning" | "error";
  };
  performance: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  services: {
    name: string;
    status: "running" | "stopped" | "error";
    lastCheck: string;
  }[];
  systemLogs?: {
    timestamp: string;
    level: "info" | "warning" | "error" | "critical";
    message: string;
  }[];
  errorStats?: {
    totalErrors: number;
    errorsLast24h: number;
    criticalErrors: number;
  };
  systemInfo?: {
    platform: string;
    nodeVersion: string;
    cores: number;
    loadAverage: number[];
    processId: number;
  };
  lastUpdated?: string;
}

export default function SystemHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [previousMetrics, setPreviousMetrics] = useState<{
    cpu: number;
    memory: number;
  } | null>(null);
  const {
    data: realTimeData,
    isConnected: wsConnected,
    error: wsError,
    reconnect: wsReconnect,
  } = useSystemWebSocket();

  const {
    data: systemStatus,
    isLoading,
    refetch,
  } = useQuery<SystemStatus>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const response = await apiRequest("/api/system/health");
      return (
        response || {
          database: { status: "healthy", responseTime: 45, connections: 12 },
          storage: { used: 65, total: 100, status: "healthy" },
          performance: { cpu: 23, memory: 67, uptime: 86400 },
          services: [
            {
              name: "API Server",
              status: "running",
              lastCheck: new Date().toISOString(),
            },
            {
              name: "Database",
              status: "running",
              lastCheck: new Date().toISOString(),
            },
            {
              name: "File Storage",
              status: "running",
              lastCheck: new Date().toISOString(),
            },
          ],
          systemLogs: [
            {
              timestamp: new Date().toISOString(),
              level: "info",
              message: "System health check completed",
            },
          ],
          errorStats: {
            totalErrors: 0,
            errorsLast24h: 0,
            criticalErrors: 0,
          },
          lastUpdated: new Date().toISOString(),
        }
      );
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Update previous metrics when real-time data changes
  useEffect(() => {
    if (realTimeData) {
      setPreviousMetrics({
        cpu: realTimeData.performance.cpu,
        memory: realTimeData.performance.memory,
      });
    }
  }, [realTimeData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
      case "stopped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
      case "stopped":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "critical":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "api server":
        return <Server className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "file storage":
        return <HardDrive className="h-4 w-4" />;
      case "sms service":
        return <Smartphone className="h-4 w-4" />;
      case "telegram bot":
        return <Bot className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getPerformanceStatus = (value: number) => {
    if (value < 50) return "healthy";
    if (value < 80) return "warning";
    return "error";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor system performance and service status
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  wsConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-500">
                {wsConnected ? "Real-time" : "Offline"}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {realTimeData?.timestamp
                ? new Date(realTimeData.timestamp).toLocaleTimeString()
                : lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="mb-8">
        <SystemHealthSummary
          databaseStatus={systemStatus?.database.status || "healthy"}
          storageStatus={systemStatus?.storage.status || "healthy"}
          cpuUsage={
            realTimeData?.performance.cpu || systemStatus?.performance.cpu || 0
          }
          memoryUsage={
            realTimeData?.performance.memory ||
            systemStatus?.performance.memory ||
            0
          }
          errorCount={systemStatus?.errorStats?.totalErrors || 0}
          criticalErrors={systemStatus?.errorStats?.criticalErrors || 0}
          servicesRunning={
            systemStatus?.services?.filter((s) => s.status === "running")
              .length || 0
          }
          totalServices={systemStatus?.services?.length || 0}
        />
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(systemStatus?.database.status || "healthy")}
              <Badge
                className={getStatusColor(
                  systemStatus?.database.status || "healthy"
                )}
              >
                {systemStatus?.database.status || "healthy"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Response Time: {systemStatus?.database.responseTime || 0}ms
              </p>
              <p className="text-xs text-muted-foreground">
                Connections: {systemStatus?.database.connections || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Storage Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(systemStatus?.storage.status || "healthy")}
              <Badge
                className={getStatusColor(
                  systemStatus?.storage.status || "healthy"
                )}
              >
                {systemStatus?.storage.status || "healthy"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress
                value={systemStatus?.storage.used || 0}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {systemStatus?.storage.used || 0}% of{" "}
                {systemStatus?.storage.total || 100}GB used
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(
                getPerformanceStatus(
                  realTimeData?.performance.cpu ||
                    systemStatus?.performance.cpu ||
                    0
                )
              )}
              <Badge
                className={getStatusColor(
                  getPerformanceStatus(
                    realTimeData?.performance.cpu ||
                      systemStatus?.performance.cpu ||
                      0
                  )
                )}
              >
                {realTimeData?.performance.cpu ||
                  systemStatus?.performance.cpu ||
                  0}
                %
              </Badge>
            </div>
            <Progress
              value={
                realTimeData?.performance.cpu ||
                systemStatus?.performance.cpu ||
                0
              }
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(
                getPerformanceStatus(
                  realTimeData?.performance.memory ||
                    systemStatus?.performance.memory ||
                    0
                )
              )}
              <Badge
                className={getStatusColor(
                  getPerformanceStatus(
                    realTimeData?.performance.memory ||
                      systemStatus?.performance.memory ||
                      0
                  )
                )}
              >
                {realTimeData?.performance.memory ||
                  systemStatus?.performance.memory ||
                  0}
                %
              </Badge>
            </div>
            <Progress
              value={
                realTimeData?.performance.memory ||
                systemStatus?.performance.memory ||
                0
              }
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Error Statistics */}
      {systemStatus?.errorStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Errors
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.errorStats.totalErrors}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Errors (24h)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.errorStats.errorsLast24h}
              </div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Errors
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.errorStats.criticalErrors}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Information and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Uptime */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>System Uptime</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatUptime(systemStatus?.performance.uptime || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              System has been running continuously since last restart
            </p>
          </CardContent>
        </Card>

        {/* System Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Platform:</span>
                <span className="text-sm font-medium">
                  {systemStatus?.systemInfo?.platform || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Node.js:</span>
                <span className="text-sm font-medium">
                  {systemStatus?.systemInfo?.nodeVersion || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  CPU Cores:
                </span>
                <span className="text-sm font-medium">
                  {systemStatus?.systemInfo?.cores || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Process ID:
                </span>
                <span className="text-sm font-medium">
                  {systemStatus?.systemInfo?.processId || "Unknown"}
                </span>
              </div>
              {systemStatus?.systemInfo?.loadAverage && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Load Average:
                  </span>
                  <span className="text-sm font-medium">
                    {systemStatus.systemInfo.loadAverage
                      .map(
                        (load, index) =>
                          `${load.toFixed(2)}${index < 2 ? ", " : ""}`
                      )
                      .join("")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <SystemPerformanceTrends
          currentCpu={
            realTimeData?.performance.cpu || systemStatus?.performance.cpu || 0
          }
          currentMemory={
            realTimeData?.performance.memory ||
            systemStatus?.performance.memory ||
            0
          }
          previousCpu={previousMetrics?.cpu}
          previousMemory={previousMetrics?.memory}
        />
      </div>

      {/* Tabs for Services, Logs, and Reports */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Services Status</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Services Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus?.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(service.name)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last checked:{" "}
                          {new Date(service.lastCheck).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>System Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus?.systemLogs?.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${getLogLevelColor(
                      log.level
                    )}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getLogLevelIcon(log.level)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          log.level === "critical"
                            ? "border-red-300 text-red-700"
                            : log.level === "error"
                            ? "border-red-200 text-red-600"
                            : log.level === "warning"
                            ? "border-yellow-200 text-yellow-600"
                            : "border-blue-200 text-blue-600"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generate Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReportGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Alerts */}
      {wsError && (
        <Alert className="mt-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Connection Warning:</strong> Real-time monitoring is
            offline.
            <Button
              variant="link"
              className="p-0 h-auto text-orange-800 underline ml-2"
              onClick={wsReconnect}
            >
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {systemStatus?.errorStats &&
        systemStatus.errorStats.criticalErrors > 0 && (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Critical System Alert:</strong>{" "}
              {systemStatus.errorStats.criticalErrors} critical error(s)
              detected. Please review system logs and take immediate action.
            </AlertDescription>
          </Alert>
        )}

      {systemStatus?.performance &&
        (systemStatus.performance.cpu > 80 ||
          systemStatus.performance.memory > 80) && (
          <Alert className="mt-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Performance Warning:</strong> High resource usage
              detected. CPU: {systemStatus.performance.cpu}%, Memory:{" "}
              {systemStatus.performance.memory}%
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
