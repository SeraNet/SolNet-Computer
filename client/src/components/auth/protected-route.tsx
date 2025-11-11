import { ReactNode, useRef } from "react";
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
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const hasCheckedRef = useRef(false);
  const lastLocationRef = useRef(location);

  useEffect(() => {
    // Reset check flag when location changes
    if (lastLocationRef.current !== location) {
      hasCheckedRef.current = false;
      lastLocationRef.current = location;
    }

    // Don't run checks while loading or if already checked
    if (isLoading || hasCheckedRef.current) return;

    // Mark as checked to prevent repeated checks
    hasCheckedRef.current = true;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      setLocation(fallbackPath);
      return;
    }

    // Admin users have access to all pages - bypass role and permission checks
    if (user?.role === 'admin') {
      return; // Allow access for admin users
    }

    // Check role permissions for non-admin users
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }

    // Check specific permissions for non-admin users
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
  }, [isLoading, isAuthenticated, user?.role, location, requiredRoles, requiredPermissions, setLocation, toast, fallbackPath, hasRole, hasPermission]);

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