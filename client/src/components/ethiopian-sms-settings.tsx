import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EthiopianSMSSettings {
  provider:
    | "africas_talking"
    | "bulksms"
    | "local_aggregator"
    | "ethio_telecom"
    | "custom";
  username?: string;
  password?: string;
  apiKey?: string;
  senderId?: string;
  baseUrl?: string;
  customEndpoint?: string;
  customHeaders?: string;
  isActive: boolean;
}

export function EthiopianSMSSettings() {
  const { toast } = useToast();
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["ethiopian-sms-settings"],
    queryFn: async () => {
      const response = await apiRequest("/api/ethiopian-sms-settings", "GET");
      return response as EthiopianSMSSettings;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<EthiopianSMSSettings>) => {
      return await apiRequest("/api/ethiopian-sms-settings", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ethiopian SMS settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update Ethiopian SMS settings",
        variant: "destructive",
      });
    },
  });

  // Test SMS mutation
  const testSMSMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ethiopian-sms/test", "POST");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ethiopian test SMS sent successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send Ethiopian test SMS",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<EthiopianSMSSettings>({
    provider: "africas_talking",
    username: "",
    password: "",
    apiKey: "",
    senderId: "SolNet",
    baseUrl: "",
    customEndpoint: "",
    customHeaders: "",
    isActive: true,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleTestSMS = async () => {
    setIsTestLoading(true);
    try {
      await testSMSMutation.mutateAsync();
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleInputChange = (field: keyof EthiopianSMSSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return <div>Loading Ethiopian SMS settings...</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">SMS Provider</Label>
          <Select
            value={formData.provider}
            onValueChange={(value: any) => handleInputChange("provider", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SMS provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="africas_talking">AfricasTalking</SelectItem>
              <SelectItem value="bulksms">BulkSMS</SelectItem>
              <SelectItem value="ethio_telecom">Ethio Telecom</SelectItem>
              <SelectItem value="local_aggregator">
                Local SMS Aggregator
              </SelectItem>
              <SelectItem value="custom">Custom Provider</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sender ID */}
        <div className="space-y-2">
          <Label htmlFor="senderId">Sender ID</Label>
          <Input
            id="senderId"
            value={formData.senderId || ""}
            onChange={(e) => handleInputChange("senderId", e.target.value)}
            placeholder="SolNet"
          />
        </div>

        {/* Provider-specific fields */}
        {formData.provider === "africas_talking" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="AfricasTalking username (or 'sandbox' for testing)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                placeholder="AfricasTalking API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl || ""}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                placeholder="https://api.africastalking.com/version1/messaging"
              />
            </div>
          </>
        )}

        {formData.provider === "bulksms" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                placeholder="BulkSMS API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl || ""}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                placeholder="https://api.bulksms.com/v1/messages"
              />
            </div>
          </>
        )}

        {formData.provider === "ethio_telecom" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Ethio Telecom username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Ethio Telecom password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl || ""}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                placeholder="https://sms.ethiotelecom.et/api/send"
              />
            </div>
          </>
        )}

        {formData.provider === "local_aggregator" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={formData.apiKey || ""}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                placeholder="Local aggregator API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl || ""}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                placeholder="https://api.ethiopiansms.com/send"
              />
            </div>
          </>
        )}

        {formData.provider === "custom" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="customEndpoint">Custom Endpoint</Label>
              <Input
                id="customEndpoint"
                value={formData.customEndpoint || ""}
                onChange={(e) =>
                  handleInputChange("customEndpoint", e.target.value)
                }
                placeholder="https://your-sms-provider.com/api/send"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customHeaders">Custom Headers (JSON)</Label>
              <Textarea
                id="customHeaders"
                value={formData.customHeaders || ""}
                onChange={(e) =>
                  handleInputChange("customHeaders", e.target.value)
                }
                placeholder='{"Authorization": "Bearer your-token"}'
                rows={3}
              />
            </div>
          </>
        )}

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              handleInputChange("isActive", checked)
            }
          />
          <Label htmlFor="isActive">Enable Ethiopian SMS Service</Label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button type="submit" disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestSMS}
            disabled={isTestLoading || testSMSMutation.isPending}
          >
            {isTestLoading || testSMSMutation.isPending
              ? "Sending..."
              : "Test SMS"}
          </Button>
        </div>
      </form>

      {/* Status Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Ethiopian SMS Service Status</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Provider: {formData.provider}</p>
          <p>Sender ID: {formData.senderId || "Not set"}</p>
          <p>Status: {formData.isActive ? "Active" : "Inactive"}</p>
          <p className="text-xs mt-2">
            💡 Ethiopian SMS service supports AfricasTalking, BulkSMS, Ethio
            Telecom, and local aggregators. Messages will be sent in Amharic
            language for better customer experience.
          </p>
        </div>
      </div>
    </div>
  );
}
