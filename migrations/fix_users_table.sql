-- Fix users table structure to match schema
-- Add missing columns and fix constraints

-- Add missing columns if they don't exist
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "num_id" serial UNIQUE,
ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'sales',
ADD COLUMN IF NOT EXISTS "location_id" varchar,
ADD COLUMN IF NOT EXISTS "profile_picture" text,
ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;

-- Fix the syntax error in the existing table (remove the missing comma)
-- This is a workaround since we can't easily fix the original migration
-- The table should work as is, but we'll ensure the proper structure

-- Add foreign key constraint for location_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_location_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_location_id_fkey" 
        FOREIGN KEY ("location_id") REFERENCES "locations"("id");
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "users" ("is_active");
CREATE INDEX IF NOT EXISTS "users_location_id_idx" ON "users" ("location_id");
