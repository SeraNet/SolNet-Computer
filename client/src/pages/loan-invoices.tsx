import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Printer,
  Send,
  Search,
  Calendar,
  User,
  CreditCard,
  Plus,
  Wrench,
  ShoppingCart,
  Trash2,
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
  Shield,
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
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";
import LogoDisplay from "@/components/logo-display";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
interface LoanInvoice {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceDescription: string;
  serviceDescription: string;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  dueDate: string;
  status: "pending" | "overdue" | "paid" | "cancelled";
  notes?: string;
  createdAt: string;
  // New fields for enhanced invoice types
  invoiceType?: string;
  itemType?: string;
  inventoryItemId?: string;
  quantity?: number;
  unitPrice?: number | string;
  serviceTypeId?: string;
  deviceTypeId?: string;
}
interface OutstandingAmount {
  id: string;
  type: "service" | "sales";
  description: string;
  amount: number | string;
  unitPrice?: number | string;
  quantity?: number;
  date: string;
  customerId: string;
  customerName: string;
  selected: boolean;
  itemName?: string;
  itemDescription?: string;
}

// Service types will be fetched from the database

export default function LoanInvoices() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCombinedInvoiceDialogOpen, setIsCombinedInvoiceDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<LoanInvoice | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [editingInvoice, setEditingInvoice] = useState<LoanInvoice | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "cash",
    notes: "",
  });

  // Enhanced state management
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">(
    "list"
  );
  const [sortBy, setSortBy] = useState<
    "date" | "amount" | "status" | "customer"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
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
  const { data: invoices = [], isLoading } = useQuery<LoanInvoice[]>({
    queryKey: ["loan-invoices"],
  });
  const { data: customers = [], isLoading: customersLoading } = useQuery<any[]>(
    {
      queryKey: ["customers"],
    }
  );

  // Fetch service types from database
  const { data: serviceTypes = [], isLoading: serviceTypesLoading } = useQuery<
    any[]
  >({
    queryKey: ["service-types"],
    queryFn: () => apiRequest("/api/service-types", "GET"),
  });

  // Fetch device types from database
  const { data: deviceTypes = [], isLoading: deviceTypesLoading } = useQuery<
    any[]
  >({
    queryKey: ["device-types"],
    queryFn: () => apiRequest("/api/device-types", "GET"),
  });

  // Fetch inventory items from database
  const { data: inventoryItems = [], isLoading: inventoryItemsLoading } =
    useQuery<any[]>({
      queryKey: ["inventory"],
      queryFn: () => apiRequest("/api/inventory", "GET"),
    });

  // Debug inventory items loading
  useEffect(() => {
    if (inventoryItems.length > 0) {
      // Inventory items loaded successfully
    }
  }, [inventoryItems]);

  // Get outstanding service loans (devices with status 'delivered' but not fully paid)
  const { data: outstandingServices = [] } = useQuery<any[]>({
    queryKey: ["outstanding-services"],
    queryFn: async () => {
      return apiRequest("/api/devices/outstanding-services", "GET");
    },
  });
  // Get outstanding sales (sales with payment status 'pending' or partial)
  const { data: outstandingSales = [] } = useQuery<any[]>({
    queryKey: ["outstanding-sales"],
    queryFn: async () => {
      const data = await apiRequest("/api/sales/outstanding", "GET");
      return data;
    },
  });
  const [formData, setFormData] = useState({
    invoiceType: "service", // 'service', 'product', 'repair'
    customerId: "",
    // Service Invoice fields
    serviceTypeId: "",
    deviceTypeId: "",
    serviceDescription: "",
    // Product Sale fields
    inventoryItemId: "",
    quantity: 1,
    unitPrice: "",
    // Common fields
    totalAmount: "",
    paidAmount: "0",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [combinedInvoiceData, setCombinedInvoiceData] = useState({
    customerId: "",
    serviceTypeId: "",
    deviceTypeId: "",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
    selectedItems: [] as OutstandingAmount[],
  });
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const invoiceData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        totalAmount: parseFloat(data.totalAmount),
        paidAmount: parseFloat(data.paidAmount),
      };
      const response = await apiRequest(
        "/api/loan-invoices",
        "POST",
        invoiceData
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loan-invoices"] });
      setIsDialogOpen(false);
      setFormData({
        invoiceType: "service",
        customerId: "",
        serviceTypeId: "",
        deviceTypeId: "",
        serviceDescription: "",
        inventoryItemId: "",
        quantity: 1,
        unitPrice: "",
        totalAmount: "",
        paidAmount: "0",
        dueDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create loan invoice",
        variant: "destructive",
      });
    },
  });
  const createCombinedInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "/api/loan-invoices/combined",
        "POST",
        data
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Combined loan invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loan-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-services"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-sales"] });
      setIsCombinedInvoiceDialogOpen(false);
      setCombinedInvoiceData({
        customerId: "",
        serviceTypeId: "",
        deviceTypeId: "",
        dueDate: new Date().toISOString().split("T")[0],
        notes: "",
        selectedItems: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create combined loan invoice",
        variant: "destructive",
      });
    },
  });
  const recordPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        `/api/loan-invoices/${selectedInvoice?.id}/record-payment`,
        "POST",
        data
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loan-invoices"] });
      setIsPaymentDialogOpen(false);
      setPaymentData({
        amount: "",
        paymentMethod: "cash",
        notes: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await apiRequest(
        `/api/loan-invoices/${data.id}`,
        "PUT",
        data.updates
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loan-invoices"] });
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/loan-invoices/${id}`, "DELETE");
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loan-invoices"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });
  // Get outstanding amounts for selected customer
  const getOutstandingAmounts = (customerId: string): OutstandingAmount[] => {
    const services = outstandingServices
      .filter((service: any) => {
        return service.customerId === customerId;
      })
      .map((service: any) => ({
        id: service.id,
        type: "service" as const,
        description: `${service.deviceType} - ${service.brand} ${service.model}`,
        amount: Number(service.totalCost || 0),
        date: service.updatedAt || service.createdAt,
        customerId: service.customerId,
        customerName: service.customerName,
        selected: false,
      }));
    const sales = outstandingSales
      .filter((sale: any) => {
        // Include sales that match the customer OR have no customerId (unassigned)
        return sale.customerId === customerId || !sale.customerId;
      })
      .flatMap((sale: any) => {
        // If sale has items, create separate entries for each item
        if (sale.items && sale.items.length > 0) {
          return sale.items.map((item: any) => {
            const description =
              item.itemName ||
              item.itemDescription ||
              `Item #${item.id.slice(0, 8)}`;
            return {
              id: `${sale.id}-${item.id}`,
              type: "sales" as const,
              description: description,
              amount: Number(item.totalPrice || 0),
              unitPrice: Number(item.unitPrice || 0),
              quantity: Number(item.quantity || 1),
              date: sale.createdAt,
              customerId: sale.customerId || customerId,
              customerName: sale.customerName || "Unassigned",
              selected: false,
              itemName: item.itemName,
              itemDescription: item.itemDescription,
            };
          });
        } else {
          // Fallback for sales without items
          return [
            {
              id: sale.id,
              type: "sales" as const,
              description: sale.customerId
                ? `Sale #${sale.id.slice(0, 8)}`
                : `Unassigned Sale #${sale.id.slice(0, 8)}`,
              amount: Number(sale.totalAmount || 0),
              unitPrice: Number(sale.totalAmount || 0),
              quantity: 1,
              date: sale.createdAt,
              customerId: sale.customerId || customerId,
              customerName: sale.customerName || "Unassigned",
              selected: false,
            },
          ];
        }
      });
    const result = [...services, ...sales];
    return result;
  };
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    const outstandingAmounts = getOutstandingAmounts(customerId);
    setCombinedInvoiceData((prev) => ({
      ...prev,
      customerId,
      selectedItems: outstandingAmounts,
    }));
  };
  const handleItemSelection = (itemId: string, selected: boolean) => {
    setCombinedInvoiceData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item) =>
        item.id === itemId ? { ...item, selected } : item
      ),
    }));
  };
  const handleCombinedInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItems = combinedInvoiceData.selectedItems.filter(
      (item) => item.selected
    );
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }
    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const itemsToStore = selectedItems.map((item) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      amount: item.amount,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      // Store original item data for better description handling
      originalData: {
        itemName: item.itemName,
        itemDescription: item.itemDescription,
      },
    }));
    createCombinedInvoiceMutation.mutate({
      customerId: combinedInvoiceData.customerId,
      serviceTypeId: combinedInvoiceData.serviceTypeId,
      deviceTypeId: combinedInvoiceData.deviceTypeId,
      dueDate: new Date(combinedInvoiceData.dueDate).toISOString(),
      notes: combinedInvoiceData.notes,
      items: itemsToStore,
      totalAmount,
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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

  const getInvoiceStatus = (invoice: LoanInvoice) => {
    const remaining = parseFloat(invoice.remainingAmount?.toString() || "0");
    const total = parseFloat(invoice.totalAmount?.toString() || "0");
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();

    if (remaining === 0)
      return {
        status: "paid",
        color: "text-green-600",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    if (dueDate < today)
      return {
        status: "overdue",
        color: "text-red-600",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    if (remaining < total)
      return {
        status: "partial",
        color: "text-yellow-600",
        icon: <Clock className="h-4 w-4" />,
      };
    return {
      status: "pending",
      color: "text-blue-600",
      icon: <Info className="h-4 w-4" />,
    };
  };

  const calculateInvoiceStats = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount?.toString() || "0"),
      0
    );
    const totalPaid = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.paidAmount?.toString() || "0"),
      0
    );
    const totalRemaining = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.remainingAmount?.toString() || "0"),
      0
    );
    const overdueInvoices = invoices.filter((inv) => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return (
        dueDate < today &&
        parseFloat(inv.remainingAmount?.toString() || "0") > 0
      );
    });
    const paidInvoices = invoices.filter(
      (inv) => parseFloat(inv.remainingAmount?.toString() || "0") === 0
    );

    return {
      totalInvoices,
      totalAmount,
      totalPaid,
      totalRemaining,
      overdueInvoices: overdueInvoices.length,
      paidInvoices: paidInvoices.length,
      collectionRate: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
    };
  };

  // Helper function to get service type label
  const getServiceTypeLabel = (serviceTypeId: string) => {
    const type = serviceTypes.find((t) => t.id === serviceTypeId);
    return type ? type.name : "Service";
  };

  // Helper function to get device type name
  const getDeviceTypeName = (deviceTypeId: string) => {
    const type = deviceTypes.find((t) => t.id === deviceTypeId);
    return type ? type.name : "Device";
  };

  // Helper function to get inventory item details
  const getInventoryItemDetails = (inventoryItemId: string) => {
    const item = inventoryItems.find((i) => i.id === inventoryItemId);
    return item
      ? {
          name: item.name,
          price: item.salePrice,
          description: item.description,
          category: item.category,
        }
      : null;
  };

  const printInvoice = async (invoice: LoanInvoice) => {

    // Fetch payment history for this invoice
    let paymentHistory: any[] = [];
    try {
      const response = await apiRequest(
        `/api/loan-invoices/${invoice.id}/payment-history`,
        "GET"
      );
      paymentHistory = response || [];
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }

    // Determine invoice type based on available data
    let invoiceType = invoice.invoiceType || "service";

    // If no invoiceType field, try to determine from other fields
    if (!invoice.invoiceType) {
      if (invoice.inventoryItemId || invoice.quantity || invoice.unitPrice) {
        invoiceType = "product";
      } else if (invoice.serviceTypeId && invoice.deviceTypeId) {
        invoiceType = "service";
      } else {
        invoiceType = "service"; // default fallback
      }
    }

    // Ensure we have valid data with fallbacks
    const safeInvoice = {
      id: invoice.id || "-",
      customerName: invoice.customerName || "Unknown Customer",
      customerEmail: invoice.customerEmail || "-",
      customerPhone: invoice.customerPhone || "-",
      invoiceType: invoiceType,
      serviceTypeId: invoice.serviceTypeId || "",
      deviceTypeId: invoice.deviceTypeId || "",
      deviceDescription:
        invoice.deviceDescription ||
        getDeviceTypeName(invoice.deviceTypeId || ""),
      serviceDescription: invoice.serviceDescription || "Technical service",
      totalAmount: Number(invoice.totalAmount) || 0,
      paidAmount: Number(invoice.paidAmount) || 0,
      remainingAmount: Number(invoice.remainingAmount) || 0,
      unitPrice: Number(invoice.unitPrice) || 0,
      quantity: Number(invoice.quantity) || 1,
      dueDate: invoice.dueDate || new Date().toISOString(),
      createdAt: invoice.createdAt || new Date().toISOString(),
      status: invoice.status || "pending",
      notes: invoice.notes || "",
    };

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Check if this is a combined invoice
      const isCombinedInvoice =
        safeInvoice.notes &&
        safeInvoice.notes.startsWith("COMBINED_INVOICE_ITEMS:");
      let items: any[] = [];
      if (isCombinedInvoice) {
        try {
          const itemsJson = safeInvoice.notes.replace(
            "COMBINED_INVOICE_ITEMS:",
            ""
          );
          items = JSON.parse(itemsJson);
        } catch (error) {}
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Loan Invoice - ${safeInvoice.customerName}</title>
          <style>
            @page { margin: 0.25in; size: A4; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 10px; 
              background: white;
              color: #333;
              line-height: 1.4;
              font-size: 13px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #007bff;
              padding-bottom: 10px;
            }
            .header h1 { 
              color: #007bff; 
              margin: 0 0 5px 0; 
              font-size: 22px; 
              font-weight: 700;
            }
            .header p { 
              margin: 2px 0; 
              color: #666; 
              font-size: 11px;
            }
            .invoice-details { 
              background: #f8f9fa; 
              padding: 10px; 
              border-radius: 4px; 
              margin-bottom: 15px;
              border-left: 3px solid #007bff;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .invoice-details p { 
              margin: 3px 0; 
              font-weight: 500;
              font-size: 12px;
            }
            .customer-info { 
              background: #ffffff; 
              padding: 10px; 
              border: 1px solid #e9ecef; 
              border-radius: 4px; 
              margin-bottom: 15px;
            }
            .customer-info h3 { 
              color: #007bff; 
              margin: 0 0 8px 0; 
              font-size: 14px;
              border-bottom: 1px solid #e9ecef;
              padding-bottom: 5px;
            }
            .customer-info p {
              margin: 3px 0;
              font-size: 12px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border-radius: 4px;
              overflow: hidden;
            }
            .items-table th, .items-table td { 
              border: 1px solid #e9ecef; 
              padding: 6px; 
              text-align: left; 
              font-size: 11px;
            }
            .items-table th { 
              background: linear-gradient(135deg, #007bff, #0056b3); 
              color: white; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.3px;
            }
            .items-table td { 
              background: white;
            }
            .items-table tr:nth-child(even) td { 
              background: #f8f9fa; 
            }
            .financial-summary { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px; 
              margin: 15px 0; 
            }
            .financial-card { 
              padding: 12px; 
              border-radius: 4px; 
              text-align: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .financial-card h4 { 
              margin: 0 0 5px 0; 
              font-size: 10px; 
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-weight: 600;
            }
            .financial-card p { 
              margin: 0; 
              font-size: 16px; 
              font-weight: 700; 
            }
            .total-amount { 
              background: linear-gradient(135deg, #28a745, #20c997); 
              color: white;
            }
            .paid-amount { 
              background: linear-gradient(135deg, #007bff, #0056b3); 
              color: white;
            }
            .remaining-amount { 
              background: linear-gradient(135deg, #ffc107, #e0a800); 
              color: #856404;
            }
            .payment-history { 
              page-break-inside: avoid; 
              margin-top: 15px;
            }
            .payment-history h3 { 
              margin-bottom: 10px; 
              color: #007bff;
              font-size: 16px;
              border-bottom: 1px solid #007bff;
              padding-bottom: 5px;
            }
            .payment-status { 
              margin-top: 15px; 
              padding: 8px; 
              border-radius: 4px;
              text-align: center;
              font-size: 12px;
            }
            .status-pending { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              color: #856404;
            }
            .status-paid { 
              background: #d4edda; 
              border: 1px solid #c3e6cb; 
              color: #155724;
            }
            .status-overdue { 
              background: #f8d7da; 
              border: 1px solid #f5c6cb; 
              color: #721c24;
            }
            .footer { 
              margin-top: 20px; 
              text-align: center; 
              font-size: 10px; 
              color: #666;
              border-top: 1px solid #e9ecef;
              padding-top: 10px;
            }
            .item-type { 
              font-size: 10px; 
              color: #666; 
              font-style: italic; 
            }
            .compact-layout {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            @media print {
              body { margin: 0; padding: 8px; font-size: 12px; }
              .financial-summary { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; }
              .compact-layout { display: grid !important; grid-template-columns: 1fr 1fr !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="text-align: center; margin-bottom: 10px;">
              <img id="company-logo" src="" alt="Company Logo" style="max-width: 100px; max-height: 50px; object-fit: contain;">
            </div>
            <h1>LOAN INVOICE</h1>
            <p>SolNet Computer Services</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Date:</strong> ${format(
              parseISO(safeInvoice.createdAt),
              "MMM dd, yyyy"
            )}</p>
            <p><strong>Due Date:</strong> ${format(
              parseISO(safeInvoice.dueDate),
              "MMM dd, yyyy"
            )}</p>
            <p><strong>Invoice #:</strong> ${safeInvoice.id.slice(0, 8)}</p>
            <p><strong>Status:</strong> ${safeInvoice.status.toUpperCase()}</p>
          </div>
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="compact-layout">
              <div>
                <p><strong>Name:</strong> ${safeInvoice.customerName}</p>
                <p><strong>Email:</strong> ${safeInvoice.customerEmail}</p>
              </div>
              <div>
                <p><strong>Phone:</strong> ${safeInvoice.customerPhone}</p>
                <p><strong>Invoice ID:</strong> ${safeInvoice.id}</p>
              </div>
            </div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
                              ${
                                isCombinedInvoice && items.length > 0
                                  ? items
                                      .map(
                                        (item: any) => `
                  <tr>
                    <td>${
                      item.description ||
                      (item.originalData?.itemName &&
                      item.originalData?.itemDescription
                        ? `${item.originalData.itemName} - ${item.originalData.itemDescription}`
                        : item.originalData?.itemName ||
                          item.originalData?.itemDescription ||
                          "-")
                    }</td>
                     <td class="item-type">${
                       item.type === "service" ? "Service" : "Sales"
                     }</td>
                     <td>${item.quantity || 1}</td>
                     <td>${formatCurrency(
                       Number(item.unitPrice) || Number(item.amount) || 0
                     )}</td>
                         <td>${formatCurrency(item.amount)}</td>
              </tr>
                `
                                      )
                                      .join("")
                                  : `
                <tr>
                  <td>${getDeviceTypeName(safeInvoice.deviceTypeId)} - ${
                                      safeInvoice.serviceDescription
                                    }</td>
                   <td class="item-type">${
                     safeInvoice.invoiceType === "service"
                       ? "Service"
                       : safeInvoice.invoiceType === "product"
                       ? "Product Sale"
                       : safeInvoice.invoiceType === "repair"
                       ? "Repair"
                       : "Service"
                   }</td>
                   <td>${safeInvoice.quantity}</td>
                   <td>${(() => {
                     // For product sales, show actual unit price from database
                     if (
                       safeInvoice.invoiceType === "product" &&
                       safeInvoice.unitPrice
                     ) {
                       return formatCurrency(safeInvoice.unitPrice);
                     }
                     // For services, show service fee (total amount minus any parts/materials)
                     if (safeInvoice.invoiceType === "service") {
                       // Assume 85% is service fee, 15% is materials
                       const serviceFee = safeInvoice.totalAmount * 0.85;
                       return formatCurrency(serviceFee);
                     }
                     // For repairs, show labor cost (total amount minus parts)
                     if (safeInvoice.invoiceType === "repair") {
                       // Assume 60% is labor, 40% is parts
                       const laborCost = safeInvoice.totalAmount * 0.6;
                       return formatCurrency(laborCost);
                     }
                     // Default: show total amount as unit price
                     return formatCurrency(safeInvoice.totalAmount);
                   })()}</td>
                   <td>${formatCurrency(safeInvoice.totalAmount)}</td>
              </tr>
              `
                              }
            </tbody>
          </table>
          <div class="financial-summary">
             <div class="financial-card total-amount">
               <h4>Total Amount</h4>
               <p>${formatCurrency(safeInvoice.totalAmount)}</p>
             </div>
             <div class="financial-card paid-amount">
               <h4>Amount Paid</h4>
               <p>${formatCurrency(safeInvoice.paidAmount)}</p>
             </div>
             <div class="financial-card remaining-amount">
               <h4>Remaining Balance</h4>
               <p>${formatCurrency(safeInvoice.remainingAmount)}</p>
             </div>
          </div>
          
          ${
            paymentHistory.length > 0
              ? `
          <div class="payment-history">
            <h3 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 5px;">Payment History</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Amount Paid</th>
                  <th>Recorded By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${paymentHistory
                  .map(
                    (payment: any) => `
                  <tr>
                    <td>${format(
                      parseISO(payment.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}</td>
                     <td>${formatCurrency(payment.amount)}</td>
                    <td>${payment.recordedBy || "-"}</td>
                    <td>${payment.notes || "-"}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }
          
          <div class="payment-status status-${safeInvoice.status.toLowerCase()}">
            <p><strong>Invoice Status: ${safeInvoice.status.toUpperCase()}</strong></p>
          </div>
          <div class="footer">
            <p>Thank you for choosing SolNet Computer Services!</p>
            <p>Please contact us if you have any questions about this invoice.</p>
          </div>
        </body>
        <script>
          // Load company logo
          fetch('/api/logo')
            .then(response => response.json())
            .then(data => {
              if (data.logo && data.logo.data) {
                const logoImg = document.getElementById('company-logo');
                if (logoImg) {
                  logoImg.src = data.logo.data;
                }
              }
            })
            .catch(error => {
            });
        </script>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  const sendInvoiceEmail = async (invoice: LoanInvoice) => {
    try {
      await apiRequest(
        `/api/loan-invoices/${invoice.id}/send-email`,
        "POST",
        {}
      );
      toast({
        title: "Success",
        description: "Invoice sent to customer email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice email.",
        variant: "destructive",
      });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate based on invoice type
    let isValid = true;
    let errorMessage = "";

    if (!formData.customerId || !formData.totalAmount) {
      isValid = false;
      errorMessage =
        "Please fill in customer, total amount, and all required fields.";
    } else if (formData.invoiceType === "service") {
      if (
        !formData.serviceTypeId ||
        !formData.deviceTypeId ||
        !formData.serviceDescription
      ) {
        isValid = false;
        errorMessage =
          "For service invoices, please select service type, device type, and provide service description.";
      }
    } else if (formData.invoiceType === "product") {
      if (
        !formData.inventoryItemId ||
        !formData.quantity ||
        !formData.unitPrice
      ) {
        isValid = false;
        errorMessage =
          "For product sales, please select an item, quantity, and unit price.";
      }
    }

    if (!isValid) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    const remainingAmount =
      parseFloat(formData.totalAmount) - parseFloat(formData.paidAmount);
    const invoiceData = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount),
      remainingAmount,
    };

    createInvoiceMutation.mutate(invoiceData);
  };
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.amount || !selectedInvoice) {
      toast({
        title: "Error",
        description: "Please enter payment amount.",
        variant: "destructive",
      });
      return;
    }
    const paymentAmount = parseFloat(paymentData.amount);
    const remainingAmount = Number(selectedInvoice.remainingAmount || 0);
    if (paymentAmount > remainingAmount) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed remaining balance.",
        variant: "destructive",
      });
      return;
    }
    recordPaymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      ...paymentData,
    });
  };
  const openPaymentDialog = (invoice: LoanInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: "",
      paymentMethod: "cash",
      notes: "",
    });
    setIsPaymentDialogOpen(true);
  };
  const openEditDialog = (invoice: LoanInvoice) => {
    setEditingInvoice(invoice);
    setIsEditDialogOpen(true);
  };
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      deviceDescription: formData.get("deviceDescription") as string,
      serviceDescription: formData.get("serviceDescription") as string,
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      dueDate: formData.get("dueDate") as string,
      notes: formData.get("notes") as string,
    };
    updateInvoiceMutation.mutate({
      id: editingInvoice.id,
      updates,
    });
  };
  const handleDelete = (invoice: LoanInvoice) => {
    if (confirm(`Are you sure you want to delete this invoice?`)) {
      deleteInvoiceMutation.mutate(invoice.id);
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.deviceDescription
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <TooltipProvider>
      <PageLayout
        title="Loan Invoice Management"
        subtitle="Manage payment requests and track outstanding balances"
        icon={FileText}
        actions={
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCombinedInvoiceDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Combined Invoice
            </Button>
            <Button 
              variant="default"
              onClick={() => setIsDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        }
      >
        {/* Create Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Loan Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Invoice Type Selection */}
                    <div>
                      <Label htmlFor="invoiceType">Invoice Type</Label>
                      <Select
                        value={formData.invoiceType}
                        onValueChange={(value) =>
                          setFormData((prev) => {
                            // Reset all type-specific fields when changing invoice type
                            const newFormData = {
                              ...prev,
                              invoiceType: value,
                            };

                            // Reset fields based on new invoice type
                            if (value === "service") {
                              // Keep service-related fields, reset others
                              newFormData.inventoryItemId = "";
                              newFormData.quantity = 1;
                              newFormData.unitPrice = "";
                            } else if (value === "product") {
                              // Keep product-related fields, reset others
                              newFormData.serviceTypeId = "";
                              newFormData.deviceTypeId = "";
                              newFormData.serviceDescription = "";
                            } else if (value === "repair") {
                              // Keep repair-related fields, reset others
                              newFormData.inventoryItemId = "";
                              newFormData.quantity = 1;
                              newFormData.unitPrice = "";
                            }

                            return newFormData;
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice type" />
                        </SelectTrigger>
                        <SelectContent side="bottom" sideOffset={4}>
                          <SelectItem value="service">
                            🔧 Service Invoice
                          </SelectItem>
                          <SelectItem value="product">
                            🛒 Product Sale
                          </SelectItem>
                          <SelectItem value="repair">
                            ⚙️ Repair Service
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Customer Selection */}
                    <div>
                      <Label htmlFor="customerId">Customer</Label>
                      <Select
                        value={formData.customerId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            customerId: value,
                          }))
                        }
                        disabled={customersLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              customersLoading
                                ? "Loading customers..."
                                : "Select customer"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent side="bottom" sideOffset={4}>
                          {customersLoading ? (
                            <SelectItem value="" disabled>
                              Loading customers...
                            </SelectItem>
                          ) : customers.length === 0 ? (
                            <SelectItem value="" disabled>
                              No customers found
                            </SelectItem>
                          ) : (
                            customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Conditional Fields Based on Invoice Type */}
                    {formData.invoiceType === "service" && (
                      <>
                        <div>
                          <Label htmlFor="serviceType">Service Type</Label>
                          <Select
                            value={formData.serviceTypeId}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                serviceTypeId: value,
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" sideOffset={4}>
                              {serviceTypesLoading ? (
                                <SelectItem value="" disabled>
                                  Loading service types...
                                </SelectItem>
                              ) : serviceTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No service types found
                                </SelectItem>
                              ) : (
                                serviceTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="deviceTypeId">Device Type</Label>
                          <Select
                            value={formData.deviceTypeId}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                deviceTypeId: value,
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" sideOffset={4}>
                              {deviceTypesLoading ? (
                                <SelectItem value="" disabled>
                                  Loading device types...
                                </SelectItem>
                              ) : deviceTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No device types found
                                </SelectItem>
                              ) : (
                                deviceTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="serviceDescription">
                            Service Description
                          </Label>
                          <Input
                            id="serviceDescription"
                            value={formData.serviceDescription}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                serviceDescription: e.target.value,
                              }))
                            }
                            placeholder="e.g., Screen replacement, software installation"
                            required
                          />
                        </div>
                      </>
                    )}

                    {formData.invoiceType === "product" && (
                      <>
                        <div>
                          <Label htmlFor="inventoryItem">Product</Label>
                          <Select
                            value={formData.inventoryItemId}
                            onValueChange={(value) => {
                              const itemDetails =
                                getInventoryItemDetails(value);
                              setFormData((prev) => ({
                                ...prev,
                                inventoryItemId: value,
                                unitPrice: itemDetails?.price?.toString() || "",
                                totalAmount: itemDetails?.price
                                  ? (itemDetails.price * prev.quantity).toFixed(
                                      2
                                    )
                                  : "",
                              }));
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent side="bottom" sideOffset={4}>
                              {inventoryItemsLoading ? (
                                <SelectItem value="" disabled>
                                  Loading products...
                                </SelectItem>
                              ) : inventoryItems.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No products found
                                </SelectItem>
                              ) : (
                                inventoryItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} - ${item.salePrice} (
                                    {item.category})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={formData.quantity}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 1;
                                setFormData((prev) => ({
                                  ...prev,
                                  quantity,
                                  totalAmount: prev.unitPrice
                                    ? (
                                        parseFloat(prev.unitPrice) * quantity
                                      ).toFixed(2)
                                    : "",
                                }));
                              }}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="unitPrice">Unit Price</Label>
                            <Input
                              id="unitPrice"
                              type="number"
                              step="0.01"
                              value={formData.unitPrice}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  unitPrice: e.target.value,
                                  totalAmount: e.target.value
                                    ? (
                                        parseFloat(e.target.value) *
                                        prev.quantity
                                      ).toFixed(2)
                                    : "",
                                }));
                              }}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {formData.invoiceType === "repair" && (
                      <>
                        <div>
                          <Label htmlFor="deviceTypeId">Device Type</Label>
                          <Select
                            value={formData.deviceTypeId}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                deviceTypeId: value,
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" sideOffset={4}>
                              {deviceTypesLoading ? (
                                <SelectItem value="" disabled>
                                  Loading device types...
                                </SelectItem>
                              ) : deviceTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No device types found
                                </SelectItem>
                              ) : (
                                deviceTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="serviceType">Service Type</Label>
                          <Select
                            value={formData.serviceTypeId}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                serviceTypeId: value,
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent side="bottom" sideOffset={4}>
                              {serviceTypesLoading ? (
                                <SelectItem value="" disabled>
                                  Loading service types...
                                </SelectItem>
                              ) : serviceTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No service types found
                                </SelectItem>
                              ) : (
                                serviceTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="serviceDescription">
                            Repair Description
                          </Label>
                          <Input
                            id="serviceDescription"
                            value={formData.serviceDescription}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                serviceDescription: e.target.value,
                              }))
                            }
                            placeholder="e.g., Screen replacement with labor"
                            required
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="totalAmount">Total Amount</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalAmount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="paidAmount">Paid Amount</Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        value={formData.paidAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paidAmount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Additional notes"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createInvoiceMutation.isPending}
                    >
                      {createInvoiceMutation.isPending
                        ? "Creating..."
                        : "Create Invoice"}
                    </Button>
                  </form>
          </DialogContent>
        </Dialog>
        {/* Quick Stats Bar */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  {invoices.length} Total Invoices
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {
                    invoices.filter((inv) => {
                      const dueDate = new Date(inv.dueDate);
                      const today = new Date();
                      return (
                        dueDate < today &&
                        parseFloat(inv.remainingAmount?.toString() || "0") > 0
                      );
                    }).length
                  }{" "}
                  Overdue
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {
                    invoices.filter(
                      (inv) =>
                        parseFloat(inv.remainingAmount?.toString() || "0") === 0
                    ).length
                  }{" "}
                  Paid
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Invoices</p>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateInvoiceStats().totalInvoices}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">All time invoices</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(calculateInvoiceStats().totalAmount)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">All invoices combined</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding</p>
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(calculateInvoiceStats().totalRemaining)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {calculateInvoiceStats().overdueInvoices} overdue invoices
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Collection Rate</p>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateInvoiceStats().collectionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Payment success rate</p>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
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
                    setStatusFilter("all");
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


        {/* Invoices List */}
        <Card className="card-elevated">
          <CardContent className="p-0">
            <div className="space-y-4">
              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                            {invoice.customerName}
                          </h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 mb-1">
                          {(() => {
                            const isCombinedInvoice =
                              invoice.notes &&
                              invoice.notes.startsWith(
                                "COMBINED_INVOICE_ITEMS:"
                              );
                            if (isCombinedInvoice && invoice.notes) {
                              try {
                                const itemsJson = invoice.notes.replace(
                                  "COMBINED_INVOICE_ITEMS:",
                                  ""
                                );
                                const items = JSON.parse(itemsJson);
                                const itemCount = items.length;
                                const serviceCount = items.filter(
                                  (item: any) => item.type === "service"
                                ).length;
                                const salesCount = items.filter(
                                  (item: any) => item.type === "sales"
                                ).length;
                                // Show first few item descriptions
                                const descriptions = items
                                  .slice(0, 3)
                                  .map((item: any) => item.description || "-")
                                  .join(", ");
                                const moreText =
                                  items.length > 3
                                    ? ` and ${items.length - 3} more`
                                    : "";
                                return `Combined Invoice: ${descriptions}${moreText}`;
                              } catch (error) {
                                return `${invoice.deviceDescription} - ${invoice.serviceDescription}`;
                              }
                            } else {
                              return `${invoice.deviceDescription} - ${invoice.serviceDescription}`;
                            }
                          })()}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Due: {format(parseISO(invoice.dueDate), "PPP")}
                          </span>
                          <span>
                            Created:{" "}
                            {format(parseISO(invoice.createdAt), "PPP")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(invoice.totalAmount || 0)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Remaining:{" "}
                          {formatCurrency(invoice.remainingAmount || 0)}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printInvoice(invoice)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendInvoiceEmail(invoice)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        {(Number(invoice.remainingAmount) || 0) > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDialog(invoice)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(invoice)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(invoice)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Combined Invoice Dialog */}
        <Dialog
          open={isCombinedInvoiceDialogOpen}
          onOpenChange={setIsCombinedInvoiceDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Combined Loan Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCombinedInvoiceSubmit} className="space-y-6">
              <div>
                <Label htmlFor="combinedCustomerId">Customer</Label>
                <Select
                  value={selectedCustomer}
                  onValueChange={handleCustomerChange}
                  disabled={customersLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        customersLoading
                          ? "Loading customers..."
                          : "Select customer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    {customersLoading ? (
                      <SelectItem value="" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : customers.length === 0 ? (
                      <SelectItem value="" disabled>
                        No customers found
                      </SelectItem>
                    ) : (
                      customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="combinedServiceType">Service Type</Label>
                <Select
                  value={combinedInvoiceData.serviceTypeId}
                  onValueChange={(value) =>
                    setCombinedInvoiceData((prev) => ({
                      ...prev,
                      serviceTypeId: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    {serviceTypesLoading ? (
                      <SelectItem value="" disabled>
                        Loading service types...
                      </SelectItem>
                    ) : serviceTypes.length === 0 ? (
                      <SelectItem value="" disabled>
                        No service types found
                      </SelectItem>
                    ) : (
                      serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="combinedDeviceType">Device Type</Label>
                <Select
                  value={combinedInvoiceData.deviceTypeId}
                  onValueChange={(value) =>
                    setCombinedInvoiceData((prev) => ({
                      ...prev,
                      deviceTypeId: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    {deviceTypesLoading ? (
                      <SelectItem value="" disabled>
                        Loading device types...
                      </SelectItem>
                    ) : deviceTypes.length === 0 ? (
                      <SelectItem value="" disabled>
                        No device types found
                      </SelectItem>
                    ) : (
                      deviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedCustomer && (
                <>
                  <div>
                    <Label>Outstanding Amounts</Label>
                    <div className="mt-2 space-y-3">
                      {combinedInvoiceData.selectedItems.length === 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500">
                            No outstanding amounts found for this customer.
                          </p>
                          <p className="text-sm text-gray-400">
                            Debug info: Services: {outstandingServices.length},
                            Sales: {outstandingSales.length}
                          </p>
                        </div>
                      ) : (
                        combinedInvoiceData.selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg"
                          >
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                handleItemSelection(item.id, checked as boolean)
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {item.type === "service" ? (
                                  <Wrench className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 text-green-500" />
                                )}
                                <span className="font-medium">
                                  {item.description}
                                </span>
                                <Badge variant="outline">
                                  {item.type === "service"
                                    ? "Service"
                                    : "Sales"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(item.amount)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {combinedInvoiceData.selectedItems.some(
                    (item) => item.selected
                  ) && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            combinedInvoiceData.selectedItems
                              .filter((item) => item.selected)
                              .reduce(
                                (sum, item) => sum + Number(item.amount),
                                0
                              )
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="combinedDueDate">Due Date</Label>
                    <Input
                      id="combinedDueDate"
                      type="date"
                      value={combinedInvoiceData.dueDate}
                      onChange={(e) =>
                        setCombinedInvoiceData((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="combinedNotes">Notes</Label>
                    <Input
                      id="combinedNotes"
                      value={combinedInvoiceData.notes}
                      onChange={(e) =>
                        setCombinedInvoiceData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Invoice notes (optional)"
                    />
                  </div>
                </>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createCombinedInvoiceMutation.isPending || !selectedCustomer
                }
              >
                {createCombinedInvoiceMutation.isPending
                  ? "Creating..."
                  : "Create Combined Invoice"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Payment Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{selectedInvoice.customerName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.deviceDescription}
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Remaining Balance: </span>
                  <span className="text-red-600">
                    {formatCurrency(selectedInvoice.remainingAmount || 0)}
                  </span>
                </div>
              </div>
            )}
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      paymentMethod: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentNotes">Notes</Label>
                <Input
                  id="paymentNotes"
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Payment notes (optional)"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={recordPaymentMutation.isPending}
              >
                {recordPaymentMutation.isPending
                  ? "Recording..."
                  : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Edit Invoice Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Loan Invoice</DialogTitle>
            </DialogHeader>
            {editingInvoice && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="editDeviceDescription">
                    Device Description
                  </Label>
                  <Input
                    id="editDeviceDescription"
                    name="deviceDescription"
                    defaultValue={editingInvoice.deviceDescription}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editServiceDescription">
                    Service Description
                  </Label>
                  <Input
                    id="editServiceDescription"
                    name="serviceDescription"
                    defaultValue={editingInvoice.serviceDescription}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTotalAmount">Total Amount</Label>
                  <Input
                    id="editTotalAmount"
                    name="totalAmount"
                    type="number"
                    step="0.01"
                    defaultValue={Number(editingInvoice.totalAmount) || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={editingInvoice.dueDate.split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editNotes">Notes</Label>
                  <Input
                    id="editNotes"
                    name="notes"
                    defaultValue={editingInvoice.notes || ""}
                    placeholder="Optional notes"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateInvoiceMutation.isPending}
                >
                  {updateInvoiceMutation.isPending
                    ? "Updating..."
                    : "Update Invoice"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </PageLayout>
    </TooltipProvider>
  );
}
