import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatCurrencyAmount } from "@/lib/currency";
import { DeviceFeedbackForm } from "@/components/DeviceFeedbackForm";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Search,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Package,
  Truck,
  Star,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";

// Define the Device interface
interface Device {
  numId?: number;
  id: string | number;
  customerId?: string;
  locationId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  deviceType: string;
  brand: string;
  model: string;
  problemDescription: string;
  serviceType?: string;
  priority?: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  totalCost?: string | null;
  notes?: string;
  estimatedCompletion?: string;
  feedbackRequested?: boolean;
  feedbackSubmitted?: boolean;
  receiptNumber?: string;
}

const statusOptions = [
  {
    value: "registered",
    label: "Registered",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    icon: "📝",
  },
  {
    value: "diagnosed",
    label: "Diagnosed",
    color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    icon: "🔍",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
    icon: "⚙️",
  },
  {
    value: "waiting_parts",
    label: "Waiting Parts",
    color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    icon: "📦",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    icon: "✅",
  },
  {
    value: "ready_for_pickup",
    label: "Ready for Pickup",
    color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
    icon: "⏰",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200",
    icon: "🚚",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    icon: "❌",
  },
];

const paymentStatusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  },
  {
    value: "paid",
    label: "Paid",
    color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  },
  {
    value: "partial",
    label: "Partial",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  },
  {
    value: "refunded",
    label: "Refunded",
    color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  },
];

