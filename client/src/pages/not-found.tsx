import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Log when 404 page is shown for debugging
  console.warn("404 Page Displayed:", {
    path: location,
    timestamp: new Date().toISOString(),
    isAuthenticated,
    fullUrl: window.location.href
  });

  const handleGoHome = () => {
    setLocation(isAuthenticated ? "/dashboard" : "/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              404
            </h1>
            
            <p className="text-lg text-gray-700 mb-2">
              Page Not Found
            </p>
            
            <p className="text-sm text-gray-600 mb-6">
              The page you're looking for doesn't exist or you don't have permission to access it.
            </p>

            <div className="flex gap-3 w-full">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Button
                onClick={handleGoHome}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                {isAuthenticated ? "Dashboard" : "Home"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
