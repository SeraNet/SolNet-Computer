import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { EthiopianSMSSettings } from "@/components/ethiopian-sms-settings";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

type EmailNotifications = {
  newCustomers: boolean;
  lowInventory: boolean;
  dailyReports: boolean;
  salesAlerts: boolean;
};

type SmsNotifications = {
  orderConfirmations: boolean;
  appointmentReminders: boolean;
  urgentAlerts: boolean;
};

type NotificationSettingsState = {
  emailNotifications: EmailNotifications;
  smsNotifications: SmsNotifications;
  emailAddress: string;
  phoneNumber: string;
  dailyReportTime: string;
  lowInventoryThreshold: string;
};

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettingsState>({
    emailNotifications: {
      newCustomers: true,
      lowInventory: true,
      dailyReports: false,
      salesAlerts: true,
    },
    smsNotifications: {
      orderConfirmations: true,
      appointmentReminders: true,
      urgentAlerts: false,
    },
    emailAddress: "admin@solnetcomputer.com",
    phoneNumber: "+251913341664",
    dailyReportTime: "18:00",
    lowInventoryThreshold: "5",
  });

  // Load persisted notification settings (category: "notifications")
  const { data: notificationSettings } = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: async () => apiRequest("/api/settings/notifications", "GET"),
  });

  useEffect(() => {
    if (!notificationSettings) return;
    const raw = notificationSettings as any;
    const getValue = (key: string) => {
      if (Array.isArray(raw)) {
        const found = raw.find((s: any) => s?.key === key);
        return found?.value;
      }
      if (typeof raw === "object" && raw !== null) {
        return raw[key];
      }
      return undefined;
    };
    const email = getValue("emailAddress");
    if (typeof email === "string" && email.length > 0) {
      setSettings((prev) => ({ ...prev, emailAddress: email }));
    }
    const reportTime = getValue("dailyReportTime");
    if (typeof reportTime === "string" && reportTime.length > 0) {
      setSettings((prev) => ({ ...prev, dailyReportTime: reportTime }));
    }
    const phone = getValue("phoneNumber");
    if (typeof phone === "string" && phone.length > 0) {
      setSettings((prev) => ({ ...prev, phoneNumber: phone }));
    }
  }, [notificationSettings]);

  // Persist individual keys under notifications category
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) =>
      apiRequest(`/api/settings/notifications/${key}`, "PUT", {
        value,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "notifications"],
      });
    },
    onError: (err: any) => {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save notification settings.",
        variant: "destructive",
      });
    },
  });

  function handleToggle(
    category: "emailNotifications",
    setting: keyof EmailNotifications
  ): void;
  function handleToggle(
    category: "smsNotifications",
    setting: keyof SmsNotifications
  ): void;
  function handleToggle(
    category: "emailNotifications" | "smsNotifications",
    setting: string
  ) {
    setSettings((prev) => {
      if (category === "emailNotifications") {
        const current = prev.emailNotifications;
        const key = setting as keyof EmailNotifications;
        return {
          ...prev,
          emailNotifications: {
            ...current,
            [key]: !current[key],
          },
        };
      } else {
        const current = prev.smsNotifications;
        const key = setting as keyof SmsNotifications;
        return {
          ...prev,
          smsNotifications: {
            ...current,
            [key]: !current[key],
          },
        };
      }
    });
  }

  const handleSave = () => {
    // Persist key notification settings
    saveSettingMutation.mutate({
      key: "emailAddress",
      value: settings.emailAddress,
    });
    saveSettingMutation.mutate({
      key: "dailyReportTime",
      value: settings.dailyReportTime,
    });
    saveSettingMutation.mutate({
      key: "phoneNumber",
      value: settings.phoneNumber,
    });
    toast({
      title: "Settings Saved",
      description:
        "Your notification preferences have been updated successfully.",
    });
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your email address.",
    });
  };

  const handleTestSMS = () => {
    toast({
      title: "Test SMS Sent",
      description: "A test SMS has been sent to your phone number.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Notification Preferences</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configure how your business communicates with customers and team members
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Channels</div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <span className="inline-flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <MessageSquare className="h-4 w-4" /> SMS
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Daily Report Time
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {settings.dailyReportTime || "18:00"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Low Inventory Threshold
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {settings.lowInventoryThreshold}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Email Notifications */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Configure email notifications for important business events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleTestEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Test Email
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="flex items-center gap-2"
              disabled={saveSettingMutation.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {saveSettingMutation.isPending
                ? "Saving..."
                : "Save Email Preferences"}
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  New Customer Registration
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when new customers register
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications.newCustomers}
                onCheckedChange={() =>
                  handleToggle("emailNotifications", "newCustomers")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Low Inventory Alerts
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive alerts when items are running low
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications.lowInventory}
                onCheckedChange={() =>
                  handleToggle("emailNotifications", "lowInventory")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Daily Sales Reports
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get daily summary of sales activities
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications.dailyReports}
                onCheckedChange={() =>
                  handleToggle("emailNotifications", "dailyReports")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Sales Alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified of significant sales events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications.salesAlerts}
                onCheckedChange={() =>
                  handleToggle("emailNotifications", "salesAlerts")
                }
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      emailAddress: e.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportTime">Daily Report Time</Label>
                <Input
                  id="reportTime"
                  type="time"
                  value={settings.dailyReportTime}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      dailyReportTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            SMS Notifications
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Configure SMS notifications for customer communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleTestSMS}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Test SMS
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="flex items-center gap-2"
              disabled={saveSettingMutation.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {saveSettingMutation.isPending
                ? "Saving..."
                : "Save SMS Preferences"}
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Order Confirmations
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Send SMS confirmations to customers
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications.orderConfirmations}
                onCheckedChange={() =>
                  handleToggle("smsNotifications", "orderConfirmations")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Appointment Reminders
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Remind customers of upcoming appointments
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications.appointmentReminders}
                onCheckedChange={() =>
                  handleToggle("smsNotifications", "appointmentReminders")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Urgent Alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive urgent system alerts via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications.urgentAlerts}
                onCheckedChange={() =>
                  handleToggle("smsNotifications", "urgentAlerts")
                }
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="+251913341664"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Inventory Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={settings.lowInventoryThreshold}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      lowInventoryThreshold: e.target.value,
                    }))
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ethiopian SMS Configuration */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Ethiopian SMS Configuration
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Set up provider credentials and test SMS for Ethiopian gateways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EthiopianSMSSettings />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="px-6"
          disabled={saveSettingMutation.isPending}
        >
          {saveSettingMutation.isPending
            ? "Saving..."
            : "Save Notification Settings"}
        </Button>
      </div>
    </div>
  );
}
