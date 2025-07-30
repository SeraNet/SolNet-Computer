import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { 
  Laptop,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Plus,
  ShoppingCart,
  Calendar,
  BarChart3
} from "lucide-react";
import POSModal from "@/components/pos-modal";
import { useState } from "react";

const deviceRegistrationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deviceTypeId: z.string().min(1, "Device type is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().optional(),
  serialNumber: z.string().optional(),
  problemDescription: z.string().min(1, "Problem description is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
});

type DeviceRegistrationForm = z.infer<typeof deviceRegistrationSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPOSModal, setShowPOSModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activeRepairs, isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/devices/active-repairs"],
  });

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/today"],
  });

  const { data: deviceTypes } = useQuery({
    queryKey: ["/api/device-types"],
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ["/api/service-types"],
  });

  const form = useForm<DeviceRegistrationForm>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deviceTypeId: "",
      brandId: "",
      modelId: "",
      serialNumber: "",
      problemDescription: "",
      serviceTypeId: "",
      priority: "normal",
    },
  });

  const registerDeviceMutation = useMutation({
    mutationFn: async (data: DeviceRegistrationForm) => {
      // First create or find customer
      const customerResponse = await apiRequest("POST", "/api/customers", {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || null,
      });
      const customer = await customerResponse.json();

      // Then create device
      const deviceResponse = await apiRequest("POST", "/api/devices", {
        customerId: customer.id,
        deviceTypeId: data.deviceTypeId,
        brandId: data.brandId,
        modelId: data.modelId || null,
        serialNumber: data.serialNumber || null,
        problemDescription: data.problemDescription,
        serviceTypeId: data.serviceTypeId,
        priority: data.priority,
        status: "registered",
      });
      return deviceResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Device Registered Successfully",
        description: "The device has been registered and a receipt can be printed.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices/active-repairs"] });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeviceRegistrationForm) => {
    registerDeviceMutation.mutate(data);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "registered": return "status-registered";
      case "diagnosed": return "status-diagnosed";
      case "in_progress": return "status-in_progress";
      case "waiting_parts": return "status-waiting_parts";
      case "completed": return "status-completed";
      case "ready_for_pickup": return "status-ready_for_pickup";
      case "delivered": return "status-delivered";
      case "cancelled": return "status-cancelled";
      default: return "status-registered";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening in your shop today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Quick Register
          </Button>
          <Button onClick={() => setShowPOSModal(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Laptop className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Repairs</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.activeRepairs || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.completedToday || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.lowStockItems || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : `$${stats?.todayRevenue || 0}`}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        {/* Device Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Device Registration</CardTitle>
            <p className="text-sm text-gray-600">Register a new device for repair</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="deviceTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deviceTypes?.map((type: any) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands?.map((brand: any) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Describe the issue..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="serviceTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes?.map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerDeviceMutation.isPending}
                  >
                    {registerDeviceMutation.isPending ? "Registering..." : "Register & Print Receipt"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Active Repairs List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Repairs</CardTitle>
                <p className="text-sm text-gray-600">Current devices being serviced</p>
              </div>
              <Button variant="link" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repairsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))
              ) : activeRepairs?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Laptop className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No active repairs</p>
                </div>
              ) : (
                activeRepairs?.map((repair: any) => (
                  <div key={repair.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Laptop className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {repair.brand} {repair.deviceType}
                        </div>
                        <div className="text-sm text-gray-500">{repair.customerName}</div>
                        <div className="text-xs text-gray-400">
                          Registered {new Date(repair.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(repair.status)}>
                      {formatStatus(repair.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => setShowPOSModal(true)}
              >
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Point of Sale</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <Plus className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium">Add Item</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium">Schedule</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <CardTitle>Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))
              ) : lowStockItems?.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">All items are well stocked</p>
                </div>
              ) : (
                lowStockItems?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{item.quantity} left</div>
                      <div className="text-xs text-gray-500">Min: {item.minStockLevel}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {lowStockItems?.length > 0 && (
              <div className="mt-4">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Reorder All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))
              ) : recentSales?.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <ShoppingCart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm">No sales today</p>
                </div>
              ) : (
                recentSales?.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Sale #{sale.id.slice(-6)}</div>
                        <div className="text-xs text-gray-500">
                          Customer: {sale.customerName || "Walk-in"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${sale.totalAmount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <POSModal open={showPOSModal} onOpenChange={setShowPOSModal} />
    </>
  );
}
