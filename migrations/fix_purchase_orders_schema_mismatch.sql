-- Fix purchase_orders table schema mismatch
-- The actual table has different columns than what the code expects

-- First, let's see what columns we actually have
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE 'Current purchase_orders table columns:';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  %: % (%)', col_record.column_name, col_record.data_type, 
                     CASE WHEN col_record.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
END $$;

-- Add missing columns that the code expects
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS supplier_id VARCHAR REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS location_id VARCHAR REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS created_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Set NOT NULL constraints for required fields
DO $$ 
BEGIN
    -- Only set NOT NULL if the column exists and doesn't already have the constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'location_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'location_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_orders ALTER COLUMN location_id SET NOT NULL;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'created_by'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_orders ALTER COLUMN created_by SET NOT NULL;
    END IF;
END $$;

-- Fix purchase_order_items table to match expected schema
ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS inventory_item_id VARCHAR REFERENCES inventory_items(id),
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Set NOT NULL constraint for item_name if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_order_items' 
        AND column_name = 'item_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_order_items' 
        AND column_name = 'item_name' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE purchase_order_items ALTER COLUMN item_name SET NOT NULL;
    END IF;
END $$;

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
    
    -- Update purchase orders with null location_id
    IF default_location_id IS NOT NULL THEN
        UPDATE purchase_orders 
        SET location_id = default_location_id 
        WHERE location_id IS NULL;
    END IF;
    
    -- Update purchase orders with null created_by
    IF default_user_id IS NOT NULL THEN
        UPDATE purchase_orders 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
    END IF;
    
    -- Update purchase order items with null item_name
    UPDATE purchase_order_items 
    SET item_name = COALESCE(name, 'Unknown Item')
    WHERE item_name IS NULL;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN purchase_orders.supplier_id IS 'Reference to supplier for this purchase order';
COMMENT ON COLUMN purchase_orders.location_id IS 'Location where this purchase order is for';
COMMENT ON COLUMN purchase_orders.created_by IS 'User who created this purchase order';
COMMENT ON COLUMN purchase_orders.expected_delivery_date IS 'Expected delivery date for the order';
COMMENT ON COLUMN purchase_order_items.inventory_item_id IS 'Reference to inventory item if this is an existing item';
COMMENT ON COLUMN purchase_order_items.item_name IS 'Name of the item being ordered';
