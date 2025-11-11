import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Monitor,
  Package,
  Users,
  Calendar,
  Shield,
  BarChart3,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface NotificationPreference {
  preference: {
    id: string;
    userId: string;
    typeId: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
  };
  type: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const categoryIcons: Record<string, any> = {
  device: Monitor,
  inventory: Package,
  customer: Users,
  appointment: Calendar,
  sales: BarChart3,
  system: Shield,
  report: BarChart3,
};

const categoryColors: Record<string, string> = {
  device: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  inventory: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
  customer: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300",
  appointment: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
  sales: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  system: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300",
  report: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300",
};

export default function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // Fetch notification preferences
  const {
    data: preferences = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      try {
        const result = await apiRequest(
          "/api/notifications/preferences",
          "GET"
        );
        return result;
      } catch (error) {
        console.error("🔔 Notification preferences API error:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Fetch notification types for reference
  const { data: notificationTypes = [] } = useQuery({
    queryKey: ["notifications", "types"],
    queryFn: async () => {
      try {
        const result = await apiRequest("/api/notifications/types", "GET");
        return result;
      } catch (error) {
        console.error("🔔 Notification types API error:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Default notification types if none exist in database
  const defaultNotificationTypes = [
    {
      id: "system_alert",
      name: "system_alert",
      description: "System-wide notifications and alerts",
      category: "system",
    },
    {
      id: "customer_feedback",
      name: "customer_feedback",
      description: "New customer feedback received",
      category: "customer",
    },
    {
      id: "customer_message",
      name: "customer_message",
      description: "New customer message received",
      category: "customer",
    },
    {
      id: "device_registered",
      name: "device_registered",
      description: "Device registration notification",
      category: "device",
    },
    {
      id: "device_status_change",
      name: "device_status_change",
      description: "Device status change notification",
      category: "device",
    },
    {
      id: "device_tracked",
      name: "device_tracked",
      description: "Device tracking activity notification",
      category: "device",
    },
    {
      id: "device_feedback",
      name: "device_feedback",
      description: "Device feedback received",
      category: "device",
    },
    {
      id: "payment_status_update",
      name: "payment_status_update",
      description: "Payment status change notification",
      category: "sales",
    },
    {
      id: "low_stock_alert",
      name: "low_stock_alert",
      description: "Low stock inventory alert",
      category: "inventory",
    },
    {
      id: "maintenance_reminder",
      name: "maintenance_reminder",
      description: "System maintenance reminders",
      category: "system",
    },
  ];

  // Use default types if no types are returned from API
  const effectiveNotificationTypes =
    notificationTypes.length > 0 ? notificationTypes : defaultNotificationTypes;

  // Create default preferences if none exist
  const effectivePreferences =
    preferences.length > 0
      ? preferences
      : effectiveNotificationTypes.map((type: any) => ({
          preference: {
            id: `default-${type.id}`,
            userId: user?.id || "",
            typeId: type.id,
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: false,
            inAppEnabled: true,
          },
          type: type,
        }));

  // Update preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: ({
      typeId,
      preferences,
    }: {
      typeId: string;
      preferences: any;
    }) =>
      apiRequest(
        `/api/notifications/preferences/${typeId}`,
        "PUT",
        preferences
      ),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "preferences"],
      });
      setSavingStates((prev) => ({ ...prev, [variables.typeId]: false }));
      toast({
        title: "Preferences Updated",
        description:
          "Your notification preferences have been saved successfully.",
      });
    },
    onError: (error, variables) => {
      console.error("🔔 Update failed:", { error, variables });
      setSavingStates((prev) => ({ ...prev, [variables.typeId]: false }));
      toast({
        title: "Update Failed",
        description:
          "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Array<{ typeId: string; preferences: any }>) =>
      Promise.all(
        updates.map(({ typeId, preferences }) =>
          apiRequest(
            `/api/notifications/preferences/${typeId}`,
            "PUT",
            preferences
          )
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "preferences"],
      });
      toast({
        title: "Bulk Update Complete",
        description:
          "All notification preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Bulk Update Failed",
        description: "Failed to update some preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (
    typeId: string,
    field: string,
    value: boolean
  ) => {
    setSavingStates((prev) => ({ ...prev, [typeId]: true }));

    const preference = effectivePreferences.find(
      (p: NotificationPreference) => p.preference.typeId === typeId
    );
    if (preference) {
      const updateData = {
        typeId,
        preferences: {
          ...preference.preference,
          [field]: value,
        },
      };
      updatePreferenceMutation.mutate(updateData);
    }
  };

  const handleBulkUpdate = (field: string, value: boolean) => {
    const updates = preferences.map((pref: NotificationPreference) => ({
      typeId: pref.preference.typeId,
      preferences: {
        ...pref.preference,
        [field]: value,
      },
    }));

    bulkUpdateMutation.mutate(updates);
  };

  const getCategoryPreferences = (category: string) => {
    return effectivePreferences.filter(
      (pref: NotificationPreference) => pref.type.category === category
    );
  };

  const getCategoryStats = (category: string) => {
    const categoryPrefs = getCategoryPreferences(category);
    const total = categoryPrefs.length;
    const emailEnabled = categoryPrefs.filter(
      (p: NotificationPreference) => p.preference.emailEnabled
    ).length;
    const smsEnabled = categoryPrefs.filter(
      (p: NotificationPreference) => p.preference.smsEnabled
    ).length;
    const inAppEnabled = categoryPrefs.filter(
      (p: NotificationPreference) => p.preference.inAppEnabled
    ).length;

    return { total, emailEnabled, smsEnabled, inAppEnabled };
  };

  const categories = Array.from(
    new Set(
      effectivePreferences.map((p: NotificationPreference) => p.type.category)
    )
  ) as string[];

  const stats = useMemo(() => {
    const totalPreferences = effectivePreferences.length;
    const emailEnabled = effectivePreferences.filter((p: any) => p.preference.emailEnabled).length;
    const smsEnabled = effectivePreferences.filter((p: any) => p.preference.smsEnabled).length;
    const inAppEnabled = effectivePreferences.filter((p: any) => p.preference.inAppEnabled).length;
    
    return {
      totalPreferences,
      emailEnabled,
      smsEnabled,
      inAppEnabled,
    };
  }, [effectivePreferences]);

  if (isLoading) {
    return (
      <PageLayout
        title="Notification Preferences"
        subtitle="Manage your notification settings"
        icon={Bell}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="card-elevated animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Notification Preferences"
        subtitle="Manage your notification settings"
        icon={Bell}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load notification preferences. Please refresh the page and
            try again.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Notification Preferences"
      subtitle="Customize how you receive notifications for different events"
      icon={Bell}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["notifications", "preferences"],
            })
          }
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      }
    >
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Notifications</p>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalPreferences}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Notification types
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Enabled</p>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.emailEnabled}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Email notifications
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">SMS Enabled</p>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.smsEnabled}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              SMS notifications
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In-App Enabled</p>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.inAppEnabled}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              In-app notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {preferences.length === 0 && (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-slate-900 dark:text-slate-100">
            Using default notification preferences. These will be saved to
            the database when you make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Quickly enable or disable notification channels for all types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Email All</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate("emailEnabled", true)}
                disabled={bulkUpdateMutation.isPending}
              >
                Enable All
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">SMS All</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate("smsEnabled", true)}
                disabled={bulkUpdateMutation.isPending}
              >
                Enable All
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">In-App All</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate("inAppEnabled", true)}
                disabled={bulkUpdateMutation.isPending}
              >
                Enable All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types Tabs */}
      <Card className="card-elevated">
        <CardContent className="p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {effectivePreferences.map((pref: NotificationPreference) => (
              <NotificationPreferenceCard
                key={pref.preference.id}
                preference={pref}
                onPreferenceChange={handlePreferenceChange}
                isSaving={savingStates[pref.preference.typeId] || false}
              />
            ))}
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {categoryIcons[category] &&
                  React.createElement(categoryIcons[category], {
                    className: "h-5 w-5 text-slate-700 dark:text-slate-300",
                  })}
                <h3 className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
                  {category} Notifications
                </h3>
                <Badge variant="outline" className={categoryColors[category]}>
                  {getCategoryStats(category).total} types
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCategoryPreferences(category).map(
                (pref: NotificationPreference) => (
                  <NotificationPreferenceCard
                    key={pref.preference.id}
                    preference={pref}
                    onPreferenceChange={handlePreferenceChange}
                    isSaving={savingStates[pref.preference.typeId] || false}
                  />
                )
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

interface NotificationPreferenceCardProps {
  preference: NotificationPreference;
  onPreferenceChange: (typeId: string, field: string, value: boolean) => void;
  isSaving: boolean;
}

function NotificationPreferenceCard({
  preference,
  onPreferenceChange,
  isSaving,
}: NotificationPreferenceCardProps) {
  const { type, preference: pref } = preference;
  const Icon = categoryIcons[type.category] || Bell;

  return (
    <Card
      className={`card-elevated transition-all duration-200 ${
        isSaving ? "ring-2 ring-blue-500 dark:ring-blue-600" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {type.name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${categoryColors[type.category]}`}
          >
            {type.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
          <Label
            htmlFor={`email-${pref.id}`}
            className="text-sm flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <div className="p-1.5 bg-blue-500 dark:bg-blue-600 rounded">
              <Mail className="h-3.5 w-3.5 text-white" />
            </div>
            Email
          </Label>
          <Switch
            id={`email-${pref.id}`}
            checked={pref.emailEnabled}
            onCheckedChange={(checked) =>
              onPreferenceChange(pref.typeId, "emailEnabled", checked)
            }
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
          <Label
            htmlFor={`sms-${pref.id}`}
            className="text-sm flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <div className="p-1.5 bg-green-500 dark:bg-green-600 rounded">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            SMS
          </Label>
          <Switch
            id={`sms-${pref.id}`}
            checked={pref.smsEnabled}
            onCheckedChange={(checked) =>
              onPreferenceChange(pref.typeId, "smsEnabled", checked)
            }
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
          <Label
            htmlFor={`in-app-${pref.id}`}
            className="text-sm flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <div className="p-1.5 bg-purple-500 dark:bg-purple-600 rounded">
              <Bell className="h-3.5 w-3.5 text-white" />
            </div>
            In-App
          </Label>
          <Switch
            id={`in-app-${pref.id}`}
            checked={pref.inAppEnabled}
            onCheckedChange={(checked) =>
              onPreferenceChange(pref.typeId, "inAppEnabled", checked)
            }
            disabled={isSaving}
          />
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 dark:border-blue-400"></div>
            Saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