export default function RepairTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [highlightedDeviceId, setHighlightedDeviceId] = useState<string | null>(
    null
  );
  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
    estimatedCompletion: "",
    actualCost: "",
    paymentStatus: "",
  });

  // Check for deviceId in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get("deviceId");
    if (deviceId) {
      setHighlightedDeviceId(deviceId);
      // Clear the URL parameter after reading it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Show a toast to indicate the device was highlighted
      toast({
        title: "Device Highlighted",
        description:
          "The device from your notification has been highlighted below.",
      });
    }
  }, [toast]);

  // Type the useQuery hook to return Device[]
  const {
    data: devices = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["devices"],
    queryFn: () => apiRequest("/api/devices", "GET"),
    refetchOnWindowFocus: true,
  });

  // Query to get device cost information
  const { data: deviceCostInfo } = useQuery({
    queryKey: ["device-cost", selectedDevice?.id],
    queryFn: () => apiRequest(`/api/devices/${selectedDevice?.id}/cost`, "GET"),
    enabled: !!selectedDevice?.id,
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/devices/${selectedDevice?.id}`, "PUT", data);
    },
    onSuccess: (data, variables) => {
      let description = "Device status updated successfully";
      // Check if cost was updated
      if (variables.totalCost !== undefined) {
        const costValue = parseFloat(variables.totalCost);
        description = `Device updated successfully. Actual cost set to ${formatCurrency(
          costValue
        )}`;
      }
      toast({
        title: "Success",
        description,
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({
        queryKey: ["device-cost", selectedDevice?.id],
      });
      // Invalidate dashboard queries to update pie chart
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["device-status-distribution"] });
      setIsUpdateModalOpen(false);
      setSelectedDevice(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update device status: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  const requestFeedbackMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await apiRequest(`/api/feedback/request/${deviceId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback request sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to request feedback: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  const filteredDevices = devices.filter(
    (device: any) =>
      device.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <Badge
        className={`${
          statusConfig?.color || "bg-gray-100 text-gray-800"
        } flex items-center gap-1`}
      >
        <span>{statusConfig?.icon}</span>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleUpdateDevice = () => {
    const data: any = {
      status: updateForm.status,
    };
    if (updateForm.notes) data.notes = updateForm.notes;
    if (updateForm.estimatedCompletion)
      data.estimatedCompletion = updateForm.estimatedCompletion;
    if (updateForm.paymentStatus) data.paymentStatus = updateForm.paymentStatus;
    // Handle actual cost update - convert to decimal string format
    if (updateForm.actualCost && updateForm.actualCost.trim() !== "") {
      const costValue = parseFloat(updateForm.actualCost);
      if (!isNaN(costValue) && costValue >= 0) {
        data.totalCost = costValue.toFixed(2); // Convert to decimal string
      }
    }
    updateDeviceMutation.mutate(data);
  };

  const handleQuickStatusUpdate = (
    device: Device,
    newStatus: string,
    notes?: string
  ) => {
    setSelectedDevice(device);
    // Get cost information before updating
    apiRequest(`/api/devices/${device.id}/cost`, "GET")
      .then((costInfo: any) => {
        const costText = costInfo.isEstimated
          ? `Estimated Cost: ${formatCurrency(costInfo.cost)}`
          : `Actual Cost: ${formatCurrency(costInfo.cost)}`;
        toast({
          title: "Cost Information",
          description: costText,
        });
      })
      .catch((error) => {});
    const data: any = {
      status: newStatus,
    };
    if (notes) {
      data.notes = notes;
    }
    updateDeviceMutation.mutate(data);
  };

  const openUpdateModal = (device: Device) => {
    setSelectedDevice(device);
    setUpdateForm({
      status: device.status || "",
      notes: device.notes || "",
      estimatedCompletion: device.estimatedCompletion || "",
      actualCost: device.actualCost?.toString() || "",
      paymentStatus: device.paymentStatus || "",
    });
    setIsUpdateModalOpen(true);
  };

  // Calculate statistics
  const stats = {
    total: devices.length,
    active: devices.filter((d: Device) => d.status === "in_progress").length,
    completed: devices.filter((d: Device) => d.status === "completed").length,
    delivered: devices.filter((d: Device) => d.status === "delivered").length,
  };

  return (
    <PageLayout
      icon={Activity}
      title="Repair Tracking"
      subtitle="Track and manage device repairs with real-time status updates"
      actions={
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="h-10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Devices
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Active Repairs
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Delivered
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                  {stats.delivered}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 card-elevated">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
            <Input
              id="device-search"
              name="deviceSearch"
              placeholder="Search by customer, device type, brand, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDevices.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mb-4">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No devices found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDevices.map((device: Device, index: number) => (
            <Card
              key={device.id}
              className={`group card-elevated hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                highlightedDeviceId === device.id
                  ? "ring-4 ring-blue-500 ring-opacity-50 bg-blue-50/50 dark:bg-blue-950/50"
                  : ""
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {device.customerName}
                        </h3>
                        {device.receiptNumber && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            #{device.receiptNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(device.status)}
                        {device.paymentStatus && (
                          <Badge
                            className={
                              paymentStatusOptions.find(
                                (option) =>
                                  option.value === device.paymentStatus
                              )?.color || "bg-gray-100 text-gray-800"
                            }
                          >
                            {paymentStatusOptions.find(
                              (option) => option.value === device.paymentStatus
                            )?.label || device.paymentStatus}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-4">
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Device
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {device.deviceType} - {device.brand} {device.model}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Issue</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                          {device.problemDescription ||
                            "No issue description provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Registered
                        </span>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(device.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Cost</span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className="text-lg">
                            ETB{" "}
                            {device.totalCost
                              ? formatCurrencyAmount(
                                  parseFloat(device.totalCost)
                                )
                              : "TBD"}
                          </span>
                          {device.totalCost &&
                          parseFloat(device.totalCost) > 0 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium">
                              Actual
                            </span>
                          ) : (
                            device.totalCost === "0.00" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                                Estimated
                              </span>
                            )
                          )}
                        </p>
                      </div>
                    </div>

                    {device.notes && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          Notes:
                        </span>
                        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
                          {device.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 ml-6">
                    {/* Quick Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {device.status === "registered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                          onClick={() =>
                            handleQuickStatusUpdate(
                              device,
                              "diagnosed",
                              "Device diagnosed - ready for repair"
                            )
                          }
                          title="Mark as Diagnosed"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Diagnose
                        </Button>
                      )}
                      {device.status === "diagnosed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                          onClick={() =>
                            handleQuickStatusUpdate(
                              device,
                              "in_progress",
                              "Repair work started"
                            )
                          }
                          title="Start Repair"
                        >
                          <Wrench className="h-4 w-4 mr-1" />
                          Start Repair
                        </Button>
                      )}
                      {device.status === "in_progress" && (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                            onClick={() =>
                              handleQuickStatusUpdate(
                                device,
                                "waiting_parts",
                                "Waiting for parts to arrive"
                              )
                            }
                            title="Waiting for Parts"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Waiting Parts
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                            onClick={() =>
                              handleQuickStatusUpdate(
                                device,
                                "completed",
                                "Repair completed successfully"
                              )
                            }
                            title="Mark Complete"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}
                      {device.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                          onClick={() =>
                            handleQuickStatusUpdate(
                              device,
                              "ready_for_pickup",
                              "Device ready for customer pickup"
                            )
                          }
                          title="Ready for Pickup"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Ready for Pickup
                        </Button>
                      )}
                      {device.status === "ready_for_pickup" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                          onClick={() =>
                            handleQuickStatusUpdate(
                              device,
                              "delivered",
                              "Device delivered to customer"
                            )
                          }
                          title="Mark Delivered"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Deliver
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-0 shadow-xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                              Device Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Customer
                                </Label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {device.customerName}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Receipt Number
                                </Label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {device.receiptNumber || "N/A"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Phone
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {device.customerPhone}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Email
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {device.customerEmail}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Status
                                </Label>
                                <div className="mt-1">
                                  {getStatusBadge(device.status)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Device Type
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {device.deviceType}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Brand & Model
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {device.brand} {device.model}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Service Type
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {device.serviceType}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Priority
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                                  {device.priority}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Reported Issue
                              </Label>
                              <p className="font-medium text-slate-900 dark:text-slate-100 mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                {device.problemDescription ||
                                  "No issue description provided"}
                              </p>
                            </div>
                            {device.notes && (
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Notes
                                </Label>
                                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  {device.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateModal(device)}
                        className="border-blue-200 hover:bg-blue-50 text-blue-600"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      {/* Feedback buttons for delivered devices */}
                      {device.status === "delivered" && (
                        <>
                          {!device.feedbackSubmitted && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              onClick={() => {
                                setSelectedDevice(device);
                                setIsFeedbackModalOpen(true);
                              }}
                              title="Submit Feedback"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Feedback
                            </Button>
                          )}
                          {device.feedbackRequested &&
                            !device.feedbackSubmitted && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() =>
                                  requestFeedbackMutation.mutate(
                                    String(device.id)
                                  )
                                }
                                disabled={requestFeedbackMutation.isPending}
                                title="Request Feedback"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Request
                              </Button>
                            )}
                          {device.feedbackSubmitted && (
                            <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Feedback Submitted
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Device Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Update Device Status
            </DialogTitle>
            {deviceCostInfo && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {deviceCostInfo.isEstimated
                    ? "Estimated Cost"
                    : "Actual Cost"}
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(deviceCostInfo.cost)}
                </div>
                {deviceCostInfo.isEstimated && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Based on service type base price
                  </div>
                )}
              </div>
            )}
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Status
              </Label>
              <Select
                value={updateForm.status}
                onValueChange={(value) =>
                  setUpdateForm({ ...updateForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, notes: e.target.value })
                }
                placeholder="Add any updates or notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="estimatedCompletion"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Estimated Completion
              </Label>
              <Input
                id="estimatedCompletion"
                type="date"
                value={updateForm.estimatedCompletion}
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    estimatedCompletion: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="actualCost"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Actual Cost
                {deviceCostInfo && (
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    {deviceCostInfo.isEstimated
                      ? "Currently estimated"
                      : "Currently set"}
                  </span>
                )}
              </Label>
              <Input
                id="actualCost"
                type="number"
                step="0.01"
                min="0"
                value={updateForm.actualCost}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, actualCost: e.target.value })
                }
                placeholder={
                  deviceCostInfo
                    ? `ETB ${formatCurrencyAmount(deviceCostInfo.cost)}`
                    : "ETB 0.00"
                }
              />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {deviceCostInfo?.isEstimated
                  ? "Leave empty to keep estimated cost, or enter actual cost to override"
                  : "Enter new actual cost to update the current value"}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="paymentStatus"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Payment Status
              </Label>
              <Select
                value={updateForm.paymentStatus}
                onValueChange={(value) =>
                  setUpdateForm({ ...updateForm, paymentStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsUpdateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDevice}
                disabled={updateDeviceMutation.isPending}
              >
                {updateDeviceMutation.isPending
                  ? "Updating..."
                  : "Update Device"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Form Modal */}
      <DeviceFeedbackForm
        deviceId={String(selectedDevice?.id || "")}
        customerId={selectedDevice?.customerId}
        locationId={selectedDevice?.locationId}
        deviceInfo={{
          problemDescription: selectedDevice?.problemDescription || "",
          customerName: selectedDevice?.customerName || "",
        }}
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedDevice(null);
        }}
      />
    </PageLayout>
  );
}
