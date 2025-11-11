import { useState } from "react";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Receipt,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Settings,
  Tag,
  Clock,
  Building,
  Edit,
  Trash2,
  MoreHorizontal,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart,
  LineChart,
  Zap,
  Info,
  Lightbulb,
  Star,
  Shield,
  Activity,
  Bell,
  FileText,
  Upload,
  Save,
  Copy,
  Share2,
  Archive,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  CreditCard,
  Smartphone,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportExportControls } from "@/components/import-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type InsertExpense,
  type Expense,
  type ExpenseCategory,
} from "@shared/schema";
import { format, parseISO } from "date-fns";
import { ExpenseCategoryManager } from "@/components/expense-category-manager";
import { useAuth } from "@/hooks/useAuth";

// Expense types for better reporting
const expenseTypes = [
  { value: "daily", label: "Daily", description: "Recurring daily expenses" },
  {
    value: "monthly",
    label: "Monthly",
    description: "Recurring monthly expenses",
  },
  {
    value: "yearly",
    label: "Yearly",
    description: "Annual expenses and subscriptions",
  },
  {
    value: "one-time",
    label: "One-time",
    description: "Single occurrence expenses",
  },
  {
    value: "equipment",
    label: "Equipment",
    description: "Capital equipment purchases",
  },
];

// Payment methods
const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "credit-card", label: "Credit Card" },
  { value: "mobile-money", label: "Mobile Money" },
];

