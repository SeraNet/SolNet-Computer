import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Printer, 
  Plus, 
  Search, 
  User, 
  Smartphone, 
  Wrench, 
  Calendar,
  DollarSign,
  FileText,
  CheckCircle
} from "lucide-react";
import { useCurrentLocation } from "@/hooks/useLocation";

const deviceRegistrationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deviceTypeId: z.string().min(1, "Device type is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  serialNumber: z.string().optional(),
  problemDescription: z.string().min(1, "Problem description is required"),
  customerNotes: z.string().optional(),
  priority: z.enum(["normal", "high", "urgent"]),
  estimatedCost: z.number().min(0).optional(),
});

type DeviceRegistrationForm = z.infer<typeof deviceRegistrationSchema>;

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function DeviceRegistration() {
  const [step, setStep] = useState<"device" | "confirmation">("device");
  const [registeredDevice, setRegisteredDevice] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentLocation } = useCurrentLocation();

  const { data: deviceTypes = [] } = useQuery<any[]>({ queryKey: ["/api/device-types"] });
  const { data: brands = [] } = useQuery<any[]>({ queryKey: ["/api/brands"] });
  const { data: models = [] } = useQuery<any[]>({ queryKey: ["/api/models"] });
  const { data: serviceTypes = [] } = useQuery<any[]>({ queryKey: ["/api/service-types"] });
  const { data: customers = [] } = useQuery<any[]>({ queryKey: ["/api/customers"] });

  const deviceForm = useForm<DeviceRegistrationForm>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      priority: "normal",
      problemDescription: "",
      customerNotes: "",
      estimatedCost: 0,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      serialNumber: "",
    },
  });

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      return await apiRequest("/api/customers", "POST", data);
    },
    onSuccess: (customer) => {
      setSelectedCustomer(customer);
      setShowNewCustomerForm(false);
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/devices", "POST", data);
    },
    onSuccess: (device) => {
      setRegisteredDevice(device);
      setStep("confirmation");
      toast({
        title: "Success",
        description: "Device registered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register device",
        variant: "destructive",
      });
    },
  });

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Device Registration Receipt - ${registeredDevice?.id || 'Unknown'}`,
  });

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.includes(customerSearch)
  );

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    deviceForm.setValue("customerName", customer.name);
    deviceForm.setValue("customerPhone", customer.phone);
    deviceForm.setValue("customerEmail", customer.email || "");
  };

  const onSubmitCustomer = (data: CustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  const onSubmitDevice = (data: DeviceRegistrationForm) => {
    if (!currentLocation) {
      toast({
        title: "Error",
        description: "Please select a location first",
        variant: "destructive",
      });
      return;
    }

    let customerId = selectedCustomer?.id;
    
    if (!customerId) {
      // Create customer first if not selected
      const customerData = {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || undefined,
      };
      
      createCustomerMutation.mutate(customerData, {
        onSuccess: (customer: any) => {
          const deviceData = {
            customerId: customer.id,
            locationId: currentLocation.id,
            deviceTypeId: data.deviceTypeId,
            brandId: data.brandId,
            modelId: data.modelId,
            serviceTypeId: data.serviceTypeId,
            serialNumber: data.serialNumber || null,
            problemDescription: data.problemDescription,
            customerNotes: data.customerNotes || null,
            status: "registered",
            priority: data.priority,
            totalCost: data.estimatedCost || 0,
            paymentStatus: "pending",
          };
          createDeviceMutation.mutate(deviceData);
        },
      });
    } else {
      const deviceData = {
        customerId,
        locationId: currentLocation.id,
        deviceTypeId: data.deviceTypeId,
        brandId: data.brandId,
        modelId: data.modelId,
        serviceTypeId: data.serviceTypeId,
        serialNumber: data.serialNumber || null,
        problemDescription: data.problemDescription,
        customerNotes: data.customerNotes || null,
        status: "registered",
        priority: data.priority,
        totalCost: data.estimatedCost || 0,
        paymentStatus: "pending",
      };
      createDeviceMutation.mutate(deviceData);
    }
  };

  const resetForm = () => {
    setStep("device");
    setRegisteredDevice(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowNewCustomerForm(false);
    deviceForm.reset();
    customerForm.reset();
  };

  if (step === "confirmation" && registeredDevice) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registration Complete</h1>
            <p className="mt-1 text-sm text-gray-600">Device has been successfully registered</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button onClick={resetForm} variant="outline">
              Register Another Device
            </Button>
          </div>
        </div>

        {/* Receipt */}
        <div ref={receiptRef} className="max-w-md mx-auto bg-white p-6 border">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">LeulNet Computer Services</h2>
            {currentLocation && (
              <div className="text-sm text-gray-600 mt-2">
                <p>{currentLocation.name}</p>
                <p>{currentLocation.address}</p>
                <p>{currentLocation.city}, {currentLocation.state} {currentLocation.zipCode}</p>
                {currentLocation.phone && <p>Phone: {currentLocation.phone}</p>}
              </div>
            )}
          </div>

          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-semibold mb-2">Device Registration Receipt</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span>{registeredDevice.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{deviceForm.getValues("customerName")}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{deviceForm.getValues("customerPhone")}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Device Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{deviceTypes.find((dt: any) => dt.id === deviceForm.getValues("deviceTypeId"))?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Brand:</span>
                <span>{brands.find((b: any) => b.id === deviceForm.getValues("brandId"))?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span>{models.find((m: any) => m.id === deviceForm.getValues("modelId"))?.name}</span>
              </div>
              {deviceForm.getValues("serialNumber") && (
                <div className="flex justify-between">
                  <span>Serial:</span>
                  <span>{deviceForm.getValues("serialNumber")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Service Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span>{serviceTypes.find((st: any) => st.id === deviceForm.getValues("serviceTypeId"))?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="capitalize">{deviceForm.getValues("priority")}</span>
              </div>
              {deviceForm.getValues("estimatedCost") && deviceForm.getValues("estimatedCost") > 0 && (
                <div className="flex justify-between">
                  <span>Est. Cost:</span>
                  <span>${(deviceForm.getValues("estimatedCost") || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Problem Description</h4>
            <p className="text-sm">{deviceForm.getValues("problemDescription")}</p>
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Thank you for choosing LeulNet!</p>
            <p>Keep this receipt for your records.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Registration</h1>
            <p className="mt-1 text-sm text-gray-600">Register new devices for repair services with automatic receipt printing</p>
          </div>
          {currentLocation && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <span className="font-medium text-blue-900">{currentLocation.name}</span>
                <span className="text-blue-700 ml-1">({currentLocation.code})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCustomer && !showNewCustomerForm && (
              <>
                <div>
                  <Label>Search Existing Customer</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {customerSearch && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filteredCustomers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => setShowNewCustomerForm(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Customer
                </Button>
              </>
            )}

            {selectedCustomer && (
              <div className="p-3 border rounded bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedCustomer(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            {showNewCustomerForm && (
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                  <FormField
                    control={customerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createCustomerMutation.isPending}
                    >
                      Create Customer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewCustomerForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Device Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...deviceForm}>
                <form onSubmit={deviceForm.handleSubmit(onSubmitDevice)} className="space-y-6">
                  {/* Customer Info (if not selected from list) */}
                  {!selectedCustomer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-gray-50">
                      <h3 className="col-span-full font-medium mb-2">Customer Details</h3>
                      <FormField
                        control={deviceForm.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deviceForm.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deviceForm.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Device Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={deviceForm.control}
                      name="deviceTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type *</FormLabel>
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
                      control={deviceForm.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand *</FormLabel>
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

                    <FormField
                      control={deviceForm.control}
                      name="modelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {models.map((model: any) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deviceForm.control}
                      name="serviceTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
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
                      control={deviceForm.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deviceForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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

                  <FormField
                    control={deviceForm.control}
                    name="problemDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problem Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the issue with the device..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deviceForm.control}
                    name="customerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes from customer..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deviceForm.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createDeviceMutation.isPending || createCustomerMutation.isPending}
                  >
                    {createDeviceMutation.isPending || createCustomerMutation.isPending 
                      ? "Registering..." 
                      : "Register Device"
                    }
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}