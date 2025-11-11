import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { CategoryManager } from "@/components/category-manager";
import PredefinedProblemsManager from "@/components/predefined-problems-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Package,
  Wrench,
  Clock,
  Eye,
  EyeOff,
  Star,
  Award,
  Shield,
  Zap,
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  SortAsc,
  SortDesc,
  Info,
  Lightbulb,
  Activity,
  Bell,
  Download,
  Save,
  Copy,
  Share2,
  Archive,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Receipt,
  Building,
  Smartphone,
  Repeat,
  AlertCircle,
  CheckSquare,
  Square,
  Tag,
  Heart,
  Trophy,
  MessageCircle,
  Smile,
  Frown,
  Meh,
  Filter,
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Globe,
  RefreshCw,
  MapPin as Location,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Service Type Schema
const serviceTypeSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  estimatedDuration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
  basePrice: z.number().min(0, "Price must be 0 or greater").optional(),
  isPublic: z.boolean().default(true),
  features: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  warranty: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});
type ServiceTypeForm = z.infer<typeof serviceTypeSchema>;
// Brand Schema
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});
// Model Schema
const modelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  brandId: z.string().min(1, "Brand is required"),
  deviceTypeId: z.string().min(1, "Device type is required"),
  description: z.string().optional(),
  specifications: z.string().optional(),
  releaseYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
});
// Device Type Schema
const deviceTypeSchema = z.object({
  name: z.string().min(1, "Device type name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});
type BrandForm = z.infer<typeof brandSchema>;
type ModelForm = z.infer<typeof modelSchema>;
type DeviceTypeForm = z.infer<typeof deviceTypeSchema>;
// We'll fetch categories from the API instead of hardcoding them
export default function ServiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { searchInfo, getHighlightClass } = useSearchHighlight();
  const { user } = useAuth();

  // Enhanced state management
  const [activeTab, setActiveTab] = useState("services");
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryManagerType, setCategoryManagerType] =
    useState<"service">("service");
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isDeviceTypeDialogOpen, setIsDeviceTypeDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [editingDeviceType, setEditingDeviceType] = useState<any>(null);

  // Enhanced state for better UX
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "duration" | "category" | "status"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showInsights, setShowInsights] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours' | 'days' | 'months'>('minutes');
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "info" | "warning" | "success" | "error";
      message: string;
      timestamp: Date;
    }>
  >([]);
  // Queries
  const { data: services = [], isLoading: servicesLoading } = useQuery<any[]>({
    queryKey: ["service-types"],
    queryFn: () => apiRequest("/api/service-types", "GET"),
  });

  // Services loaded and cached by React Query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<
    any[]
  >({
    queryKey: ["categories"],
    queryFn: () => apiRequest("/api/categories", "GET"),
  });
  const { data: brands = [], isLoading: brandsLoading } = useQuery<any[]>({
    queryKey: ["brands"],
    queryFn: () => apiRequest("/api/brands", "GET"),
  });
  const { data: models = [], isLoading: modelsLoading } = useQuery<any[]>({
    queryKey: ["models"],
    queryFn: () => apiRequest("/api/models", "GET"),
  });
  const { data: deviceTypes = [], isLoading: deviceTypesLoading } = useQuery<
    any[]
  >({
    queryKey: ["device-types"],
    queryFn: () => apiRequest("/api/device-types", "GET"),
  });

  // Enhanced helper functions
  const addNotification = (
    type: "info" | "warning" | "success" | "error",
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification].slice(-5)); // Keep last 5

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const calculateServiceStats = () => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.isActive).length;
    const publicServices = services.filter((s) => s.isPublic).length;

    // Enhanced average price calculation with better handling
    const servicesWithPrice = services.filter(
      (s) => s.basePrice && s.basePrice > 0
    );
    const averagePrice =
      servicesWithPrice.length > 0
        ? servicesWithPrice.reduce(
            (sum, service) => sum + Number(service.basePrice),
            0
          ) / servicesWithPrice.length
        : 0;

    const totalValue = services.reduce(
      (sum, service) => sum + Number(service.basePrice || 0),
      0
    );
    const categoriesCount = new Set(services.map((s) => s.category)).size;

    return {
      totalServices,
      activeServices,
      publicServices,
      servicesWithPrice: servicesWithPrice.length,
      averagePrice,
      totalValue,
      categoriesCount,
      activeRate:
        totalServices > 0 ? (activeServices / totalServices) * 100 : 0,
      publicRate:
        totalServices > 0 ? (publicServices / totalServices) * 100 : 0,
    };
  };

  const getServiceStatus = (service: any) => {
    if (!service.isActive) {
      return {
        status: "inactive",
        color: "text-red-600",
        icon: <X className="h-4 w-4" />,
      };
    }
    if (!service.isPublic) {
      return {
        status: "private",
        color: "text-yellow-600",
        icon: <EyeOff className="h-4 w-4" />,
      };
    }
    return {
      status: "active",
      color: "text-green-600",
      icon: <CheckCircle className="h-4 w-4" />,
    };
  };

  const getServiceIcon = (service: any) => {
    const name = service.name?.toLowerCase() || "";
    if (name.includes("repair")) return <Wrench className="h-4 w-4" />;
    if (name.includes("maintenance")) return <Settings className="h-4 w-4" />;
    if (name.includes("installation")) return <Building className="h-4 w-4" />;
    if (name.includes("consultation"))
      return <MessageCircle className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const getServicePriority = (service: any) => {
    const price = service.basePrice || 0;
    const duration = service.estimatedDuration || 0;

    if (price > 100 && duration > 120)
      return {
        priority: "premium",
        color: "text-purple-600",
        icon: <Trophy className="h-4 w-4" />,
      };
    if (price > 50)
      return {
        priority: "standard",
        color: "text-blue-600",
        icon: <Star className="h-4 w-4" />,
      };
    return {
      priority: "basic",
      color: "text-gray-600",
      icon: <Package className="h-4 w-4" />,
    };
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || "";
    if (categoryLower.includes("repair"))
      return <Wrench className="h-4 w-4 text-orange-600" />;
    if (categoryLower.includes("maintenance"))
      return <Settings className="h-4 w-4 text-blue-600" />;
    if (categoryLower.includes("installation"))
      return <Building className="h-4 w-4 text-green-600" />;
    if (categoryLower.includes("consultation"))
      return <MessageCircle className="h-4 w-4 text-purple-600" />;
    if (categoryLower.includes("diagnostic"))
      return <Activity className="h-4 w-4 text-red-600" />;
    return <Package className="h-4 w-4 text-gray-600" />;
  };

  // Format duration in minutes to human-readable format
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return '0 min';
    
    const months = Math.floor(minutes / (30 * 24 * 60)); // Approximate month as 30 days
    const days = Math.floor((minutes % (30 * 24 * 60)) / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;

    const parts: string[] = [];
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
    if (mins > 0) parts.push(`${mins} min`);

    return parts.join(' ') || '0 min';
  };

  // Detect the most appropriate unit for a given duration in minutes
  const detectDurationUnit = (minutes: number) => {
    if (!minutes || minutes === 0) return { unit: 'minutes', value: 0 };
    
    // Check if it's a clean month (30 days)
    if (minutes % (30 * 24 * 60) === 0) {
      const months = minutes / (30 * 24 * 60);
      if (months >= 1 && Number.isInteger(months)) {
        return { unit: 'months', value: months };
      }
    }
    
    // Check if it's a clean day
    if (minutes % (24 * 60) === 0) {
      const days = minutes / (24 * 60);
      if (days >= 1 && Number.isInteger(days)) {
        return { unit: 'days', value: days };
      }
    }
    
    // Check if it's a clean hour
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      if (hours >= 1 && Number.isInteger(hours)) {
        return { unit: 'hours', value: hours };
      }
    }
    
    // Default to minutes
    return { unit: 'minutes', value: minutes };
  };

  // Handle search navigation - switch to correct tab
  useEffect(() => {
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
      // Clear the tab parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("tab");
      window.history.replaceState({}, "", newUrl.toString());
    } else if (searchInfo) {
      if (searchInfo.searchType === "brand") {
        setActiveTab("brands");
      } else if (searchInfo.searchType === "model") {
        setActiveTab("models");
      } else if (searchInfo.searchType === "service") {
        setActiveTab("services");
      }
    }
  }, [searchInfo]);
  // Use all categories for services (no type filtering needed)
  const serviceCategories = categories;

  // Filter and sort services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !searchTerm ||
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive) ||
      (statusFilter === "public" && service.isPublic) ||
      (statusFilter === "private" && !service.isPublic);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort services based on selected criteria
  const sortedServices = [...filteredServices].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = (a.name || "").localeCompare(b.name || "");
        break;
      case "price":
        comparison = (a.basePrice || 0) - (b.basePrice || 0);
        break;
      case "duration":
        comparison = (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        break;
      case "category":
        comparison = (a.category || "").localeCompare(b.category || "");
        break;
      case "status":
        const aActive = a.isActive ? 1 : 0;
        const bActive = b.isActive ? 1 : 0;
        comparison = aActive - bActive;
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
  // Service Type Form
  const serviceForm = useForm<ServiceTypeForm>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "General",
      estimatedDuration: 0,
      basePrice: 0,
      isPublic: true,
      features: [],
      requirements: [],
      warranty: "",
      isActive: true,
      sortOrder: 0,
    },
  });
  // Brand Form
  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
    },
  });
  // Model Form
  const modelForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: "",
      brandId: "",
      deviceTypeId: "",
      description: "",
      specifications: "",
      releaseYear: 0,
    },
  });
  // Device Type Form
  const deviceTypeForm = useForm<DeviceTypeForm>({
    resolver: zodResolver(deviceTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "General",
    },
  });
  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/service-types", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["public", "services"] });
      toast({
        title: "Success",
        description: "Service type created successfully",
      });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create service type",
        variant: "destructive",
      });
    },
  });
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/service-types/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["public", "services"] });
      toast({
        title: "Success",
        description: "Service type updated successfully",
      });
      setIsServiceDialogOpen(false);
      setEditingService(null);
      serviceForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update service type",
        variant: "destructive",
      });
    },
  });
  const togglePublicMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      apiRequest(`/api/service-types/${id}`, "PUT", { isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["public", "services"] });
      toast({
        title: "Success",
        description: "Service visibility updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service visibility",
        variant: "destructive",
      });
    },
  });
  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/service-types/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["public", "services"] });
      toast({
        title: "Success",
        description: "Service type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service type",
        variant: "destructive",
      });
    },
  });
  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; type: "service" | "accessory" }) =>
      apiRequest("/api/categories", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiRequest(`/api/categories/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });
  // Brand mutations
  const createBrandMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      website?: string;
    }) => apiRequest("/api/brands", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      setIsBrandDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    },
  });
  const updateBrandMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string; website?: string };
    }) => apiRequest(`/api/brands/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
      setIsBrandDialogOpen(false);
      setEditingBrand(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update brand",
        variant: "destructive",
      });
    },
  });
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/brands/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete brand",
        variant: "destructive",
      });
    },
  });
  // Model mutations
  const createModelMutation = useMutation({
    mutationFn: (data: {
      name: string;
      brandId: string;
      deviceTypeId: string;
      description?: string;
      specifications?: string;
      releaseYear?: number;
    }) => apiRequest("/api/models", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Success",
        description: "Model created successfully",
      });
      setIsModelDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create model",
        variant: "destructive",
      });
    },
  });
  const updateModelMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        brandId: string;
        deviceTypeId: string;
        description?: string;
        specifications?: string;
        releaseYear?: number;
      };
    }) => apiRequest(`/api/models/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Success",
        description: "Model updated successfully",
      });
      setIsModelDialogOpen(false);
      setEditingModel(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update model",
        variant: "destructive",
      });
    },
  });
  const deleteModelMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/models/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete model",
        variant: "destructive",
      });
    },
  });
  // Device type mutations
  const createDeviceTypeMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      category: string;
    }) => apiRequest("/api/device-types", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-types"] });
      toast({
        title: "Success",
        description: "Device type created successfully",
      });
      setIsDeviceTypeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create device type",
        variant: "destructive",
      });
    },
  });
  const updateDeviceTypeMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string; category: string };
    }) => apiRequest(`/api/device-types/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-types"] });
      toast({
        title: "Success",
        description: "Device type updated successfully",
      });
      setIsDeviceTypeDialogOpen(false);
      setEditingDeviceType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device type",
        variant: "destructive",
      });
    },
  });
  const deleteDeviceTypeMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/device-types/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-types"] });
      toast({
        title: "Success",
        description: "Device type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete device type",
        variant: "destructive",
      });
    },
  });
  // Handlers
  const handleServiceSubmit = (data: ServiceTypeForm) => {
    // Convert duration to minutes based on selected unit
    let durationInMinutes = data.estimatedDuration || 0;
    if (durationInMinutes > 0) {
      switch (durationUnit) {
        case 'hours':
          durationInMinutes = durationInMinutes * 60;
          break;
        case 'days':
          durationInMinutes = durationInMinutes * 24 * 60;
          break;
        case 'months':
          durationInMinutes = durationInMinutes * 30 * 24 * 60; // Approximate month as 30 days
          break;
        case 'minutes':
        default:
          // Already in minutes
          break;
      }
    }

    // Convert 0 values to undefined for optional fields and ensure proper types
    const submitData = {
      ...data,
      estimatedDuration: durationInMinutes === 0 ? undefined : durationInMinutes,
      basePrice: data.basePrice === 0 ? undefined : data.basePrice?.toString(),
      sortOrder: data.sortOrder,
    };

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        data: submitData as any,
      });
    } else {
      createServiceMutation.mutate(submitData as any);
    }
  };
  const handleBrandSubmit = (data: BrandForm) => {
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data });
    } else {
      createBrandMutation.mutate(data);
    }
  };
  const handleModelSubmit = (data: ModelForm) => {
    // Convert 0 values to undefined for optional fields
    const submitData = {
      ...data,
      releaseYear: data.releaseYear === 0 ? undefined : data.releaseYear,
    };

    if (editingModel) {
      updateModelMutation.mutate({ id: editingModel.id, data: submitData });
    } else {
      createModelMutation.mutate(submitData);
    }
  };
  const handleDeviceTypeSubmit = (data: DeviceTypeForm) => {
    if (editingDeviceType) {
      updateDeviceTypeMutation.mutate({ id: editingDeviceType.id, data });
    } else {
      createDeviceTypeMutation.mutate(data);
    }
  };

  // Force refresh service types data
  const handleRefreshServices = () => {
    queryClient.invalidateQueries({ queryKey: ["service-types"] });
    queryClient.refetchQueries({ queryKey: ["service-types"] });
  };

  // Toggle public visibility
  const handleTogglePublic = (service: any) => {
    togglePublicMutation.mutate({
      id: service.id,
      isPublic: !service.isPublic,
    });
  };
  const openServiceDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      
      // Detect the most appropriate unit for the stored duration
      const detectedUnit = detectDurationUnit(service.estimatedDuration || 0);
      
      serviceForm.reset({
        name: service.name,
        description: service.description || "",
        category: service.category || "General",
        estimatedDuration: detectedUnit.value,
        basePrice: service.basePrice ? Number(service.basePrice) : 0,
        isPublic: service.isPublic,
        features:
          typeof service.features === "string"
            ? JSON.parse(service.features || "[]")
            : service.features || [],
        requirements:
          typeof service.requirements === "string"
            ? JSON.parse(service.requirements || "[]")
            : service.requirements || [],
        warranty: service.warranty || "",
        isActive: service.isActive,
        sortOrder: service.sortOrder || 0,
      });
      setDurationUnit(detectedUnit.unit as 'minutes' | 'hours' | 'days' | 'months');
    } else {
      setEditingService(null);
      serviceForm.reset();
      setDurationUnit('minutes'); // Reset to minutes when creating new
    }
    setIsServiceDialogOpen(true);
  };
  const handleDeleteService = (id: string) => {
    if (confirm("Are you sure you want to delete this service type?")) {
      deleteServiceMutation.mutate(id);
    }
  };
  const openBrandDialog = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
      brandForm.reset({
        name: brand.name,
        description: brand.description || "",
        website: brand.website || "",
      });
    } else {
      setEditingBrand(null);
      brandForm.reset();
    }
    setIsBrandDialogOpen(true);
  };
  const handleDeleteBrand = (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteBrandMutation.mutate(id);
    }
  };
  const openModelDialog = (model?: any) => {
    if (model) {
      setEditingModel(model);
      modelForm.reset({
        name: model.name,
        brandId: model.brandId,
        deviceTypeId: model.deviceTypeId,
        description: model.description || "",
        specifications: model.specifications || "",
        releaseYear: model.releaseYear || 0,
      });
    } else {
      setEditingModel(null);
      modelForm.reset();
    }
    setIsModelDialogOpen(true);
  };
  const handleDeleteModel = (id: string) => {
    if (confirm("Are you sure you want to delete this model?")) {
      deleteModelMutation.mutate(id);
    }
  };
  const openDeviceTypeDialog = (deviceType?: any) => {
    if (deviceType) {
      setEditingDeviceType(deviceType);
      deviceTypeForm.reset({
        name: deviceType.name,
        description: deviceType.description || "",
        category: deviceType.category || "General",
      });
    } else {
      setEditingDeviceType(null);
      deviceTypeForm.reset();
    }
    setIsDeviceTypeDialogOpen(true);
  };
  const handleDeleteDeviceType = (id: string) => {
    if (confirm("Are you sure you want to delete this device type?")) {
      deleteDeviceTypeMutation.mutate(id);
    }
  };
  // Category management handlers
  const openCategoryManager = (type: "service") => {
    setCategoryManagerType(type);
    setShowCategoryManager(true);
  };
  const handleAddCategory = (name: string, type: "service" | "accessory") => {
    createCategoryMutation.mutate({ name, type });
  };
  const handleUpdateCategory = (id: string, name: string) => {
    updateCategoryMutation.mutate({ id, data: { name } });
  };
  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  return (
    <TooltipProvider>
      <PageLayout
        title="Service Management Hub"
        subtitle="Comprehensive service management with intelligent insights and analytics"
        icon={Settings}
      >
        {/* Search Highlight Banner */}
        {searchInfo &&
          (searchInfo.searchType === "brand" ||
            searchInfo.searchType === "model" ||
            searchInfo.searchType === "service") && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-300">
                    Showing search result:{" "}
                    <strong>{searchInfo.searchTitle}</strong> (
                    {searchInfo.searchType})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

        {/* Quick Stats Bar */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  {calculateServiceStats().activeServices} Active
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {calculateServiceStats().publicServices} Public
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {calculateServiceStats().categoriesCount} Categories
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  {calculateServiceStats().totalServices} Total
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2 mb-6">
            {notifications.map((notification) => (
              <Alert
                key={notification.id}
                className={`border-l-4 ${
                  notification.type === "success"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600"
                    : notification.type === "warning"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600"
                    : notification.type === "error"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600"
                    : "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                }`}
              >
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-slate-100">{notification.message}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
        <Card className="card-elevated mb-6">
          <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <TabsTrigger 
              value="services" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-4 rounded-md"
            >
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger
              value="device-types"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-4 rounded-md"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Device Types</span>
            </TabsTrigger>
            <TabsTrigger 
              value="brands" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-4 rounded-md"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Brands</span>
            </TabsTrigger>
            <TabsTrigger 
              value="models" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-4 rounded-md"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Models</span>
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-4 rounded-md"
            >
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Problems</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Services</p>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {calculateServiceStats().totalServices}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    All service types
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Services</p>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {calculateServiceStats().activeServices}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Currently available
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Price</p>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {calculateServiceStats().averagePrice > 0
                      ? formatCurrency(calculateServiceStats().averagePrice)
                      : "N/A"}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {(() => {
                      const stats = calculateServiceStats();
                      const servicesWithPrice = services.filter(
                        (s) => s.basePrice && s.basePrice > 0
                      ).length;
                      return servicesWithPrice > 0
                        ? `${servicesWithPrice} services priced`
                        : "No pricing set";
                    })()}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</p>
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {calculateServiceStats().categoriesCount}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Service categories
                  </p>
                  {showInsights &&
                    calculateServiceStats().categoriesCount > 5 && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <BarChart3 className="h-3 w-3 inline mr-1" />
                        Well organized
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Controls and Filters */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                    <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    <span>Controls & Filters</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInsights(!showInsights)}
                          className={
                            showInsights
                              ? "bg-purple-50 border-purple-200 text-purple-700"
                              : ""
                          }
                        >
                          {showInsights ? (
                            <Eye className="h-4 w-4 mr-2" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-2" />
                          )}
                          Insights
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle smart insights and recommendations</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompactView(!compactView)}
                          className={
                            compactView
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : ""
                          }
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {compactView ? "Compact" : "Normal"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle compact view mode</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAutoRefresh(!autoRefresh)}
                          className={
                            autoRefresh
                              ? "bg-green-50 border-green-200 text-green-700"
                              : ""
                          }
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                              autoRefresh ? "animate-spin" : ""
                            }`}
                          />
                          Auto-refresh
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable automatic data refresh</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Search
                    </label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                        <SelectItem value="all">All Categories</SelectItem>
                        {serviceCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        setSortBy("name");
                        setSortOrder("asc");
                        addNotification("info", "Filters cleared");
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights Section */}
            {showInsights && (
              <Card className="card-elevated mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Service Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {calculateServiceStats().activeRate > 80 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          High Availability
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {calculateServiceStats().activeRate.toFixed(1)}%
                        services active
                      </p>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <Activity className="h-3 w-3 inline mr-1" />
                        Excellent service availability
                      </div>
                    </div>
                  )}

                  {calculateServiceStats().publicRate > 80 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          High Visibility
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        {calculateServiceStats().publicRate.toFixed(1)}%
                        services public
                      </p>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Strong customer visibility
                      </div>
                    </div>
                  )}

                  {calculateServiceStats().averagePrice > 50 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                          Premium Pricing
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        {formatCurrency(calculateServiceStats().averagePrice)}{" "}
                        average price
                      </p>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                        <Trophy className="h-3 w-3 inline mr-1" />
                        High-value services
                      </div>
                    </div>
                  )}

                  {calculateServiceStats().categoriesCount > 5 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Well Organized
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-400">
                        {calculateServiceStats().categoriesCount} service
                        categories
                      </p>
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded">
                        <BarChart3 className="h-3 w-3 inline mr-1" />
                        Excellent categorization
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Service Types</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRefreshServices}
                  disabled={servicesLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      servicesLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button onClick={() => openServiceDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                className={
                  compactView
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                }
              >
                {sortedServices.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Settings className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No services found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ||
                        categoryFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "No services available yet"}
                      </p>
                    </div>
                  </div>
                ) : (
                  sortedServices.map((service: any) => {
                    const serviceStatus = getServiceStatus(service);
                    const serviceIcon = getServiceIcon(service);
                    const priority = getServicePriority(service);

                      return (
                      <Card
                        key={service.id}
                        className={`card-elevated relative hover:shadow-lg transition-all duration-200 ${getHighlightClass(
                          service,
                          "service"
                        )} ${compactView ? "p-3" : ""}`}
                        data-highlighted={
                          searchInfo?.searchType === "service" &&
                          searchInfo?.searchId === service.id
                        }
                      >
                        {!compactView && service.imageUrl && (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-auto px-2 py-1 text-xs rounded-full border-0 cursor-pointer transition-colors ${
                                      service.isPublic
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-gray-500 text-white hover:bg-gray-600"
                                    }`}
                                    onClick={() => handleTogglePublic(service)}
                                  >
                                    {service.isPublic ? (
                                      <>
                                        <Eye className="h-3 w-3 mr-1" />
                                        Public
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="h-3 w-3 mr-1" />
                                        Private
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {service.isPublic
                                      ? "Click to hide from public page"
                                      : "Click to show on public page"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        )}

                        {compactView ? (
                          // Compact View
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {serviceIcon}
                                <div>
                                  <h3 className="font-medium text-sm truncate max-w-32 text-slate-900 dark:text-slate-100">
                                    {service.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {service.category}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {priority.icon}
                                {serviceStatus.icon}
                              </div>
                            </div>

                            {service.description && (
                              <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                                {service.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs">
                              {service.basePrice && (
                                <div className="flex items-center gap-1 text-green-600 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(service.basePrice)}
                                </div>
                              )}
                              {service.estimatedDuration && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(service.estimatedDuration)}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openServiceDialog(service)}
                                className="h-7 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                                className="h-7 px-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Normal View
                          <>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  {serviceIcon}
                                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                                    {service.name}
                                  </CardTitle>
                                  {priority.icon}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openServiceDialog(service)
                                        }
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit service</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteService(service.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete service</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {service.category}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {serviceStatus.icon}
                                  <Badge
                                    className={
                                      service.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {serviceStatus.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {service.description && (
                                <p className="text-sm text-muted-foreground">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                {service.basePrice && (
                                  <div className="flex items-center gap-1 text-green-600 font-medium">
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                      {formatCurrency(service.basePrice)}
                                    </span>
                                  </div>
                                )}
                                {service.estimatedDuration && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDuration(service.estimatedDuration)}</span>
                                  </div>
                                )}
                              </div>
                              {service.features &&
                                service.features.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Features:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {service.features
                                        .slice(0, 3)
                                        .map(
                                          (feature: string, index: number) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {feature}
                                            </Badge>
                                          )
                                        )}
                                      {service.features.length > 3 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          +{service.features.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              {service.warranty && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Shield className="h-3 w-3" />
                                  <span>{service.warranty}</span>
                                </div>
                              )}
                            </CardContent>
                          </>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="brands" className="space-y-6">
            {/* Enhanced Statistics Cards for Brands */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Brands</p>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {brands.length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    All brand partners
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Brands</p>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {brands.filter((b) => b.isActive).length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Currently partnered
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Models per Brand</p>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {brands.length > 0
                      ? Math.round(models.length / brands.length)
                      : 0}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Average models
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Top Brand</p>
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {brands.length > 0
                      ? brands[0]?.name?.substring(0, 10)
                      : "N/A"}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Most models</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Controls for Brands */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                    <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    <span>Brand Controls</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInsights(!showInsights)}
                          className={
                            showInsights
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : ""
                          }
                        >
                          {showInsights ? (
                            <Eye className="h-4 w-4 mr-2" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-2" />
                          )}
                          Insights
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle smart insights and recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Performance Insights for Brands */}
            {showInsights && (
              <Card className="card-elevated mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Brand Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {brands.length > 5 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Diverse Partnerships
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {brands.length} brand partnerships
                      </p>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <Activity className="h-3 w-3 inline mr-1" />
                        Excellent brand diversity
                      </div>
                    </div>
                  )}

                  {models.length > brands.length * 2 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                          Rich Model Library
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        {models.length} models across {brands.length} brands
                      </p>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Strong model coverage
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Brands</h2>
              <Button onClick={() => openBrandDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>
            {brandsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No brands found</p>
                      <p className="text-sm text-gray-400">
                        No brands available yet
                      </p>
                    </div>
                  </div>
                ) : (
                  brands.map((brand: any) => (
                    <Card
                      key={brand.id}
                      className={`card-elevated relative hover:shadow-lg transition-all duration-200 ${getHighlightClass(
                        brand,
                        "brand"
                      )}`}
                      data-highlighted={
                        searchInfo?.searchType === "brand" &&
                        searchInfo?.searchId === brand.id
                      }
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                              {brand.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openBrandDialog(brand)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit brand</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBrand(brand.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete brand</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {brand.description && (
                          <p className="text-sm text-muted-foreground">
                            {brand.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={brand.isActive ? "default" : "secondary"}
                            className={
                              brand.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {brand.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {brand.website && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Website
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="models" className="space-y-6">
            {/* Enhanced Statistics Cards for Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Models</p>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {models.length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    All device models
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Models</p>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {models.filter((m) => m.isActive).length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Currently available
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Brands Covered</p>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {new Set(models.map((m) => m.brandName)).size}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Unique brands</p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Device Types</p>
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {new Set(models.map((m) => m.deviceTypeName)).size}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Device categories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Controls for Models */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                    <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    <span>Model Controls</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInsights(!showInsights)}
                          className={
                            showInsights
                              ? "bg-green-50 border-green-200 text-green-700"
                              : ""
                          }
                        >
                          {showInsights ? (
                            <Eye className="h-4 w-4 mr-2" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-2" />
                          )}
                          Insights
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle smart insights and recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Performance Insights for Models */}
            {showInsights && (
              <Card className="card-elevated mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Model Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {models.length > 10 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Comprehensive Library
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {models.length} models available
                      </p>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <Activity className="h-3 w-3 inline mr-1" />
                        Excellent model coverage
                      </div>
                    </div>
                  )}

                  {new Set(models.map((m) => m.brandName)).size > 5 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                          Multi-Brand Support
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        {new Set(models.map((m) => m.brandName)).size} brands
                        supported
                      </p>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Strong brand diversity
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Models</h2>
              <Button onClick={() => openModelDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>
            {modelsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Smartphone className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No models found</p>
                      <p className="text-sm text-gray-400">
                        No models available yet
                      </p>
                    </div>
                  </div>
                ) : (
                  models.map((model: any) => (
                    <Card
                      key={model.id}
                      className={`card-elevated relative hover:shadow-lg transition-all duration-200 ${getHighlightClass(
                        model,
                        "model"
                      )}`}
                      data-highlighted={
                        searchInfo?.searchType === "model" &&
                        searchInfo?.searchId === model.id
                      }
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                              {model.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openModelDialog(model)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit model</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteModel(model.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete model</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {model.brandName}
                          </Badge>
                          {model.deviceTypeName && (
                            <Badge variant="outline" className="text-xs">
                              <Settings className="h-3 w-3 mr-1" />
                              {model.deviceTypeName}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {model.description && (
                          <p className="text-sm text-muted-foreground">
                            {model.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={model.isActive ? "default" : "secondary"}
                            className={
                              model.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {model.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {model.releaseYear && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {model.releaseYear}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="device-types" className="space-y-6">
            {/* Enhanced Statistics Cards for Device Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Device Types</p>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {deviceTypes.length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    All device categories
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Types</p>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {deviceTypes.filter((dt) => dt.isActive).length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Currently available
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</p>
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {
                      new Set(deviceTypes.map((dt) => dt.category || "General"))
                        .size
                    }
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Device categories
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Models Count</p>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {models.length}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Total models</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Controls for Device Types */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                    <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    <span>Device Type Controls</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInsights(!showInsights)}
                          className={
                            showInsights
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : ""
                          }
                        >
                          {showInsights ? (
                            <Eye className="h-4 w-4 mr-2" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-2" />
                          )}
                          Insights
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle smart insights and recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Performance Insights for Device Types */}
            {showInsights && (
              <Card className="card-elevated mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Device Type Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {deviceTypes.length > 5 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Comprehensive Catalog
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {deviceTypes.length} device types available
                      </p>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <Activity className="h-3 w-3 inline mr-1" />
                        Excellent device coverage
                      </div>
                    </div>
                  )}

                  {models.length > 10 && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                          Rich Model Library
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        {models.length} models across device types
                      </p>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Strong model diversity
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Device Types</h2>
              <Button onClick={() => openDeviceTypeDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device Type
              </Button>
            </div>
            {deviceTypesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deviceTypes.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Settings className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No device types found</p>
                      <p className="text-sm text-gray-400">
                        No device types available yet
                      </p>
                    </div>
                  </div>
                ) : (
                  deviceTypes.map((deviceType: any) => (
                    <Card
                      key={deviceType.id}
                      className="card-elevated relative hover:shadow-lg transition-all duration-200"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                              {deviceType.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openDeviceTypeDialog(deviceType)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit device type</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteDeviceType(deviceType.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete device type</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {deviceType.description && (
                          <p className="text-sm text-muted-foreground">
                            {deviceType.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              deviceType.isActive ? "default" : "secondary"
                            }
                            className={
                              deviceType.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {deviceType.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {deviceType.category && (
                            <Badge variant="outline" className="text-xs">
                              {deviceType.category}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="problems" className="space-y-6">
            {/* <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Problem Descriptions</h2>
              <div className="text-sm text-gray-500">
                Manage predefined problem descriptions for quick service
                diagnosis
              </div>
            </div> */}

            <PredefinedProblemsManager />
          </TabsContent>
        </Tabs>
          </CardContent>
        </Card>
        {/* Service Type Dialog */}
        <Dialog
          open={isServiceDialogOpen}
          onOpenChange={setIsServiceDialogOpen}
        >
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-describedby="service-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service Type" : "Add Service Type"}
              </DialogTitle>
              <div id="service-dialog-description" className="sr-only">
                {editingService
                  ? "Edit service type details"
                  : "Add new service type"}
              </div>
            </DialogHeader>
            <form
              onSubmit={serviceForm.handleSubmit(handleServiceSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    {...serviceForm.register("name")}
                    placeholder="e.g., Laptop Screen Repair"
                  />
                  {serviceForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {serviceForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={serviceForm.watch("category")}
                    onValueChange={(value) =>
                      serviceForm.setValue("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                      {serviceCategories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openCategoryManager("service")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Manage Categories
                  </Button>
                  {serviceForm.formState.errors.category && (
                    <p className="text-sm text-red-500">
                      {serviceForm.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...serviceForm.register("description")}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedDuration">
                    Estimated Duration
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={serviceForm.watch("estimatedDuration") || 0}
                      onChange={(e) =>
                        serviceForm.setValue(
                          "estimatedDuration",
                          e.target.value ? parseInt(e.target.value) : 0
                        )
                      }
                      placeholder="60"
                      className="flex-1"
                    />
                    <select
                      id="durationUnit"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours' | 'days' | 'months')}
                      className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="basePrice">
                    Base Price ({getCurrencySymbol()})
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={serviceForm.watch("basePrice") || 0}
                    onChange={(e) =>
                      serviceForm.setValue(
                        "basePrice",
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    placeholder="50.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="serviceImage">Service Image</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="serviceImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            serviceForm.setValue(
                              "imageUrl",
                              e.target?.result as string
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  {serviceForm.watch("imageUrl") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => serviceForm.setValue("imageUrl", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {serviceForm.watch("imageUrl") && (
                  <div className="mt-2">
                    <img
                      src={serviceForm.watch("imageUrl")}
                      alt="Service preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  ⚠️ Image upload requires database column. Service will be
                  created without image if column is missing.
                </p>
              </div>
              <div>
                <Label htmlFor="warranty">Warranty Information</Label>
                <Input
                  id="warranty"
                  {...serviceForm.register("warranty")}
                  placeholder="e.g., 90 days parts and labor warranty"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...serviceForm.register("isPublic")}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Show on public landing page</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...serviceForm.register("isActive")}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsServiceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createServiceMutation.isPending ||
                    updateServiceMutation.isPending
                  }
                >
                  {editingService ? "Update" : "Create"} Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Brand Dialog */}
        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
          <DialogContent
            className="max-w-md"
            aria-describedby="brand-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </DialogTitle>
              <div id="brand-dialog-description" className="sr-only">
                {editingBrand ? "Edit brand details" : "Add a new brand"}
              </div>
            </DialogHeader>
            <form
              onSubmit={brandForm.handleSubmit(handleBrandSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="brandName">Name *</Label>
                <Input
                  id="brandName"
                  {...brandForm.register("name")}
                  placeholder="e.g., Apple"
                />
                {brandForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {brandForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="brandDescription">Description</Label>
                <Textarea
                  id="brandDescription"
                  {...brandForm.register("description")}
                  placeholder="Brief description of the brand"
                />
              </div>
              <div>
                <Label htmlFor="brandWebsite">Website</Label>
                <Input
                  id="brandWebsite"
                  {...brandForm.register("website")}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBrandDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createBrandMutation.isPending ||
                    updateBrandMutation.isPending
                  }
                >
                  {editingBrand ? "Update" : "Create"} Brand
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Model Dialog */}
        <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
          <DialogContent
            className="max-w-md"
            aria-describedby="model-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingModel ? "Edit Model" : "Add Model"}
              </DialogTitle>
              <div id="model-dialog-description" className="sr-only">
                {editingModel ? "Edit model details" : "Add a new model"}
              </div>
            </DialogHeader>
            <form
              onSubmit={modelForm.handleSubmit(handleModelSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="modelName">Name *</Label>
                <Input
                  id="modelName"
                  {...modelForm.register("name")}
                  placeholder="e.g., iPhone 15 Pro"
                />
                {modelForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {modelForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="modelBrand">Brand *</Label>
                <Select
                  value={modelForm.watch("brandId")}
                  onValueChange={(value) =>
                    modelForm.setValue("brandId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                    {brands.map((brand: any) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modelForm.formState.errors.brandId && (
                  <p className="text-sm text-red-500">
                    {modelForm.formState.errors.brandId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="modelDeviceType">Device Type *</Label>
                <Select
                  value={modelForm.watch("deviceTypeId")}
                  onValueChange={(value) =>
                    modelForm.setValue("deviceTypeId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={4}>
                    {deviceTypes.map((deviceType: any) => (
                      <SelectItem key={deviceType.id} value={deviceType.id}>
                        {deviceType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modelForm.formState.errors.deviceTypeId && (
                  <p className="text-sm text-red-500">
                    {modelForm.formState.errors.deviceTypeId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="modelDescription">Description</Label>
                <Textarea
                  id="modelDescription"
                  {...modelForm.register("description")}
                  placeholder="Brief description of the model"
                />
              </div>
              <div>
                <Label htmlFor="modelSpecifications">Specifications</Label>
                <Textarea
                  id="modelSpecifications"
                  {...modelForm.register("specifications")}
                  placeholder="Technical specifications"
                />
              </div>
              <div>
                <Label htmlFor="modelReleaseYear">Release Year</Label>
                <Input
                  id="modelReleaseYear"
                  type="number"
                  value={modelForm.watch("releaseYear") || 0}
                  onChange={(e) =>
                    modelForm.setValue(
                      "releaseYear",
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                  placeholder="2024"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModelDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createModelMutation.isPending ||
                    updateModelMutation.isPending
                  }
                >
                  {editingModel ? "Update" : "Create"} Model
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Device Type Dialog */}
        <Dialog
          open={isDeviceTypeDialogOpen}
          onOpenChange={setIsDeviceTypeDialogOpen}
        >
          <DialogContent
            className="max-w-md"
            aria-describedby="device-type-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingDeviceType ? "Edit Device Type" : "Add Device Type"}
              </DialogTitle>
              <div id="device-type-dialog-description" className="sr-only">
                {editingDeviceType
                  ? "Edit device type details"
                  : "Add a new device type"}
              </div>
            </DialogHeader>
            <form
              onSubmit={deviceTypeForm.handleSubmit(handleDeviceTypeSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="deviceTypeName">Name *</Label>
                <Input
                  id="deviceTypeName"
                  {...deviceTypeForm.register("name")}
                  placeholder="e.g., Smartphone"
                />
                {deviceTypeForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {deviceTypeForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="deviceTypeCategory">Category *</Label>
                <Input
                  id="deviceTypeCategory"
                  {...deviceTypeForm.register("category")}
                  placeholder="e.g., General, Mobile, Computer"
                />
                {deviceTypeForm.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {deviceTypeForm.formState.errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="deviceTypeDescription">Description</Label>
                <Textarea
                  id="deviceTypeDescription"
                  {...deviceTypeForm.register("description")}
                  placeholder="Brief description of the device type"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeviceTypeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createDeviceTypeMutation.isPending ||
                    updateDeviceTypeMutation.isPending
                  }
                >
                  {editingDeviceType ? "Update" : "Create"} Device Type
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Category Manager */}
        <CategoryManager
          open={showCategoryManager}
          onOpenChange={setShowCategoryManager}
          categories={categories}
          type={categoryManagerType}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </PageLayout>
    </TooltipProvider>
  );
}
