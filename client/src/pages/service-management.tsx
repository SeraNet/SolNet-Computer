import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Settings,
  Monitor,
  Tag,
  Wrench,
  Edit,
  Trash2,
} from "lucide-react";

const deviceTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brandId: z.string().min(1, "Brand is required"),
  specifications: z.string().optional(),
});

const serviceTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Base price must be positive"),
  estimatedDuration: z.number().min(1, "Duration must be at least 1 hour"),
});

type DeviceTypeForm = z.infer<typeof deviceTypeSchema>;
type BrandForm = z.infer<typeof brandSchema>;
type ModelForm = z.infer<typeof modelSchema>;
type ServiceTypeForm = z.infer<typeof serviceTypeSchema>;

export default function ServiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("device-types");
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Queries
  const { data: deviceTypes = [], isLoading: loadingDeviceTypes } = useQuery<any[]>({
    queryKey: ["/api/device-types"],
  });

  const { data: brands = [], isLoading: loadingBrands } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  const { data: models = [], isLoading: loadingModels } = useQuery<any[]>({
    queryKey: ["/api/models"],
  });

  const { data: serviceTypes = [], isLoading: loadingServiceTypes } = useQuery<any[]>({
    queryKey: ["/api/service-types"],
  });

  // Forms
  const deviceTypeForm = useForm<DeviceTypeForm>({
    resolver: zodResolver(deviceTypeSchema),
    defaultValues: { name: "", description: "" },
  });

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", description: "" },
  });

  const modelForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: { name: "", brandId: "", specifications: "" },
  });

  const serviceTypeForm = useForm<ServiceTypeForm>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: { name: "", description: "", basePrice: 0, estimatedDuration: 1 },
  });

  // Mutations for Device Types
  const addDeviceTypeMutation = useMutation({
    mutationFn: async (data: DeviceTypeForm) => {
      const response = await apiRequest("POST", "/api/device-types", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Device Type Added", description: "Device type has been added successfully." });
      deviceTypeForm.reset();
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutations for Brands
  const addBrandMutation = useMutation({
    mutationFn: async (data: BrandForm) => {
      const response = await apiRequest("POST", "/api/brands", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Brand Added", description: "Brand has been added successfully." });
      brandForm.reset();
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutations for Models
  const addModelMutation = useMutation({
    mutationFn: async (data: ModelForm) => {
      const response = await apiRequest("POST", "/api/models", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Model Added", description: "Model has been added successfully." });
      modelForm.reset();
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutations for Service Types
  const addServiceTypeMutation = useMutation({
    mutationFn: async (data: ServiceTypeForm) => {
      const response = await apiRequest("POST", "/api/service-types", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Service Type Added", description: "Service type has been added successfully." });
      serviceTypeForm.reset();
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/service-types"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getCurrentForm = () => {
    switch (activeTab) {
      case "device-types": return deviceTypeForm;
      case "brands": return brandForm;
      case "models": return modelForm;
      case "service-types": return serviceTypeForm;
      default: return deviceTypeForm;
    }
  };

  const getCurrentMutation = () => {
    switch (activeTab) {
      case "device-types": return addDeviceTypeMutation;
      case "brands": return addBrandMutation;
      case "models": return addModelMutation;
      case "service-types": return addServiceTypeMutation;
      default: return addDeviceTypeMutation;
    }
  };

  const resetForm = () => {
    deviceTypeForm.reset();
    brandForm.reset();
    modelForm.reset();
    serviceTypeForm.reset();
    setEditingItem(null);
  };

  const handleSubmit = (data: any) => {
    getCurrentMutation().mutate(data);
  };

  const renderDeviceTypesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Manage device types for your repair services</CardDescription>
          </div>
          <Dialog open={showDialog && activeTab === "device-types"} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device Type</DialogTitle>
                <DialogDescription>Add a new device type to your service catalog</DialogDescription>
              </DialogHeader>
              <Form {...deviceTypeForm}>
                <form onSubmit={deviceTypeForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={deviceTypeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device type name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deviceTypeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addDeviceTypeMutation.isPending}>
                      Add Device Type
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loadingDeviceTypes ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceTypes.map((type: any) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderBrandsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Manage device brands for your repair services</CardDescription>
          </div>
          <Dialog open={showDialog && activeTab === "brands"} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>Add a new brand to your service catalog</DialogDescription>
              </DialogHeader>
              <Form {...brandForm}>
                <form onSubmit={brandForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={brandForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addBrandMutation.isPending}>
                      Add Brand
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loadingBrands ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand: any) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderModelsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Models</CardTitle>
            <CardDescription>Manage device models for your repair services</CardDescription>
          </div>
          <Dialog open={showDialog && activeTab === "models"} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Model</DialogTitle>
                <DialogDescription>Add a new model to your service catalog</DialogDescription>
              </DialogHeader>
              <Form {...modelForm}>
                <form onSubmit={modelForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={modelForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter model name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={modelForm.control}
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
                  <FormField
                    control={modelForm.control}
                    name="specifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specifications (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter specifications" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addModelMutation.isPending}>
                      Add Model
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loadingModels ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model: any) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {brands.find((b: any) => b.id === model.brandId)?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{model.specifications || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderServiceTypesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Types</CardTitle>
            <CardDescription>Manage service types and pricing for your repair services</CardDescription>
          </div>
          <Dialog open={showDialog && activeTab === "service-types"} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service Type</DialogTitle>
                <DialogDescription>Add a new service type to your catalog</DialogDescription>
              </DialogHeader>
              <Form {...serviceTypeForm}>
                <form onSubmit={serviceTypeForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={serviceTypeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter service type name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={serviceTypeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serviceTypeForm.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={serviceTypeForm.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (hours)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addServiceTypeMutation.isPending}>
                      Add Service Type
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loadingServiceTypes ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.map((service: any) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.description || "—"}</TableCell>
                  <TableCell>${service.basePrice?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{service.estimatedDuration} hours</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500 mt-2">Manage device types, brands, models, and service types</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="device-types" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Device Types
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Brands
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="service-types" className="flex items-center gap-2">
            <Tool className="h-4 w-4" />
            Service Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="device-types" className="space-y-6">
          {renderDeviceTypesTab()}
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          {renderBrandsTab()}
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {renderModelsTab()}
        </TabsContent>

        <TabsContent value="service-types" className="space-y-6">
          {renderServiceTypesTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}