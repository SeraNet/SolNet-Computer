import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Printer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useCurrentLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
// QRCode will be imported dynamically
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}
interface POSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedItem?: any;
}
const POSModal = React.memo(
  ({ open, onOpenChange, preSelectedItem }: POSModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [completedSale, setCompletedSale] = useState<any>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const receiptRef = useRef<HTMLDivElement>(null);
    const { currentLocation } = useCurrentLocation();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<
      "cash" | "card" | "mobile"
    >("cash");
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(0); // Default 0% tax rate
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const { data: inventoryItems = [], isLoading } = useQuery<any[]>({
      queryKey: ["inventory", "pos"],
      queryFn: () => apiRequest("/api/inventory", "GET"),
      enabled: open,
    });
    // Filter only active and in-stock items for POS
    const availableItems = inventoryItems.filter(
      (item) => item.isActive && item.quantity > 0
    );
    // Auto-add preSelectedItem to cart when modal opens
    useEffect(() => {
      if (
        open &&
        preSelectedItem &&
        availableItems &&
        availableItems.length > 0
      ) {
        // Clear cart first
        setCart([]);
        // Add the pre-selected item to cart
        const item = Array.isArray(availableItems)
          ? availableItems.find(
              (invItem: any) => invItem.id === preSelectedItem.id
            )
          : undefined;
        if (item && item.quantity > 0) {
          setCart([
            {
              id: item.id,
              name: item.name,
              price: parseFloat(item.salePrice || "0"),
              quantity: 1,
              stock: item.quantity,
            },
          ]);
        }
      } else if (!open) {
        // Clear cart when modal closes
        setCart([]);
        setCompletedSale(null);
        setShowReceipt(false);
      }
    }, [open, preSelectedItem?.id, availableItems?.length]);
    const processSaleMutation = useMutation({
      mutationFn: async () => {
        const subtotal = cart.reduce(
          (sum, item) =>
            sum + parseFloat(String(item.price || "0")) * item.quantity,
          0
        );
        const computedDiscount = Math.max(0, discountAmount);
        const computedTax = (subtotal - computedDiscount) * (taxRate / 100);
        const totalAmount = Math.max(
          0,
          subtotal - computedDiscount + computedTax
        );
        const saleItems = cart.map((item) => ({
          inventoryItemId: item.id,
          quantity: item.quantity,
          unitPrice: parseFloat(String(item.price || "0")),
          totalPrice: parseFloat(String(item.price || "0")) * item.quantity,
        }));

        const saleData = {
          sale: {
            subtotal: subtotal.toString(), // Add required subtotal field
            totalAmount: totalAmount.toString(),
            taxAmount: computedTax.toString(),
            discountAmount: computedDiscount.toString(),
            paymentMethod,
            paymentStatus: "paid" as const,
            ...(currentLocation?.id ? { locationId: currentLocation.id } : {}),
            ...(user?.id ? { salesPersonId: user.id } : {}),
          },
          items: saleItems.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
          })),
        };
        const response = await apiRequest("/api/sales", "POST", saleData);
        return response;
      },
      onSuccess: async (saleData) => {
        const receiptData = {
          ...saleData,
          items: cart,
          timestamp: new Date().toLocaleString(),
          subtotal: cartSubtotal,
          discount: Math.max(0, discountAmount),
          taxRate: taxRate,
          tax: calculatedTaxAmount,
          total: cartTotal,
          amountPaid,
          changeDue:
            paymentMethod === "cash" ? Math.max(0, amountPaid - cartTotal) : 0,
        };
        setCompletedSale(receiptData);
        // Generate QR code for receipt
        const qrData = `Receipt: ${saleData.id?.slice(-8) || "N/A"}
Total: ${formatCurrency(cartTotal)}
Date: ${new Date().toLocaleDateString()}
Items: ${cart.length}
Tax: ${taxRate}%`;
        try {
          const QRCodeModule = await import("qrcode");
          const QRCode = QRCodeModule.default || QRCodeModule;
          const qrCodeUrl = await QRCode.toDataURL(qrData, {
            width: 128,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeDataUrl(qrCodeUrl);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
        }
        setShowReceipt(true);
        toast({
          title: "Sale Completed",
          description:
            "Sale processed successfully. Receipt is ready to print.",
        });
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["sales"] });
      },
      onError: (error: any) => {
        toast({
          title: "Sale Failed",
          description: `Failed to process sale: ${
            error.message || "Unknown error"
          }`,
          variant: "destructive",
        });
      },
    });
    const filteredItems = Array.isArray(availableItems)
      ? availableItems.filter((item: any) => {
          // Calculate remaining stock after cart items
          const cartItem = cart.find((cartItem) => cartItem.id === item.id);
          const remainingStock =
            item.quantity - (cartItem ? cartItem.quantity : 0);
          return (
            remainingStock > 0 &&
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.barcode?.toLowerCase?.().includes(searchTerm.toLowerCase()))
          );
        })
      : [];
    const addToCart = (item: any) => {
      const existingItem = cart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        if (existingItem.quantity < item.quantity) {
          setCart(
            cart.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        } else {
          toast({
            title: "Insufficient Stock",
            description: `Only ${item.quantity} items available in stock.`,
            variant: "destructive",
          });
        }
      } else {
        if (item.quantity > 0) {
          setCart([
            ...cart,
            {
              id: item.id,
              name: item.name,
              price: item.salePrice,
              quantity: 1,
              stock: item.quantity,
            },
          ]);
        } else {
          toast({
            title: "Out of Stock",
            description: "This item is currently out of stock.",
            variant: "destructive",
          });
        }
      }
    };
    const updateQuantity = (itemId: string, newQuantity: number) => {
      const item = cart.find((cartItem) => cartItem.id === itemId);
      if (!item) return;
      if (newQuantity <= 0) {
        removeFromCart(itemId);
      } else if (newQuantity <= item.stock) {
        setCart(
          cart.map((cartItem) =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${item.stock} items available in stock.`,
          variant: "destructive",
        });
      }
    };
    const removeFromCart = (itemId: string) => {
      setCart(cart.filter((cartItem) => cartItem.id !== itemId));
    };
    const clearCart = () => {
      setCart([]);
    };
    const cartSubtotal = cart.reduce(
      (sum, item) =>
        sum + parseFloat(String(item.price || "0")) * item.quantity,
      0
    );
    // Calculate tax amount based on tax rate
    const calculatedTaxAmount =
      (cartSubtotal - Math.max(0, discountAmount)) * (taxRate / 100);
    const cartTotal = Math.max(
      0,
      cartSubtotal - Math.max(0, discountAmount) + calculatedTaxAmount
    );
    const handlePrintReceipt = () => {
      const printWindow = window.open("", "_blank", "width=600,height=800");
      if (!printWindow) {
        toast({
          title: "Error",
          description:
            "Unable to open print window. Please check your popup blocker.",
          variant: "destructive",
        });
        return;
      }
      const receiptContent = receiptRef.current?.innerHTML || "";
      const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Receipt</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: black;
              background: white;
              font-size: 14px;
            }
            h1, h2, h3 { color: black !important; margin: 10px 0; }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 18px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .p-4 { padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { font-weight: bold; background-color: #f5f5f5; }
            .total-row { font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `;
      printWindow.document.write(printDocument);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    };
    const handleCloseReceipt = () => {
      setShowReceipt(false);
      setCompletedSale(null);
      setCart([]);
      onOpenChange(false);
    };
    if (showReceipt && completedSale) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">Sales Receipt</DialogTitle>
            </DialogHeader>
            <div ref={receiptRef} className="space-y-4">
              <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">SolNet Computer Services</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Sales Receipt</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Date: {completedSale.timestamp}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receipt #: {completedSale.id?.slice(-8) || "N/A"}
                </p>
                {currentLocation?.name && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Location: {currentLocation.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Items Purchased:</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-slate-900 dark:text-slate-100 py-2">Item</th>
                      <th className="text-left text-slate-900 dark:text-slate-100 py-2">Qty</th>
                      <th className="text-left text-slate-900 dark:text-slate-100 py-2">Price</th>
                      <th className="text-left text-slate-900 dark:text-slate-100 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSale.items.map(
                      (item: CartItem, index: number) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                          <td className="py-2 text-slate-900 dark:text-slate-100">{item.quantity}</td>
                          <td className="py-2 text-slate-900 dark:text-slate-100">{formatCurrency(item.price || "0")}</td>
                          <td className="py-2 text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              parseFloat(String(item.price || "0")) *
                                item.quantity
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 dark:text-slate-100">Subtotal:</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatCurrency(completedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 dark:text-slate-100">Discount:</span>
                  <span className="text-slate-900 dark:text-slate-100">-{formatCurrency(completedSale.discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 dark:text-slate-100">Tax ({completedSale.taxRate}%):</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatCurrency(completedSale.tax)}</span>
                </div>
                <div className="flex justify-between total-row">
                  <span className="text-slate-900 dark:text-slate-100">Total Amount:</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatCurrency(completedSale.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 dark:text-slate-100">Payment Method:</span>
                  <span className="capitalize text-slate-900 dark:text-slate-100">{paymentMethod}</span>
                </div>
                {paymentMethod === "cash" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-900 dark:text-slate-100">Change:</span>
                    <span className="text-slate-900 dark:text-slate-100">{formatCurrency(completedSale.changeDue)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900 dark:text-slate-100">Status:</span>
                  <span className="text-slate-900 dark:text-slate-100">Paid</span>
                </div>
              </div>
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
                <p>Thank you for your business!</p>
                <p>Please keep this receipt for your records.</p>
                {qrCodeDataUrl && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={qrCodeDataUrl}
                      alt="Receipt QR Code"
                      className="w-16 h-16"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrintReceipt} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseReceipt}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[80vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Point of Sale</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Product Selection */}
            <div className="flex flex-col">
              <div className="mb-4">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <div className="animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                          </div>
                        </Card>
                      ))
                    : filteredItems.map((item: any) => (
                        <Card
                          key={item.id}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          onClick={() => addToCart(item)}
                        >
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {item.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {formatCurrency(item.salePrice)}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              Stock: {item.quantity}
                            </div>
                            {item.quantity <= item.minStockLevel && (
                              <Badge variant="destructive" className="text-xs">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                </div>
              </div>
            </div>
            {/* Cart */}
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <ShoppingCart className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
                <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Shopping Cart
                </h4>
              </div>
              <Card className="flex-1 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>Item</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Total</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-2" />
                        <p>Cart is empty</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-4 gap-2 items-center py-2 border-b border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {formatCurrency(item.price || "0")} each
                            </div>
                          </div>
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm text-slate-900 dark:text-slate-100">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-sm text-right text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.price || "0")}
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {formatCurrency(
                                parseFloat(String(item.price || "0")) *
                                  item.quantity
                              )}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-slate-900 dark:text-slate-100">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        disabled={cart.length === 0}
                      >
                        Clear Cart
                      </Button>
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Discount"
                            value={discountAmount}
                            onChange={(e) =>
                              setDiscountAmount(parseFloat(e.target.value) || 0)
                            }
                          />
                          <select
                            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={taxRate}
                            onChange={(e) =>
                              setTaxRate(parseFloat(e.target.value))
                            }
                          >
                            <option value={0}>No Tax (0%)</option>
                            <option value={2}>Low Tax (2%)</option>
                            <option value={10}>Standard Tax (10%)</option>
                            <option value={15}>High Tax (15%)</option>
                          </select>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount Paid"
                            value={amountPaid}
                            onChange={(e) =>
                              setAmountPaid(parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={
                              paymentMethod === "cash" ? "default" : "outline"
                            }
                            onClick={() => setPaymentMethod("cash")}
                          >
                            Cash
                          </Button>
                          <Button
                            variant={
                              paymentMethod === "card" ? "default" : "outline"
                            }
                            onClick={() => setPaymentMethod("card")}
                          >
                            Card
                          </Button>
                        </div>
                        <Button
                          onClick={() => processSaleMutation.mutate()}
                          disabled={
                            cart.length === 0 || processSaleMutation.isPending
                          }
                          className="bg-primary hover:bg-primary/90"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {processSaleMutation.isPending
                            ? "Processing..."
                            : "Process Sale"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
export default POSModal;
