-- Simple fix for purchase_orders table - add missing columns only
-- This migration adds the columns that the code expects but doesn't exist in the actual table

-- Add missing columns to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS supplier_id VARCHAR REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS location_id VARCHAR REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS created_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Add missing columns to purchase_order_items table
ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS inventory_item_id VARCHAR REFERENCES inventory_items(id),
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Update existing records to have required values
DO $$
DECLARE
    default_location_id VARCHAR;
    default_user_id VARCHAR;
BEGIN
    -- Get default location
    SELECT id INTO default_location_id 
    FROM locations 
    WHERE is_active = true 
    LIMIT 1;
    
    -- Get default user
    SELECT id INTO default_user_id 
    FROM users 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF default_user_id IS NULL THEN
        SELECT id INTO default_user_id 
        FROM users 
        LIMIT 1;
    END IF;
    
    -- Update purchase orders with null location_id (only if column exists)
    IF default_location_id IS NOT NULL THEN
        UPDATE purchase_orders 
        SET location_id = default_location_id 
        WHERE location_id IS NULL;
    END IF;
    
    -- Update purchase orders with null created_by (only if column exists)
    IF default_user_id IS NOT NULL THEN
        UPDATE purchase_orders 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
    END IF;
END $$;
