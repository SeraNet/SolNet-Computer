import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  CreditCard,
  Barcode,
  X,
  Check,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useCurrentLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BarcodeScannerModal = React.memo(
  ({ open, onOpenChange }: BarcodeScannerModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [barcodeInput, setBarcodeInput] = useState("");
    const [scannedItem, setScannedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<
      "cash" | "card" | "mobile"
    >("cash");
    const { currentLocation } = useCurrentLocation();
    const { user } = useAuth();

    const { data: inventoryItems = [], isLoading } = useQuery<any[]>({
      queryKey: ["inventory", "barcode"],
      queryFn: () => apiRequest("/api/inventory", "GET"),
      enabled: open,
    });

    // Filter only active and in-stock items
    const availableItems = inventoryItems.filter(
      (item) => item.isActive && item.quantity > 0
    );

    const processSaleMutation = useMutation({
      mutationFn: async () => {
        if (!scannedItem) return;

        const totalAmount =
          parseFloat(String(scannedItem.salePrice || "0")) * quantity;
        const saleData = {
          sale: {
            totalAmount: totalAmount.toString(),
            taxAmount: "0",
            discountAmount: "0",
            paymentMethod,
            paymentStatus: "paid",
            ...(currentLocation?.id ? { locationId: currentLocation.id } : {}),
            ...(user?.id ? { salesPersonId: user.id } : {}),
          },
          items: [
            {
              inventoryItemId: scannedItem.id,
              quantity,
              unitPrice: parseFloat(String(scannedItem.salePrice || "0")),
              totalPrice: totalAmount,
            },
          ],
        };

        const response = await apiRequest("/api/sales", "POST", saleData);
        return response;
      },
      onSuccess: () => {
        toast({
          title: "Sale completed!",
          description: `Successfully sold ${quantity}x ${scannedItem?.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        resetModal();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast({
          title: "Sale failed",
          description: error?.message || "Failed to process sale",
          variant: "destructive",
        });
      },
    });

    const resetModal = () => {
      setBarcodeInput("");
      setScannedItem(null);
      setQuantity(1);
      setPaymentMethod("cash");
    };

    useEffect(() => {
      if (!open) {
        resetModal();
      }
    }, [open]);

    const handleBarcodeSubmit = () => {
      if (!barcodeInput.trim()) return;

      // Find item by barcode or name
      const item = availableItems.find(
        (invItem) =>
          invItem.barcode === barcodeInput.trim() ||
          invItem.name.toLowerCase().includes(barcodeInput.toLowerCase())
      );

      if (item) {
        setScannedItem(item);
        toast({
          title: "Item found!",
          description: `Found: ${item.name}`,
        });
      } else {
        toast({
          title: "Item not found",
          description: "No item found with this barcode or name",
          variant: "destructive",
        });
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleBarcodeSubmit();
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Quick Scan & Sell
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!scannedItem ? (
              // Barcode input section
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Scan Barcode or Enter Item Name
                  </label>
                  <Input
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Scan barcode or type item name..."
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleBarcodeSubmit}
                  disabled={!barcodeInput.trim() || isLoading}
                  className="w-full"
                >
                  <Barcode className="mr-2 h-4 w-4" />
                  Find Item
                </Button>
              </div>
            ) : (
              // Item details and sale section
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {scannedItem.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">
                        {formatCurrency(scannedItem.salePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold">
                        {scannedItem.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuantity(
                              Math.min(scannedItem.quantity, quantity + 1)
                            )
                          }
                          disabled={quantity >= scannedItem.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          parseFloat(String(scannedItem.salePrice || "0")) *
                            quantity
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <div className="flex gap-2 mt-1">
                      {(["cash", "card", "mobile"] as const).map((method) => (
                        <Button
                          key={method}
                          variant={
                            paymentMethod === method ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPaymentMethod(method)}
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setScannedItem(null)}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => processSaleMutation.mutate()}
                      disabled={processSaleMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {processSaleMutation.isPending
                        ? "Processing..."
                        : "Complete Sale"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

BarcodeScannerModal.displayName = "BarcodeScannerModal";

export default BarcodeScannerModal;
