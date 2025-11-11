import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/hooks/useLocation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Save,
  Send,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  FileText,
  X,
  RefreshCw,
  Filter,
  Search,
  Edit,
  Settings,
  TrendingUp,
  Calendar,
  User,
  Download,
  Printer,
  Share2,
  MessageCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Utility functions for PDF generation and Telegram integration
const generatePurchaseOrderPDF = (orderData: any, items: any[]) => {
  const doc = {
    content: [
      {
        text: "PURCHASE ORDER",
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            width: "*",
            text: [
              { text: "Order Number: ", bold: true },
              orderData.orderNumber,
              "\n",
              { text: "Date: ", bold: true },
              new Date().toLocaleDateString(),
              "\n",
              { text: "Priority: ", bold: true },
              orderData.priority.toUpperCase(),
              "\n",
              { text: "Expected Delivery: ", bold: true },
              orderData.expectedDeliveryDate || "Not specified",
            ],
          },
          {
            width: "*",
            text: [
              { text: "Location: ", bold: true },
              orderData.locationName || "Not specified",
              "\n",
              { text: "Supplier: ", bold: true },
              orderData.supplierName || "Not specified",
              "\n",
              { text: "Total Items: ", bold: true },
              items.length,
              "\n",
              { text: "Total Cost: ", bold: true },
              formatCurrency(orderData.totalCost),
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        text: "Order Items",
        style: "subheader",
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Item", style: "tableHeader" },
              { text: "Quantity", style: "tableHeader" },
              { text: "Price", style: "tableHeader" },
              { text: "Total", style: "tableHeader" },
              { text: "Priority", style: "tableHeader" },
            ],
            ...items.map((item) => [
              { text: item.name, style: "tableCell" },
              { text: item.customQuantity.toString(), style: "tableCell" },
              { text: formatCurrency(item.customPrice), style: "tableCell" },
              {
                text: formatCurrency(item.customQuantity * item.customPrice),
                style: "tableCell",
              },
              { text: item.priority.toUpperCase(), style: "tableCell" },
            ]),
          ],
        },
      },
      {
        text: [
          { text: "Notes: ", bold: true },
          orderData.notes || "No additional notes",
        ],
        margin: [0, 20, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: "#1e40af",
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: "#374151",
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "#ffffff",
        fillColor: "#1e40af",
      },
      tableCell: {
        fontSize: 9,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  return doc;
};

const sendToTelegram = async (orderData: any, items: any[], pdfBlob?: Blob) => {
  try {
    // This would typically connect to your backend API that handles Telegram integration
    const formData = new FormData();
    formData.append(
      "orderData",
      JSON.stringify({
        orderNumber: orderData.orderNumber,
        totalCost: orderData.totalCost,
        itemCount: items.length,
        priority: orderData.priority,
        expectedDelivery: orderData.expectedDeliveryDate,
      })
    );

    if (pdfBlob) {
      formData.append("pdf", pdfBlob, `${orderData.orderNumber}.pdf`);
    }

    // Get authentication headers manually for FormData
    const token = localStorage.getItem("token");
    const selectedLocation = localStorage.getItem("selectedLocation");

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(selectedLocation &&
        selectedLocation !== "all" && {
          "X-Selected-Location": selectedLocation,
        }),
    };

    const response = await fetch("/api/telegram/send-purchase-order", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || "Failed to send to Telegram");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Purchase Order Form Schema
const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  supplierId: z.string().optional(),
  locationId: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
  expectedDeliveryDate: z.string().optional(),
});

type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>;

// Purchase Order Item Schema
const purchaseOrderItemSchema = z.object({
  itemId: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  sku: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  currentStock: z.number().min(0),
  minStockLevel: z.number().min(0),
  suggestedQuantity: z.number().min(1, "Quantity must be at least 1"),
  estimatedPrice: z.number().min(0, "Price must be positive"),
  supplier: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  notes: z.string().optional(),
  isExistingItem: z.boolean().default(false),
  includeInOrder: z.boolean().default(true),
});

type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;

// Types
type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  quantity: number;
  minStockLevel: number;
  reorderQuantity: number;
  purchasePrice?: number;
  supplier?: string;
  isActive: boolean;
};

