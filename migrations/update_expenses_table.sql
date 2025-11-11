-- Update expenses table to match the shared schema
-- Add missing columns and update existing ones

-- First, drop the existing expenses table constraints and recreate with new schema
DROP TABLE IF EXISTS "expenses" CASCADE;

CREATE TABLE "expenses" (
    "num_id" serial UNIQUE NOT NULL,
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "location_id" varchar REFERENCES "locations"("id"),
    "category" text NOT NULL,
    "description" text NOT NULL,
    "amount" decimal(10,2) NOT NULL,
    "expense_date" timestamp NOT NULL,
    "vendor" text,
    "receipt_url" text,
    "notes" text,
    "expense_type" text DEFAULT 'one-time',
    "payment_method" text DEFAULT 'cash',
    "is_recurring" boolean NOT NULL DEFAULT false,
    "recurring_frequency" text,
    "created_by" varchar REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX "idx_expenses_location_id" ON "expenses"("location_id");
CREATE INDEX "idx_expenses_expense_date" ON "expenses"("expense_date");
CREATE INDEX "idx_expenses_category" ON "expenses"("category");
CREATE INDEX "idx_expenses_created_by" ON "expenses"("created_by");
