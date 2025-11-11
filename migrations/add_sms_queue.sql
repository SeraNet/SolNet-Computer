-- Create SMS queue table for reliable SMS delivery with retry mechanism
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'device_registration', 'status_update', 'ready_for_pickup', 'delivered', etc.
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB, -- Store additional context like deviceId, receiptNumber, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status);
CREATE INDEX IF NOT EXISTS idx_sms_queue_created_at ON sms_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_queue_type ON sms_queue(type);
CREATE INDEX IF NOT EXISTS idx_sms_queue_phone ON sms_queue(phone);

-- Add comment for documentation
COMMENT ON TABLE sms_queue IS 'Queue system for SMS messages with retry mechanism for failed deliveries';
COMMENT ON COLUMN sms_queue.status IS 'pending: waiting to send, sent: successfully delivered, failed: exceeded max attempts, cancelled: manually cancelled';
COMMENT ON COLUMN sms_queue.attempts IS 'Number of times we attempted to send this SMS';
COMMENT ON COLUMN sms_queue.metadata IS 'JSON object containing context like deviceId, receiptNumber, customerId, etc.';