// Enhanced item selection type
type SelectedItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  suggestedQuantity: number;
  defaultPrice: number;
  customQuantity: number;
  customPrice: number;
  priority: "urgent" | "high" | "normal" | "low";
  isSelected: boolean;
};

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  supplierId?: string;
  locationId: string;
  createdBy: string;
  totalItems: number;
  totalEstimatedCost: string;
  notes?: string;
  priority: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
};

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPurchaseOrder?: any;
  setEditingPurchaseOrder?: (order: any) => void;
  onOrderCreated?: (orderId: string) => void;
  onOrderUpdated?: (orderId: string) => void;
}

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  editingPurchaseOrder,
  setEditingPurchaseOrder,
  onOrderCreated,
  onOrderUpdated,
}: PurchaseOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedLocationData } = useLocation();

  const [activeTab, setActiveTab] = useState("low-stock");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isSendingToTelegram, setIsSendingToTelegram] = useState(false);
  const [hasPopulatedForm, setHasPopulatedForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for purchase order details
  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(
        -6
      )}`,
      supplierId: "none",
      locationId: selectedLocationData?.id || "",
      notes: "",
      priority: "normal",
      expectedDeliveryDate: "",
    },
  });

  // Queries
  const { data: lowStockItems = [], isLoading: loadingLowStock } = useQuery<
    InventoryItem[]
  >({
    queryKey: ["inventory", "low-stock", selectedLocationData?.id],
    queryFn: () => {
      const params = selectedLocationData?.id
        ? `?locationId=${selectedLocationData.id}`
        : "";
      return apiRequest(`/api/inventory/low-stock${params}`, "GET");
    },
    enabled: isOpen && activeTab === "low-stock",
  });

  const { data: allInventoryItems = [], isLoading: loadingAllItems } = useQuery<
    InventoryItem[]
  >({
    queryKey: ["inventory", "all", selectedLocationData?.id],
    queryFn: () => {
      const params = selectedLocationData?.id
        ? `?locationId=${selectedLocationData.id}`
        : "";
      return apiRequest(`/api/inventory${params}`, "GET");
    },
    enabled: isOpen && activeTab === "all-items",
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => apiRequest("/api/suppliers", "GET"),
    enabled: isOpen,
  });

  const { data: locations = [] } = useQuery<any[]>({
    queryKey: ["locations"],
    queryFn: () => apiRequest("/api/locations", "GET"),
    enabled: isOpen,
  });

  const { data: existingDraftOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders", "draft", selectedLocationData?.id],
    queryFn: () => {
      const baseParams = selectedLocationData?.id
        ? `?locationFilter=${encodeURIComponent(
            JSON.stringify({
              locationId: selectedLocationData.id,
              includeAllLocations: false,
            })
          )}&status=draft`
        : "?status=draft";
      return apiRequest(`/api/purchase-orders${baseParams}`, "GET");
    },
    enabled: isOpen,
  });

  // Fetch purchase order items when editing
  const {
    data: purchaseOrderItems = [],
    isLoading: loadingPurchaseOrderItems,
    error: purchaseOrderItemsError,
    refetch: refetchPurchaseOrderItems,
  } = useQuery({
    queryKey: ["purchase-orders", editingPurchaseOrder?.id, "items"],
    queryFn: async () => {
      const orderId = editingPurchaseOrder?.id;
      console.log("Fetching purchase order items for ID:", orderId);

      if (!orderId) {
        throw new Error("No purchase order ID provided");
      }

      const response = await apiRequest(
        `/api/purchase-orders/${orderId}/items`,
        "GET"
      );

      console.log("API Response for purchase order items:", response);
      return response;
    },
    enabled: isOpen && !!editingPurchaseOrder?.id,
    retry: 3,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
  });

  // Enhanced debugging for query state - only log when values actually change
  useEffect(() => {
    // Only log when modal is open to reduce console spam
    if (isOpen) {
      console.log("🔍 Query Debug Info:", {
        isOpen,
        editingPurchaseOrder: editingPurchaseOrder
          ? {
              id: editingPurchaseOrder.id,
              orderNumber: editingPurchaseOrder.orderNumber,
              status: editingPurchaseOrder.status,
            }
          : null,
        editingPurchaseOrderId: editingPurchaseOrder?.id,
        queryEnabled: isOpen && !!editingPurchaseOrder?.id,
        purchaseOrderItemsLength: purchaseOrderItems.length,
        loadingPurchaseOrderItems,
        purchaseOrderItemsError: purchaseOrderItemsError
          ? {
              message: purchaseOrderItemsError.message,
              stack: purchaseOrderItemsError.stack,
            }
          : null,
      });
    }
  }, [
    isOpen,
    editingPurchaseOrder?.id, // Only depend on the ID, not the entire object
    purchaseOrderItems.length, // Only depend on length, not the entire array
    loadingPurchaseOrderItems,
    purchaseOrderItemsError?.message, // Only depend on error message, not the entire error object
  ]);

  // Force refetch when modal opens with editing purchase order
  useEffect(() => {
    if (isOpen && editingPurchaseOrder?.id) {
      console.log("Modal opened with editing purchase order, forcing refetch");
      // Small delay to ensure the query is properly set up
      setTimeout(() => {
        refetchPurchaseOrderItems();
      }, 100);
    }
  }, [isOpen, editingPurchaseOrder?.id, refetchPurchaseOrderItems]);

  // Debug logging - only when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log("Query state:", {
        isOpen,
        editingPurchaseOrderId: editingPurchaseOrder?.id,
        purchaseOrderItemsLength: purchaseOrderItems.length,
        loadingPurchaseOrderItems,
        error: purchaseOrderItemsError?.message,
      });
    }
  }, [
    isOpen,
    editingPurchaseOrder?.id,
    purchaseOrderItems.length,
    loadingPurchaseOrderItems,
    purchaseOrderItemsError?.message,
  ]);

  // Update form when locations are loaded or selectedLocationData changes
  useEffect(() => {
    if (
      locations.length > 0 &&
      !form.getValues("locationId") &&
      !editingPurchaseOrder
    ) {
      // Set the first available location as default if none is selected (only for new orders)
      form.setValue("locationId", locations[0].id);
    } else if (selectedLocationData?.id && !editingPurchaseOrder) {
      // Update with selected location (only for new orders)
      form.setValue("locationId", selectedLocationData.id);
    }
  }, [locations, selectedLocationData, form, editingPurchaseOrder]);

  // Populate form when editing purchase order
  useEffect(() => {
    if (editingPurchaseOrder && !hasPopulatedForm) {
      console.log(
        "Populating form with editing purchase order:",
        editingPurchaseOrder
      );
      form.reset({
        orderNumber: editingPurchaseOrder.orderNumber,
        supplierId:
          editingPurchaseOrder.supplierId &&
          editingPurchaseOrder.supplierId !== "null"
            ? editingPurchaseOrder.supplierId
            : "none",
        locationId: editingPurchaseOrder.locationId,
        notes: editingPurchaseOrder.notes || "",
        priority: editingPurchaseOrder.priority || "normal",
        expectedDeliveryDate: editingPurchaseOrder.expectedDeliveryDate
          ? new Date(editingPurchaseOrder.expectedDeliveryDate)
              .toISOString()
              .split("T")[0]
          : "",
      });
      setHasPopulatedForm(true);
    } else if (!editingPurchaseOrder) {
      // Reset form for new purchase order
      form.reset({
        orderNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(
          -6
        )}`,
        supplierId: "none",
        locationId: selectedLocationData?.id || "",
        notes: "",
        priority: "normal",
        expectedDeliveryDate: "",
      });
      setHasPopulatedForm(false);
    }
  }, [editingPurchaseOrder, form, selectedLocationData, hasPopulatedForm]);

  // Populate selected items when editing purchase order
  useEffect(() => {
    // Only log when actually processing items to reduce console spam
    if (editingPurchaseOrder && !loadingPurchaseOrderItems) {
      console.log("Populate items effect triggered:", {
        editingPurchaseOrder: !!editingPurchaseOrder,
        purchaseOrderItemsLength: purchaseOrderItems.length,
        loadingPurchaseOrderItems,
        purchaseOrderItemsError: purchaseOrderItemsError?.message,
      });

      if (purchaseOrderItems.length > 0) {
        console.log(
          "Populating items with purchase order items:",
          purchaseOrderItems
        );
        // Convert purchase order items to selected items format
        const existingSelectedItems: SelectedItem[] = purchaseOrderItems.map(
          (item: any) => ({
            id: item.itemId || item.id,
            name: item.name,
            sku: item.sku || "",
            category: item.category || "",
            currentStock: item.currentStock || 0,
            minStockLevel: item.minStockLevel || 0,
            suggestedQuantity: item.suggestedQuantity || 1,
            defaultPrice: item.estimatedPrice || 0,
            customQuantity: item.suggestedQuantity || 1,
            customPrice: item.estimatedPrice || 0,
            priority: item.priority || "normal",
            isSelected: true,
          })
        );

        console.log("Converted selected items:", existingSelectedItems);
        setSelectedItems(existingSelectedItems);
      } else if (purchaseOrderItemsError) {
        console.error(
          "Error loading purchase order items:",
          purchaseOrderItemsError
        );
        // Show error toast
        toast({
          title: "Error Loading Items",
          description: "Failed to load purchase order items. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log(
          "No purchase order items found - this might be a new order or empty order"
        );
        setSelectedItems([]);
      }
    } else if (!editingPurchaseOrder) {
      // Clear selected items when creating new order
      setSelectedItems([]);
    }
  }, [
    editingPurchaseOrder?.id, // Only depend on the ID, not the entire object
    purchaseOrderItems.length, // Only depend on length, not the entire array
    loadingPurchaseOrderItems,
    purchaseOrderItemsError?.message, // Only depend on error message, not the entire error object
    toast,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
      setHasPopulatedForm(false);
      setSearchTerm("");
      setFilterPriority("all");
      setActiveTab("low-stock");
      // Clear any console logs when modal closes
      console.log("Purchase Order Modal closed - cleaning up state");
    } else if (isOpen && editingPurchaseOrder) {
      // Reset form population flag when modal opens with editing purchase order
      setHasPopulatedForm(false);
    }
  }, [isOpen, editingPurchaseOrder?.id]);

  // Convert inventory items to enhanced selection items
  const convertToSelectionItems = (items: InventoryItem[]): SelectedItem[] => {
    return items.map((item) => {
      const suggestedQty = Math.max(
        item.reorderQuantity,
        item.minStockLevel - item.quantity + 10
      );
      const priority =
        item.quantity === 0
          ? "urgent"
          : item.quantity <= item.minStockLevel
          ? "high"
          : item.quantity <= item.minStockLevel + 5
          ? "normal"
          : "low";

      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.quantity,
        minStockLevel: item.minStockLevel,
        suggestedQuantity: suggestedQty,
        defaultPrice: item.purchasePrice || 0,
        customQuantity: suggestedQty,
        customPrice: item.purchasePrice || 0,
        priority,
        isSelected: false,
      };
    });
  };

  // Get current items based on active tab
  const getCurrentItems = (): InventoryItem[] => {
    if (activeTab === "low-stock") {
      return lowStockItems;
    } else if (activeTab === "all-items") {
      return allInventoryItems;
    }
    return [];
  };

  // Filter items based on search and priority
  const getFilteredItems = (): SelectedItem[] => {
    const items = convertToSelectionItems(getCurrentItems());

    // When editing, show existing PO items + available inventory items
    if (editingPurchaseOrder && purchaseOrderItems.length > 0) {
      // Create a map of current inventory items for easy lookup
      const inventoryItemMap = new Map();
      items.forEach((item) => {
        inventoryItemMap.set(item.id, item);
      });

      // Convert purchase order items to selection items
      const poItems = purchaseOrderItems.map((poItem: any) => {
        const existingItem = inventoryItemMap.get(poItem.itemId || poItem.id);

        if (existingItem) {
          // Item exists in current inventory - update it with PO data
          return {
            ...existingItem,
            customQuantity: poItem.suggestedQuantity || 1,
            customPrice: poItem.estimatedPrice || existingItem.defaultPrice,
            isSelected: true, // Mark as selected since it's in the PO
          };
        } else {
          // Item doesn't exist in current inventory - create new selection item
          return {
            id: poItem.itemId || poItem.id,
            name: poItem.name,
            sku: poItem.sku || "",
            category: poItem.category || "",
            currentStock: poItem.currentStock || 0,
            minStockLevel: poItem.minStockLevel || 0,
            suggestedQuantity: poItem.suggestedQuantity || 1,
            defaultPrice: poItem.estimatedPrice || 0,
            customQuantity: poItem.suggestedQuantity || 1,
            customPrice: poItem.estimatedPrice || 0,
            priority: poItem.priority || "normal",
            isSelected: true, // Mark as selected since it's in the PO
          };
        }
      });

      // Get IDs of items that are already in the purchase order
      const poItemIds = new Set(
        purchaseOrderItems.map((item: any) => item.itemId || item.id)
      );

      // Add current inventory items that are NOT in the purchase order
      const nonPoItems = items.filter((item) => !poItemIds.has(item.id));

      // Combine PO items with non-PO inventory items
      const allItems = [...poItems, ...nonPoItems];

      return allItems.filter((item) => {
        const matchesSearch =
          searchTerm === "" ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPriority =
          filterPriority === "all" ||
          (filterPriority === "low" && item.priority === "low") ||
          (filterPriority === "normal" && item.priority === "normal") ||
          (filterPriority === "high" && item.priority === "high") ||
          (filterPriority === "urgent" && item.priority === "urgent");

        return matchesSearch && matchesPriority;
      });
    }

    // When not editing, just return filtered inventory items
    return items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        filterPriority === "all" ||
        (filterPriority === "low" && item.priority === "low") ||
        (filterPriority === "normal" && item.priority === "normal") ||
        (filterPriority === "high" && item.priority === "high") ||
        (filterPriority === "urgent" && item.priority === "urgent");

      return matchesSearch && matchesPriority;
    });
  };

  // Handle item selection
  const handleItemSelection = (itemId: string, isSelected: boolean) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, isSelected } : item
        );
      } else {
        const filteredItems = getFilteredItems();
        const item = filteredItems.find((item) => item.id === itemId);
        if (item) {
          return [...prev, { ...item, isSelected }];
        }
      }
      return prev;
    });
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, customQuantity: quantity } : item
      )
    );
  };

  // Handle price change
  const handlePriceChange = (itemId: string, price: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, customPrice: price } : item
      )
    );
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    const filteredItems = getFilteredItems();
    if (isSelected) {
      setSelectedItems(
        filteredItems.map((item) => ({ ...item, isSelected: true }))
      );
    } else {
      setSelectedItems([]);
    }
  };

  // Mutations
  const createPurchaseOrderMutation = useMutation({
    mutationFn: (data: {
      order: PurchaseOrderForm;
      items: PurchaseOrderItem[];
    }) => {
      // Ensure we have a location ID from the form
      if (!data.order.locationId) {
        toast({
          title: "Location Required",
          description:
            "Please select a location before creating a purchase order.",
          variant: "destructive",
        });
        throw new Error("Location ID is required");
      }

      // Flatten the data structure to match backend expectations
      const orderData = {
        orderNumber: data.order.orderNumber,
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        status: "draft",
        supplierId:
          data.order.supplierId === "none" ? undefined : data.order.supplierId,
        locationId: data.order.locationId,
        totalItems: data.items.length,
        totalEstimatedCost: data.items
          .reduce(
            (total, item) =>
              total + item.estimatedPrice * item.suggestedQuantity,
            0
          )
          .toFixed(2),
        notes: data.order.notes || "",
        priority: data.order.priority,
        expectedDeliveryDate: data.order.expectedDeliveryDate || null,
        items: data.items,
      };
      return apiRequest("/api/purchase-orders", "POST", orderData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Purchase order created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      onOrderCreated?.(data.id);
      onClose();
    },
    onError: (error: any) => {
      console.error("Purchase order creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const finalizeOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest(`/api/purchase-orders/${orderId}`, "PUT", {
        status: "submitted",
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order finalized and submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setShowFinalizeDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to finalize order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/purchase-orders/${id}`, "PUT", data),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Purchase order updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      onOrderUpdated?.(data.id);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest(`/api/purchase-orders/${orderId}`, "PUT", {
        status: "cancelled",
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to cancel order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: PurchaseOrderForm) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    const selectedItemsForOrder = selectedItems.filter(
      (item) => item.isSelected
    );

    if (selectedItemsForOrder.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item for the purchase order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);
    try {
      const purchaseOrderItems: PurchaseOrderItem[] = selectedItemsForOrder.map(
        (item) => ({
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          description: "",
          currentStock: item.currentStock,
          minStockLevel: item.minStockLevel,
          suggestedQuantity: item.customQuantity,
          estimatedPrice: item.customPrice,
          supplier: "",
          priority: item.priority,
          notes: "",
          isExistingItem: true,
          includeInOrder: true,
        })
      );

      if (editingPurchaseOrder) {
        // Update existing purchase order
        const totalQuantity = purchaseOrderItems.reduce(
          (total, item) => total + item.suggestedQuantity,
          0
        );
        const totalCost = purchaseOrderItems.reduce(
          (total, item) => total + item.estimatedPrice * item.suggestedQuantity,
          0
        );

        const updateData = {
          orderNumber: data.orderNumber,
          supplierId: data.supplierId === "none" ? undefined : data.supplierId,
          locationId: data.locationId,
          totalItems: purchaseOrderItems.length,
          totalQuantity: totalQuantity,
          totalEstimatedCost: totalCost.toFixed(2),
          notes: data.notes || "",
          priority: data.priority,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          items: purchaseOrderItems,
        };

        await updatePurchaseOrderMutation.mutateAsync({
          id: editingPurchaseOrder.id,
          data: updateData,
        });
      } else {
        // Create new purchase order
        await createPurchaseOrderMutation.mutateAsync({
          order: data,
          items: purchaseOrderItems,
        });
      }
    } finally {
      setIsProcessing(false);
      setIsSubmitting(false);
    }
  };

  // Handle finalize order
  const handleFinalizeOrder = async (orderId: string) => {
    await finalizeOrderMutation.mutateAsync(orderId);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    await cancelOrderMutation.mutateAsync(orderId);
  };

  // Handle print purchase order
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const selectedItemsForOrder = selectedItems.filter(
        (item) => item.isSelected
      );
      const orderData = form.getValues();

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Purchase Order - ${orderData.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1e40af; margin: 0; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .order-details, .order-summary { flex: 1; }
            .order-details { margin-right: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; }
            .notes { margin-top: 30px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PURCHASE ORDER</h1>
            <p>${orderData.orderNumber}</p>
          </div>
          
          <div class="order-info">
            <div class="order-details">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Priority:</strong> ${orderData.priority.toUpperCase()}</p>
              <p><strong>Expected Delivery:</strong> ${
                orderData.expectedDeliveryDate || "Not specified"
              }</p>
            </div>
            <div class="order-summary">
              <p><strong>Total Items:</strong> ${
                selectedItemsForOrder.length
              }</p>
              <p><strong>Total Cost:</strong> ${formatCurrency(
                calculateTotalCost()
              )}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${selectedItemsForOrder
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.sku}</td>
                  <td>${item.customQuantity}</td>
                  <td>${formatCurrency(item.customPrice)}</td>
                  <td>${formatCurrency(
                    item.customQuantity * item.customPrice
                  )}</td>
                  <td>${item.priority.toUpperCase()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total">
            <h3>Total: ${formatCurrency(calculateTotalCost())}</h3>
          </div>
          
          ${
            orderData.notes
              ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${orderData.notes}</p>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Handle download purchase order as Excel
  const handleDownload = async () => {
    try {
      const selectedItemsForOrder = selectedItems.filter(
        (item) => item.isSelected
      );
      const orderData = form.getValues();

      // Create CSV content for Excel (simple Excel format)
      const csvContent = [
        // Header row
        ["Item Name", "Amount"],
        // Data rows
        ...selectedItemsForOrder.map((item) => [
          item.name,
          item.customQuantity.toString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Add BOM for Excel to recognize UTF-8
      const BOM = "\uFEFF";
      const content = BOM + csvContent;

      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase-order-${orderData.orderNumber}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "Purchase order Excel file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download purchase order.",
        variant: "destructive",
      });
    }
  };

  // Handle send to Telegram
  const handleSendToTelegram = async () => {
    try {
      setIsSendingToTelegram(true);
      const selectedItemsForOrder = selectedItems.filter(
        (item) => item.isSelected
      );
      const orderData = form.getValues();

      const orderDataForTelegram = {
        ...orderData,
        totalCost: calculateTotalCost(),
        locationName: locations.find((loc) => loc.id === orderData.locationId)
          ?.name,
        supplierName: suppliers.find((sup) => sup.id === orderData.supplierId)
          ?.name,
      };

      await sendToTelegram(orderDataForTelegram, selectedItemsForOrder);

      toast({
        title: "Sent to Telegram",
        description: "Purchase order has been sent to Telegram successfully.",
      });
    } catch (error) {
      toast({
        title: "Telegram Send Failed",
        description: "Failed to send purchase order to Telegram.",
        variant: "destructive",
      });
    } finally {
      setIsSendingToTelegram(false);
    }
  };

  // Get stock status
  const getStockStatus = (item: SelectedItem) => {
    if (item.currentStock === 0) {
      return { status: "Out of Stock", color: "destructive" as const };
    } else if (item.currentStock <= item.minStockLevel) {
      return { status: "Low Stock", color: "destructive" as const };
    } else {
      return { status: "In Stock", color: "default" as const };
    }
  };

  // Calculate total estimated cost
  const calculateTotalCost = () => {
    return selectedItems
      .filter((item) => item.isSelected)
      .reduce(
        (total, item) => total + item.customQuantity * item.customPrice,
        0
      );
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "normal":
        return "text-blue-600 bg-blue-50";
      case "low":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const filteredItems = getFilteredItems();
  const totalCost = calculateTotalCost();
  const selectedCount = selectedItems.filter((item) => item.isSelected).length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          aria-describedby="purchase-order-description"
        >
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl text-slate-900 dark:text-slate-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {editingPurchaseOrder
                ? "Edit Purchase Order"
                : "Create Purchase Order"}
            </DialogTitle>
            <div
              id="purchase-order-description"
              className="text-base text-slate-600 dark:text-slate-400"
            >
              {editingPurchaseOrder ? (
                <div className="flex items-center gap-2">
                  <span>Editing purchase order:</span>
                  <Badge variant="outline" className="font-mono">
                    {editingPurchaseOrder.orderNumber}
                  </Badge>
                  <span>•</span>
                  <Badge
                    variant={
                      editingPurchaseOrder.status === "draft"
                        ? "secondary"
                        : editingPurchaseOrder.status === "submitted"
                        ? "default"
                        : editingPurchaseOrder.status === "approved"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {editingPurchaseOrder.status}
                  </Badge>
                </div>
              ) : (
                "Create a comprehensive purchase order for inventory management. Customize quantities and prices for each item as needed."
              )}
            </div>
          </DialogHeader>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* Left Column - Order Details & Summary */}
            <div className="lg:col-span-4 space-y-6">
              {/* Order Details Form */}
              <Card className="border-2 border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-800/50">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Configure basic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 bg-white dark:bg-slate-800/50">
                  <Form {...form}>
                    <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Order Number
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Location
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem
                                  key={location.id}
                                  value={location.id}
                                >
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Supplier
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No supplier</SelectItem>
                              {suppliers.map((supplier) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id}
                                >
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Priority
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Expected Delivery
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel className="font-semibold">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes..."
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Summary - In Left Column */}
            {selectedCount > 0 && (
              <Card className="border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-slate-800/50">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100 text-base">
                    <CheckCircle className="h-4 w-4" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white dark:bg-slate-800/50">
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedCount}
                      </div>
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Items Selected
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(totalCost)}
                      </div>
                      <div className="text-xs font-medium text-green-700 dark:text-green-300">
                        Total Cost
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {selectedItems.filter((item) => item.priority === "urgent").length}
                      </div>
                      <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                        Urgent Items
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {selectedItems.filter((item) => item.currentStock === 0).length}
                      </div>
                      <div className="text-xs font-medium text-red-700 dark:text-red-300">
                        Out of Stock
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Items Selection */}
          <div className="lg:col-span-8">
            <Card className="border-2 border-green-100 dark:border-green-800 bg-white dark:bg-slate-800/50">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Package className="h-5 w-5" />
                  Item Selection & Configuration
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Select items and customize quantities and prices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-slate-800/50">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      value="low-stock"
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Low Stock Items
                    </TabsTrigger>
                    <TabsTrigger
                      value="all-items"
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      All Items
                    </TabsTrigger>
                    <TabsTrigger
                      value="draft-orders"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Draft Orders
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="low-stock" className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search items by name, SKU, or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select
                        value={filterPriority}
                        onValueChange={setFilterPriority}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="normal">
                            Normal Priority
                          </SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">
                            Urgent Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editing Mode Notice */}
                    {editingPurchaseOrder && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Edit className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          Editing Mode: Items from the original order are
                          pre-selected and editable. You can modify quantities,
                          prices, or add/remove items.
                        </span>
                      </div>
                    )}

                    {/* Select All */}
                    {filteredItems.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          checked={
                            selectedCount === filteredItems.length &&
                            filteredItems.length > 0
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(checked as boolean)
                          }
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Select All ({filteredItems.length} items)
                        </span>
                      </div>
                    )}

                    {/* Items Table */}
                    {loadingLowStock ||
                    (editingPurchaseOrder && loadingPurchaseOrderItems) ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          {editingPurchaseOrder
                            ? "Loading purchase order items..."
                            : "Loading low stock items..."}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="w-12">Select</TableHead>
                              <TableHead>Item Details</TableHead>
                              <TableHead>Stock Info</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Priority</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => {
                              const stockStatus = getStockStatus(item);
                              const isSelected =
                                selectedItems.find((si) => si.id === item.id)
                                  ?.isSelected || false;
                              const selectedItem = selectedItems.find(
                                (si) => si.id === item.id
                              );
                              const quantity =
                                selectedItem?.customQuantity ||
                                item.suggestedQuantity;
                              const price =
                                selectedItem?.customPrice || item.defaultPrice;
                              const total = quantity * price;

                              return (
                                <TableRow
                                  key={item.id}
                                  className={isSelected ? "bg-blue-50 dark:bg-blue-950/30" : ""}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) =>
                                        handleItemSelection(
                                          item.id,
                                          checked as boolean
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        SKU: {item.sku}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {item.category}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          Current:
                                        </span>{" "}
                                        {item.currentStock}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          Min:
                                        </span>{" "}
                                        {item.minStockLevel}
                                      </div>
                                      <Badge
                                        variant={stockStatus.color}
                                        className="text-xs"
                                      >
                                        {stockStatus.status}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          item.id,
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      className="w-20"
                                      disabled={!isSelected}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={price}
                                      onChange={(e) =>
                                        handlePriceChange(
                                          item.id,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-24"
                                      disabled={!isSelected}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold text-green-600">
                                      {formatCurrency(total)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`text-xs ${getPriorityColor(
                                        item.priority
                                      )}`}
                                    >
                                      {item.priority}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all-items" className="space-y-4">
                    {/* Similar structure as low-stock but with all items */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search items by name, SKU, or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select
                        value={filterPriority}
                        onValueChange={setFilterPriority}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="normal">
                            Normal Priority
                          </SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">
                            Urgent Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editing Mode Notice */}
                    {editingPurchaseOrder && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <Edit className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          Editing Mode: Items from the original order are
                          pre-selected and editable. You can modify quantities,
                          prices, or add/remove items.
                        </span>
                      </div>
                    )}

                    {loadingAllItems ||
                    (editingPurchaseOrder && loadingPurchaseOrderItems) ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          {editingPurchaseOrder
                            ? "Loading purchase order items..."
                            : "Loading all items..."}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="w-12">Select</TableHead>
                              <TableHead>Item Details</TableHead>
                              <TableHead>Stock Info</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Priority</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => {
                              const stockStatus = getStockStatus(item);
                              const isSelected =
                                selectedItems.find((si) => si.id === item.id)
                                  ?.isSelected || false;
                              const selectedItem = selectedItems.find(
                                (si) => si.id === item.id
                              );
                              const quantity =
                                selectedItem?.customQuantity ||
                                item.suggestedQuantity;
                              const price =
                                selectedItem?.customPrice || item.defaultPrice;
                              const total = quantity * price;

                              return (
                                <TableRow
                                  key={item.id}
                                  className={isSelected ? "bg-blue-50 dark:bg-blue-950/30" : ""}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) =>
                                        handleItemSelection(
                                          item.id,
                                          checked as boolean
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        SKU: {item.sku}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {item.category}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          Current:
                                        </span>{" "}
                                        {item.currentStock}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          Min:
                                        </span>{" "}
                                        {item.minStockLevel}
                                      </div>
                                      <Badge
                                        variant={stockStatus.color}
                                        className="text-xs"
                                      >
                                        {stockStatus.status}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          item.id,
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      className="w-20"
                                      disabled={!isSelected}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={price}
                                      onChange={(e) =>
                                        handlePriceChange(
                                          item.id,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-24"
                                      disabled={!isSelected}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold text-green-600">
                                      {formatCurrency(total)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`text-xs ${getPriorityColor(
                                        item.priority
                                      )}`}
                                    >
                                      {item.priority}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="draft-orders" className="space-y-4">
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Draft Purchase Orders
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Continue working on saved draft orders
                      </p>

                      {existingDraftOrders.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8">
                          <p className="text-gray-500">No draft orders found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {existingDraftOrders.map((order) => (
                            <Card
                              key={order.id}
                              className="border-2 border-orange-200"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {order.orderNumber}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(
                                          order.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        {order.totalItems} items
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {formatCurrency(
                                          parseFloat(order.totalEstimatedCost)
                                        )}
                                      </div>
                                      <Badge
                                        variant={
                                          order.priority === "urgent"
                                            ? "destructive"
                                            : order.priority === "high"
                                            ? "secondary"
                                            : "default"
                                        }
                                        className="text-xs"
                                      >
                                        {order.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Set this order as the editing purchase order
                                        if (setEditingPurchaseOrder) {
                                          setEditingPurchaseOrder(order);
                                        }
                                        // Reset form population flag to trigger re-population
                                        setHasPopulatedForm(false);
                                        // Switch to low-stock tab to show items
                                        setActiveTab("low-stock");
                                        // Clear current selected items to prepare for new ones
                                        setSelectedItems([]);
                                        console.log(
                                          "Switching to edit mode for order:",
                                          order.orderNumber
                                        );
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleFinalizeOrder(order.id)
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Send className="h-4 w-4 mr-1" />
                                      Finalize
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelOrder(order.id)
                                      }
                                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          {/* End Right Column */}
        </div>
        {/* End Two Column Grid */}

        {/* Action Buttons - Full Width Below Grid */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
              <div className="flex gap-2">
                {selectedCount > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      size="sm"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSendToTelegram}
                      disabled={isSendingToTelegram}
                      size="sm"
                    >
                      {isSendingToTelegram ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send to Telegram
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isProcessing && !isSubmitting && selectedCount > 0) {
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  disabled={isProcessing || isSubmitting || selectedCount === 0}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {editingPurchaseOrder
                        ? "Updating Order..."
                        : "Creating Order..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPurchaseOrder
                        ? "Update Purchase Order"
                        : "Create Purchase Order"}
                    </>
                  )}
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog
        open={showFinalizeDialog}
        onOpenChange={setShowFinalizeDialog}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Finalize Purchase Order</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to finalize this purchase order? This action
              cannot be undone and will submit the order to the supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowFinalizeDialog(false);
              }}
            >
              Finalize Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
