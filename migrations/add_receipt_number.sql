-- Add receipt_number column to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS receipt_number VARCHAR UNIQUE;
