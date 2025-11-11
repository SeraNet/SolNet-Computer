-- Fix inventory_items table by adding missing columns
-- This migration adds all the columns that are expected by the application

-- Add missing columns to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS reorder_point INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS avg_daily_sales DECIMAL(8, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS specifications JSONB,
ADD COLUMN IF NOT EXISTS compatibility JSONB,
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP,
ADD COLUMN IF NOT EXISTS predicted_stockout TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_public ON inventory_items(is_public);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_brand ON inventory_items(brand);

-- Update existing records to have default values for new columns
UPDATE inventory_items 
SET 
  is_public = true,
  is_active = true,
  min_stock_level = 10,
  reorder_point = 15,
  reorder_quantity = 50,
  lead_time_days = 7,
  avg_daily_sales = 0,
  sort_order = 0
WHERE is_public IS NULL OR is_active IS NULL;

-- Insert sample data if table is empty
INSERT INTO inventory_items (
  name, sku, description, category, brand, model, 
  purchase_price, sale_price, quantity, is_public, is_active
) VALUES 
  ('iPhone Charger Cable', 'IPHONE-CABLE-001', 'Lightning to USB cable for iPhone', 'Cables', 'Apple', 'Lightning Cable',
   5.00, 15.00, 50, true, true),
  ('Samsung Galaxy Charger', 'SAMSUNG-CHARGER-001', 'USB-C fast charger for Samsung devices', 'Chargers', 'Samsung', 'Fast Charger',
   8.00, 25.00, 30, true, true),
  ('Screen Protector iPhone 14', 'SCREEN-PROT-IPHONE14', 'Tempered glass screen protector', 'Protection', 'Generic', 'iPhone 14',
   2.00, 12.00, 100, true, true),
  ('Wireless Earbuds', 'WIRELESS-EARBUDS-001', 'Bluetooth wireless earbuds with charging case', 'Audio', 'Generic', 'TWS-001',
   15.00, 45.00, 25, true, true)
ON CONFLICT (sku) DO NOTHING;
