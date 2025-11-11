-- Create expense_categories table
CREATE TABLE IF NOT EXISTS "expense_categories" (
    "num_id" serial UNIQUE NOT NULL,
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "color" varchar(7),
    "icon" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_by" varchar REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX "idx_expense_categories_name" ON "expense_categories"("name");
CREATE INDEX "idx_expense_categories_is_active" ON "expense_categories"("is_active");
CREATE INDEX "idx_expense_categories_sort_order" ON "expense_categories"("sort_order");

-- Insert some default expense categories
INSERT INTO "expense_categories" ("name", "description", "color", "icon", "sort_order") VALUES
('Rent', 'Office or store rent payments', '#3B82F6', 'building', 1),
('Utilities', 'Electricity, water, internet, phone bills', '#10B981', 'zap', 2),
('Supplies', 'Office supplies and materials', '#F59E0B', 'package', 3),
('Marketing', 'Advertising and promotional expenses', '#8B5CF6', 'megaphone', 4),
('Equipment', 'Computers, tools, and machinery', '#EF4444', 'tool', 5),
('Transportation', 'Fuel, vehicle maintenance, travel', '#06B6D4', 'car', 6),
('Insurance', 'Business insurance policies', '#84CC16', 'shield', 7),
('Professional Services', 'Legal, accounting, consulting fees', '#F97316', 'briefcase', 8),
('Maintenance', 'Building and equipment maintenance', '#6B7280', 'wrench', 9),
('Miscellaneous', 'Other business expenses', '#9CA3AF', 'more-horizontal', 10)
ON CONFLICT DO NOTHING;
