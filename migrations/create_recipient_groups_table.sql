-- Create recipient_groups table
CREATE TABLE IF NOT EXISTS recipient_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create recipient_group_members table to link customers to groups
CREATE TABLE IF NOT EXISTS recipient_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES recipient_groups(id) ON DELETE CASCADE,
    customer_id VARCHAR NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, customer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipient_groups_name ON recipient_groups(name);
CREATE INDEX IF NOT EXISTS idx_recipient_group_members_group_id ON recipient_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_recipient_group_members_customer_id ON recipient_group_members(customer_id);

-- Insert some default groups
INSERT INTO recipient_groups (name, description) VALUES
('Muslim Customers', 'Customers for Eid and Islamic occasions'),
('Christian Customers', 'Customers for Christmas and Easter'),
('High Value Customers', 'VIP customers for special promotions'),
('Recent Customers', 'Customers who visited recently'),
('Addis Ababa Customers', 'Customers located in Addis Ababa')
ON CONFLICT (name) DO NOTHING;