export default function Expenses() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Enhanced state management
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">(
    "list"
  );
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category" | "type">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showInsights, setShowInsights] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "info" | "warning" | "success" | "error";
      message: string;
      timestamp: Date;
    }>
  >([]);

  // Fetch expense categories from database
  const { data: expenseCategories = [], isLoading: categoriesLoading } =
    useQuery<ExpenseCategory[]>({
      queryKey: ["expense-categories"],
      queryFn: () => apiRequest("/api/expense-categories", "GET"),
    });

  // Ensure no duplicate category options by name (can happen if seeded twice)
  const uniqueExpenseCategories = Array.from(
    new Map(expenseCategories.map((c) => [c.name, c])).values()
  );

  const { data: expenses = [], isLoading, refetch } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: () => apiRequest("/api/expenses", "GET"),
  });

  // Auto refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refetch();
        addNotification("info", "Data refreshed automatically");
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refetch]);

  // Budgets state
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [budgetYear, setBudgetYear] = useState<number>(currentYear);
  const [budgetMonth, setBudgetMonth] = useState<number | "all">(currentMonth);
  const { data: budgets = [] } = useQuery<any[]>({
    queryKey: ["budgets", budgetYear, budgetMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (budgetYear) params.set("year", String(budgetYear));
      if (budgetMonth !== "all") params.set("month", String(budgetMonth));
      return await apiRequest(`/api/budgets?${params.toString()}`, "GET");
    },
  });
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    budgets
      .filter((b: any) => b.expenseType)
      .forEach((b: any) => {
        map[b.expenseType] = String(b.amount);
      });
    setBudgetInputs(map);
  }, [budgets]);

  const createBudget = useMutation({
    mutationFn: async (payload: any) =>
      apiRequest("/api/budgets", "POST", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({
        queryKey: ["analytics", "budget-analysis"],
      });
      toast({ title: "Saved", description: "Budget saved successfully." });
    },
    onError: (e: any) =>
      toast({ 
        title: "Error", 
        description: `Failed to save budget: ${e.message || 'Unknown error'}`, 
        variant: "destructive" 
      }),
  });
  const handleSaveBudgets = () => {
    const selectedLocation = localStorage.getItem("selectedLocation");
    const locationId =
      selectedLocation && selectedLocation !== "all"
        ? selectedLocation
        : undefined;
    
    const budgetEntries = Object.entries(budgetInputs).filter(([type, amount]) => amount && amount.trim() !== "");
    
    if (budgetEntries.length === 0) {
      toast({
        title: "No Budgets",
        description: "Please enter at least one budget amount.",
        variant: "destructive"
      });
      return;
    }
    
    budgetEntries.forEach(([type, amount]) => {
      const budgetData = {
        expenseType: type,
        amount: amount,
        year: budgetYear,
        month: budgetMonth === "all" ? null : budgetMonth,
        locationId,
        period: budgetMonth === "all" ? "yearly" : "monthly",
        notes: `Budget for ${type} expenses`,
      };
      
      createBudget.mutate(budgetData);
    });
    
    setIsBudgetDialogOpen(false);
  };

  const { data: expenseStats } = useQuery({
    queryKey: ["expenses", "stats"],
  });

  const [formData, setFormData] = useState<{
    category: string;
    description: string;
    amount: string;
    expenseDate: string;
    vendor: string;
    notes: string;
    isRecurring: boolean;
    recurringFrequency: string | undefined;
    expenseType: string;
    paymentMethod: string;
  }>({
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    vendor: "",
    notes: "",
    isRecurring: false,
    recurringFrequency: undefined,
    expenseType: "one-time",
    paymentMethod: "cash",
  });

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const selectedLocation = localStorage.getItem("selectedLocation");
      const locationId =
        selectedLocation && selectedLocation !== "all"
          ? selectedLocation
          : undefined;
      return await apiRequest("/api/expenses", "POST", {
        ...data,
        amount: data.amount.toString(),
        expenseDate: data.expenseDate,
        // Ensure expense is created for the currently selected location
        locationId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "stats"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const selectedLocation = localStorage.getItem("selectedLocation");
      const locationId =
        selectedLocation && selectedLocation !== "all"
          ? selectedLocation
          : undefined;
      return await apiRequest(`/api/expenses/${id}`, "PUT", {
        ...data,
        amount: data.amount.toString(),
        expenseDate: data.expenseDate,
        // Keep expense associated with the selected location (if any)
        locationId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "stats"] });
      setIsDialogOpen(false);
      setEditingExpense(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/expenses/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      category: "",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      vendor: "",
      notes: "",
      isRecurring: false,
      recurringFrequency: undefined,
      expenseType: "one-time",
      paymentMethod: "cash",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.description || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data: formData });
    } else {
      createExpenseMutation.mutate(formData);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category || "",
      description: expense.description || "",
      amount: expense.amount || "",
      expenseDate: expense.expenseDate
        ? format(expense.expenseDate, "yyyy-MM-dd")
        : "",
      vendor: expense.vendor || "",
      notes: expense.notes || "",
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency
        ? expense.recurringFrequency
        : undefined,
      expenseType: expense.expenseType || "one-time",
      paymentMethod: "cash",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    deleteExpenseMutation.mutate(expense.id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      !searchTerm ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    const matchesType =
      typeFilter === "all" || expense.expenseType === typeFilter;

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy-MM-dd") ===
          format(new Date(), "yyyy-MM-dd")) ||
      (dateFilter === "this-month" &&
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy-MM") ===
          format(new Date(), "yyyy-MM")) ||
      (dateFilter === "this-year" &&
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy") === format(new Date(), "yyyy"));

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  const getCategoryLabel = (category: string) => {
    return (
      expenseCategories.find((cat) => cat.name === category)?.name || category
    );
  };

  const getTypeLabel = (type: string) => {
    return expenseTypes.find((t) => t.value === type)?.label || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    return paymentMethods.find((pm) => pm.value === method)?.label || method;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-red-100 text-red-800 border-red-200";
      case "monthly":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "yearly":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "equipment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Clock className="h-3 w-3" />;
      case "monthly":
        return <Calendar className="h-3 w-3" />;
      case "yearly":
        return <TrendingUp className="h-3 w-3" />;
      case "equipment":
        return <Building className="h-3 w-3" />;
      default:
        return <Receipt className="h-3 w-3" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-3 w-3" />;
      case "bank-transfer":
        return <Building className="h-3 w-3" />;
      case "credit-card":
        return <CreditCard className="h-3 w-3" />;
      case "mobile-money":
        return <Smartphone className="h-3 w-3" />;
      default:
        return <Receipt className="h-3 w-3" />;
    }
  };

  const getExpenseStatus = (expense: Expense) => {
    const amount = parseFloat(expense.amount || "0");
    if (amount > 1000)
      return {
        status: "high",
        color: "text-red-600",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    if (amount > 500)
      return {
        status: "medium",
        color: "text-yellow-600",
        icon: <Info className="h-4 w-4" />,
      };
    return {
      status: "normal",
      color: "text-green-600",
      icon: <CheckCircle className="h-4 w-4" />,
    };
  };

  const getExpenseIcon = (expenseType: string) => {
    switch (expenseType) {
      case "daily":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "monthly":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "yearly":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "one-time":
        return <Receipt className="h-4 w-4 text-orange-500" />;
      case "equipment":
        return <Settings className="h-4 w-4 text-indigo-500" />;
      default:
        return <Receipt className="h-4 w-4 text-slate-500" />;
    }
  };

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || "0"),
    0
  );

  const monthlyExpenses = expenses
    .filter(
      (expense) =>
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy-MM") === format(new Date(), "yyyy-MM")
    )
    .reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);

  const yearlyExpenses = expenses
    .filter(
      (expense) =>
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy") === format(new Date(), "yyyy")
    )
    .reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);

  // Calculate proper monthly average based on expense types
  const calculateMonthlyAverage = () => {
    const currentYearExpenses = expenses.filter(
      (expense) =>
        expense.expenseDate &&
        format(new Date(expense.expenseDate), "yyyy") === format(new Date(), "yyyy")
    );

    let monthlyAverage = 0;
    const calculationDetails: any[] = [];
    
    currentYearExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount || "0");
      const expenseType = expense.expenseType || "one-time";
      let contribution = 0;
      
      switch (expenseType) {
        case "daily":
          contribution = amount * 30; // Daily expense * 30 days
          break;
        case "monthly":
          contribution = amount; // Monthly expense as-is
          break;
        case "yearly":
          contribution = amount / 12; // Yearly expense / 12 months
          break;
        case "one-time":
          // One-time expenses: spread over the months they occurred
          const expenseDate = new Date(expense.expenseDate);
          const monthsSinceExpense = Math.max(1, 
            (new Date().getMonth() - expenseDate.getMonth()) + 
            (new Date().getFullYear() - expenseDate.getFullYear()) * 12
          );
          contribution = amount / monthsSinceExpense;
          break;
        case "equipment":
          // Equipment: amortize over 12 months
          contribution = amount / 12;
          break;
        default:
          contribution = amount; // Default to monthly
      }
      
      monthlyAverage += contribution;
      calculationDetails.push({
        description: expense.description,
        amount: amount,
        type: expenseType,
        contribution: contribution
      });
    });
    
    
    return monthlyAverage;
  };

  const properMonthlyAverage = calculateMonthlyAverage();

  // Calculate expense type breakdown for insights
  const expenseTypeBreakdown = expenses.reduce((acc, exp) => {
    const type = exp.expenseType || 'one-time';
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count += 1;
    acc[type].total += parseFloat(exp.amount || "0");
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return (
    <TooltipProvider>
      <PageLayout
        title="Expense Management"
        subtitle="Track, analyze, and optimize business expenses with intelligent insights"
        icon={Receipt}
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/analytics-hub")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics Hub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBudgetDialogOpen(true)}
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Budgets
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        }
      >
        {/* Quick Stats Bar */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {expenses.length} Total Expenses
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {expenses.filter((e) => e.isRecurring).length} Recurring
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  {uniqueExpenseCategories.length} Categories
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


        {/* Enhanced Expense Insights - Single Row */}
        {showInsights && (
          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Expense Insights
              </h3>
            </div>
            
            {/* Single Row Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Monthly Analysis */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Monthly Analysis</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current vs Average</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">This Month</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {formatCurrency(monthlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Avg</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {formatCurrency(properMonthlyAverage)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {monthlyExpenses > properMonthlyAverage ? (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Above Average
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs">
                        <TrendingDown className="h-3 w-3" />
                        Below Average
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expense Types */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Expense Types</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Distribution by frequency</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(expenseTypeBreakdown).slice(0, 3).map(([type, data]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTypeColor(type)} text-xs`}>
                          {getTypeLabel(type)}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {data.count}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(data.total)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(expenseTypeBreakdown).length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      +{Object.keys(expenseTypeBreakdown).length - 3} more types
                    </div>
                  )}
                </div>
              </div>


              {/* Annual Overview - Fixed */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Annual Overview</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Year-to-date spending</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">This Year</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {formatCurrency(yearlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {expenses.length}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                    💡 Based on actual expense data
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-amber-200 dark:border-amber-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Quick Stats</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Key metrics</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Recurring</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {expenses.filter((e) => e.isRecurring).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Avg per Expense</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : '0 ETB'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                    📊 Smart calculations enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Controls and Filters */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <FilterIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
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
                    id="expense-search"
                    name="expenseSearch"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
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
                    {uniqueExpenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Types</SelectItem>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
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
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
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
                    setTypeFilter("all");
                    setDateFilter("all");
                    setSortBy("date");
                    setSortOrder("desc");
                    addNotification("info", "Filters cleared");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              Expense List
              {autoRefresh && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                  Auto-refresh ON
                </span>
              )}
            </CardTitle>
            <CardContent className="pt-0">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {filteredExpenses.length} expenses found
                {compactView && " (Compact view)"}
              </div>
            </CardContent>
          </CardHeader>
          <CardContent>
            {compactView ? (
              /* Compact View - Card Layout */
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getExpenseIcon(expense.expenseType || "one-time")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {expense.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(expense.category || "")}
                              </Badge>
                              <Badge
                                className={`${getTypeColor(expense.expenseType || "one-time")} text-xs`}
                              >
                                {getTypeLabel(expense.expenseType || "one-time")}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {expense.expenseDate
                                  ? format(expense.expenseDate, "MMM dd")
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(parseFloat(expense.amount || "0"))}
                          </div>
                          {expense.vendor && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {expense.vendor}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            disabled={updateExpenseMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleteExpenseMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Expense
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {expense.description}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(expense)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Normal View - Table Layout */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Description</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Category</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Type</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Amount</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Date</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Payment Method</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Vendor</th>
                      <th className="text-left py-2 text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {expense.description}
                            </div>
                            {expense.notes && (
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline">
                            {getCategoryLabel(expense.category || "")}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge
                            className={getTypeColor(
                              expense.expenseType || "one-time"
                            )}
                          >
                            {getTypeLabel(expense.expenseType || "one-time")}
                          </Badge>
                        </td>
                        <td className="py-2 font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(parseFloat(expense.amount || "0"))}
                        </td>
                        <td className="py-2 text-sm text-gray-500 dark:text-slate-400">
                          {expense.expenseDate
                            ? format(expense.expenseDate, "MMM dd, yyyy")
                            : "N/A"}
                        </td>
                        <td className="py-2 text-sm text-gray-500 dark:text-slate-400">
                          Cash
                        </td>
                        <td className="py-2 text-sm text-gray-500 dark:text-slate-400">
                          {expense.vendor || "N/A"}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              disabled={updateExpenseMutation.isPending}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deleteExpenseMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Expense
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {expense.description}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(expense)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Add/Edit Expense Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      {uniqueExpenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div>
                            <div>{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-gray-500">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expenseType">Expense Type *</Label>
                  <Select
                    value={formData.expenseType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, expenseType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter expense description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (ETB) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="expenseDate">Date *</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expenseDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                    placeholder="Vendor name"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes about this expense"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={
                    createExpenseMutation.isPending ||
                    updateExpenseMutation.isPending
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createExpenseMutation.isPending ||
                    updateExpenseMutation.isPending
                  }
                >
                  {createExpenseMutation.isPending ||
                  updateExpenseMutation.isPending
                    ? editingExpense
                      ? "Updating..."
                      : "Adding..."
                    : editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Management Dialog */}
        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Expense Categories</DialogTitle>
            </DialogHeader>
            <ExpenseCategoryManager />
          </DialogContent>
        </Dialog>

        {/* Budget Allocation Dialog */}
        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Budget Allocation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={budgetYear}
                    onChange={(e) =>
                      setBudgetYear(
                        parseInt(e.target.value || String(currentYear), 10)
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Month</Label>
                  <Select
                    value={String(budgetMonth)}
                    onValueChange={(v) =>
                      setBudgetMonth(v === "all" ? "all" : parseInt(v, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {new Date(2024, i).toLocaleString("en-US", {
                            month: "long",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="self-end text-sm text-muted-foreground">
                  Set monthly amounts per type
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Expense Type</th>
                      <th className="text-left py-2">Monthly Budget (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTypes.map((t) => (
                      <tr key={t.value} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{t.label}</div>
                          <div className="text-xs text-gray-500">
                            {t.description}
                          </div>
                        </td>
                        <td className="py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={budgetInputs[t.value] || ""}
                            onChange={(e) =>
                              setBudgetInputs({
                                ...budgetInputs,
                                [t.value]: e.target.value,
                              })
                            }
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsBudgetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBudgets}
                  disabled={createBudget.isPending}
                >
                  {createBudget.isPending ? "Saving..." : "Save Budgets"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </TooltipProvider>
  );
}


