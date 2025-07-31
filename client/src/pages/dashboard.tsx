import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import ReceiptTemplate from "@/components/receipt-template";
import { useState, useRef } from "react";

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
  const [registeredDevice, setRegisteredDevice] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Create a new window for printing the receipt
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Unable to open print window. Please check your popup blocker.",
        variant: "destructive",
      });
      return;
    }

    // Get the receipt content
    const receiptContent = receiptRef.current?.innerHTML || '';
    
    // Create the full HTML document for printing
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Device Registration Receipt</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: black;
              background: white;
            }
            h1, h2, h3 { color: black !important; }
            .text-gray-900 { color: black !important; }
            .text-gray-600 { color: #666 !important; }
            .text-gray-700 { color: #333 !important; }
            .border-gray-200 { border-color: #ddd !important; }
            .bg-gray-50 { background-color: #f9f9f9 !important; }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `;

    // Write the document and print
    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setRegisteredDevice(null);
      }, 250);
    };
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activeRepairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/devices/active-repairs"],
  });

  const { data: lowStockItems = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: recentSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/today"],
  });

  const { data: deviceTypes = [] } = useQuery({
    queryKey: ["/api/device-types"],
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: serviceTypes = [] } = useQuery({
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
      console.log('Starting device registration with data:', data);

      // First create or find customer
      let customer;
      try {
        const customerResponse = await apiRequest("POST", "/api/customers", {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || null,
        });
        customer = await customerResponse.json();
        console.log('Customer created/found:', customer);
      } catch (error) {
        console.error('Customer creation failed:', error);
        throw new Error('Failed to create customer');
      }

      // Then create device with customer ID
      let device;
      try {
        const devicePayload = {
          customerId: customer.id,
          deviceTypeId: data.deviceTypeId,
          brandId: data.brandId,
          modelId: data.modelId || null,
          serialNumber: data.serialNumber || null,
          problemDescription: data.problemDescription,
          serviceTypeId: data.serviceTypeId,
          priority: data.priority,
          status: "registered",
        };
        console.log('Creating device with payload:', devicePayload);
        
        const deviceResponse = await apiRequest("POST", "/api/devices", devicePayload);
        device = await deviceResponse.json();
        console.log('Device created:', device);
      } catch (error) {
        console.error('Device creation failed:', error);
        throw new Error('Failed to create device');
      }
      
      // Get reference data for receipt
      const deviceType = deviceTypes.find(dt => dt.id === data.deviceTypeId);
      const brand = brands.find(b => b.id === data.brandId);
      const serviceType = serviceTypes.find(st => st.id === data.serviceTypeId);
      
      return {
        device,
        customer,
        deviceType: deviceType?.name || "Unknown",
        brand: brand?.name || "Unknown",
        serviceType: serviceType?.name || "Unknown",
      };
    },
    onSuccess: (result) => {
      toast({
        title: "Device Registered Successfully",
        description: "The device has been registered and a receipt can be printed.",
      });

      // Set up receipt data
      setRegisteredDevice({
        receiptNumber: result.device.id.slice(-8).toUpperCase(),
        date: new Date().toLocaleDateString(),
        customer: result.customer.name,
        device: {
          type: result.deviceType,
          brand: result.brand,
          model: form.getValues('modelId') ? 'Model Selected' : 'Generic Model',
          service: result.serviceType,
        },
      });

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices/active-repairs"] });
      
      // Auto-print receipt after brief delay
      setTimeout(() => {
        handlePrint();
      }, 500);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register device. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeviceRegistrationForm) => {
    console.log('Form submitted with data:', data);
    registerDeviceMutation.mutate(data);
  };

  if (statsLoading || repairsLoading || lowStockLoading || salesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Repairs</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRepairs || 0}</div>
            <p className="text-xs text-muted-foreground">Devices in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Repairs finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${recentSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Sales revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Device Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Register</CardTitle>
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

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deviceTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deviceTypes.map((type: any) => (
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand: any) => (
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
                </div>

                <FormField
                  control={form.control}
                  name="serviceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((service: any) => (
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
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the problem with the device"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
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

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Active Repairs */}
          <Card>
            <CardHeader>
              <CardTitle>Active Repairs</CardTitle>
              <p className="text-sm text-gray-600">Current devices being serviced</p>
            </CardHeader>
            <CardContent>
              {activeRepairs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active repairs</p>
              ) : (
                <div className="space-y-3">
                  {activeRepairs.slice(0, 5).map((repair: any) => (
                    <div key={repair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{repair.customerName}</p>
                        <p className="text-xs text-gray-600">{repair.deviceType} - {repair.brand}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {repair.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <p className="text-sm text-gray-600">Items that need restocking</p>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">All items well stocked</p>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {item.quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Receipt Template */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef}>
          {registeredDevice && (
            <ReceiptTemplate 
              receiptData={{
                receiptNumber: registeredDevice.receiptNumber,
                date: registeredDevice.date,
                customer: registeredDevice.customer,
                device: registeredDevice.device,
                type: 'registration'
              }}
            />
          )}
        </div>
      </div>

      {/* POS Modal */}
      <POSModal 
        isOpen={showPOSModal} 
        onClose={() => setShowPOSModal(false)} 
      />
    </div>
  );
}