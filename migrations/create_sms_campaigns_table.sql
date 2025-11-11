-- Create SMS campaigns table for storing bulk SMS campaign data
CREATE TABLE IF NOT EXISTS sms_campaigns (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    occasion TEXT NOT NULL,
    custom_occasion TEXT,
    scheduled_date TIMESTAMP,
    target_group TEXT NOT NULL,
    custom_filters JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
    sent_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create SMS campaign recipients table to track individual SMS sends
CREATE TABLE IF NOT EXISTS sms_campaign_recipients (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR NOT NULL REFERENCES sms_campaigns(id) ON DELETE CASCADE,
    customer_id VARCHAR NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled_date ON sms_campaigns(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sms_campaign_recipients_campaign_id ON sms_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaign_recipients_status ON sms_campaign_recipients(status);
