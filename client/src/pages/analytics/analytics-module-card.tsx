import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable Analytics Module Card Component
 */
interface AnalyticsModuleProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  badge?: string;
}

export function AnalyticsModule({
  title,
  icon: Icon,
  children,
  badge,
}: AnalyticsModuleProps) {
  return (
    <Card className="card-elevated h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          {title}
          {badge && (
            <Badge variant="outline" className="ml-auto">
              {badge}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
















