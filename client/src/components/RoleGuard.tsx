import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
}: RoleGuardProps) {
  const { user, hasRole, hasPermission } = useAuth();

  // Check roles
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You don't have permission to access this page. Required role(s):{" "}
                {requiredRoles.join(", ")}
              </p>
              {user && (
                <p className="text-sm text-gray-500 mt-2">
                  Your role: {user.role}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check permissions
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Access Denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You don't have the required permissions to access this page.
                </p>
                {user && (
                  <p className="text-sm text-gray-500 mt-2">
                    Your role: {user.role} | Required permissions:{" "}
                    {requiredPermissions.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}
