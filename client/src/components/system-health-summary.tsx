import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Shield,
  Zap,
  Database,
  HardDrive,
} from "lucide-react";

interface SystemHealthSummaryProps {
  databaseStatus: string;
  storageStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  errorCount: number;
  criticalErrors: number;
  servicesRunning: number;
  totalServices: number;
}

export function SystemHealthSummary({
  databaseStatus,
  storageStatus,
  cpuUsage,
  memoryUsage,
  errorCount,
  criticalErrors,
  servicesRunning,
  totalServices,
}: SystemHealthSummaryProps) {
  const getOverallStatus = () => {
    if (criticalErrors > 0) return "critical";
    if (errorCount > 0 || cpuUsage > 80 || memoryUsage > 80) return "warning";
    if (databaseStatus === "error" || storageStatus === "error")
      return "warning";
    return "healthy";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="border-2 border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <span>System Health Overview</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Database Status */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Database
                className={`h-6 w-6 ${
                  databaseStatus === "healthy"
                    ? "text-green-500"
                    : databaseStatus === "warning"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
            </div>
            <p className="text-sm font-medium">Database</p>
            <Badge
              variant="outline"
              className={`text-xs ${
                databaseStatus === "healthy"
                  ? "border-green-200 text-green-700"
                  : databaseStatus === "warning"
                  ? "border-yellow-200 text-yellow-700"
                  : "border-red-200 text-red-700"
              }`}
            >
              {databaseStatus}
            </Badge>
          </div>

          {/* Storage Status */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <HardDrive
                className={`h-6 w-6 ${
                  storageStatus === "healthy"
                    ? "text-green-500"
                    : storageStatus === "warning"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
            </div>
            <p className="text-sm font-medium">Storage</p>
            <Badge
              variant="outline"
              className={`text-xs ${
                storageStatus === "healthy"
                  ? "border-green-200 text-green-700"
                  : storageStatus === "warning"
                  ? "border-yellow-200 text-yellow-700"
                  : "border-red-200 text-red-700"
              }`}
            >
              {storageStatus}
            </Badge>
          </div>

          {/* Performance */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Zap
                className={`h-6 w-6 ${
                  cpuUsage > 80 || memoryUsage > 80
                    ? "text-red-500"
                    : cpuUsage > 60 || memoryUsage > 60
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              />
            </div>
            <p className="text-sm font-medium">Performance</p>
            <div className="text-xs text-muted-foreground">
              CPU: {cpuUsage.toFixed(1)}% | RAM: {memoryUsage.toFixed(1)}%
            </div>
          </div>

          {/* Services */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Activity
                className={`h-6 w-6 ${
                  servicesRunning === totalServices
                    ? "text-green-500"
                    : servicesRunning > totalServices / 2
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
            </div>
            <p className="text-sm font-medium">Services</p>
            <div className="text-xs text-muted-foreground">
              {servicesRunning}/{totalServices} Running
            </div>
          </div>
        </div>

        {/* Error Summary */}
        {(errorCount > 0 || criticalErrors > 0) && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Summary</span>
              <div className="flex space-x-2">
                {errorCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-200 text-orange-700"
                  >
                    {errorCount} Errors
                  </Badge>
                )}
                {criticalErrors > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-red-200 text-red-700"
                  >
                    {criticalErrors} Critical
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
