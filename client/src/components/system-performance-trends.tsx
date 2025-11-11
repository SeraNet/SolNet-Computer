import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceTrendsProps {
  currentCpu: number;
  currentMemory: number;
  previousCpu?: number;
  previousMemory?: number;
}

export function SystemPerformanceTrends({
  currentCpu,
  currentMemory,
  previousCpu,
  previousMemory,
}: PerformanceTrendsProps) {
  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />;
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous?: number) => {
    if (!previous) return "text-gray-500";
    if (current > previous) return "text-red-500";
    if (current < previous) return "text-green-500";
    return "text-gray-500";
  };

  const getTrendText = (current: number, previous?: number) => {
    if (!previous) return "No previous data";
    const diff = current - previous;
    const absDiff = Math.abs(diff);
    if (diff > 0) return `+${absDiff.toFixed(1)}%`;
    if (diff < 0) return `-${absDiff.toFixed(1)}%`;
    return "No change";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Performance Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* CPU Trend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU Usage</span>
              {getTrendIcon(currentCpu, previousCpu)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {currentCpu.toFixed(1)}%
              </span>
              <Badge
                variant="outline"
                className={getTrendColor(currentCpu, previousCpu)}
              >
                {getTrendText(currentCpu, previousCpu)}
              </Badge>
            </div>
            {previousCpu && (
              <p className="text-xs text-muted-foreground">
                Previous: {previousCpu.toFixed(1)}%
              </p>
            )}
          </div>

          {/* Memory Trend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              {getTrendIcon(currentMemory, previousMemory)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {currentMemory.toFixed(1)}%
              </span>
              <Badge
                variant="outline"
                className={getTrendColor(currentMemory, previousMemory)}
              >
                {getTrendText(currentMemory, previousMemory)}
              </Badge>
            </div>
            {previousMemory && (
              <p className="text-xs text-muted-foreground">
                Previous: {previousMemory.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Performance Status */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            <Badge
              variant={
                currentCpu > 80 || currentMemory > 80
                  ? "destructive"
                  : currentCpu > 60 || currentMemory > 60
                  ? "secondary"
                  : "default"
              }
            >
              {currentCpu > 80 || currentMemory > 80
                ? "Critical"
                : currentCpu > 60 || currentMemory > 60
                ? "Warning"
                : "Healthy"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on current CPU and memory usage levels
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
