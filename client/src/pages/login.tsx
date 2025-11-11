import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Monitor,
  LogIn,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import PrimaryLogoDisplay from "@/components/primary-logo-display";
type LoginState = "idle" | "loading" | "success" | "error";
export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      setLoginState("loading");
      try {
        // Fix: URL first, method second
        const data = await apiRequest("/api/auth/login", "POST", credentials);
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async (data) => {
      setLoginState("success");
      // Use the login function from useAuth hook and wait for it to complete
      await login(data.user, data.token);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${
          data.user.firstName || data.user.username
        }!`,
      });
      // Navigate immediately - useEffect will handle the redirect
      // Small delay for success animation
      setTimeout(() => {
        setLocation("/dashboard");
      }, 300);
    },
    onError: (error: Error) => {
      setLoginState("error");
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      // Reset to idle after showing error animation
      setTimeout(() => {
        setLoginState("idle");
      }, 2000);
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Helper functions for dynamic styling
  const getCardClasses = () => {
    const baseClasses = "shadow-lg transition-all duration-500";
    switch (loginState) {
      case "loading":
        return `${baseClasses} login-card-loading animate-pulse-glow`;
      case "success":
        return `${baseClasses} login-card-success animate-bounce-in`;
      case "error":
        return `${baseClasses} login-card-error animate-shake`;
      default:
        return `${baseClasses} login-card-idle`;
    }
  };
  const getLogoClasses = () => {
    const baseClasses =
      "mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4";
    switch (loginState) {
      case "loading":
        return `${baseClasses} login-logo-loading bg-blue-600`;
      case "success":
        return `${baseClasses} login-logo-success`;
      case "error":
        return `${baseClasses} login-logo-error animate-pulse`;
      default:
        return `${baseClasses} login-logo-idle bg-blue-600`;
    }
  };
  const getInputClasses = (baseClasses: string) => {
    switch (loginState) {
      case "loading":
        return `${baseClasses} input-loading`;
      case "success":
        return `${baseClasses} input-success`;
      case "error":
        return `${baseClasses} input-error`;
      default:
        return baseClasses;
    }
  };
  const getButtonContent = () => {
    switch (loginState) {
      case "loading":
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Welcome! Redirecting...
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </>
        );
    }
  };
  const getButtonClasses = () => {
    const baseClasses = "w-full";
    switch (loginState) {
      case "loading":
        return `${baseClasses} login-button-loading`;
      case "success":
        return `${baseClasses} login-button-success`;
      case "error":
        return `${baseClasses} login-button-error`;
      default:
        return `${baseClasses} login-button-idle`;
    }
  };
  const getHeaderText = () => {
    switch (loginState) {
      case "loading":
        return "Authenticating...";
      case "success":
        return "Welcome Back!";
      case "error":
        return "Login Failed";
      default:
        return "SolNet Computer Services";
    }
  };
  const getSubheaderText = () => {
    switch (loginState) {
      case "loading":
        return "Verifying your credentials";
      case "success":
        return "Redirecting to dashboard";
      case "error":
        return "Please check your credentials";
      default:
        return "Sign in to access the management system";
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Animated Header */}
        <div className="text-center mb-8">
          <div className={getLogoClasses()}>
            <PrimaryLogoDisplay
              width={32}
              height={32}
              className="text-white"
              showFallback={true}
              fallbackText="SN"
            />
          </div>
          <h1
            className={`text-2xl font-bold transition-all duration-300 ${
              loginState === "success"
                ? "text-green-600 dark:text-green-400"
                : loginState === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {getHeaderText()}
          </h1>
          <p
            className={`mt-2 transition-all duration-300 ${
              loginState === "success"
                ? "text-green-600 dark:text-green-400"
                : loginState === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {getSubheaderText()}
          </p>
        </div>
        {/* Animated Login Form */}
        <Card className={`${getCardClasses()} card-elevated`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 transition-colors duration-300 text-slate-900 dark:text-slate-100">
              <Shield
                className={`h-5 w-5 ${
                  loginState === "success"
                    ? "text-green-600 dark:text-green-400"
                    : loginState === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  disabled={
                    loginState === "loading" || loginState === "success"
                  }
                  className={getInputClasses("")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    disabled={
                      loginState === "loading" || loginState === "success"
                    }
                    className={getInputClasses("pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={
                      loginState === "loading" || loginState === "success"
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className={getButtonClasses()}
                disabled={loginState === "loading" || loginState === "success"}
                variant={
                  loginState === "success"
                    ? "default"
                    : loginState === "error"
                    ? "destructive"
                    : "default"
                }
              >
                {getButtonContent()}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => setLocation("/")}
                disabled={loginState === "loading"}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                ← Back to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
