import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Edit, Eye, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const statusOptions = [
  { value: "registered", label: "Registered", color: "bg-blue-100 text-blue-800" },
  { value: "diagnosed", label: "Diagnosed", color: "bg-yellow-100 text-yellow-800" },
  { value: "in_progress", label: "In Progress", color: "bg-orange-100 text-orange-800" },
  { value: "waiting_parts", label: "Waiting Parts", color: "bg-purple-100 text-purple-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "ready_for_pickup", label: "Ready for Pickup", color: "bg-emerald-100 text-emerald-800" },
  { value: "delivered", label: "Delivered", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function RepairTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
    estimatedCompletion: "",
    actualCost: "",
  });

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices"],
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/devices/${selectedDevice.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setIsUpdateModalOpen(false);
      setSelectedDevice(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive",
      });
    },
  });

  const filteredDevices = devices.filter((device: any) =>
    device.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleUpdateDevice = () => {
    const data: any = {
      status: updateForm.status,
    };

    if (updateForm.notes) data.notes = updateForm.notes;
    if (updateForm.estimatedCompletion) data.estimatedCompletion = updateForm.estimatedCompletion;
    if (updateForm.actualCost) data.actualCost = parseFloat(updateForm.actualCost);

    updateDeviceMutation.mutate(data);
  };

  const openUpdateModal = (device: any) => {
    setSelectedDevice(device);
    setUpdateForm({
      status: device.status || "",
      notes: device.notes || "",
      estimatedCompletion: device.estimatedCompletion || "",
      actualCost: device.actualCost?.toString() || "",
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Repair Tracking</h1>
        <p className="mt-1 text-sm text-gray-600">Track and manage device repairs</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer, device type, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No devices found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDevices.map((device: any) => (
            <Card key={device.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{device.customerName}</h3>
                      {getStatusBadge(device.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Device:</span>
                        <p className="font-medium">{device.deviceType} - {device.brand} {device.model}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Issue:</span>
                        <p className="font-medium">{device.reportedIssue}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Registered:</span>
                        <p className="font-medium">{new Date(device.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Estimated Cost:</span>
                        <p className="font-medium">${device.estimatedCost || 'TBD'}</p>
                      </div>
                    </div>
                    {device.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm mt-1">{device.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Device Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-500">Customer</Label>
                              <p className="font-medium">{device.customerName}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Phone</Label>
                              <p className="font-medium">{device.customerPhone}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Email</Label>
                              <p className="font-medium">{device.customerEmail}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Status</Label>
                              <div className="mt-1">{getStatusBadge(device.status)}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Device Type</Label>
                              <p className="font-medium">{device.deviceType}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Brand & Model</Label>
                              <p className="font-medium">{device.brand} {device.model}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Service Type</Label>
                              <p className="font-medium">{device.serviceType}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Priority</Label>
                              <p className="font-medium capitalize">{device.priority}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Reported Issue</Label>
                            <p className="font-medium mt-1">{device.reportedIssue}</p>
                          </div>
                          {device.notes && (
                            <div>
                              <Label className="text-sm text-gray-500">Notes</Label>
                              <p className="font-medium mt-1">{device.notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openUpdateModal(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Device Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Device Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                placeholder="Add any updates or notes..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
              <Input
                id="estimatedCompletion"
                type="date"
                value={updateForm.estimatedCompletion}
                onChange={(e) => setUpdateForm({...updateForm, estimatedCompletion: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="actualCost">Actual Cost ($)</Label>
              <Input
                id="actualCost"
                type="number"
                step="0.01"
                value={updateForm.actualCost}
                onChange={(e) => setUpdateForm({...updateForm, actualCost: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateDevice}
                disabled={updateDeviceMutation.isPending}
              >
                {updateDeviceMutation.isPending ? "Updating..." : "Update Device"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
