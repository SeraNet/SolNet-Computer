import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "technician" | "sales";
  locationId?: string;
  profilePicture?: string;
  isActive: boolean;
}
// Initialize user state synchronously from localStorage to prevent flash
const getInitialUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
  return null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);

  // Mark as initialized immediately since we're loading synchronously
  useEffect(() => {
    // Auth initialized
  }, []);
  // Verify token with server (only if we have a token and user)
  const { data: verifiedUser, error: verifyError } = useQuery({
    queryKey: ["auth", "verify"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Token verification failed");
        }
        return response.json();
      } catch (error) {
        console.error("Token verification error:", error);
        throw error;
      }
    },
    enabled: !!localStorage.getItem("token") && !!user && !isLoading,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 0, // Don't cache this query
  });
  // Update user if server verification returns different data
  useEffect(() => {
    if (
      verifiedUser &&
      typeof verifiedUser === "object" &&
      "id" in verifiedUser
    ) {
      try {
        setUser(verifiedUser as User);
        localStorage.setItem("user", JSON.stringify(verifiedUser));
      } catch (error) {
        console.error("Error updating user from verification:", error);
      }
    }
  }, [verifiedUser]);
  // Handle verification errors gracefully - don't logout immediately
  useEffect(() => {
    if (verifyError && user) {
      console.warn(
        "Token verification failed, but keeping user logged in:",
        verifyError
      );
      // Only logout if the error is specifically about invalid token
      if (
        verifyError.message.includes("Invalid token") ||
        verifyError.message.includes("401") ||
        verifyError.message.includes("Token verification failed")
      ) {
        // Logout immediately instead of using setTimeout
        logout();
      }
    }
  }, [verifyError, user]);
  const login = (userData: User, token: string) => {
    try {
      // Update state and storage synchronously
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);
      
      // Force a small delay to ensure state updates propagate
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    } catch (error) {
      console.error("Error during login:", error);
      // Clear any partial state
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      throw error;
    }
  };
  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Navigate immediately instead of using setTimeout
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback: force reload
      window.location.reload();
    }
  };
  const hasRole = useCallback((requiredRoles: string | string[]) => {
    if (!user) return false;
    // Admin has access to all roles
    if (user.role === "admin") {
      return true;
    }
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    return roles.includes(user.role);
  }, [user]);
  
  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    // Admin has all permissions
    if (user.role === "admin") {
      return true;
    }
    // Define role-based permissions for non-admin users
    const permissions = {
      technician: [
        "view_dashboard",
        "manage_devices",
        "view_customers",
        "manage_appointments",
        "view_inventory",
        "update_repairs",
      ],
      sales: [
        "view_dashboard",
        "manage_sales",
        "view_customers",
        "manage_appointments",
        "view_inventory",
        "create_invoices",
      ],
    };
    return permissions[user.role]?.includes(permission) || false;
  }, [user]);
  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    isInitialized,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}
