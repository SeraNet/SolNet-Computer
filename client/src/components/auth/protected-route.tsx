import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  requiredPermissions?: string | string[];
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = "/login" 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      setLocation(fallbackPath);
      return;
    }

    // Check role permissions
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }

    // Check specific permissions
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    if (permissions.length > 0 && !permissions.every(permission => hasPermission(permission))) {
      toast({
        title: "Access Denied", 
        description: "You don't have the required permissions for this page.",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }
  }, [isLoading, isAuthenticated, user, hasRole, hasPermission, requiredRoles, requiredPermissions, setLocation, toast, fallbackPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}