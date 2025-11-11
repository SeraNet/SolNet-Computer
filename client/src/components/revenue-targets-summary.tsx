import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { Target, TrendingUp, Info } from "lucide-react";

export function RevenueTargetsSummary() {
  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: () => apiRequest("/api/business-profile", "GET"),
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Target className="h-5 w-5" />
            Revenue Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const hasTargets =
    businessProfile?.monthlyRevenueTarget ||
    businessProfile?.annualRevenueTarget ||
    businessProfile?.growthTargetPercentage;

  if (!hasTargets) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Target className="h-5 w-5" />
            Revenue Targets
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Configure your business revenue goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>No revenue targets configured.</strong> Set your
                  business goals in the Owner Profile → Business tab to see
                  meaningful projections in your analytics charts.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Currently using default 15% growth target for projections.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Target className="h-5 w-5" />
          Revenue Targets
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Your configured business revenue goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businessProfile?.monthlyRevenueTarget && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Monthly Target
                </span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(businessProfile.monthlyRevenueTarget)}
              </p>
            </div>
          )}

          {businessProfile?.annualRevenueTarget && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Annual Target
                </span>
              </div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(businessProfile.annualRevenueTarget)}
              </p>
            </div>
          )}

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Growth Target
              </span>
            </div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {businessProfile?.growthTargetPercentage || "15.00"}%
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-3">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Active:</strong> These targets are being used in your
            revenue projections and analytics charts. The green "Target" bars in
            charts represent your
            {businessProfile?.growthTargetPercentage || "15.00"}% growth goal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
