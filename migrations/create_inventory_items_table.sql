-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  num_id SERIAL UNIQUE,
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR REFERENCES locations(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'General',
  brand TEXT,
  model TEXT,
  purchase_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  reorder_point INTEGER NOT NULL DEFAULT 15,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  lead_time_days INTEGER DEFAULT 7,
  avg_daily_sales DECIMAL(8, 2) DEFAULT 0,
  supplier TEXT,
  barcode TEXT,
  -- New fields for public display
  is_public BOOLEAN NOT NULL DEFAULT true, -- Show on public landing page
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- For ordering on public page
  image_url TEXT, -- URL or base64 image
  specifications JSONB, -- Technical specifications
  compatibility JSONB, -- Compatible devices/systems
  warranty TEXT, -- Warranty information
  last_restocked TIMESTAMP,
  predicted_stockout TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_public ON inventory_items(is_public);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- Insert some sample data for testing
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
