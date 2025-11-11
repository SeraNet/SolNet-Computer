import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/hooks/useLocation";
import PurchaseOrderModal from "@/components/purchase-order-modal";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Filter,
  Upload,
  X,
  Cable,
  Monitor,
  Mouse,
  Wrench,
  HardDrive,
  Battery,
  Cpu,
  MemoryStick,
  ShoppingCart,
  FileText,
  Send,
  Check,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/page-layout";
// Fixed inventory item schema that matches the database
const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchasePrice: z
    .number()
    .min(0, "Purchase price must be positive")
    .optional(),
  salePrice: z.number().min(0, "Sale price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  minStockLevel: z.number().min(0, "Minimum stock level must be positive"),
  reorderPoint: z.number().min(0, "Reorder point must be positive"),
  reorderQuantity: z.number().min(1, "Reorder quantity must be at least 1"),
  leadTimeDays: z.number().min(0).optional(),
  // Display and status fields
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  imageUrl: z.string().optional(),
  // Essential inventory fields
  supplier: z.string().optional(),
  barcode: z.string().optional(),
  // Location field
  locationId: z.string().optional(),
});
type InventoryItemForm = z.infer<typeof inventoryItemSchema>;
// Data returned from the API includes an id and timestamps
type InventoryItem = InventoryItemForm & {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
export default function InventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedLocation, selectedLocationData } = useLocation();
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );

  // Track location data changes
  useEffect(() => {
    // Location data updated
  }, [selectedLocation, selectedLocationData]);

  // Check for itemId in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("itemId");
    if (itemId) {
      setHighlightedItemId(itemId);
      // Clear the URL parameter after reading it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Show a toast to indicate the item was highlighted
      toast({
        title: "Item Highlighted",
        description:
          "The inventory item from your notification has been highlighted below.",
      });
    }
  }, [toast]);
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  // Purchase order modal state
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] =
    useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<any>(null);
  const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState<any>(null);
  const [isPurchaseOrderDetailsOpen, setIsPurchaseOrderDetailsOpen] =
    useState(false);
  // Purchase order filtering and sorting
  const [purchaseOrderFilterStatus, setPurchaseOrderFilterStatus] =
    useState<string>("all");
  const [purchaseOrderFilterPriority, setPurchaseOrderFilterPriority] =
    useState<string>("all");
  const [purchaseOrderSortBy, setPurchaseOrderSortBy] =
    useState<string>("createdAt");
  const [purchaseOrderSortOrder, setPurchaseOrderSortOrder] = useState<
    "asc" | "desc"
  >("desc");
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Inventory-specific categories
  const inventoryCategories = [
    { id: "accessories", name: "Accessories", icon: Package },
    { id: "cables", name: "Cables & Adapters", icon: Cable },
    { id: "components", name: "Components", icon: Cpu },
    { id: "peripherals", name: "Peripherals", icon: Mouse },
    { id: "tools", name: "Tools", icon: Wrench },
    { id: "software", name: "Software", icon: HardDrive },
    { id: "parts", name: "Parts", icon: MemoryStick },
    { id: "consumables", name: "Consumables", icon: Battery },
    { id: "electronics", name: "Electronics", icon: Monitor },
    { id: "equipment", name: "Equipment", icon: Monitor },
    { id: "other", name: "Other", icon: Package },
  ];
  // Fixed form with proper default values
  const form = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "Accessories",
      brand: "",
      model: "",
      purchasePrice: undefined,
      salePrice: 0,
      quantity: 0,
      minStockLevel: 10,
      reorderPoint: 15,
      reorderQuantity: 50,
      isPublic: true,
      isActive: true,
      sortOrder: 0,
      imageUrl: "",
      supplier: "",
      barcode: "",
      leadTimeDays: 7,
      locationId: selectedLocationData?.id || undefined,
    },
  });
  // Update form when location changes
  useEffect(() => {
    if (selectedLocationData?.id) {
      form.setValue("locationId", selectedLocationData.id);
    }
  }, [selectedLocationData, form]);
  // Queries with location filtering
  const {
    data: inventoryItems = [],
    isLoading,
    error: inventoryError,
  } = useQuery<InventoryItem[]>({
    queryKey: ["inventory", selectedLocationData?.id],
    queryFn: () => {
      const params = selectedLocationData?.id
        ? `?locationId=${selectedLocationData.id}`
        : "";
      return apiRequest(`/api/inventory${params}`, "GET");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  // Purchase order statistics
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase-orders", "stats", selectedLocationData?.id],
    queryFn: () => {
      const params = selectedLocationData?.id
        ? `?locationFilter=${encodeURIComponent(
            JSON.stringify({
              locationId: selectedLocationData.id,
              includeAllLocations: false,
            })
          )}`
        : "";
      return apiRequest(`/api/purchase-orders${params}`, "GET");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate purchase order statistics
  const purchaseOrderStats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter((po: any) => po.status === "draft").length,
    submitted: purchaseOrders.filter((po: any) => po.status === "submitted")
      .length,
    approved: purchaseOrders.filter((po: any) => po.status === "approved")
      .length,
    received: purchaseOrders.filter((po: any) => po.status === "received")
      .length,
    cancelled: purchaseOrders.filter((po: any) => po.status === "cancelled")
      .length,
    urgent: purchaseOrders.filter((po: any) => po.priority === "urgent").length,
    totalValue: purchaseOrders.reduce(
      (sum: number, po: any) => sum + parseFloat(po.totalEstimatedCost || "0"),
      0
    ),
    averageValue:
      purchaseOrders.length > 0
        ? purchaseOrders.reduce(
            (sum: number, po: any) =>
              sum + parseFloat(po.totalEstimatedCost || "0"),
            0
          ) / purchaseOrders.length
        : 0,
  };
  // Fetch purchase order items when viewing a purchase order
  const {
    data: purchaseOrderItems = [],
    isLoading: loadingPurchaseOrderItems,
  } = useQuery({
    queryKey: ["purchase-orders", viewingPurchaseOrder?.id, "items"],
    queryFn: () =>
      apiRequest(
        `/api/purchase-orders/${viewingPurchaseOrder?.id}/items`,
        "GET"
      ),
    enabled: !!viewingPurchaseOrder?.id,
  });
  // Mutations
  const addItemMutation = useMutation({
    mutationFn: (data: InventoryItemForm) =>
      apiRequest("/api/inventory", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsDialogOpen(false);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  const updateItemMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InventoryItemForm>;
    }) => apiRequest(`/api/inventory/${id}`, "PUT", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/inventory/${id}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Purchase Order Mutations
  const updatePurchaseOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/purchase-orders/${id}`, "PUT", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setEditingPurchaseOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  const deletePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  const finalizePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}`, "PUT", { status: "submitted" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order finalized and submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to finalize purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  // Purchase Order Workflow Mutations
  const submitPurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}/submit`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Purchase Order Submitted",
        description: "Purchase order has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit purchase order.",
        variant: "destructive",
      });
    },
  });
  const approvePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Purchase Order Approved",
        description: "Purchase order has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve purchase order.",
        variant: "destructive",
      });
    },
  });
  const receivePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}/receive`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Purchase Order Received",
        description: "Purchase order has been received successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to receive purchase order.",
        variant: "destructive",
      });
    },
  });
  const cancelPurchaseOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest(`/api/purchase-orders/${id}/cancel`, "PATCH", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Purchase Order Cancelled",
        description: "Purchase order has been cancelled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel purchase order.",
        variant: "destructive",
      });
    },
  });
  const reopenPurchaseOrderMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/purchase-orders/${id}/reopen`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Purchase Order Reopened",
        description: "Purchase order has been reopened as draft.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reopen purchase order.",
        variant: "destructive",
      });
    },
  });
  // Filter items based on active tab and search term
  const filteredItems = inventoryItems.filter((item) => {
    // First filter by tab
    let tabFilter = true;
    switch (activeTab) {
      case "all":
        tabFilter = true;
        break;
      case "public":
        tabFilter = item.isPublic && item.isActive;
        break;
      case "private":
        tabFilter = !item.isPublic || !item.isActive;
        break;
      case "low-stock":
        tabFilter = item.quantity <= item.minStockLevel;
        break;
      case "out-of-stock":
        tabFilter = item.quantity === 0;
        break;
      default:
        tabFilter = true;
    }
    // Then filter by search term
    const searchFilter =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand &&
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return tabFilter && searchFilter;
  });
  // Helper functions
  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) {
      return { status: "Out of Stock", color: "destructive" };
    } else if (quantity <= minStockLevel) {
      return { status: "Low Stock", color: "destructive" };
    } else {
      return { status: "In Stock", color: "default" };
    }
  };
  const getCategoryIcon = (category: string) => {
    const categoryItem = inventoryCategories.find(
      (cat) => cat.name === category || cat.id === category
    );
    return categoryItem?.icon || Package;
  };
  const openDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      // Set image preview if item has an image
      if (item.imageUrl) {
        setImagePreview(item.imageUrl);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      form.reset({
        name: item.name,
        sku: item.sku,
        description: item.description || "",
        category: item.category || "Accessories",
        brand: item.brand || "",
        model: item.model || "",
        purchasePrice: item.purchasePrice
          ? Number(item.purchasePrice)
          : undefined,
        salePrice: Number(item.salePrice),
        quantity: item.quantity,
        minStockLevel: item.minStockLevel,
        reorderPoint: item.reorderPoint,
        reorderQuantity: item.reorderQuantity,
        isPublic: item.isPublic,
        isActive: item.isActive,
        sortOrder: item.sortOrder || 0,
        imageUrl: item.imageUrl || "",
        supplier: item.supplier || "",
        barcode: item.barcode || "",
        leadTimeDays: item.leadTimeDays || 7,
        locationId: item.locationId || selectedLocationData?.id || "",
      });
    } else {
      setEditingItem(null);
      setImagePreview(null);
      setImageFile(null);
      form.reset({
        name: "",
        sku: "",
        description: "",
        category: "Accessories",
        brand: "",
        model: "",
        purchasePrice: undefined,
        salePrice: 0,
        quantity: 0,
        minStockLevel: 10,
        reorderPoint: 15,
        reorderQuantity: 50,
        isPublic: true,
        isActive: true,
        sortOrder: 0,
        imageUrl: "",
        supplier: "",
        barcode: "",
        leadTimeDays: 7,
        locationId: selectedLocationData?.id || "",
      });
    }
    setIsDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(id);
    }
  };
  // Simplified image upload functions
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("imageUrl", "");
  };
  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };
  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };
  const handleBulkDelete = async () => {
    if (
      confirm(`Are you sure you want to delete ${selectedItems.length} items?`)
    ) {
      try {
        await Promise.all(
          selectedItems.map((id) => deleteItemMutation.mutateAsync(id))
        );
        setSelectedItems([]);
        toast({
          title: "Success",
          description: `${selectedItems.length} items deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete some items",
          variant: "destructive",
        });
      }
    }
  };
  const handleTogglePublic = async (item: any) => {
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: { isPublic: !item.isPublic },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item visibility. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleBulkTogglePublic = async (isPublic: boolean) => {
    try {
      const updatePromises = selectedItems
        .map((id) => {
          const item = inventoryItems.find((item) => item.id === id);
          if (item) {
            return updateItemMutation.mutateAsync({
              id,
              data: { isPublic },
            });
          }
          return null;
        })
        .filter(Boolean);
      if (updatePromises.length === 0) {
        toast({
          title: "Warning",
          description: "No valid items selected for update",
          variant: "destructive",
        });
        return;
      }
      await Promise.all(updatePromises);
      setSelectedItems([]);
      toast({
        title: "Success",
        description: `${updatePromises.length} items ${
          isPublic ? "made public" : "made private"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some items. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleExportInventory = () => {
    const dataToExport = filteredItems.map((item) => ({
      Name: item.name,
      SKU: item.sku,
      Category: item.category,
      Brand: item.brand || "",
      Model: item.model || "",
      Description: item.description || "",
      Purchase_Price: item.purchasePrice || 0,
      Sale_Price: item.salePrice,
      Quantity: item.quantity,
      Min_Stock_Level: item.minStockLevel,
      Reorder_Point: item.reorderPoint,
      Reorder_Quantity: item.reorderQuantity,
      Supplier: item.supplier || "",
      Barcode: item.barcode || "",
      Public: item.isPublic ? "Yes" : "No",
      Active: item.isActive ? "Yes" : "No",
      Sort_Order: item.sortOrder,
      Created_At: item.createdAt,
      Updated_At: item.updatedAt,
    }));
    const csvContent = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: `Exported ${dataToExport.length} items to CSV`,
    });
  };
  // Purchase Order Handlers
  const handleViewPurchaseOrder = (purchaseOrder: any) => {
    setViewingPurchaseOrder(purchaseOrder);
    setIsPurchaseOrderDetailsOpen(true);
  };
  const handleEditPurchaseOrder = (purchaseOrder: any) => {
    setEditingPurchaseOrder(purchaseOrder);
    setIsPurchaseOrderModalOpen(true);
  };
  const handleDeletePurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to delete purchase order ${purchaseOrder.orderNumber}?`
      )
    ) {
      deletePurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  const handleFinalizePurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to finalize purchase order ${purchaseOrder.orderNumber}? This action cannot be undone.`
      )
    ) {
      finalizePurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  // Purchase Order Workflow Handlers
  const handleSubmitPurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to submit purchase order ${purchaseOrder.orderNumber}?`
      )
    ) {
      submitPurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  const handleApprovePurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to approve purchase order ${purchaseOrder.orderNumber}?`
      )
    ) {
      approvePurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  const handleReceivePurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to mark purchase order ${purchaseOrder.orderNumber} as received?`
      )
    ) {
      receivePurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  const handleCancelPurchaseOrder = (purchaseOrder: any) => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (reason !== null && reason.trim() !== "") {
      cancelPurchaseOrderMutation.mutate({
        id: purchaseOrder.id,
        reason: reason.trim(),
      });
    }
  };
  const handleReopenPurchaseOrder = (purchaseOrder: any) => {
    if (
      confirm(
        `Are you sure you want to reopen purchase order ${purchaseOrder.orderNumber} as draft?`
      )
    ) {
      reopenPurchaseOrderMutation.mutate(purchaseOrder.id);
    }
  };
  // Simplified image upload - just use base64 for now
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
  const onSubmit = async (data: InventoryItemForm) => {
    try {
      setIsUploading(true);
      // Handle image upload if there's a new image file
      let finalImageUrl = data.imageUrl;
      if (imageFile) {
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (error) {
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }
      const finalData = {
        ...data,
        imageUrl: finalImageUrl,
        locationId: selectedLocationData?.id || data.locationId,
      };
      if (editingItem) {
        updateItemMutation.mutate({ id: editingItem.id, data: finalData });
      } else {
        addItemMutation.mutate(finalData);
      }
      // Reset image state after successful submission
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <PageLayout
      icon={Package}
      title="Inventory Management"
      subtitle="Manage your inventory items and accessories for both internal use and public display"
      actions={
        <>
          {selectedLocationData && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {selectedLocationData.name}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setIsPurchaseOrderModalOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase Order
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </>
      }
    >
      {/* Add Item Dialog - Outside of actions */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Package className="h-5 w-5" />
              {editingItem
                ? "Edit Inventory Item"
                : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingItem
                ? "Update the item details below."
                : "Add a new item to your inventory with essential information."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Basic Information Section */}
              <div className="bg-blue-50/50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Stock keeping unit"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Item description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent side="bottom" sideOffset={4}>
                            {inventoryCategories.map((category) => (
                              <SelectItem
                                key={`inventory-category-${category.id}`}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Model number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              {/* Pricing & Stock Section */}
              <div className="bg-green-50/50 dark:bg-green-950/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                  Pricing & Stock Management
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value ? parseFloat(value) : undefined
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sale Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value ? parseFloat(value) : 0
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value ? parseInt(value) : 0);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="minStockLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Stock</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="10"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value ? parseInt(value) : 0);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reorderPoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reorder Point</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="15"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value ? parseInt(value) : 0);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="reorderQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reorder Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value ? parseInt(value) : 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Public Display Options */}
                  <div className="bg-purple-50/50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Public Display Options
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Public Display
                                  </FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Show this item on the public landing page
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Active
                                  </FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Item is available for sale
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sortOrder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Order</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(
                                        value ? parseInt(value) : 0
                                      );
                                    }}
                                  />
                                </FormControl>
                                <div className="text-sm text-muted-foreground">
                                  Lower numbers appear first on public pages
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Image</FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    {/* Image Preview */}
                                    {(imagePreview || field.value) && (
                                      <div className="relative">
                                        <img
                                          src={imagePreview || field.value}
                                          alt="Product preview"
                                          className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-2 right-2"
                                          onClick={removeImage}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                    {/* Upload Area */}
                                    {!imagePreview && !field.value && (
                                      <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                        onClick={() =>
                                          document
                                            .getElementById("image-upload")
                                            ?.click()
                                        }
                                      >
                                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                          Click to upload image
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          PNG, JPG, GIF up to 5MB
                                        </p>
                                      </div>
                                    )}
                                    {/* Hidden file input */}
                                    <input
                                      id="image-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageChange}
                                      className="hidden"
                                    />
                                    {/* URL input as fallback */}
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-600">
                                        Or enter image URL:
                                      </p>
                                      <Input
                                        placeholder="https://example.com/image.jpg"
                                        {...field}
                                      />
                                    </div>
                                  </div>
                                </FormControl>
                                <div className="text-sm text-muted-foreground">
                                  Upload an image or provide a URL for public
                                  display
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Input placeholder="Supplier name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode</FormLabel>
                            <FormControl>
                              <Input placeholder="Barcode/SKU" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leadTimeDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Time (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="7"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value ? parseInt(value) : 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        addItemMutation.isPending ||
                        updateItemMutation.isPending ||
                        isUploading
                      }
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {editingItem ? "Updating..." : "Adding..."}
                        </>
                      ) : editingItem ? (
                        "Update Item"
                      ) : (
                        "Add Item"
                      )}
                    </Button>
                  </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            All Items
          </TabsTrigger>
          <TabsTrigger
            value="public"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Public Display
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Private Items
          </TabsTrigger>
          <TabsTrigger
            value="low-stock"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Low Stock
          </TabsTrigger>
          <TabsTrigger
            value="out-of-stock"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Out of Stock
          </TabsTrigger>
          <TabsTrigger
            value="purchase-orders"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Purchase Orders
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-6">
          {/* Search and Bulk Actions - Only for inventory tabs */}
          {activeTab !== "purchase-orders" && (
            <>
              <Card className="card-elevated mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Input
                          placeholder="Search items by name, SKU, category, brand..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 text-base border-gray-200 focus:border-blue-300 focus:ring-blue-500/20"
                        />
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {selectedItems.length > 0 ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkTogglePublic(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Make Public
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkTogglePublic(false)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Make Private
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete ({selectedItems.length})
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportInventory}
                            disabled={filteredItems.length === 0}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export CSV
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card className="group card-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Total Items
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {inventoryItems.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="group card-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Public Items
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {
                        inventoryItems.filter(
                          (item) => item.isPublic && item.isActive
                        ).length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card className="group card-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Low Stock
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {
                        inventoryItems.filter(
                          (item) => item.quantity <= item.minStockLevel
                        ).length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card className="group card-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 rounded-xl shadow-lg group-hover:shadow-red-500/50 transition-all duration-300">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Out of Stock
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {
                        inventoryItems.filter((item) => item.quantity === 0)
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card className="group card-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Purchase Orders
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {
                            purchaseOrders.filter(
                              (po: any) => po.status === "draft"
                            ).length
                          }{" "}
                          drafts
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {purchaseOrders.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Items Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="relative">
                      <div className="relative h-24 overflow-hidden rounded-t-lg">
                        <Skeleton className="h-full w-full" />
                      </div>
                      <CardHeader className="pb-1 px-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 flex-1">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-5 w-5 rounded" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-16 rounded" />
                          <Skeleton className="h-4 w-12 rounded" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-1 px-3 pb-3">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-20 rounded" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Select All Checkbox */}
                  {filteredItems.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === filteredItems.length &&
                          filteredItems.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">
                        Select All ({filteredItems.length} items)
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(
                        item.quantity,
                        item.minStockLevel
                      );
                      const CategoryIcon = getCategoryIcon(item.category);
                      return (
                        <Card
                          key={item.id}
                          className={`relative hover:shadow-lg transition-all duration-200 group card-elevated ${
                            highlightedItemId === item.id
                              ? "ring-4 ring-blue-500 ring-opacity-50 bg-blue-50/50 dark:bg-blue-950/50"
                              : ""
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm"
                            />
                          </div>
                          {/* Image */}
                          <div className="relative h-24 overflow-hidden rounded-t-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CategoryIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Button
                                variant={
                                  item.isPublic ? "default" : "secondary"
                                }
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => handleTogglePublic(item)}
                                disabled={updateItemMutation.isPending}
                              >
                                {item.isPublic ? (
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
                            </div>
                          </div>
                          <CardHeader className="pb-1 px-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <CardTitle className="text-xs font-semibold truncate">
                                  {item.name}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                                  onClick={() => openDialog(item)}
                                  title="Edit Item"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(item.id)}
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1 text-xs px-1 py-0.5"
                              >
                                {(() => {
                                  const CategoryIcon = getCategoryIcon(
                                    item.category
                                  );
                                  return <CategoryIcon className="h-3 w-3" />;
                                })()}
                                {item.category}
                              </Badge>
                              {item.brand && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0.5"
                                >
                                  {item.brand}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-1 bg-gradient-to-b from-white to-gray-50/30 px-3 pb-3">
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-xs">
                                  {formatCurrency(item.salePrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3 text-blue-600" />
                                <span className="font-medium text-xs">
                                  {item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant={stockStatus.color as any}
                                className="text-xs px-1 py-0.5"
                              >
                                {stockStatus.status}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {item.sku && (
                                  <div className="text-xs text-muted-foreground font-mono truncate">
                                    {item.sku}
                                  </div>
                                )}
                                {item.sortOrder > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    #{item.sortOrder}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Search purchase orders by number, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={purchaseOrderFilterStatus}
                  onValueChange={setPurchaseOrderFilterStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={purchaseOrderFilterPriority}
                  onValueChange={setPurchaseOrderFilterPriority}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={purchaseOrderSortBy}
                  onValueChange={setPurchaseOrderSortBy}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="orderNumber">Order Number</SelectItem>
                    <SelectItem value="totalEstimatedCost">
                      Total Value
                    </SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPurchaseOrderSortOrder(
                      purchaseOrderSortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {purchaseOrderSortOrder === "asc" ? "↑" : "↓"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPurchaseOrderModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Purchase Order
                </Button>
              </div>
            </div>
            {/* Enhanced Purchase Orders Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-xl border border-blue-200/60 dark:border-blue-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {purchaseOrderStats.total}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Orders</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/30 rounded-xl border border-yellow-200/60 dark:border-yellow-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {purchaseOrderStats.draft}
                </div>
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Draft</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 rounded-xl border border-orange-200/60 dark:border-orange-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {purchaseOrderStats.submitted}
                </div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Submitted</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 rounded-xl border border-green-200/60 dark:border-green-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {purchaseOrderStats.approved}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Approved</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {purchaseOrderStats.received}
                </div>
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Received</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 rounded-xl border border-red-200/60 dark:border-red-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {purchaseOrderStats.cancelled}
                </div>
                <div className="text-sm font-medium text-red-700 dark:text-red-300">Cancelled</div>
              </div>
              <div className="card-elevated text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 rounded-xl border border-purple-200/60 dark:border-purple-800/60 hover:shadow-lg transition-all duration-200">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {purchaseOrderStats.urgent}
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Urgent</div>
              </div>
            </div>
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="card-elevated bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/60 dark:border-blue-800/60 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {purchaseOrderStats.totalValue >= 1000000
                          ? `ETB ${(purchaseOrderStats.totalValue / 1000000).toFixed(1)}M`
                          : purchaseOrderStats.totalValue >= 1000
                          ? `ETB ${(purchaseOrderStats.totalValue / 1000).toFixed(1)}K`
                          : formatCurrency(purchaseOrderStats.totalValue)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30 border-green-200/60 dark:border-green-800/60 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        Average Order Value
                      </p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {purchaseOrderStats.averageValue >= 1000000
                          ? `ETB ${(purchaseOrderStats.averageValue / 1000000).toFixed(1)}M`
                          : purchaseOrderStats.averageValue >= 1000
                          ? `ETB ${(purchaseOrderStats.averageValue / 1000).toFixed(1)}K`
                          : formatCurrency(purchaseOrderStats.averageValue)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/30 border-purple-200/60 dark:border-purple-800/60 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {purchaseOrderStats.total > 0
                          ? Math.round(
                              (purchaseOrderStats.received /
                                purchaseOrderStats.total) *
                                100
                            )
                          : 0}%
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/30 border-orange-200/60 dark:border-orange-800/60 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                        Urgent Orders
                      </p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {purchaseOrderStats.urgent}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Purchase Orders Table */}
            {purchaseOrders.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                    No Purchase Orders
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-center">
                    Create your first purchase order to manage inventory
                    procurement.
                  </p>
                  <Button onClick={() => setIsPurchaseOrderModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Purchase Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-100">Purchase Orders</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Manage and track all purchase orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Items & Quantity</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrders
                        .filter((po: any) => {
                          const matchesSearch =
                            searchTerm === "" ||
                            po.orderNumber
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            po.status
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            po.priority
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase());
                          const matchesStatus =
                            purchaseOrderFilterStatus === "all" ||
                            po.status === purchaseOrderFilterStatus;
                          const matchesPriority =
                            purchaseOrderFilterPriority === "all" ||
                            po.priority === purchaseOrderFilterPriority;
                          return (
                            matchesSearch && matchesStatus && matchesPriority
                          );
                        })
                        .sort((a: any, b: any) => {
                          let aValue: any = a[purchaseOrderSortBy];
                          let bValue: any = b[purchaseOrderSortBy];
                          if (
                            purchaseOrderSortBy === "orderNumber" ||
                            purchaseOrderSortBy === "status" ||
                            purchaseOrderSortBy === "priority"
                          ) {
                            aValue = aValue?.toLowerCase() || "";
                            bValue = bValue?.toLowerCase() || "";
                          }
                          if (purchaseOrderSortBy === "totalEstimatedCost") {
                            aValue = parseFloat(aValue || "0");
                            bValue = parseFloat(bValue || "0");
                          }
                          if (purchaseOrderSortOrder === "asc") {
                            return aValue > bValue ? 1 : -1;
                          } else {
                            return aValue < bValue ? 1 : -1;
                          }
                        })
                        .map((po: any) => (
                          <TableRow key={po.id}>
                            <TableCell className="font-medium">
                              {po.orderNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(po.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  po.status === "draft"
                                    ? "secondary"
                                    : po.status === "submitted"
                                    ? "default"
                                    : po.status === "approved"
                                    ? "default"
                                    : po.status === "received"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {po.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {po.totalItems} items
                                </div>
                                <div className="text-muted-foreground">
                                  {po.totalQuantity || po.totalItems} total qty
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                parseFloat(po.totalEstimatedCost || "0")
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  po.priority === "urgent"
                                    ? "destructive"
                                    : po.priority === "high"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {po.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPurchaseOrder(po)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* Draft Status Actions */}
                                {po.status === "draft" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleEditPurchaseOrder(po)
                                      }
                                      title="Edit Order"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleFinalizePurchaseOrder(po)
                                      }
                                      className="text-green-600 hover:text-green-700"
                                      title="Finalize Order"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelPurchaseOrder(po)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                      title="Cancel Order"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {/* Submitted Status Actions */}
                                {po.status === "submitted" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleApprovePurchaseOrder(po)
                                      }
                                      className="text-green-600 hover:text-green-700"
                                      title="Approve Order"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelPurchaseOrder(po)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                      title="Cancel Order"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {/* Approved Status Actions */}
                                {po.status === "approved" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleReceivePurchaseOrder(po)
                                      }
                                      className="text-green-600 hover:text-green-700"
                                      title="Mark as Received"
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelPurchaseOrder(po)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                      title="Cancel Order"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {/* Cancelled Status Actions */}
                                {po.status === "cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleReopenPurchaseOrder(po)
                                    }
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Reopen as Draft"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                                {/* Delete Action (available for all statuses except received) */}
                                {po.status !== "received" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeletePurchaseOrder(po)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Order"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </TabsContent>
      </Tabs>
      {/* Purchase Order Modal - Only render when open */}
      {isPurchaseOrderModalOpen && (
        <PurchaseOrderModal
          isOpen={isPurchaseOrderModalOpen}
          onClose={() => {
            setIsPurchaseOrderModalOpen(false);
            setEditingPurchaseOrder(null);
          }}
          editingPurchaseOrder={editingPurchaseOrder}
          setEditingPurchaseOrder={setEditingPurchaseOrder}
          onOrderCreated={(orderId) => {
            toast({
              title: "Purchase Order Created",
              description: `Purchase order ${orderId} has been created successfully.`,
            });
            // Refresh purchase orders data
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
          }}
          onOrderUpdated={(orderId) => {
            // If orderId is provided, it means we want to edit this order
            if (orderId) {
              // Find the order to edit
              const orderToEdit = purchaseOrders.find(
                (order: any) => order.id === orderId
              );
              if (orderToEdit) {
                setEditingPurchaseOrder(orderToEdit);
                setIsPurchaseOrderModalOpen(true);
              }
            } else {
              toast({
                title: "Purchase Order Updated",
                description: `Purchase order has been updated successfully.`,
              });
              // Refresh purchase orders data
              queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            }
          }}
        />
      )}
      {/* Purchase Order Details Modal */}
      <Dialog
        open={isPurchaseOrderDetailsOpen}
        onOpenChange={setIsPurchaseOrderDetailsOpen}
      >
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          aria-describedby="purchase-order-details-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Purchase Order Details
            </DialogTitle>
            <DialogDescription id="purchase-order-details-description" className="text-slate-600 dark:text-slate-400">
              View complete details of the purchase order
            </DialogDescription>
          </DialogHeader>
          {viewingPurchaseOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-100">Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
                    <div>
                      <p>
                        <strong>Order Number:</strong>{" "}
                        {viewingPurchaseOrder.orderNumber}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          viewingPurchaseOrder.date
                        ).toLocaleDateString()}
                      </p>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          className="ml-2"
                          variant={
                            viewingPurchaseOrder.status === "draft"
                              ? "secondary"
                              : viewingPurchaseOrder.status === "submitted"
                              ? "default"
                              : viewingPurchaseOrder.status === "approved"
                              ? "default"
                              : viewingPurchaseOrder.status === "received"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {viewingPurchaseOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <strong>Priority:</strong>
                        <Badge
                          className="ml-2"
                          variant={
                            viewingPurchaseOrder.priority === "urgent"
                              ? "destructive"
                              : viewingPurchaseOrder.priority === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {viewingPurchaseOrder.priority}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p>
                        <strong>Total Items:</strong>{" "}
                        {viewingPurchaseOrder.totalItems}
                      </p>
                      <p>
                        <strong>Total Cost:</strong>{" "}
                        {formatCurrency(
                          parseFloat(
                            viewingPurchaseOrder.totalEstimatedCost || "0"
                          )
                        )}
                      </p>
                      <p>
                        <strong>Expected Delivery:</strong>{" "}
                        {viewingPurchaseOrder.expectedDeliveryDate
                          ? new Date(
                              viewingPurchaseOrder.expectedDeliveryDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(
                          viewingPurchaseOrder.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {viewingPurchaseOrder.notes && (
                    <div className="mt-4">
                      <p className="text-slate-900 dark:text-slate-100">
                        <strong>Notes:</strong>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {viewingPurchaseOrder.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Order Items */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-100">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPurchaseOrderItems ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                              Loading items...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : purchaseOrderItems.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground"
                          >
                            No items found for this purchase order
                          </TableCell>
                        </TableRow>
                      ) : (
                        purchaseOrderItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.sku || "N/A"}</TableCell>
                            <TableCell>{item.category || "N/A"}</TableCell>
                            <TableCell>{item.suggestedQuantity}</TableCell>
                            <TableCell>
                              {formatCurrency(item.estimatedPrice || 0)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                (item.estimatedPrice || 0) *
                                  item.suggestedQuantity
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.priority === "urgent"
                                    ? "destructive"
                                    : item.priority === "high"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {item.priority || "normal"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPurchaseOrderDetailsOpen(false)}
                >
                  Close
                </Button>
                {/* Draft Status Actions */}
                {viewingPurchaseOrder.status === "draft" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                        setIsPurchaseOrderModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Order
                    </Button>
                    <Button
                      onClick={() => {
                        handleSubmitPurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Order
                    </Button>
                  </>
                )}
                {/* Submitted Status Actions */}
                {viewingPurchaseOrder.status === "submitted" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprovePurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Order
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCancelPurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  </>
                )}
                {/* Approved Status Actions */}
                {viewingPurchaseOrder.status === "approved" && (
                  <>
                    <Button
                      onClick={() => {
                        handleReceivePurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Mark as Received
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCancelPurchaseOrder(viewingPurchaseOrder);
                        setIsPurchaseOrderDetailsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  </>
                )}
                {/* Cancelled Status Actions */}
                {viewingPurchaseOrder.status === "cancelled" && (
                  <Button
                    onClick={() => {
                      handleReopenPurchaseOrder(viewingPurchaseOrder);
                      setIsPurchaseOrderDetailsOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reopen as Draft
                  </Button>
                )}
                {/* Delete Action (available for all statuses except received) */}
                {viewingPurchaseOrder.status !== "received" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeletePurchaseOrder(viewingPurchaseOrder);
                      setIsPurchaseOrderDetailsOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
