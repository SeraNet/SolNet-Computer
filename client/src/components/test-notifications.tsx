import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Plus, Trash2, Smartphone, MessageSquare } from "lucide-react";

export function TestNotifications() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createTestNotifications = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest(
        "/api/notifications/create-test",
        "POST"
      );

      toast({
        title: "Test Notifications Created",
        description: `Successfully created ${response.count} test notifications`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test notifications",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestCustomerFeedback = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest(
        "/api/notifications/test-customer-feedback",
        "POST"
      );

      toast({
        title: "Customer Feedback Notification Created",
        description: "Test customer feedback notification created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer feedback notification",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestCustomerMessage = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest(
        "/api/notifications/test-customer-message",
        "POST"
      );

      toast({
        title: "Customer Message Notification Created",
        description: "Test customer message notification created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer message notification",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestDeviceRegistration = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest(
        "/api/notifications/test-device-registration",
        "POST"
      );

      toast({
        title: "Device Registration Notification Created",
        description:
          "Test device registration notification created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create device registration notification",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-blue-50 dark:bg-blue-950/30">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Info:</span> Create test notifications to verify the notification system is working correctly. These will appear in your notification center.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={createTestNotifications}
          disabled={isCreating}
          className="h-auto py-3 flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2 w-full">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Create Test Notifications</span>
          </div>
          <span className="text-xs opacity-90">General notification test</span>
        </Button>

        <Button
          onClick={createTestCustomerFeedback}
          disabled={isCreating}
          variant="outline"
          className="h-auto py-3 flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2 w-full">
            <Bell className="h-4 w-4" />
            <span className="font-medium">Test Customer Feedback</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">Feedback notification test</span>
        </Button>

        <Button
          onClick={createTestCustomerMessage}
          disabled={isCreating}
          variant="outline"
          className="h-auto py-3 flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2 w-full">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Test Customer Message</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">Message notification test</span>
        </Button>

        <Button
          onClick={createTestDeviceRegistration}
          disabled={isCreating}
          variant="outline"
          className="h-auto py-3 flex-col items-start gap-1"
        >
          <div className="flex items-center gap-2 w-full">
            <Smartphone className="h-4 w-4" />
            <span className="font-medium">Test Device Registration</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">Device notification test</span>
        </Button>
      </div>
    </div>
  );
}
