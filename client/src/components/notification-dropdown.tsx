import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  Archive,
  Trash2,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  readAt: string | null;
  expiresAt: string | null;
  data: any;
  type: {
    id: string;
    name: string;
    category: string;
  };
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  relatedEntityType?: string;
  relatedEntityId?: string;
}

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

export function NotificationDropdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest("/api/notifications", "GET"),
    enabled: !!user?.id,
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await apiRequest(
        "/api/notifications/unread-count",
        "GET"
      );
      return response.count;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notification preferences
  const { data: preferences = [] } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: () => apiRequest("/api/notifications/preferences", "GET"),
    enabled: !!user?.id && showPreferences,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest(`/api/notifications/${notificationId}/read`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("/api/notifications/mark-all-read", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  // Archive notification mutation
  const archiveMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest(`/api/notifications/${notificationId}/archive`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "preferences"],
      });
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleArchive = (notificationId: string) => {
    archiveMutation.mutate(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read first
    markAsReadMutation.mutate(notification.id);

    // Build URL with parameters for specific item selection
    let targetUrl = "/dashboard"; // Default fallback

    // Navigate based on notification type and related entity
    if (notification.relatedEntityType && notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case "device":
          // Navigate to repair tracking page with device ID
          targetUrl = `/repair-tracking?deviceId=${notification.relatedEntityId}`;
          break;
        case "customer_feedback":
          // Navigate to customer feedback page with feedback ID
          targetUrl = `/customer-feedback?feedbackId=${notification.relatedEntityId}`;
          break;
        case "customer_message":
          // Navigate to dashboard with message ID
          targetUrl = `/dashboard?messageId=${notification.relatedEntityId}`;
          break;
        case "inventory":
          // Navigate to inventory management page with item ID
          targetUrl = `/inventory-management?itemId=${notification.relatedEntityId}`;
          break;
        default:
          // For system alerts or unknown types, navigate to dashboard
          targetUrl = `/dashboard`;
          break;
      }
    } else {
      // For notifications without specific entity, navigate based on notification type
      switch (notification.type?.name) {
        case "device_registered":
        case "device_status_change":
        case "device_tracked":
        case "device_feedback":
          // Try to get device ID from notification data
          const deviceId = notification.data?.deviceId;
          targetUrl = deviceId
            ? `/repair-tracking?deviceId=${deviceId}`
            : `/repair-tracking`;
          break;
        case "customer_feedback":
          // Try to get feedback ID from notification data
          const feedbackId = notification.data?.feedbackId;
          targetUrl = feedbackId
            ? `/customer-feedback?feedbackId=${feedbackId}`
            : `/customer-feedback`;
          break;
        case "customer_message":
          // Try to get message ID from notification data
          const messageId = notification.data?.messageId;
          targetUrl = messageId
            ? `/dashboard?messageId=${messageId}`
            : `/dashboard`;
          break;
        case "low_stock_alert":
          // Try to get item ID from notification data
          const itemId = notification.data?.itemId;
          targetUrl = itemId
            ? `/inventory-management?itemId=${itemId}`
            : `/inventory-management`;
          break;
        case "payment_status_update":
          targetUrl = `/sales`;
          break;
        default:
          // For system alerts, navigate to dashboard
          targetUrl = `/dashboard`;
          break;
      }
    }

    // Navigate to the target URL
    window.location.href = targetUrl;

    // Close the dropdown
    setIsOpen(false);
  };

  const handlePreferenceChange = (
    typeId: string,
    field: string,
    value: boolean
  ) => {
    const preference = preferences.find(
      (p: NotificationPreference) => p.preference.typeId === typeId
    );
    if (preference) {
      updatePreferenceMutation.mutate({
        typeId,
        preferences: {
          ...preference.preference,
          [field]: value,
        },
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴";
      case "high":
        return "🟠";
      case "normal":
        return "🔵";
      case "low":
        return "⚪";
      default:
        return "⚪";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(
    (n: Notification) => n.status === "unread"
  );
  const readNotifications = notifications.filter(
    (n: Notification) => n.status === "read"
  );

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 max-h-96 overflow-y-auto"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="h-6 px-2 text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notification Preferences</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Quick Settings
                        </span>
                      </div>
                      <Link href="/notification-preferences">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Full Settings
                        </Button>
                      </Link>
                    </div>
                    {preferences
                      .slice(0, 3)
                      .map((pref: NotificationPreference) => (
                        <Card key={pref.preference.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                              {pref.type.name
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`email-${pref.preference.id}`}
                                className="text-xs"
                              >
                                Email
                              </Label>
                              <Switch
                                id={`email-${pref.preference.id}`}
                                checked={pref.preference.emailEnabled}
                                onCheckedChange={(checked) =>
                                  handlePreferenceChange(
                                    pref.preference.typeId,
                                    "emailEnabled",
                                    checked
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`sms-${pref.preference.id}`}
                                className="text-xs"
                              >
                                SMS
                              </Label>
                              <Switch
                                id={`sms-${pref.preference.id}`}
                                checked={pref.preference.smsEnabled}
                                onCheckedChange={(checked) =>
                                  handlePreferenceChange(
                                    pref.preference.typeId,
                                    "smsEnabled",
                                    checked
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`in-app-${pref.preference.id}`}
                                className="text-xs"
                              >
                                In-App
                              </Label>
                              <Switch
                                id={`in-app-${pref.preference.id}`}
                                checked={pref.preference.inAppEnabled}
                                onCheckedChange={(checked) =>
                                  handlePreferenceChange(
                                    pref.preference.typeId,
                                    "inAppEnabled",
                                    checked
                                  )
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    {preferences.length > 3 && (
                      <div className="text-center p-3 text-sm text-gray-500">
                        <Link
                          href="/notification-preferences"
                          className="text-blue-600 hover:underline"
                        >
                          View all {preferences.length} notification types
                        </Link>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <>
              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                    Unread ({unreadNotifications.length})
                  </DropdownMenuLabel>
                  {unreadNotifications.map((notification: Notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 group"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start w-full gap-2">
                        <span className="text-sm">
                          {getPriorityIcon(notification.priority)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium truncate group-hover:text-blue-600">
                              {notification.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              {notification.priority}
                            </Badge>
                            {notification.relatedEntityType && (
                              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(notification.id);
                                }}
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                    Read ({readNotifications.length})
                  </DropdownMenuLabel>
                  {readNotifications
                    .slice(0, 5)
                    .map((notification: Notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 opacity-75"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start w-full gap-2">
                          <span className="text-sm">
                            {getPriorityIcon(notification.priority)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                {notification.title}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(
                                  notification.priority
                                )}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.type?.name && (
                              <p className="text-xs text-gray-400 mt-1">
                                Type:{" "}
                                {notification.type.name.replace(/_/g, " ")}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(notification.id);
                                }}
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
