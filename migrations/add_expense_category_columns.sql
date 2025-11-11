-- Add color and icon columns to expense_categories table
-- These columns are used by the expense category manager UI

-- Add color column for UI visualization
ALTER TABLE expense_categories 
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#3B82F6';

-- Add icon column for UI icons
ALTER TABLE expense_categories 
  ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'Tag';

-- Update existing records with default values if they're null
UPDATE expense_categories 
SET color = '#3B82F6' 
WHERE color IS NULL;

UPDATE expense_categories 
SET icon = 'Tag' 
WHERE icon IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN expense_categories.color IS 'Hex color code for UI display (e.g., #3B82F6)';
COMMENT ON COLUMN expense_categories.icon IS 'Icon name from lucide-react library';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Expense category columns added successfully';
  RAISE NOTICE '📊 All existing categories updated with defaults';
END $$;
















