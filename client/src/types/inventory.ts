export interface InventoryPrediction {
  itemId: string;
  name: string;
  sku: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  currentStock: number;
  daysUntilStockout: number;
  avgDailySales: string;
  suggestedReorderQuantity: number;
}

export interface InventoryAlert {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  alertType: "low_stock" | "predicted_stockout" | "reorder_required";
  itemName: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}
