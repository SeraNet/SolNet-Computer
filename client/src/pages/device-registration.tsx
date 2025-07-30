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
import { insertDeviceSchema, insertCustomerSchema } from "@shared/schema";
import { useCurrentLocation } from "@/hooks/useLocation";

const deviceRegistrationSchema = insertDeviceSchema.extend({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  estimatedCost: z.number().min(0).optional(),
});

type DeviceRegistrationForm = z.infer<typeof deviceRegistrationSchema>;

const customerSchema = insertCustomerSchema.extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
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

  const { data: deviceTypes = [] } = useQuery({ queryKey: ["/api/device-types"] });
  const { data: brands = [] } = useQuery({ queryKey: ["/api/brands"] });
  const { data: models = [] } = useQuery({ queryKey: ["/api/models"] });
  const { data: serviceTypes = [] } = useQuery({ queryKey: ["/api/service-types"] });
  const { data: customers = [] } = useQuery({ queryKey: ["/api/customers"] });

  const deviceForm = useForm<DeviceRegistrationForm>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      status: "registered",
      priority: "medium",
      problemDescription: "",
      customerNotes: "",
      estimatedCost: 0,
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
      return await apiRequest("/api/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });
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
      return await apiRequest("/api/devices", {
        method: "POST",
        body: JSON.stringify(data),
      });
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
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
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
        onSuccess: (customer) => {
          const deviceData = {
            customerId: customer.id,
            locationId: currentLocation.id,
            deviceTypeId: data.deviceTypeId,
            brandId: data.brandId,
            modelId: data.modelId,
            serviceTypeId: data.serviceTypeId,
            serialNumber: data.serialNumber,
            problemDescription: data.problemDescription,
            customerNotes: data.customerNotes,
            status: data.status,
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
        serialNumber: data.serialNumber,
        problemDescription: data.problemDescription,
        customerNotes: data.customerNotes,
        status: data.status,
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Registration Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Device ID</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{registeredDevice.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer</Label>
                <p>{selectedCustomer?.name || deviceForm.getValues("customerName")}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Device</Label>
                <p>{deviceTypes.find((dt: any) => dt.id === registeredDevice.deviceTypeId)?.name} - {brands.find((b: any) => b.id === registeredDevice.brandId)?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge className="bg-blue-100 text-blue-800">
                  {registeredDevice.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Estimated Cost</Label>
                <p>${registeredDevice.totalCost?.toFixed(2) || "0.00"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Receipt for Printing */}
          <div style={{ display: "none" }}>
            <div ref={receiptRef} className="p-8 max-w-md mx-auto bg-white">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">LeulNet Computer Services</h1>
                <p className="text-sm text-gray-600">Device Registration Receipt</p>
                <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="border-t border-b border-gray-300 py-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Device ID:</strong>
                    <p className="font-mono text-xs">{registeredDevice.id}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p>{registeredDevice.status}</p>
                  </div>
                  <div>
                    <strong>Priority:</strong>
                    <p>{registeredDevice.priority}</p>
                  </div>
                  <div>
                    <strong>Est. Cost:</strong>
                    <p>${registeredDevice.totalCost?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {selectedCustomer?.name || deviceForm.getValues("customerName")}</p>
                  <p><strong>Phone:</strong> {selectedCustomer?.phone || deviceForm.getValues("customerPhone")}</p>
                  {(selectedCustomer?.email || deviceForm.getValues("customerEmail")) && (
                    <p><strong>Email:</strong> {selectedCustomer?.email || deviceForm.getValues("customerEmail")}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Device Information</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Type:</strong> {deviceTypes.find((dt: any) => dt.id === registeredDevice.deviceTypeId)?.name}</p>
                  <p><strong>Brand:</strong> {brands.find((b: any) => b.id === registeredDevice.brandId)?.name}</p>
                  <p><strong>Model:</strong> {models.find((m: any) => m.id === registeredDevice.modelId)?.name}</p>
                  {registeredDevice.serialNumber && (
                    <p><strong>Serial:</strong> {registeredDevice.serialNumber}</p>
                  )}
                  <p><strong>Service:</strong> {serviceTypes.find((st: any) => st.id === registeredDevice.serviceTypeId)?.name}</p>
                </div>
              </div>

              {registeredDevice.problemDescription && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Problem Description</h3>
                  <p className="text-sm">{registeredDevice.problemDescription}</p>
                </div>
              )}

              <div className="border-t border-gray-300 pt-4 mt-4 text-center text-xs text-gray-500">
                <p>Please keep this receipt for your records</p>
                <p>Contact us for updates on your device status</p>
              </div>
            </div>
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
              <MapPin className="h-4 w-4 text-blue-600" />
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
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...deviceForm}>
                <form onSubmit={deviceForm.handleSubmit(onSubmitDevice)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={deviceForm.control}
                      name="deviceTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormLabel>Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Input {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
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
                            {...field}
                            placeholder="Describe the issue with the device..."
                            className="min-h-[100px]"
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
                            {...field}
                            placeholder="Additional notes from customer..."
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
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!selectedCustomer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-gray-50">
                      <h3 className="md:col-span-2 font-medium text-gray-900">New Customer Details</h3>
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
                            <FormLabel>Customer Phone *</FormLabel>
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
                            <FormLabel>Customer Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createDeviceMutation.isPending}
                  >
                    {createDeviceMutation.isPending ? "Registering..." : "Register Device & Print Receipt"}
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
