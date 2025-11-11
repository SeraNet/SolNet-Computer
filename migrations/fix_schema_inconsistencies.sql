-- Fix schema inconsistencies and ensure all tables/columns are properly defined
-- This migration consolidates all the missing fields and ensures consistency

-- 1. Update purchase_orders table to match schema
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS supplier_id VARCHAR REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS location_id VARCHAR REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS created_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Set NOT NULL constraints after adding columns (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'location_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_orders ALTER COLUMN location_id SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_orders ALTER COLUMN created_by SET NOT NULL;
    END IF;
END $$;

-- 2. Update purchase_order_items table to match schema
ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS inventory_item_id VARCHAR REFERENCES inventory_items(id),
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Set NOT NULL constraint for item_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_order_items' 
        AND column_name = 'item_name' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_order_items ALTER COLUMN item_name SET NOT NULL;
    END IF;
END $$;

-- 3. Ensure all required constraints exist
-- Add unique constraint to customers.phone if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customers_phone_unique' 
        AND table_name = 'customers'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
    END IF;
END $$;

-- 4. Ensure receipt_number column exists in devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS receipt_number VARCHAR UNIQUE;

-- 5. Ensure registration_date column exists in customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 6. Ensure revenue target columns exist in business_profile table
ALTER TABLE business_profile 
ADD COLUMN IF NOT EXISTS monthly_revenue_target DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS annual_revenue_target DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS growth_target_percentage DECIMAL(5,2) DEFAULT 15.00;

-- 7. Update existing customers to have registration_date if null
UPDATE customers SET registration_date = DATE(created_at) WHERE registration_date IS NULL;

-- 8. Add comments for documentation
COMMENT ON COLUMN business_profile.monthly_revenue_target IS 'Monthly revenue target for the business';
COMMENT ON COLUMN business_profile.annual_revenue_target IS 'Annual revenue target for the business';
COMMENT ON COLUMN business_profile.growth_target_percentage IS 'Target growth percentage for revenue projections';
COMMENT ON COLUMN customers.registration_date IS 'Date when customer first attended the shop';
COMMENT ON COLUMN devices.receipt_number IS 'Unique receipt number for device tracking';
COMMENT ON COLUMN purchase_orders.supplier_id IS 'Reference to supplier for this purchase order';
COMMENT ON COLUMN purchase_orders.location_id IS 'Location where this purchase order is for';
COMMENT ON COLUMN purchase_orders.created_by IS 'User who created this purchase order';
COMMENT ON COLUMN purchase_orders.expected_delivery_date IS 'Expected delivery date for the order';
