-- Add unique constraint to phone field in customers table
ALTER TABLE customers ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
