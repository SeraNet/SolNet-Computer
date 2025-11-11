import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Filter,
  Target,
  UserCheck,
  Settings,
  Eye,
  Tag,
  UserPlus,
  UserMinus,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

// Customer Category Schema
const customerCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum([
    "religion",
    "location",
    "device_type",
    "spending_level",
    "activity_level",
    "age_group",
    "occupation",
    "custom",
  ]),
  criteria: z
    .object({
      religions: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      deviceTypes: z.array(z.string()).optional(),
      minSpending: z.number().optional(),
      maxSpending: z.number().optional(),
      lastVisitDays: z.number().optional(),
      ageMin: z.number().optional(),
      ageMax: z.number().optional(),
      occupations: z.array(z.string()).optional(),
      customTags: z.array(z.string()).optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  autoAssign: z.boolean().default(false),
});

type CustomerCategoryForm = z.infer<typeof customerCategorySchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  religion?: string;
  location?: string;
  deviceTypes?: string[];
  totalSpent: number;
  lastVisit: string;
  tags?: string[];
  age?: number;
  occupation?: string;
  categories?: string[];
  createdAt?: string;
  registrationDate?: string;
}

interface CustomerCategory {
  id: string;
  name: string;
  description?: string;
  type: string;
  criteria?: any;
  isActive: boolean;
  autoAssign: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Predefined category types and their options
const categoryTypeOptions = {
  religion: [
    "Muslim",
    "Christian",
    "Orthodox",
    "Catholic",
    "Protestant",
    "Other",
  ],
  location: [
    "Addis Ababa",
    "Dire Dawa",
    "Bahir Dar",
    "Mekelle",
    "Adama",
    "Hawassa",
    "Other",
  ],
  device_type: [
    "iPhone",
    "Samsung",
    "Huawei",
    "Xiaomi",
    "Other Android",
    "Feature Phone",
  ],
  spending_level: [
    "Low (0-500 ETB)",
    "Medium (500-2000 ETB)",
    "High (2000+ ETB)",
  ],
  activity_level: [
    "Very Active (Last 7 days)",
    "Active (Last 30 days)",
    "Inactive (30+ days)",
  ],
  age_group: ["18-25", "26-35", "36-45", "46-55", "55+"],
  occupation: [
    "Student",
    "Employee",
    "Business Owner",
    "Professional",
    "Other",
  ],
  custom: [],
};

// Predefined categories for quick setup
const predefinedCategories = [
  {
    name: "Muslim Customers",
    description: "All Muslim customers for religious occasions",
    type: "religion" as const,
    criteria: { religions: ["Muslim"] },
    autoAssign: true,
  },
  {
    name: "Christian Customers",
    description: "All Christian customers for religious occasions",
    type: "religion" as const,
    criteria: {
      religions: ["Christian", "Orthodox", "Catholic", "Protestant"],
    },
    autoAssign: true,
  },
  {
    name: "High Value Customers",
    description: "Customers who spent more than 2000 ETB",
    type: "spending_level" as const,
    criteria: { minSpending: 2000 },
    autoAssign: true,
  },
  {
    name: "Recent Customers",
    description: "Customers who visited in the last 30 days",
    type: "activity_level" as const,
    criteria: { lastVisitDays: 30 },
    autoAssign: true,
  },
  {
    name: "Addis Ababa Customers",
    description: "Customers located in Addis Ababa",
    type: "location" as const,
    criteria: { locations: ["Addis Ababa"] },
    autoAssign: true,
  },
  {
    name: "iPhone Users",
    description: "Customers using iPhone devices",
    type: "device_type" as const,
    criteria: { deviceTypes: ["iPhone"] },
    autoAssign: true,
  },
  {
    name: "Young Customers",
    description: "Customers aged 18-35",
    type: "age_group" as const,
    criteria: { ageMin: 18, ageMax: 35 },
    autoAssign: true,
  },
];

export function CustomerCategorization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] =
    useState<CustomerCategory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("religion");
  const [showCustomerManager, setShowCustomerManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch customers for categorization
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await apiRequest("/api/customers", "GET");
      return response as Customer[];
    },
  });

  // Fetch customer categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["customer-categories"],
    queryFn: async () => {
      const response = await apiRequest("/api/customer-categories", "GET");
      return response as CustomerCategory[];
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CustomerCategoryForm) => {
      return await apiRequest("/api/customer-categories", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });
      setShowCreateForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create customer category",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CustomerCategoryForm) => {
      return await apiRequest(
        `/api/customer-categories/${editingCategory?.id}`,
        "PUT",
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer category updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });
      setEditingCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update customer category",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest(
        `/api/customer-categories/${categoryId}`,
        "DELETE"
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete customer category",
        variant: "destructive",
      });
    },
  });

  // Auto-assign customers to categories
  const autoAssignMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/customer-categories/auto-assign", "POST");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customers automatically assigned to categories",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to auto-assign customers",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CustomerCategoryForm>({
    resolver: zodResolver(customerCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: "religion",
      criteria: {},
      isActive: true,
      autoAssign: false,
    },
  });

  const onSubmit = (data: CustomerCategoryForm) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: CustomerCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      type: category.type as any,
      criteria: category.criteria || {},
      isActive: category.isActive,
      autoAssign: category.autoAssign,
    });
    setSelectedType(category.type);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this customer category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setShowCreateForm(false);
    form.reset({
      name: "",
      description: "",
      type: "religion",
      criteria: {},
      isActive: true,
      autoAssign: false,
    });
  };

  const handleCreatePredefinedCategory = (
    predefinedCategory: (typeof predefinedCategories)[0]
  ) => {
    form.reset({
      name: predefinedCategory.name,
      description: predefinedCategory.description,
      type: predefinedCategory.type,
      criteria: predefinedCategory.criteria,
      isActive: true,
      autoAssign: predefinedCategory.autoAssign,
    });
    setSelectedType(predefinedCategory.type);
    setShowCreateForm(true);
  };

  const calculateMemberCount = (category: CustomerCategory) => {
    if (!customers) return 0;

    let filteredCustomers = [...customers];

    if (category.criteria) {
      const criteria = category.criteria;

      if (criteria.religions?.length) {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.religion && criteria.religions.includes(c.religion)
        );
      }

      if (criteria.locations?.length) {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.location && criteria.locations.includes(c.location)
        );
      }

      if (criteria.deviceTypes?.length) {
        filteredCustomers = filteredCustomers.filter(
          (c) =>
            c.deviceTypes &&
            c.deviceTypes.some((dt) => criteria.deviceTypes.includes(dt))
        );
      }

      if (criteria.minSpending) {
        filteredCustomers = filteredCustomers.filter(
          (c) => (c.totalSpent || 0) >= criteria.minSpending
        );
      }

      if (criteria.maxSpending) {
        filteredCustomers = filteredCustomers.filter(
          (c) => (c.totalSpent || 0) <= criteria.maxSpending
        );
      }

      if (criteria.lastVisitDays) {
        const cutoffDate = new Date(
          Date.now() - criteria.lastVisitDays * 24 * 60 * 60 * 1000
        );
        filteredCustomers = filteredCustomers.filter(
          (c) => c.lastVisit && new Date(c.lastVisit) > cutoffDate
        );
      }

      if (criteria.ageMin || criteria.ageMax) {
        filteredCustomers = filteredCustomers.filter((c) => {
          if (!c.age) return false;
          if (criteria.ageMin && c.age < criteria.ageMin) return false;
          if (criteria.ageMax && c.age > criteria.ageMax) return false;
          return true;
        });
      }

      if (criteria.occupations?.length) {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.occupation && criteria.occupations.includes(c.occupation)
        );
      }
    }

    return filteredCustomers.length;
  };

  if (customersLoading || categoriesLoading) {
    return <div>Loading customer categorization...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Customer Categorization
          </h2>
          <p className="text-muted-foreground">
            Organize customers into categories for targeted marketing and
            communication
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => autoAssignMutation.mutate()}
            variant="outline"
            disabled={autoAssignMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                autoAssignMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Auto-Assign
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create/Edit Form */}
        {(showCreateForm || editingCategory) && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </CardTitle>
                <CardDescription>
                  {editingCategory
                    ? "Edit your customer category"
                    : "Create a new customer category for better organization"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Category Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Muslim Customers"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedType(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="religion">
                                  Religion
                                </SelectItem>
                                <SelectItem value="location">
                                  Location
                                </SelectItem>
                                <SelectItem value="device_type">
                                  Device Type
                                </SelectItem>
                                <SelectItem value="spending_level">
                                  Spending Level
                                </SelectItem>
                                <SelectItem value="activity_level">
                                  Activity Level
                                </SelectItem>
                                <SelectItem value="age_group">
                                  Age Group
                                </SelectItem>
                                <SelectItem value="occupation">
                                  Occupation
                                </SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe this category (optional)"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Criteria based on type */}
                    {selectedType && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">
                          Categorization Criteria
                        </Label>

                        {selectedType === "religion" && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Select Religions
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {categoryTypeOptions.religion.map((religion) => (
                                <div
                                  key={religion}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    checked={form
                                      .watch("criteria.religions")
                                      ?.includes(religion)}
                                    onCheckedChange={(checked) => {
                                      const current =
                                        form.watch("criteria.religions") || [];
                                      if (checked) {
                                        form.setValue("criteria.religions", [
                                          ...current,
                                          religion,
                                        ]);
                                      } else {
                                        form.setValue(
                                          "criteria.religions",
                                          current.filter((r) => r !== religion)
                                        );
                                      }
                                    }}
                                  />
                                  <Label className="text-sm">{religion}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedType === "location" && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Select Locations
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {categoryTypeOptions.location.map((location) => (
                                <div
                                  key={location}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    checked={form
                                      .watch("criteria.locations")
                                      ?.includes(location)}
                                    onCheckedChange={(checked) => {
                                      const current =
                                        form.watch("criteria.locations") || [];
                                      if (checked) {
                                        form.setValue("criteria.locations", [
                                          ...current,
                                          location,
                                        ]);
                                      } else {
                                        form.setValue(
                                          "criteria.locations",
                                          current.filter((l) => l !== location)
                                        );
                                      }
                                    }}
                                  />
                                  <Label className="text-sm">{location}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedType === "spending_level" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="criteria.minSpending"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Minimum Spending (ETB)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="0"
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? Number(e.target.value)
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
                                control={form.control}
                                name="criteria.maxSpending"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Maximum Spending (ETB)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="No limit"
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? Number(e.target.value)
                                              : undefined
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {selectedType === "activity_level" && (
                          <FormField
                            control={form.control}
                            name="criteria.lastVisitDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Visit Within (Days)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="30"
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : undefined
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormDescription>
                                  Customers who visited within this many days
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {selectedType === "age_group" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="criteria.ageMin"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Minimum Age</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="18"
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? Number(e.target.value)
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
                                control={form.control}
                                name="criteria.ageMax"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Maximum Age</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="65"
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? Number(e.target.value)
                                              : undefined
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto-assign option */}
                    <FormField
                      control={form.control}
                      name="autoAssign"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto-assign customers</FormLabel>
                            <FormDescription>
                              Automatically assign customers to this category
                              based on criteria
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={
                          createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending
                        }
                        className="flex items-center gap-2"
                      >
                        {createCategoryMutation.isPending ||
                        updateCategoryMutation.isPending ? (
                          <>
                            <Save className="h-4 w-4 animate-spin" />
                            {editingCategory ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {editingCategory
                              ? "Update Category"
                              : "Create Category"}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Predefined Categories */}
        {!showCreateForm && !editingCategory && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Setup Categories
                </CardTitle>
                <CardDescription>
                  Create common customer categories with one click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedCategories.map((category, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleCreatePredefinedCategory(category)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {category.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Plus className="h-3 w-3 mr-2" />
                          Create This Category
                        </Button>
                        {category.autoAssign && (
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Your Categories
              </CardTitle>
              <CardDescription>
                {categories?.length || 0} customer categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories?.map((category) => (
                  <div key={category.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">
                      {calculateMemberCount(category)} members • {category.type}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No categories yet. Create your first category!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
