import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import {
  Printer,
  Plus,
  Search,
  User,
  Smartphone,
  Wrench,
  Calendar,
  FileText,
  CheckCircle,
  Loader2,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import { insertDeviceSchema, insertCustomerSchema } from "@shared/schema";
import { useCurrentLocation } from "@/hooks/useLocation";
import ReceiptTemplate from "@/components/receipt-template";
import PredefinedProblemsSelector from "@/components/predefined-problems-selector";
const deviceRegistrationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deviceTypeId: z.string().min(1, "Device type is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  serialNumber: z.string().optional(),
  problemDescription: z.string().optional(),
  customerNotes: z.string().optional(),
  status: z.string().default("registered"),
  priority: z.string().default("normal"),
  estimatedCost: z
    .number()
    .min(0, "Estimated cost must be positive")
    .optional(),
  taxRate: z.number().min(0).max(100).default(0),
});
type DeviceRegistrationForm = z.infer<typeof deviceRegistrationSchema>;
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
});
type CustomerForm = z.infer<typeof customerSchema>;
export default function DeviceRegistration() {
  const [registeredDevice, setRegisteredDevice] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<any[]>([]);
  const [customDescription, setCustomDescription] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentLocation } = useCurrentLocation();
  // Restore device data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("lastRegisteredDevice");
    if (storedData && !registeredDevice) {
      try {
        const deviceData = JSON.parse(storedData);
        setRegisteredDevice(deviceData);
      } catch (error) {}
    }
  }, []);
  // Generate tracking code: SolNet + date + short ID
  const generateTrackingCode = (deviceId: string) => {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const shortId = deviceId.slice(-2); // Last 2 characters of device ID
    return `SolNet-${month}${day}${shortId}`;
  };
  // const { data: deviceTypes = [] } = useQuery<any[]>({
  //   queryKey: ["/api/device-types"],
  // });
  // const { data: brands = [] } = useQuery<any[]>({ queryKey: ["/api/brands"] });
  //const { data: models = [] } = useQuery<any[]>({ queryKey: ["/api/models"] });
  // const { data: serviceTypes = [] } = useQuery<any[]>({
  //   queryKey: ["/api/service-types"],
  // });
  const trimmedSearch = customerSearch.trim();
  const { data: customers = [] } = useQuery<any[]>({
    // When there is a search term, hit server-side search using query params
    queryKey: trimmedSearch
      ? ["customers", { search: trimmedSearch }]
      : ["customers"],
  });
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ["device-types"],
  }) as { data: any[] };
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
  }) as { data: any[] };
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["service-types"],
  }) as { data: any[] };
  const { data: models = [] } = useQuery({
    queryKey: ["models"],
  }) as { data: any[] };
  const deviceForm = useForm<DeviceRegistrationForm>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deviceTypeId: "",
      brandId: "",
      modelId: "",
      serviceTypeId: "",
      serialNumber: "",
      problemDescription: "",
      customerNotes: "",
      status: "registered",
      priority: "normal",
      estimatedCost: 0,
      taxRate: 0,
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
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create customer: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });
  const createDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/devices", "POST", data);
    },
    onSuccess: (device) => {
      toast({
        title: "Device Registered Successfully",
        description:
          "The device has been registered and a receipt can be printed.",
      });
      // Set up receipt data exactly like dashboard
      const customerName =
        selectedCustomer?.name || deviceForm.getValues("customerName");
      const customerPhone =
        selectedCustomer?.phone || deviceForm.getValues("customerPhone");
      const customerEmail =
        selectedCustomer?.email || deviceForm.getValues("customerEmail") || "";
      const deviceType =
        deviceTypes.find((dt: any) => dt.id === device.deviceTypeId)?.name ||
        "Unknown";
      const brand =
        brands.find((b: any) => b.id === device.brandId)?.name || "Unknown";
      const model =
        models.find((m: any) => m.id === device.modelId)?.name ||
        "Not Specified";
      const service =
        serviceTypes.find((st: any) => st.id === device.serviceTypeId)?.name ||
        "Unknown";
      const estimatedCost = deviceForm.getValues("estimatedCost") || 0;
      const taxRate = deviceForm.getValues("taxRate") || 0;
      const taxAmount = estimatedCost * (taxRate / 100);
      const totalCost = estimatedCost + taxAmount;
      const estimatedCostText =
        device?.totalCost && parseFloat(device.totalCost) > 0
          ? formatCurrency(device.totalCost)
          : estimatedCost > 0
          ? formatCurrency(estimatedCost)
          : "TBD";
      const receiptDeviceData = {
        receiptNumber: device.receiptNumber || generateTrackingCode(device.id), // Use saved receipt number if available
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || "N/A",
        },
        device: {
          type: deviceType,
          brand: brand,
          model: model,
          serialNumber: device.serialNumber || "N/A",
          service: service,
          problemDescription: device.problemDescription || "",
          estimatedCost: estimatedCostText,
          taxRate: taxRate,
          taxAmount: taxAmount,
          totalCost: totalCost,
          priority: device.priority || "normal",
        },
        status: "Registered",
        nextSteps:
          "Device will be diagnosed and customer will be contacted with repair estimate.",
      };
      setRegisteredDevice(receiptDeviceData);
      // Store in localStorage as backup
      localStorage.setItem(
        "lastRegisteredDevice",
        JSON.stringify(receiptDeviceData)
      );
      // Don't change step - stay on registration page
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      // Auto-print receipt after brief delay
      setTimeout(() => {
        handlePrint();
        // Reset form after printing
        setTimeout(() => {
          resetForm();
        }, 1000);
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to register device: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });
  const handlePrint = () => {
    let deviceData = registeredDevice;
    // Try to get from localStorage if state is null
    if (!deviceData) {
      const storedData = localStorage.getItem("lastRegisteredDevice");
      if (storedData) {
        try {
          deviceData = JSON.parse(storedData);
        } catch (error) {}
      }
    }
    if (!deviceData) {
      toast({
        title: "Error",
        description: "No device data available for printing",
        variant: "destructive",
      });
      return;
    }
    // Create a new window for printing the receipt
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
      toast({
        title: "Error",
        description:
          "Unable to open print window. Please check your popup blocker.",
        variant: "destructive",
      });
      return;
    }
    // Get the receipt content
    const receiptContent = receiptRef.current?.innerHTML || "";
    if (!receiptContent) {
      // Create a simple fallback receipt template
      const fallbackReceipt = `
        <div style="font-family: Arial, sans-serif; max-width: 80mm; padding: 10px; text-align: center;">
          <h2 style="margin: 0 0 10px 0; font-size: 14px;">SolNet Computer Services</h2>
          <p style="margin: 5px 0; font-size: 10px;">Professional Computer Repair & Technical Services</p>
          <hr style="border: 1px solid #ccc; margin: 10px 0;">
          <div style="text-align: left; font-size: 10px;">
            <p><strong>Receipt #:</strong> ${deviceData.receiptNumber}</p>
            <p><strong>Date:</strong> ${deviceData.date}</p>
            <p><strong>Time:</strong> ${deviceData.time}</p>
            <p><strong>Customer:</strong> ${deviceData.customer.name}</p>
            <p><strong>Phone:</strong> ${deviceData.customer.phone}</p>
            <p><strong>Device:</strong> ${deviceData.device.type} - ${deviceData.device.brand}</p>
            <p><strong>Model:</strong> ${deviceData.device.model}</p>
            <p><strong>Problem:</strong> ${deviceData.device.problemDescription}</p>
            <p><strong>Estimated Cost:</strong> ${deviceData.device.estimatedCost}</p>
            <p><strong>Status:</strong> ${deviceData.status}</p>
          </div>
          <hr style="border: 1px solid #ccc; margin: 10px 0;">
          <p style="font-size: 10px; margin: 5px 0;">Thank you for choosing SolNet!</p>
          <p style="font-size: 8px; margin: 5px 0;">📞 091 334 1664 | 📧 info@solnetcomputer.com</p>
        </div>
      `;
      const printDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Device Registration Receipt</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>
            ${fallbackReceipt}
          </body>
        </html>
      `;
      printWindow.document.write(printDocument);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast({
            title: "Success",
            description: "Receipt printed successfully (fallback template)",
          });
        }, 500);
      };
      return;
    }
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
            .receipt-print { display: block !important; }
            .print-visible { display: block !important; }
            .print-hidden { display: none !important; }
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
        toast({
          title: "Success",
          description: "Receipt printed successfully",
        });
      }, 500);
    };
  };
  const filteredCustomers = customers.filter((customer: any) => {
    const nameMatches = customer.name
      ?.toLowerCase()
      .includes(trimmedSearch.toLowerCase());
    const digits = (s: string) => s.replace(/\D/g, "");
    const phoneMatches = customer.phone
      ? digits(customer.phone).includes(digits(trimmedSearch))
      : false;
    const emailMatches = customer.email
      ?.toLowerCase()
      .includes(trimmedSearch.toLowerCase());
    return !!trimmedSearch && (nameMatches || phoneMatches || emailMatches);
  });
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
    // Validate predefined problems selection
    if (selectedProblems.length === 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please select at least one predefined problem.",
        variant: "destructive",
      });
      return;
    }
    let customerId = selectedCustomer?.id;
    // Validate required selects
    if (!data.deviceTypeId || !data.brandId || !data.serviceTypeId) {
      toast({
        title: "Missing Required Fields",
        description:
          "Please select Device Type, Brand and Service Type before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!customerId) {
      // Create customer first if not selected
      const customerData = {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || undefined,
      };
      createCustomerMutation.mutate(customerData, {
        onSuccess: (customer) => {
          // Generate problem description from selected problems
          const problemNames = selectedProblems.map((p) => p.name);
          const problemDescription = customDescription
            ? `${problemNames.join(", ")}. ${customDescription}`
            : problemNames.join(", ");
          const deviceData = {
            customerId: customer.id,
            locationId: currentLocation.id,
            deviceTypeId: data.deviceTypeId,
            brandId: data.brandId,
            modelId: data.modelId,
            serviceTypeId: data.serviceTypeId,
            serialNumber: data.serialNumber,
            problemDescription: problemDescription,
            customerNotes: data.customerNotes,
            status: data.status,
            priority: data.priority,
            totalCost:
              data.estimatedCost !== undefined && data.estimatedCost !== null
                ? String(data.estimatedCost)
                : "0",
            paymentStatus: "pending",
            receiptNumber: generateTrackingCode(crypto.randomUUID()), // Generate receipt number before device creation
          };
          createDeviceMutation.mutate(deviceData);
        },
      });
    } else {
      // Generate problem description from selected problems
      const problemNames = selectedProblems.map((p) => p.name);
      const problemDescription = customDescription
        ? `${problemNames.join(", ")}. ${customDescription}`
        : problemNames.join(", ");
      const deviceData = {
        customerId,
        locationId: currentLocation.id,
        deviceTypeId: data.deviceTypeId,
        brandId: data.brandId,
        modelId: data.modelId,
        serviceTypeId: data.serviceTypeId,
        serialNumber: data.serialNumber,
        problemDescription: problemDescription,
        customerNotes: data.customerNotes,
        status: data.status,
        priority: data.priority,
        totalCost:
          data.estimatedCost !== undefined && data.estimatedCost !== null
            ? String(data.estimatedCost)
            : "0",
        paymentStatus: "pending",
        receiptNumber: generateTrackingCode(crypto.randomUUID()), // Generate receipt number before device creation
      };
      createDeviceMutation.mutate(deviceData);
    }
  };
  const resetForm = () => {
    setRegisteredDevice(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowNewCustomerForm(false);
    setSelectedProblems([]);
    setCustomDescription("");
    deviceForm.reset();
    customerForm.reset();
    // Clear localStorage
    localStorage.removeItem("lastRegisteredDevice");
  };

  return (
    <PageLayout
      icon={ClipboardList}
      title="Device Registration"
      subtitle="Register new devices for repair services with automatic receipt generation"
      actions={
        currentLocation && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="text-sm">
              <span className="font-bold text-blue-900 dark:text-blue-100">
                {currentLocation?.name}
              </span>
              <span className="text-blue-700 dark:text-blue-400 ml-1 font-medium">
                ({currentLocation?.code})
              </span>
            </div>
          </div>
        )
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection - Enhanced */}
          <Card className="card-elevated border-0 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Customer Information</span>
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
                        id="customer-search"
                        name="customerSearch"
                        placeholder="Search by name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-9"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {customerSearch && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredCustomers.map((customer: any) => (
                        <div
                          key={customer.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-between"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-slate-100">
                              {customer.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                              {customer.phone}
                            </p>
                          </div>
                          <Button size="sm" variant="secondary">
                            Select
                          </Button>
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
                <div className="p-3 border rounded bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedCustomer.phone}
                      </p>
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
                  <form
                    onSubmit={customerForm.handleSubmit(onSubmitCustomer)}
                    className="space-y-4"
                  >
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
                            <Input
                              {...field}
                              type="email"
                              value={field.value || ""}
                            />
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
            <Card className="card-elevated border-0 dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Device Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...deviceForm}>
                  <form
                    onSubmit={(e) => {
                      deviceForm.handleSubmit(onSubmitDevice)(e);
                    }}
                    className="space-y-4"
                  >
                    {/* Section: Device Basics - Premium Enhanced */}
                    <div className="p-6 rounded-xl border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Device Basics</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Select device, brand, and service type
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={deviceForm.control}
                          name="deviceTypeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Device Type *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select device type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
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
                              <FormLabel>Brand</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
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
                              <FormLabel>Model (Optional)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
                                  {serviceTypes.map((service: any) => (
                                    <SelectItem
                                      key={service.id}
                                      value={service.id}
                                    >
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
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
                    </div>
                    {/* Section: Issues & Notes - Premium Enhanced */}
                    <div className="p-6 rounded-xl border-2 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                          <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Issues & Problems</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Select predefined problems and describe the issue
                          </p>
                        </div>
                      </div>
                      <PredefinedProblemsSelector
                        selectedProblems={selectedProblems}
                        onProblemsChange={setSelectedProblems}
                        customDescription={customDescription}
                        onCustomDescriptionChange={setCustomDescription}
                      />
                      {selectedProblems.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Please select at least one problem
                        </p>
                      )}
                    </div>

                    {/* Section: Pricing - Premium Enhanced */}
                    <div className="p-6 rounded-xl border-2 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Pricing & Cost</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Enter estimated cost and tax rate
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={deviceForm.control}
                          name="estimatedCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estimated Cost</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="h-11 text-base font-semibold"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deviceForm.control}
                          name="taxRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tax Rate (%)</FormLabel>
                              <Select
                                onValueChange={(v) =>
                                  field.onChange(parseFloat(v))
                                }
                                defaultValue={String(field.value ?? 0)}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select tax rate" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={4}>
                                  <SelectItem value="0">No Tax (0%)</SelectItem>
                                  <SelectItem value="2">Low Tax (2%)</SelectItem>
                                  <SelectItem value="10">Standard Tax (10%)</SelectItem>
                                  <SelectItem value="15">High Tax (15%)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Pricing Summary Card - Premium */}
                      {(() => {
                        const estimated =
                          deviceForm.watch("estimatedCost") || 0;
                        const rate = deviceForm.watch("taxRate") || 0;
                        const tax = estimated * (rate / 100);
                        const total = estimated + tax;
                        return (
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-800 shadow-lg">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-green-200 dark:border-green-800/50">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subtotal</span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {formatCurrency(estimated)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pb-2 border-b border-green-200 dark:border-green-800/50">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  Tax ({rate}%)
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {formatCurrency(tax)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-base font-bold text-green-700 dark:text-green-400">
                                  Total Amount
                                </span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                  {formatCurrency(total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {!selectedCustomer && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <h3 className="md:col-span-2 font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          New Customer Details
                        </h3>
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
                      className="w-full btn-primary py-6 text-lg font-bold shadow-xl hover:shadow-2xl"
                      disabled={createDeviceMutation.isPending}
                    >
                      {createDeviceMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Registering Device...
                        </>
                      ) : (
                        <>
                          <Printer className="h-5 w-5 mr-2" />
                          Register Device & Print Receipt
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden Receipt Template for Printing */}
      {registeredDevice && (
        <div className="hidden">
          <ReceiptTemplate ref={receiptRef} data={registeredDevice} />
        </div>
      )}
    </PageLayout>
  );
}
