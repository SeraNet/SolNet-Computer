-- Fix purchase_orders location_id null values before applying NOT NULL constraint
-- This migration should be run before fix_schema_inconsistencies.sql

-- First, check if there are any purchase orders with null location_id
DO $$
DECLARE
    null_location_count INTEGER;
    default_location_id VARCHAR;
BEGIN
    -- Count purchase orders with null location_id
    SELECT COUNT(*) INTO null_location_count 
    FROM purchase_orders 
    WHERE location_id IS NULL;
    
    IF null_location_count > 0 THEN
        RAISE NOTICE 'Found % purchase orders with null location_id', null_location_count;
        
        -- Get the first available location as default
        SELECT id INTO default_location_id 
        FROM locations 
        WHERE is_active = true 
        LIMIT 1;
        
        IF default_location_id IS NOT NULL THEN
            -- Update all purchase orders with null location_id to use the default location
            UPDATE purchase_orders 
            SET location_id = default_location_id 
            WHERE location_id IS NULL;
            
            RAISE NOTICE 'Updated % purchase orders to use location_id: %', null_location_count, default_location_id;
        ELSE
            RAISE EXCEPTION 'No active locations found. Please create at least one location before running this migration.';
        END IF;
    ELSE
        RAISE NOTICE 'No purchase orders with null location_id found';
    END IF;
END $$;

-- Also fix any purchase orders with null created_by
DO $$
DECLARE
    null_created_by_count INTEGER;
    default_user_id VARCHAR;
BEGIN
    -- Count purchase orders with null created_by
    SELECT COUNT(*) INTO null_created_by_count 
    FROM purchase_orders 
    WHERE created_by IS NULL;
    
    IF null_created_by_count > 0 THEN
        RAISE NOTICE 'Found % purchase orders with null created_by', null_created_by_count;
        
        -- Get the first available admin user as default
        SELECT id INTO default_user_id 
        FROM users 
        WHERE role = 'admin' 
        LIMIT 1;
        
        IF default_user_id IS NOT NULL THEN
            -- Update all purchase orders with null created_by to use the default user
            UPDATE purchase_orders 
            SET created_by = default_user_id 
            WHERE created_by IS NULL;
            
            RAISE NOTICE 'Updated % purchase orders to use created_by: %', null_created_by_count, default_user_id;
        ELSE
            -- If no admin user, use the first available user
            SELECT id INTO default_user_id 
            FROM users 
            LIMIT 1;
            
            IF default_user_id IS NOT NULL THEN
                UPDATE purchase_orders 
                SET created_by = default_user_id 
                WHERE created_by IS NULL;
                
                RAISE NOTICE 'Updated % purchase orders to use created_by: %', null_created_by_count, default_user_id;
            ELSE
                RAISE EXCEPTION 'No users found. Please create at least one user before running this migration.';
            END IF;
        END IF;
    ELSE
        RAISE NOTICE 'No purchase orders with null created_by found';
    END IF;
END $$;
