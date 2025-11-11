-- Create Ethiopian SMS settings table for storing local SMS provider configuration
CREATE TABLE IF NOT EXISTS ethiopian_sms_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'ethio_telecom', 'local_aggregator', 'custom'
    username TEXT,
    password TEXT,
    api_key TEXT,
    sender_id TEXT,
    base_url TEXT,
    custom_endpoint TEXT,
    custom_headers TEXT, -- JSON string
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default Ethiopian SMS settings
INSERT INTO ethiopian_sms_settings (provider, sender_id, is_active) VALUES 
    ('africas_talking', 'SolNet', true)
ON CONFLICT (id) DO NOTHING;
