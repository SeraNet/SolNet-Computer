-- Create customer_categories table
CREATE TABLE IF NOT EXISTS customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    criteria JSONB,
    is_active BOOLEAN DEFAULT true,
    auto_assign BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_categories_type ON customer_categories(type);
CREATE INDEX IF NOT EXISTS idx_customer_categories_is_active ON customer_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_categories_created_at ON customer_categories(created_at);

-- Add new columns to customers table for categorization
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'religion') THEN
        ALTER TABLE customers ADD COLUMN religion TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'location') THEN
        ALTER TABLE customers ADD COLUMN location TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'device_types') THEN
        ALTER TABLE customers ADD COLUMN device_types JSONB;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'tags') THEN
        ALTER TABLE customers ADD COLUMN tags JSONB;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'age') THEN
        ALTER TABLE customers ADD COLUMN age INTEGER;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'occupation') THEN
        ALTER TABLE customers ADD COLUMN occupation TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_spent') THEN
        ALTER TABLE customers ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Create indexes for the new customer columns
CREATE INDEX IF NOT EXISTS idx_customers_religion ON customers(religion);
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(location);
CREATE INDEX IF NOT EXISTS idx_customers_age ON customers(age);
CREATE INDEX IF NOT EXISTS idx_customers_occupation ON customers(occupation);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent);

-- Insert some default categories
INSERT INTO customer_categories (name, description, type, criteria, auto_assign) VALUES
('Muslim Customers', 'All Muslim customers for religious occasions', 'religion', '{"religions": ["Muslim"]}', true),
('Christian Customers', 'All Christian customers for religious occasions', 'religion', '{"religions": ["Christian", "Orthodox", "Catholic", "Protestant"]}', true),
('High Value Customers', 'Customers who spent more than 2000 ETB', 'spending_level', '{"minSpending": 2000}', true),
('Recent Customers', 'Customers who visited in the last 30 days', 'activity_level', '{"lastVisitDays": 30}', true),
('Addis Ababa Customers', 'Customers located in Addis Ababa', 'location', '{"locations": ["Addis Ababa"]}', true),
('iPhone Users', 'Customers using iPhone devices', 'device_type', '{"deviceTypes": ["iPhone"]}', true),
('Young Customers', 'Customers aged 18-35', 'age_group', '{"ageMin": 18, "ageMax": 35}', true)
ON CONFLICT (name) DO NOTHING;
