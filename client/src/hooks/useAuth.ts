import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "technician" | "sales";
  locationId?: string;
  isActive: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  // Verify token with server (optional, for enhanced security)
  const { data: verifiedUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user if server verification returns different data
  useEffect(() => {
    if (verifiedUser && typeof verifiedUser === 'object' && 'id' in verifiedUser && verifiedUser.id !== user?.id) {
      setUser(verifiedUser as User);
      localStorage.setItem("user", JSON.stringify(verifiedUser));
    }
  }, [verifiedUser, user]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const hasRole = (requiredRoles: string | string[]) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;

    // Define role-based permissions
    const permissions = {
      admin: [
        "view_dashboard", "manage_users", "manage_locations", "view_analytics",
        "manage_inventory", "manage_expenses", "manage_settings", "view_reports",
        "manage_devices", "manage_customers", "manage_appointments", "manage_sales"
      ],
      technician: [
        "view_dashboard", "manage_devices", "view_customers", "manage_appointments",
        "view_inventory", "update_repairs"
      ],
      sales: [
        "view_dashboard", "manage_sales", "view_customers", "manage_appointments",
        "view_inventory", "create_invoices"
      ]
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}