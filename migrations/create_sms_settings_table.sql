-- Create SMS settings table for storing Twilio configuration
CREATE TABLE IF NOT EXISTS sms_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default SMS settings structure
INSERT INTO sms_settings (key, value, description) VALUES 
    ('twilioAccountSid', '', 'Twilio Account SID for SMS service')
ON CONFLICT (key) DO NOTHING;

INSERT INTO sms_settings (key, value, description) VALUES 
    ('twilioAuthToken', '', 'Twilio Auth Token for SMS service')
ON CONFLICT (key) DO NOTHING;

INSERT INTO sms_settings (key, value, description) VALUES 
    ('twilioFromNumber', '', 'Twilio phone number for sending SMS')
ON CONFLICT (key) DO NOTHING;

