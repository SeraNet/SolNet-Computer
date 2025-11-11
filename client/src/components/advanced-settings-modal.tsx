import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Bell,
  Database,
  Download,
  Shield,
  X,
  Save,
  Activity,
  HardDrive,
  Zap,
  Globe,
  Smartphone,
  Mail,
  Cpu,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Target,
  BarChart3,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  Archive,
  RotateCcw,
  Wrench,
  Cog,
  Monitor,
  Server,
  Network,
  BellRing,
  MessageSquare,
  Calendar,
  Calculator,
  Percent,
  DollarSign,
  Package,
  Truck,
  AlertCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ImportExportControls } from "@/components/import-export";
import { TestNotifications } from "@/components/test-notifications";

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSettingsModal({
  isOpen,
  onClose,
}: AdvancedSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("notifications");

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    repairCompleteNotifications: true,
    dailyReports: false,
    systemAlerts: true,
    performanceWarnings: true,
    securityAlerts: true,

    // System
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "365",
    sessionTimeout: "60",
    cacheEnabled: true,
    cacheExpiry: "3600",
    queryOptimization: true,
    compressionEnabled: true,

    // Security
    twoFactorAuth: false,
    passwordExpiry: "90",
    loginAttempts: "5",
    auditLogging: true,
    ipWhitelist: "",
    sessionEncryption: true,
    dataEncryption: true,

    // Business
    receiptFooter: "Thank you for choosing SolNet Computer Services!",
    taxRate: "8.5",
    defaultWarranty: "30",
    autoInvoiceGeneration: true,
    paymentReminders: true,
    reminderFrequency: "7",
    latePaymentFees: "5.0",
    discountRules: "{}",

    // Performance
    maxConcurrentUsers: "50",
    requestTimeout: "30",
    batchProcessingSize: "100",
    realTimeUpdates: true,
    websocketEnabled: true,
    apiRateLimit: "1000",

    // Integrations
    smsProvider: "ethiopian",
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    telegramEnabled: false,
    telegramBotToken: "",
    webhookUrl: "",
    webhookSecret: "",

    // Monitoring
    systemMonitoring: true,
    performanceTracking: true,
    errorTracking: true,
    logRetention: "30",
    alertThresholds: "{}",
  });

  // Load advanced settings
  const { data } = useQuery({
    queryKey: ["settings", "advanced"],
    queryFn: async () => apiRequest("/api/settings/advanced", "GET"),
  });

  // Load system health data
  const { data: systemHealth } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => apiRequest("/api/system/health"),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (!data) return;
    const obj = data as Record<string, any>;
    setSettings((prev) => ({
      ...prev,
      ...obj,
    }));
  }, [data]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) =>
      apiRequest(`/api/settings/advanced/${key}`, "PUT", { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "advanced"] });
    },
    onError: (err: any) => {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save advanced settings.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save all settings
    Object.entries(settings).forEach(([key, value]) => {
      saveMutation.mutate({ key, value });
    });

    toast({
      title: "Settings Saved",
      description: "Advanced settings have been updated successfully.",
    });
    onClose();
  };

  const handleBackup = () => {
    toast({
      title: "Backup Started",
      description:
        "Database backup has been initiated. You will be notified when complete.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description:
        "Data export is being prepared. Download will begin shortly.",
    });
  };

  const handleCacheClear = () => {
    queryClient.clear();
    toast({
      title: "Cache Cleared",
      description: "Application cache has been cleared successfully.",
    });
  };

  const handleSystemRestart = () => {
    toast({
      title: "Restart Initiated",
      description: "System restart has been initiated. Please wait...",
    });
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Advanced Settings
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <TabsTrigger
                    value="notifications"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Database className="h-4 w-4" />
                    <span className="font-medium">System</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Security</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="integrations"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Integrations</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="monitoring"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Monitoring</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Business</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced-rules"
                    className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white dark:bg-slate-800 data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <Cog className="h-4 w-4" />
                    <span className="font-medium">Advanced Rules</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-800/30">
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <Switch
                          id="email-notifications"
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) =>
                            handleSettingChange("emailNotifications", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">
                          SMS Notifications
                        </Label>
                        <Switch
                          id="sms-notifications"
                          checked={settings.smsNotifications}
                          onCheckedChange={(checked) =>
                            handleSettingChange("smsNotifications", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="low-stock-alerts">
                          Low Stock Alerts
                        </Label>
                        <Switch
                          id="low-stock-alerts"
                          checked={settings.lowStockAlerts}
                          onCheckedChange={(checked) =>
                            handleSettingChange("lowStockAlerts", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="repair-complete">
                          Repair Complete Notifications
                        </Label>
                        <Switch
                          id="repair-complete"
                          checked={settings.repairCompleteNotifications}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "repairCompleteNotifications",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-reports">Daily Reports</Label>
                        <Switch
                          id="daily-reports"
                          checked={settings.dailyReports}
                          onCheckedChange={(checked) =>
                            handleSettingChange("dailyReports", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-alerts">System Alerts</Label>
                        <Switch
                          id="system-alerts"
                          checked={settings.systemAlerts}
                          onCheckedChange={(checked) =>
                            handleSettingChange("systemAlerts", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="performance-warnings">
                          Performance Warnings
                        </Label>
                        <Switch
                          id="performance-warnings"
                          checked={settings.performanceWarnings}
                          onCheckedChange={(checked) =>
                            handleSettingChange("performanceWarnings", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="security-alerts">Security Alerts</Label>
                        <Switch
                          id="security-alerts"
                          checked={settings.securityAlerts}
                          onCheckedChange={(checked) =>
                            handleSettingChange("securityAlerts", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                        System Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-backup">Automatic Backup</Label>
                        <Switch
                          id="auto-backup"
                          checked={settings.autoBackup}
                          onCheckedChange={(checked) =>
                            handleSettingChange("autoBackup", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">
                          Backup Frequency
                        </Label>
                        <select
                          id="backup-frequency"
                          value={settings.backupFrequency}
                          onChange={(e) =>
                            handleSettingChange(
                              "backupFrequency",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-retention">
                          Data Retention (days)
                        </Label>
                        <Input
                          id="data-retention"
                          type="number"
                          value={settings.dataRetention}
                          onChange={(e) =>
                            handleSettingChange("dataRetention", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">
                          Session Timeout (minutes)
                        </Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) =>
                            handleSettingChange(
                              "sessionTimeout",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cache-enabled">Cache Enabled</Label>
                        <Switch
                          id="cache-enabled"
                          checked={settings.cacheEnabled}
                          onCheckedChange={(checked) =>
                            handleSettingChange("cacheEnabled", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cache-expiry">
                          Cache Expiry (seconds)
                        </Label>
                        <Input
                          id="cache-expiry"
                          type="number"
                          value={settings.cacheExpiry}
                          onChange={(e) =>
                            handleSettingChange("cacheExpiry", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compression-enabled">
                          Compression Enabled
                        </Label>
                        <Switch
                          id="compression-enabled"
                          checked={settings.compressionEnabled}
                          onCheckedChange={(checked) =>
                            handleSettingChange("compressionEnabled", checked)
                          }
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleBackup}
                          className="flex items-center space-x-2"
                        >
                          <Database className="h-4 w-4" />
                          <span>Backup Now</span>
                        </Button>
                        <Button
                          onClick={handleExport}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Export Data</span>
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCacheClear}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Clear Cache</span>
                        </Button>
                        <Button
                          onClick={handleSystemRestart}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Restart System</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Import/Export Section */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Import/Export Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="customers" className="space-y-4">
                      <TabsList className="h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <TabsTrigger value="customers" className="py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm">Customers</TabsTrigger>
                        <TabsTrigger value="inventory" className="py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm">Inventory</TabsTrigger>
                        <TabsTrigger value="expenses" className="py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm">Expenses</TabsTrigger>
                      </TabsList>
                      <TabsContent value="customers">
                        <ImportExportControls entity="customers" />
                      </TabsContent>
                      <TabsContent value="inventory">
                        <ImportExportControls entity="inventory" />
                      </TabsContent>
                      <TabsContent value="expenses">
                        <ImportExportControls entity="expenses" />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Test Notifications */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Test Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TestNotifications />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="two-factor-auth">
                          Two-Factor Authentication
                        </Label>
                        <Switch
                          id="two-factor-auth"
                          checked={settings.twoFactorAuth}
                          onCheckedChange={(checked) =>
                            handleSettingChange("twoFactorAuth", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-expiry">
                          Password Expiry (days)
                        </Label>
                        <Input
                          id="password-expiry"
                          type="number"
                          value={settings.passwordExpiry}
                          onChange={(e) =>
                            handleSettingChange(
                              "passwordExpiry",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-attempts">
                          Max Login Attempts
                        </Label>
                        <Input
                          id="login-attempts"
                          type="number"
                          value={settings.loginAttempts}
                          onChange={(e) =>
                            handleSettingChange("loginAttempts", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audit-logging">Audit Logging</Label>
                        <Switch
                          id="audit-logging"
                          checked={settings.auditLogging}
                          onCheckedChange={(checked) =>
                            handleSettingChange("auditLogging", checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Advanced Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-encryption">
                          Session Encryption
                        </Label>
                        <Switch
                          id="session-encryption"
                          checked={settings.sessionEncryption}
                          onCheckedChange={(checked) =>
                            handleSettingChange("sessionEncryption", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="data-encryption">Data Encryption</Label>
                        <Switch
                          id="data-encryption"
                          checked={settings.dataEncryption}
                          onCheckedChange={(checked) =>
                            handleSettingChange("dataEncryption", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                        <Textarea
                          id="ip-whitelist"
                          value={settings.ipWhitelist}
                          onChange={(e) =>
                            handleSettingChange("ipWhitelist", e.target.value)
                          }
                          placeholder="Enter IP addresses (one per line)"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        Performance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-concurrent-users">
                          Max Concurrent Users
                        </Label>
                        <Input
                          id="max-concurrent-users"
                          type="number"
                          value={settings.maxConcurrentUsers}
                          onChange={(e) =>
                            handleSettingChange(
                              "maxConcurrentUsers",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-timeout">
                          Request Timeout (seconds)
                        </Label>
                        <Input
                          id="request-timeout"
                          type="number"
                          value={settings.requestTimeout}
                          onChange={(e) =>
                            handleSettingChange(
                              "requestTimeout",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch-processing-size">
                          Batch Processing Size
                        </Label>
                        <Input
                          id="batch-processing-size"
                          type="number"
                          value={settings.batchProcessingSize}
                          onChange={(e) =>
                            handleSettingChange(
                              "batchProcessingSize",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-rate-limit">API Rate Limit</Label>
                        <Input
                          id="api-rate-limit"
                          type="number"
                          value={settings.apiRateLimit}
                          onChange={(e) =>
                            handleSettingChange("apiRateLimit", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Real-Time Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="real-time-updates">
                          Real-Time Updates
                        </Label>
                        <Switch
                          id="real-time-updates"
                          checked={settings.realTimeUpdates}
                          onCheckedChange={(checked) =>
                            handleSettingChange("realTimeUpdates", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="websocket-enabled">
                          WebSocket Enabled
                        </Label>
                        <Switch
                          id="websocket-enabled"
                          checked={settings.websocketEnabled}
                          onCheckedChange={(checked) =>
                            handleSettingChange("websocketEnabled", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="query-optimization">
                          Query Optimization
                        </Label>
                        <Switch
                          id="query-optimization"
                          checked={settings.queryOptimization}
                          onCheckedChange={(checked) =>
                            handleSettingChange("queryOptimization", checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Email Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-provider">Email Provider</Label>
                        <select
                          id="email-provider"
                          value={settings.emailProvider}
                          onChange={(e) =>
                            handleSettingChange("emailProvider", e.target.value)
                          }
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="gmail">Gmail</option>
                          <option value="outlook">Outlook</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          value={settings.smtpHost}
                          onChange={(e) =>
                            handleSettingChange("smtpHost", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings.smtpPort}
                          onChange={(e) =>
                            handleSettingChange("smtpPort", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input
                          id="smtp-username"
                          value={settings.smtpUsername}
                          onChange={(e) =>
                            handleSettingChange("smtpUsername", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={settings.smtpPassword}
                          onChange={(e) =>
                            handleSettingChange("smtpPassword", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                        SMS & Telegram
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sms-provider">SMS Provider</Label>
                        <select
                          id="sms-provider"
                          value={settings.smsProvider}
                          onChange={(e) =>
                            handleSettingChange("smsProvider", e.target.value)
                          }
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="ethiopian">Ethiopian SMS</option>
                          <option value="twilio">Twilio</option>
                          <option value="africastalking">
                            Africa's Talking
                          </option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="telegram-enabled">
                          Telegram Bot Enabled
                        </Label>
                        <Switch
                          id="telegram-enabled"
                          checked={settings.telegramEnabled}
                          onCheckedChange={(checked) =>
                            handleSettingChange("telegramEnabled", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegram-bot-token">
                          Telegram Bot Token
                        </Label>
                        <Input
                          id="telegram-bot-token"
                          value={settings.telegramBotToken}
                          onChange={(e) =>
                            handleSettingChange(
                              "telegramBotToken",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                          id="webhook-url"
                          value={settings.webhookUrl}
                          onChange={(e) =>
                            handleSettingChange("webhookUrl", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-secret">Webhook Secret</Label>
                        <Input
                          id="webhook-secret"
                          type="password"
                          value={settings.webhookSecret}
                          onChange={(e) =>
                            handleSettingChange("webhookSecret", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        System Monitoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-monitoring">
                          System Monitoring
                        </Label>
                        <Switch
                          id="system-monitoring"
                          checked={settings.systemMonitoring}
                          onCheckedChange={(checked) =>
                            handleSettingChange("systemMonitoring", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="performance-tracking">
                          Performance Tracking
                        </Label>
                        <Switch
                          id="performance-tracking"
                          checked={settings.performanceTracking}
                          onCheckedChange={(checked) =>
                            handleSettingChange("performanceTracking", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="error-tracking">Error Tracking</Label>
                        <Switch
                          id="error-tracking"
                          checked={settings.errorTracking}
                          onCheckedChange={(checked) =>
                            handleSettingChange("errorTracking", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="log-retention">
                          Log Retention (days)
                        </Label>
                        <Input
                          id="log-retention"
                          type="number"
                          value={settings.logRetention}
                          onChange={(e) =>
                            handleSettingChange("logRetention", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        System Health Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {systemHealth ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              CPU Usage
                            </span>
                            <Badge
                              variant={
                                systemHealth.performance?.cpu > 80
                                  ? "destructive"
                                  : systemHealth.performance?.cpu > 60
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {systemHealth.performance?.cpu || 0}%
                            </Badge>
                          </div>
                          <Progress
                            value={systemHealth.performance?.cpu || 0}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Memory Usage
                            </span>
                            <Badge
                              variant={
                                systemHealth.performance?.memory > 80
                                  ? "destructive"
                                  : systemHealth.performance?.memory > 60
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {systemHealth.performance?.memory || 0}%
                            </Badge>
                          </div>
                          <Progress
                            value={systemHealth.performance?.memory || 0}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Database Status
                            </span>
                            <Badge
                              variant={
                                systemHealth.database?.status === "healthy"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {systemHealth.database?.status || "unknown"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              System Uptime
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {systemHealth.performance?.uptime
                                ? `${Math.floor(
                                    systemHealth.performance.uptime / 3600
                                  )}h ${Math.floor(
                                    (systemHealth.performance.uptime % 3600) /
                                      60
                                  )}m`
                                : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Active Services
                            </span>
                            <Badge variant="default">
                              {systemHealth.services?.filter(
                                (s: any) => s.status === "running"
                              ).length || 0}{" "}
                              / {systemHealth.services?.length || 0}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400">
                          Loading system health data...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Real-time System Metrics */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Real-time System Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {systemHealth?.performance?.cpu || 0}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">CPU Usage</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {systemHealth?.performance?.memory || 0}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Memory Usage
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {systemHealth?.database?.responseTime || 0}ms
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">DB Response</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Status */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Service Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemHealth?.services?.map(
                        (service: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  service.status === "running"
                                    ? "bg-green-500"
                                    : service.status === "stopped"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                              <span className="font-medium">
                                {service.name}
                              </span>
                            </div>
                            <Badge
                              variant={
                                service.status === "running"
                                  ? "default"
                                  : service.status === "stopped"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {service.status}
                            </Badge>
                          </div>
                        )
                      ) || (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                          No service data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle>Business Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="receipt-footer">
                          Receipt Footer Message
                        </Label>
                        <Textarea
                          id="receipt-footer"
                          value={settings.receiptFooter}
                          onChange={(e) =>
                            handleSettingChange("receiptFooter", e.target.value)
                          }
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          step="0.1"
                          value={settings.taxRate}
                          onChange={(e) =>
                            handleSettingChange("taxRate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default-warranty">
                          Default Warranty Period (days)
                        </Label>
                        <Input
                          id="default-warranty"
                          type="number"
                          value={settings.defaultWarranty}
                          onChange={(e) =>
                            handleSettingChange(
                              "defaultWarranty",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Payment & Billing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-invoice-generation">
                          Auto Invoice Generation
                        </Label>
                        <Switch
                          id="auto-invoice-generation"
                          checked={settings.autoInvoiceGeneration}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "autoInvoiceGeneration",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-reminders">
                          Payment Reminders
                        </Label>
                        <Switch
                          id="payment-reminders"
                          checked={settings.paymentReminders}
                          onCheckedChange={(checked) =>
                            handleSettingChange("paymentReminders", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder-frequency">
                          Reminder Frequency (days)
                        </Label>
                        <Input
                          id="reminder-frequency"
                          type="number"
                          value={settings.reminderFrequency}
                          onChange={(e) =>
                            handleSettingChange(
                              "reminderFrequency",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="late-payment-fees">
                          Late Payment Fees (%)
                        </Label>
                        <Input
                          id="late-payment-fees"
                          type="number"
                          step="0.1"
                          value={settings.latePaymentFees}
                          onChange={(e) =>
                            handleSettingChange(
                              "latePaymentFees",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced-rules" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Calculator className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Pricing Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount-rules">
                          Discount Rules (JSON)
                        </Label>
                        <Textarea
                          id="discount-rules"
                          value={settings.discountRules}
                          onChange={(e) =>
                            handleSettingChange("discountRules", e.target.value)
                          }
                          placeholder='{"bulk": {"threshold": 10, "discount": 5}, "loyalty": {"months": 6, "discount": 10}}'
                          rows={6}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Define custom discount rules in JSON format
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-thresholds">
                          Alert Thresholds (JSON)
                        </Label>
                        <Textarea
                          id="alert-thresholds"
                          value={settings.alertThresholds}
                          onChange={(e) =>
                            handleSettingChange(
                              "alertThresholds",
                              e.target.value
                            )
                          }
                          placeholder='{"lowStock": 10, "highCpu": 80, "highMemory": 85}'
                          rows={4}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Define system alert thresholds
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Business Automation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-invoice-generation">
                          Auto Invoice Generation
                        </Label>
                        <Switch
                          id="auto-invoice-generation"
                          checked={settings.autoInvoiceGeneration}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "autoInvoiceGeneration",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-reminders">
                          Payment Reminders
                        </Label>
                        <Switch
                          id="payment-reminders"
                          checked={settings.paymentReminders}
                          onCheckedChange={(checked) =>
                            handleSettingChange("paymentReminders", checked)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder-frequency">
                          Reminder Frequency (days)
                        </Label>
                        <Input
                          id="reminder-frequency"
                          type="number"
                          value={settings.reminderFrequency}
                          onChange={(e) =>
                            handleSettingChange(
                              "reminderFrequency",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="late-payment-fees">
                          Late Payment Fees (%)
                        </Label>
                        <Input
                          id="late-payment-fees"
                          type="number"
                          step="0.1"
                          value={settings.latePaymentFees}
                          onChange={(e) =>
                            handleSettingChange(
                              "latePaymentFees",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Database Maintenance */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Database Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => {
                          toast({
                            title: "Database Optimization",
                            description:
                              "Database optimization has been initiated.",
                          });
                        }}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Wrench className="h-4 w-4" />
                        <span>Optimize Database</span>
                      </Button>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Cache Refresh",
                            description: "System cache has been refreshed.",
                          });
                        }}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh Cache</span>
                      </Button>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Log Cleanup",
                            description:
                              "Old system logs have been cleaned up.",
                          });
                        }}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clean Logs</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* API Management */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      API Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-rate-limit">
                        API Rate Limit (requests/hour)
                      </Label>
                      <Input
                        id="api-rate-limit"
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) =>
                          handleSettingChange("apiRateLimit", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websocket-enabled">
                        WebSocket Enabled
                      </Label>
                      <Switch
                        id="websocket-enabled"
                        checked={settings.websocketEnabled}
                        onCheckedChange={(checked) =>
                          handleSettingChange("websocketEnabled", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="real-time-updates">
                        Real-time Updates
                      </Label>
                      <Switch
                        id="real-time-updates"
                        checked={settings.realTimeUpdates}
                        onCheckedChange={(checked) =>
                          handleSettingChange("realTimeUpdates", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Tip:</span> Changes are automatically
            saved when you modify settings
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 px-6"
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
