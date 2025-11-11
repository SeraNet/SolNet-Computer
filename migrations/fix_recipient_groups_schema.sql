-- Fix recipient_groups table schema to match Drizzle schema
-- Add missing num_id column
ALTER TABLE recipient_groups 
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Add missing is_active column
ALTER TABLE recipient_groups 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Fix recipient_group_members table schema
-- Add missing num_id column
ALTER TABLE recipient_group_members 
ADD COLUMN IF NOT EXISTS num_id SERIAL UNIQUE;

-- Rename added_at to created_at to match schema
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipient_group_members' AND column_name = 'added_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipient_group_members' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE recipient_group_members RENAME COLUMN added_at TO created_at;
    END IF;
END $$;

