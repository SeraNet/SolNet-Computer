-- Add total_quantity column to purchase_orders table
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS total_quantity INTEGER NOT NULL DEFAULT 0;

-- Update existing purchase orders with calculated total quantities
UPDATE purchase_orders 
SET total_quantity = (
  SELECT COALESCE(SUM(suggested_quantity), 0)
  FROM purchase_order_items 
  WHERE purchase_order_items.purchase_order_id = purchase_orders.id
);
