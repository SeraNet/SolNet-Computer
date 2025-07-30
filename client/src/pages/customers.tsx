import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, User, Phone, Mail, MapPin, History, Edit } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    },
  });

  const editForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: customerDevices = [] } = useQuery({
    queryKey: ["/api/customers", selectedCustomer?.id, "devices"],
    enabled: !!selectedCustomer,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      return apiRequest("/api/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
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
      return apiRequest(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
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

  const filteredCustomers = customers.filter((customer: any) =>
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
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      registered: "bg-blue-100 text-blue-800",
      diagnosed: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      waiting_parts: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      ready_for_pickup: "bg-emerald-100 text-emerald-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">Manage customer information and history</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                        <Input type="email" placeholder="email@example.com" {...field} />
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
                        <Input placeholder="Phone number" {...field} />
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCustomerMutation.isPending}>
                    {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No customers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>
                    {customer.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm mt-1">{customer.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Customer History - {customer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-500">Email</Label>
                              <p className="font-medium">{customer.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Phone</Label>
                              <p className="font-medium">{customer.phone}</p>
                            </div>
                            {customer.address && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Address</Label>
                                <p className="font-medium">{customer.address}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Device History</h4>
                            <div className="space-y-2">
                              {customerDevices.length === 0 ? (
                                <p className="text-gray-500 text-sm">No devices registered</p>
                              ) : (
                                customerDevices.map((device: any) => (
                                  <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                      <p className="font-medium">{device.deviceType} - {device.brand} {device.model}</p>
                                      <p className="text-sm text-gray-500">{device.reportedIssue}</p>
                                      <p className="text-xs text-gray-400">
                                        Registered: {new Date(device.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {getStatusBadge(device.status)}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
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
                      <Input type="email" placeholder="email@example.com" {...field} />
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCustomerMutation.isPending}>
                  {updateCustomerMutation.isPending ? "Updating..." : "Update Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
