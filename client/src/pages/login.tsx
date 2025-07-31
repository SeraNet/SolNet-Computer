import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Monitor, LogIn, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type LoginState = 'idle' | 'loading' | 'success' | 'error';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      setLoginState('loading');
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setLoginState('success');
      
      // Store user data in localStorage or context
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName || data.user.username}!`,
      });

      // Delay navigation to show success animation
      setTimeout(() => {
        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            setLocation("/dashboard");
            break;
          case "technician":
            setLocation("/repair-tracking");
            break;
          case "sales":
            setLocation("/point-of-sale");
            break;
          default:
            setLocation("/dashboard");
        }
      }, 1200);
    },
    onError: (error: Error) => {
      setLoginState('error');
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });

      // Reset to idle after showing error animation
      setTimeout(() => {
        setLoginState('idle');
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Helper functions for dynamic styling
  const getCardClasses = () => {
    const baseClasses = "shadow-lg transition-all duration-500";
    switch (loginState) {
      case 'loading':
        return `${baseClasses} login-card-loading animate-pulse-glow`;
      case 'success': 
        return `${baseClasses} login-card-success animate-bounce-in`;
      case 'error':
        return `${baseClasses} login-card-error animate-shake`;
      default:
        return `${baseClasses} login-card-idle`;
    }
  };

  const getLogoClasses = () => {
    const baseClasses = "mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4";
    switch (loginState) {
      case 'loading':
        return `${baseClasses} login-logo-loading bg-blue-600`;
      case 'success':
        return `${baseClasses} login-logo-success`;
      case 'error':
        return `${baseClasses} login-logo-error animate-pulse`;
      default:
        return `${baseClasses} login-logo-idle bg-blue-600`;
    }
  };

  const getInputClasses = (baseClasses: string) => {
    switch (loginState) {
      case 'loading':
        return `${baseClasses} input-loading`;
      case 'success':
        return `${baseClasses} input-success`;
      case 'error':
        return `${baseClasses} input-error`;
      default:
        return baseClasses;
    }
  };

  const getButtonContent = () => {
    switch (loginState) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Welcome! Redirecting...
          </>
        );
      case 'error':
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
      case 'loading':
        return `${baseClasses} login-button-loading`;
      case 'success':
        return `${baseClasses} login-button-success`;
      case 'error':
        return `${baseClasses} login-button-error`;
      default:
        return `${baseClasses} login-button-idle`;
    }
  };

  const getHeaderText = () => {
    switch (loginState) {
      case 'loading':
        return "Authenticating...";
      case 'success':
        return "Welcome Back!";
      case 'error':
        return "Login Failed";
      default:
        return "Employee Login";
    }
  };

  const getSubheaderText = () => {
    switch (loginState) {
      case 'loading':
        return "Verifying your credentials";
      case 'success':
        return "Redirecting to dashboard";
      case 'error':
        return "Please check your credentials";
      default:
        return "Sign in to access the management system";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Animated Header */}
        <div className="text-center mb-8">
          <div className={getLogoClasses()}>
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold transition-all duration-300 ${
            loginState === 'success' ? 'text-green-600' :
            loginState === 'error' ? 'text-red-600' : 
            'text-gray-900'
          }`}>
            {getHeaderText()}
          </h1>
          <p className={`mt-2 transition-all duration-300 ${
            loginState === 'success' ? 'text-green-600' :
            loginState === 'error' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {getSubheaderText()}
          </p>
        </div>

        {/* Animated Login Form */}
        <Card className={getCardClasses()}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 transition-colors duration-300">
              <Shield className={`h-5 w-5 ${
                loginState === 'success' ? 'text-green-600' :
                loginState === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`} />
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
                  disabled={loginState === 'loading' || loginState === 'success'}
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
                    disabled={loginState === 'loading' || loginState === 'success'}
                    className={getInputClasses("pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginState === 'loading' || loginState === 'success'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                disabled={loginState === 'loading' || loginState === 'success'}
                variant={loginState === 'success' ? 'default' : loginState === 'error' ? 'destructive' : 'default'}
              >
                {getButtonContent()}
              </Button>
            </form>

            {/* Demo Credentials Section */}
            <div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${
              loginState === 'success' ? 'bg-green-50 border border-green-200' :
              loginState === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50'
            }`}>
              <p className="text-sm text-gray-600 mb-2 font-medium">Demo Credentials:</p>
              <div className="text-xs space-y-1">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>Technician:</strong> tech / tech123</div>
                <div><strong>Sales:</strong> sales / sales123</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setLocation("/")}
                disabled={loginState === 'loading'}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
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