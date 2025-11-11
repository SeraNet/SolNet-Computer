import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailSettingsState {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
}

export function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<EmailSettingsState>({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
    smtpSecure: false,
  });

  const { data } = useQuery({
    queryKey: ["settings", "email"],
    queryFn: async () => apiRequest("/api/settings/email", "GET"),
  });

  useEffect(() => {
    if (!data) return;
    const obj = data as Record<string, any>;
    setSettings((prev) => ({
      ...prev,
      smtpHost: String(obj.smtpHost ?? prev.smtpHost),
      smtpPort: String(obj.smtpPort ?? prev.smtpPort),
      smtpUser: String(obj.smtpUser ?? prev.smtpUser),
      smtpPass: String(obj.smtpPass ?? prev.smtpPass),
      smtpFrom: String(obj.smtpFrom ?? prev.smtpFrom),
      smtpSecure:
        typeof obj.smtpSecure === "boolean" ? obj.smtpSecure : prev.smtpSecure,
    }));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) =>
      apiRequest(`/api/settings/email/${key}`, "PUT", { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "email"] });
    },
    onError: (err: any) => {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save email settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveAll = () => {
    saveMutation.mutate({ key: "smtpHost", value: settings.smtpHost });
    saveMutation.mutate({ key: "smtpPort", value: settings.smtpPort });
    saveMutation.mutate({ key: "smtpUser", value: settings.smtpUser });
    saveMutation.mutate({ key: "smtpPass", value: settings.smtpPass });
    saveMutation.mutate({ key: "smtpFrom", value: settings.smtpFrom });
    saveMutation.mutate({ key: "smtpSecure", value: settings.smtpSecure });
    toast({ title: "Saved", description: "Email settings updated." });
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-100">Email Server (SMTP)</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Configure SMTP to enable outgoing emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={settings.smtpHost}
              onChange={(e) =>
                setSettings((p) => ({ ...p, smtpHost: e.target.value }))
              }
              placeholder="smtp.mailtrap.io"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">Port</Label>
            <Input
              id="smtpPort"
              value={settings.smtpPort}
              onChange={(e) =>
                setSettings((p) => ({ ...p, smtpPort: e.target.value }))
              }
              placeholder="587"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpUser">Username</Label>
            <Input
              id="smtpUser"
              value={settings.smtpUser}
              onChange={(e) =>
                setSettings((p) => ({ ...p, smtpUser: e.target.value }))
              }
              placeholder="user"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">Password</Label>
            <Input
              id="smtpPass"
              type="password"
              value={settings.smtpPass}
              onChange={(e) =>
                setSettings((p) => ({ ...p, smtpPass: e.target.value }))
              }
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpFrom">From Address</Label>
            <Input
              id="smtpFrom"
              value={settings.smtpFrom}
              onChange={(e) =>
                setSettings((p) => ({ ...p, smtpFrom: e.target.value }))
              }
              placeholder="no-reply@example.com"
            />
          </div>
          <div className="flex items-center justify-between pt-6">
            <div className="space-y-1">
              <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
              <p className="text-xs text-gray-500">
                Enable for SMTPS (465) or STARTTLS (587) as needed
              </p>
            </div>
            <Switch
              id="smtpSecure"
              checked={settings.smtpSecure}
              onCheckedChange={(checked) =>
                setSettings((p) => ({ ...p, smtpSecure: checked }))
              }
            />
          </div>
        </div>
        <Separator />
        <div className="flex gap-2 justify-end">
          <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Email Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


