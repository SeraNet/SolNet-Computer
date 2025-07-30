import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
}

export default function POSModal({ open, onOpenChange }: POSModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: open,
  });

  const processSaleMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(String(item.price || "0")) * item.quantity), 0);
      const saleItems = cart.map(item => ({
        inventoryItemId: item.id,
        quantity: item.quantity,
        unitPrice: parseFloat(String(item.price || "0")),
        totalPrice: parseFloat(String(item.price || "0")) * item.quantity,
      }));

      const response = await apiRequest("POST", "/api/sales", {
        sale: {
          totalAmount: totalAmount.toString(),
          taxAmount: "0",
          discountAmount: "0",
          paymentMethod: "cash",
          paymentStatus: "paid",
        },
        items: saleItems.map(item => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
        })),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale Completed",
        description: "Sale processed successfully and receipt can be printed.",
      });
      setCart([]);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    },
    onError: (error) => {
      toast({
        title: "Sale Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = Array.isArray(inventoryItems) ? inventoryItems.filter((item: any) => {
    // Calculate remaining stock after cart items
    const cartItem = cart.find(cartItem => cartItem.id === item.id);
    const remainingStock = item.quantity - (cartItem ? cartItem.quantity : 0);
    
    return remainingStock > 0 && (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity < item.quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${item.quantity} items available in stock.`,
          variant: "destructive",
        });
      }
    } else {
      if (item.quantity > 0) {
        setCart([...cart, {
          id: item.id,
          name: item.name,
          price: item.salePrice,
          quantity: 1,
          stock: item.quantity,
        }]);
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
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else if (newQuantity <= item.stock) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    } else {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.stock} items available in stock.`,
        variant: "destructive",
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(String(item.price || "0")) * item.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Point of Sale</DialogTitle>
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
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </Card>
                  ))
                ) : (
                  filteredItems.map((item: any) => (
                    <Card
                      key={item.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addToCart(item)}
                    >
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">${item.salePrice}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-gray-400">Stock: {item.quantity}</div>
                        {item.quantity <= item.minStockLevel && (
                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Shopping Cart</h4>
            </div>
            
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 border-b pb-2">
                  <div>Item</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">Total</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p>Cart is empty</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-100">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            ${parseFloat(String(item.price || "0")).toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-right">
                          ${parseFloat(String(item.price || "0")).toFixed(2)}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm font-medium">
                            ${(parseFloat(String(item.price || "0")) * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      ${cartTotal.toFixed(2)}
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
                    <Button
                      onClick={() => processSaleMutation.mutate()}
                      disabled={cart.length === 0 || processSaleMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {processSaleMutation.isPending ? "Processing..." : "Process Sale"}
                    </Button>
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
