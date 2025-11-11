import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrentLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  Wrench,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  SortAsc,
  SortDesc,
  Zap,
  Info,
  Star,
  Activity,
  Bell,
  Download,
  Upload,
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
  MessageSquare,
  Tag,
  Settings,
  X,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Award as Trophy,
} from "lucide-react";

const workerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "technician", "sales"], {
    required_error: "Role is required",
  }),
  isActive: z.boolean().default(true),
});

type WorkerForm = z.infer<typeof workerSchema>;

const roles = [
  {
    value: "admin",
    label: "Administrator",
    icon: Shield,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "technician",
    label: "Technician",
    icon: Wrench,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "sales",
    label: "Sales",
    icon: ShoppingCart,
    color: "bg-green-100 text-green-800",
  },
];

export default function Workers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Enhanced state management
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">(
    "list"
  );
  const [sortBy, setSortBy] = useState<"name" | "role" | "status" | "date">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [compactView, setCompactView] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "info" | "warning" | "success" | "error";
      message: string;
      timestamp: Date;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState("overview");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currentLocation } = useCurrentLocation();

  const { data: workers = [], isLoading } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: () => apiRequest("/api/users", "GET"),
  });

  const addForm = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      role: "technician",
      isActive: true,
    },
  });

  const editForm = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema.omit({ password: true })),
  });

  const createWorkerMutation = useMutation({
    mutationFn: async (data: WorkerForm) => {
      if (!currentLocation) {
        throw new Error("Please select a location first");
      }
      return await apiRequest("/api/users", "POST", {
        ...data,
        locationId: currentLocation.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Worker registered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register worker",
        variant: "destructive",
      });
    },
  });

  const updateWorkerMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<WorkerForm>;
    }) => {
      return await apiRequest(`/api/users/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Worker updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditDialogOpen(false);
      setEditingWorker(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update worker",
        variant: "destructive",
      });
    },
  });

  const toggleWorkerStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/users/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Worker status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update worker status",
        variant: "destructive",
      });
    },
  });

  const onSubmitAdd = (data: WorkerForm) => {
    createWorkerMutation.mutate(data);
  };

  const onSubmitEdit = (data: Partial<WorkerForm>) => {
    if (editingWorker) {
      updateWorkerMutation.mutate({ id: editingWorker.id, data });
    }
  };

  const handleEdit = (worker: any) => {
    setEditingWorker(worker);
    editForm.reset({
      firstName: worker.firstName || "",
      lastName: worker.lastName || "",
      email: worker.email || "",
      phone: worker.phone || "",
      username: worker.username || "",
      role: worker.role || "",
      isActive: worker.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (worker: any) => {
    const action = worker.isActive ? "deactivate" : "activate";
    if (
      confirm(
        `Are you sure you want to ${action} ${worker.firstName} ${worker.lastName}?`
      )
    ) {
      toggleWorkerStatusMutation.mutate({
        id: worker.id,
        isActive: !worker.isActive,
      });
    }
  };

  const getRoleInfo = (role: string) => {
    return roles.find((r) => r.value === role) || roles[1];
  };

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

  const getRoleIcon = (role: string) => {
    const roleConfig = roles.find((r) => r.value === role);
    return roleConfig ? (
      <roleConfig.icon className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const getWorkerStatus = (worker: any) => {
    if (worker.isActive) {
      return {
        status: "active",
        color: "text-green-600",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }
    return {
      status: "inactive",
      color: "text-red-600",
      icon: <UserX className="h-4 w-4" />,
    };
  };

  const calculateWorkerStats = () => {
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter((w) => w.isActive).length;
    const inactiveWorkers = workers.filter((w) => !w.isActive).length;
    const adminCount = workers.filter((w) => w.role === "admin").length;
    const technicianCount = workers.filter(
      (w) => w.role === "technician"
    ).length;
    const salesCount = workers.filter((w) => w.role === "sales").length;

    return {
      totalWorkers,
      activeWorkers,
      inactiveWorkers,
      adminCount,
      technicianCount,
      salesCount,
      activeRate: totalWorkers > 0 ? (activeWorkers / totalWorkers) * 100 : 0,
    };
  };

  const getWorkerPerformance = (worker: any) => {
    // Mock performance data - in real app, this would come from actual metrics
    const performance = Math.random() * 100;
    if (performance >= 90)
      return {
        level: "excellent",
        color: "text-green-600",
        icon: <Trophy className="h-4 w-4" />,
      };
    if (performance >= 75)
      return {
        level: "good",
        color: "text-blue-600",
        icon: <ThumbsUp className="h-4 w-4" />,
      };
    if (performance >= 60)
      return {
        level: "average",
        color: "text-yellow-600",
        icon: <Target className="h-4 w-4" />,
      };
    return {
      level: "needs_improvement",
      color: "text-red-600",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || worker.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && worker.isActive) ||
      (statusFilter === "inactive" && !worker.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort workers based on selected criteria
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case "role":
        comparison = a.role.localeCompare(b.role);
        break;
      case "status":
        comparison = a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
        break;
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((worker) => worker.isActive).length;
  const adminCount = workers.filter((worker) => worker.role === "admin").length;
  const technicianCount = workers.filter(
    (worker) => worker.role === "technician"
  ).length;
  const salesCount = workers.filter((worker) => worker.role === "sales").length;

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Worker Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage company workers and their roles
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PageLayout
        title="Worker Management"
        subtitle="Manage company workers, roles, and performance"
        icon={Users}
        actions={
          <div className="flex items-center space-x-2">
            {currentLocation && (
              <Badge variant="outline" className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{currentLocation.name} ({currentLocation.code})</span>
              </Badge>
            )}
            <Button variant="default" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        }
      >
        {/* Add Worker Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">Add New Worker</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Quick Stats Bar */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  {calculateWorkerStats().totalWorkers} Total Workers
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {calculateWorkerStats().activeWorkers} Active
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {calculateWorkerStats().technicianCount} Technicians
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

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Workers</p>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateWorkerStats().totalWorkers}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                All registered workers
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Workers</p>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateWorkerStats().activeWorkers}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Currently active</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Technicians</p>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateWorkerStats().technicianCount}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Repair specialists
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Activity Rate</p>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateWorkerStats().activeRate.toFixed(1)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Worker engagement</p>
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

              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Search
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Role
                </label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
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
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
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
                    setRoleFilter("all");
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


        {/* Workers Table */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                Company Workers
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Worker
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-slate-100">Register New Worker</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                      Add a new worker to your team with appropriate role and
                      permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form
                      onSubmit={addForm.handleSubmit(onSubmitAdd)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="john.doe@example.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="+251 091 334 1664"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="johndoe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={addForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select worker role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent side="bottom" sideOffset={4}>
                                {roles.map((role) => (
                                  <SelectItem
                                    key={role.value}
                                    value={role.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <role.icon className="h-4 w-4" />
                                      {role.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createWorkerMutation.isPending}
                        >
                          {createWorkerMutation.isPending
                            ? "Registering..."
                            : "Register Worker"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <Input
                  placeholder="Search workers by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workers Table */}
            <div className="border rounded-lg">
              {compactView ? (
                // Compact Grid View
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedWorkers.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                          <p className="text-gray-500 dark:text-slate-400">No workers found</p>
                          <p className="text-sm text-gray-400 dark:text-slate-500">
                            {searchTerm ||
                            roleFilter !== "all" ||
                            statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Register your first worker to get started"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      sortedWorkers.map((worker) => {
                        const roleInfo = getRoleInfo(worker.role);
                        const RoleIcon = roleInfo.icon;
                        const workerStatus = getWorkerStatus(worker);
                        const performance = getWorkerPerformance(worker);

                        return (
                          <Card
                            key={worker.id}
                            className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                      {worker.firstName} {worker.lastName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-slate-400">
                                      @{worker.username}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {workerStatus.icon}
                                  <Badge
                                    variant={
                                      worker.isActive ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {worker.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`${roleInfo.color} text-xs`}
                                  >
                                    <RoleIcon className="h-3 w-3 mr-1" />
                                    {roleInfo.label}
                                  </Badge>
                                  <div
                                    className={`${performance.color} flex items-center gap-1`}
                                  >
                                    {performance.icon}
                                  </div>
                                </div>

                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">
                                      {worker.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <Phone className="h-3 w-3" />
                                    <span className="truncate">
                                      {worker.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        worker.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 pt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(worker)}
                                    className="h-7 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(worker)}
                                    className={`h-7 px-2 ${
                                      worker.isActive
                                        ? "text-red-600 hover:text-red-700"
                                        : "text-green-600 hover:text-green-700"
                                    }`}
                                  >
                                    {worker.isActive ? (
                                      <UserX className="h-3 w-3" />
                                    ) : (
                                      <UserCheck className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                // Normal Table View
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                            <p className="text-gray-500 dark:text-slate-400">No workers found</p>
                            <p className="text-sm text-gray-400 dark:text-slate-500">
                              {searchTerm ||
                              roleFilter !== "all" ||
                              statusFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Register your first worker to get started"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedWorkers.map((worker) => {
                        const roleInfo = getRoleInfo(worker.role);
                        const RoleIcon = roleInfo.icon;

                        return (
                          <TableRow key={worker.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {worker.firstName} {worker.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    @{worker.username}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={roleInfo.color}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {roleInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {worker.email}
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {worker.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  worker.isActive ? "default" : "secondary"
                                }
                              >
                                {worker.isActive ? (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-3 w-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  worker.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(worker)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(worker)}
                                  className={
                                    worker.isActive
                                      ? "text-red-600 hover:text-red-700"
                                      : "text-green-600 hover:text-green-700"
                                  }
                                >
                                  {worker.isActive ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Worker</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Update worker information and role.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onSubmitEdit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john.doe@example.com"
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
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+251 091 334 1664" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="johndoe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select worker role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent side="bottom" sideOffset={4}>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                {role.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateWorkerMutation.isPending}
                  >
                    {updateWorkerMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </TooltipProvider>
  );
}
