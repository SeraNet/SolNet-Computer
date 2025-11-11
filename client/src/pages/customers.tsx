import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { ImportExportControls } from "@/components/import-export";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  History,
  Edit,
  Wrench,
  ShoppingCart,
  FileText,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
  registrationDate: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { searchInfo, getHighlightClass, scrollToHighlighted } =
    useSearchHighlight();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      registrationDate: "",
    },
  });

  const editForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const { data: customers = [], isLoading } = useQuery<any[]>({
    queryKey: ["customers"],
  });

  const { data: customerDevices = [] } = useQuery<any[]>({
    queryKey: ["customers", selectedCustomer?.id, "devices"],
    enabled: !!selectedCustomer,
  });

  const { data: customerSales = [] } = useQuery<any[]>({
    queryKey: ["customers", selectedCustomer?.id, "sales"],
    enabled: !!selectedCustomer,
  });

  const { data: customerLoanInvoices = [] } = useQuery<any[]>({
    queryKey: ["customers", selectedCustomer?.id, "loan-invoices"],
    enabled: !!selectedCustomer,
  });

  const { data: customerAppointments = [] } = useQuery<any[]>({
    queryKey: ["customers", selectedCustomer?.id, "appointments"],
    enabled: !!selectedCustomer,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      return apiRequest("/api/customers", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      return apiRequest(`/api/customers/${selectedCustomer.id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(
    (customer: any) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onAddSubmit = (data: CustomerForm) => {
    addCustomerMutation.mutate(data);
  };

  const onEditSubmit = (data: CustomerForm) => {
    updateCustomerMutation.mutate(data);
  };

  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    editForm.reset({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
      registrationDate: customer.registrationDate || "",
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      registered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      diagnosed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      waiting_parts: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      ready_for_pickup: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      delivered: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  const getCustomerStats = (customer: any) => {
    const totalDevices = customerDevices.length;
    const activeRepairs = customerDevices.filter((d: any) =>
      ["in-progress", "pending", "in_progress"].includes(d.status)
    ).length;
    const completedRepairs = customerDevices.filter((d: any) =>
      ["completed", "delivered"].includes(d.status)
    ).length;
    const totalSales = customerSales.length;
    const totalSalesAmount = customerSales.reduce(
      (sum: number, sale: any) => sum + Number(sale.totalAmount || 0),
      0
    );
    const totalLoanInvoices = customerLoanInvoices.length;
    const outstandingLoans = customerLoanInvoices.filter(
      (invoice: any) => Number(invoice.remainingAmount || 0) > 0
    ).length;
    const totalOutstandingAmount = customerLoanInvoices.reduce(
      (sum: number, invoice: any) => sum + Number(invoice.remainingAmount || 0),
      0
    );
    const totalAppointments = customerAppointments.length;

    return {
      totalDevices,
      activeRepairs,
      completedRepairs,
      totalSales,
      totalSalesAmount,
      totalLoanInvoices,
      outstandingLoans,
      totalOutstandingAmount,
      totalAppointments,
    };
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
    const newThisMonth = customers.filter((c: any) => {
      const created = new Date(c.registrationDate || c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const pendingPickups = customers.filter((c: any) => c.status === 'ready_for_pickup').length;
    
    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      pendingPickups
    };
  }, [customers]);

  return (
    <PageLayout
      title="Customer Management"
      subtitle="Manage customer information, track relationships, and view comprehensive history"
      icon={Users}
      actions={
        <div className="flex gap-3">
            <ImportExportControls entity="customers" />
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+251 9XX XXX XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Customer address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Registration date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addCustomerMutation.isPending}
                      variant="default"
                    >
                      {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Search Highlight Banner */}
      {searchInfo && searchInfo.searchType === "customer" && (
        <div className="notification-info mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                Showing search result:{" "}
                <strong>{searchInfo.searchTitle}</strong>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="card-elevated bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/60 dark:border-blue-800/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {summaryStats.totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30 border-green-200/60 dark:border-green-800/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Active Customers
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {summaryStats.activeCustomers}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border-orange-200/60 dark:border-orange-800/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                  New This Month
                </p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {summaryStats.newThisMonth}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 border-purple-200/60 dark:border-purple-800/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Pending Pickups
                </p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {summaryStats.pendingPickups}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Search */}
      <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="card-elevated">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCustomers.length === 0 ? (
          <Card className="card-elevated">
              <CardContent className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No customers found</p>
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer: any) => (
              <Card
                key={customer.id}
              className={`card-elevated group hover:shadow-lg transition-all duration-300 ${getHighlightClass(
                  customer,
                  "customer"
                )}`}
                data-highlighted={
                  searchInfo?.searchType === "customer" &&
                  searchInfo?.searchId === customer.id
                }
              onClick={() => {
                if (searchInfo?.searchType === "customer") {
                    scrollToHighlighted(customer, "customer");
                  }
                }}
              >
                <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                        </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                            {customer.name}
                          </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {customer.email}
                          </p>
                        </div>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                        </div>
                        {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                      </div>

                      {customer.notes && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                            {customer.notes}
                          </p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      {getStatusBadge(customer.status || "registered")}
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        Registered: {new Date(customer.registrationDate || customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                      <History className="w-4 h-4 mr-1" />
                      View Details
                          </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(customer)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
          ))
                                          )}
                                        </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                                          </div>
                {selectedCustomer.name}
              </DialogTitle>
            </DialogHeader>

                          <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-slate-100">{selectedCustomer.email}</span>
                                </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-slate-100">{selectedCustomer.phone}</span>
                                </div>
                      {selectedCustomer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-100">{selectedCustomer.address}</span>
                                  </div>
                                )}
                      {selectedCustomer.notes && (
                        <div className="pt-2">
                          <Label className="text-sm font-medium">Notes</Label>
                          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            {selectedCustomer.notes}
                                    </p>
                                  </div>
                                )}
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                              {(() => {
                          const stats = getCustomerStats(selectedCustomer);
                                return (
                            <>
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats.totalDevices}
                                    </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Devices</div>
                                    </div>
                              <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {stats.totalSales}
                                    </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Sales</div>
                                  </div>
                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                  {stats.activeRepairs}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Active Repairs</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {stats.totalAppointments}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Appointments</div>
                              </div>
                            </>
                                );
                              })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                            </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Wrench className="w-5 h-5" />
                      Customer Devices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                                {customerDevices.length === 0 ? (
                      <p className="text-gray-500 dark:text-slate-400 text-center py-8">
                        No devices found for this customer
                                  </p>
                                ) : (
                      <div className="space-y-4">
                        {customerDevices.map((device: any) => (
                          <div
                            key={device.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-slate-100">
                                {device.deviceName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {device.deviceType} • {device.brand}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                                      {getStatusBadge(device.status)}
                                    </div>
                              </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                            </TabsContent>

                            <TabsContent value="sales" className="space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <ShoppingCart className="w-5 h-5" />
                      Sales History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                                {customerSales.length === 0 ? (
                      <p className="text-gray-500 dark:text-slate-400 text-center py-8">
                        No sales found for this customer
                                  </p>
                                ) : (
                      <div className="space-y-4">
                        {customerSales.map((sale: any) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-slate-100">
                                Sale #{sale.id}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {new Date(sale.saleDate).toLocaleDateString()}
                              </p>
                            </div>
                                      <div className="text-right">
                              <div className="font-semibold text-gray-900 dark:text-slate-100">
                                {formatCurrency(sale.totalAmount)}
                                      </div>
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                {sale.paymentMethod}
                                    </div>
                              </div>
                                      </div>
                        ))}
                                      </div>
                                )}
                  </CardContent>
                </Card>
                            </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Calendar className="w-5 h-5" />
                      Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                                {customerAppointments.length === 0 ? (
                      <p className="text-gray-500 dark:text-slate-400 text-center py-8">
                        No appointments found for this customer
                                  </p>
                                ) : (
                      <div className="space-y-4">
                        {customerAppointments.map((appointment: any) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-slate-100">
                                {appointment.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                          {appointment.status}
                                      </div>
                              </div>
                    </div>
                        ))}
                  </div>
                    )}
                </CardContent>
              </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
          )}

        {/* Edit Customer Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Customer address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="registrationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Registration date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCustomerMutation.isPending}
                  >
                    {updateCustomerMutation.isPending
                      ? "Updating..."
                      : "Update Customer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </PageLayout>
  );
}