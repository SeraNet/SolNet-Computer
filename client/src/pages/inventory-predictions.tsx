import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Note: Tabs component not available in this UI library, using a simple state-based solution
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Package, 
  RefreshCw,
  Calendar,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPredictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predictions' | 'alerts'>('predictions');

  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/inventory/predictions"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/inventory/alerts"],
  });

  const updatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/inventory/update-predictions", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to update predictions");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Updated",
        description: "Inventory predictions have been recalculated based on recent sales data.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/predictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'low_stock': return <Package className="h-4 w-4" />;
      case 'predicted_stockout': return <Clock className="h-4 w-4" />;
      case 'reorder_required': return <ShoppingCart className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const criticalPredictions = predictions.filter((p: any) => p.riskLevel === 'critical');
  const highRiskPredictions = predictions.filter((p: any) => p.riskLevel === 'high');
  const criticalAlerts = alerts.filter((a: any) => a.priority === 'critical');
  const highPriorityAlerts = alerts.filter((a: any) => a.priority === 'high');

  if (predictionsLoading || alertsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Inventory Predictions</h1>
          <p className="text-gray-600 mt-1">AI-powered inventory forecasting and stock alerts</p>
        </div>
        <Button 
          onClick={() => updatePredictionsMutation.mutate()}
          disabled={updatePredictionsMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${updatePredictionsMutation.isPending ? 'animate-spin' : ''}`} />
          Update Predictions
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{criticalPredictions.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{highRiskPredictions.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Stock running low</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{alerts.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Notifications pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Items Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{predictions.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total inventory items</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'predictions' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Predictions
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'alerts' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {alerts.length}
              </Badge>
            )}
          </button>
        </div>

        {activeTab === 'predictions' && (
          <div className="space-y-4">
          {criticalAlerts.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical Alert:</strong> {criticalAlerts.length} items require immediate attention
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Inventory Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction: any) => (
                  <div
                    key={prediction.itemId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{prediction.itemName}</h4>
                          <p className="text-sm text-gray-500">SKU: {prediction.sku}</p>
                        </div>
                        <Badge variant={getRiskBadgeColor(prediction.riskLevel) as any}>
                          {prediction.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Current Stock:</span>
                          <div className="font-medium">{prediction.currentStock}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Days Until Stockout:</span>
                          <div className="font-medium">
                            {prediction.daysUntilStockout > 0 ? prediction.daysUntilStockout : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Daily Sales:</span>
                          <div className="font-medium">{prediction.avgDailySales.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Suggested Reorder:</span>
                          <div className="font-medium">{prediction.suggestedReorderQuantity}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {predictions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No inventory predictions available</p>
                    <p className="text-sm">Click "Update Predictions" to generate forecasts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAlert === alert.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAlert(alert.id === selectedAlert ? null : alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{alert.itemName}</h4>
                            <Badge variant={getPriorityBadgeColor(alert.priority) as any}>
                              {alert.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(alert.createdAt)} • {alert.alertType.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline" className="ml-3">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No active alerts</p>
                    <p className="text-sm">All inventory levels are within normal ranges</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}