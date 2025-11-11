-- Add registration_date column to customers table
ALTER TABLE customers ADD COLUMN registration_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing customers to have registration_date set to their created_at date
UPDATE customers SET registration_date = DATE(created_at) WHERE registration_date IS NULL;
