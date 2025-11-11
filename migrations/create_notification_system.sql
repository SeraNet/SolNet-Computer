-- Create notification system tables
-- Migration: create_notification_system

-- Create notification_types table
CREATE TABLE IF NOT EXISTS notification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'unread',
    recipient_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    related_entity_type TEXT,
    related_entity_id TEXT,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, type_id)
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    email_subject TEXT,
    email_body TEXT,
    sms_message TEXT,
    variables JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_types (name, description, category) VALUES
('device_registered', 'Device registration notification', 'device'),
('device_status_update', 'Device status change notification', 'device'),
('repair_completed', 'Repair completion notification', 'device'),
('low_stock_alert', 'Low stock inventory alert', 'inventory'),
('inventory_reorder', 'Inventory reorder reminder', 'inventory'),
('customer_feedback', 'New customer feedback received', 'customer'),
('appointment_reminder', 'Appointment reminder', 'appointment'),
('payment_received', 'Payment received notification', 'sales'),
('system_alert', 'System maintenance or error alert', 'system'),
('new_customer', 'New customer registration', 'customer'),
('urgent_repair', 'Urgent repair assignment', 'device'),
('daily_summary', 'Daily business summary', 'system'),
('weekly_report', 'Weekly business report', 'system'),
('monthly_report', 'Monthly business report', 'system')
ON CONFLICT (name) DO NOTHING;

-- Insert default notification templates
INSERT INTO notification_templates (type_id, title, message, email_subject, email_body, sms_message, variables) 
SELECT 
    nt.id,
    'Device Registered',
    'A new device has been registered for {customerName}',
    'Device Registration - {deviceType}',
    'Dear {customerName},<br><br>Your {deviceType} has been successfully registered for repair.<br><br>Device Details:<br>- Type: {deviceType}<br>- Brand: {brand}<br>- Model: {model}<br>- Problem: {problemDescription}<br><br>We will contact you once the diagnosis is complete.<br><br>Best regards,<br>{businessName}',
    'Device registered for {customerName}. {deviceType} - {brand} {model}. We will contact you soon.',
    '["customerName", "deviceType", "brand", "model", "problemDescription", "businessName"]'
FROM notification_types nt WHERE nt.name = 'device_registered'
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (type_id, title, message, email_subject, email_body, sms_message, variables)
SELECT 
    nt.id,
    'Device Status Updated',
    'Your device status has been updated to {status}',
    'Device Status Update - {status}',
    'Dear {customerName},<br><br>Your device status has been updated to: <strong>{status}</strong><br><br>Device: {deviceType} {brand} {model}<br>Current Status: {status}<br>Estimated Completion: {estimatedCompletion}<br><br>We will keep you updated on any further changes.<br><br>Best regards,<br>{businessName}',
    'Device status updated: {status}. {deviceType} {brand} {model}. Est. completion: {estimatedCompletion}',
    '["customerName", "status", "deviceType", "brand", "model", "estimatedCompletion", "businessName"]'
FROM notification_types nt WHERE nt.name = 'device_status_update'
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (type_id, title, message, email_subject, email_body, sms_message, variables)
SELECT 
    nt.id,
    'Repair Completed',
    'Your device repair has been completed successfully',
    'Repair Completed - Ready for Pickup',
    'Dear {customerName},<br><br>Great news! Your device repair has been completed successfully.<br><br>Device: {deviceType} {brand} {model}<br>Total Cost: {totalCost}<br>Repair Summary: {repairSummary}<br><br>Your device is ready for pickup. Please bring your receipt when collecting.<br><br>Best regards,<br>{businessName}',
    'Repair completed! {deviceType} {brand} {model} ready for pickup. Total: {totalCost}',
    '["customerName", "deviceType", "brand", "model", "totalCost", "repairSummary", "businessName"]'
FROM notification_types nt WHERE nt.name = 'repair_completed'
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (type_id, title, message, email_subject, email_body, sms_message, variables)
SELECT 
    nt.id,
    'Low Stock Alert',
    'Low stock alert for {itemName}',
    'Low Stock Alert - {itemName}',
    'Low stock alert for {itemName}.<br><br>Current stock: {currentStock}<br>Minimum threshold: {minThreshold}<br>Category: {category}<br><br>Please reorder soon to avoid stockouts.',
    'Low stock: {itemName} ({currentStock} left). Please reorder.',
    '["itemName", "currentStock", "minThreshold", "category"]'
FROM notification_types nt WHERE nt.name = 'low_stock_alert'
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (type_id, title, message, email_subject, email_body, sms_message, variables)
SELECT 
    nt.id,
    'New Customer Feedback',
    'New feedback received from {customerName} - Rating: {rating}/5',
    'New Customer Feedback - {customerName}',
    'Dear {recipientName},<br><br>New customer feedback has been received:<br><br>Customer: {customerName}<br>Email: {customerEmail}<br>Service Type: {serviceType}<br>Rating: {rating}/5<br>Review: {reviewText}<br><br>Please review and respond if necessary.<br><br>Best regards,<br>{businessName}',
    'New feedback from {customerName}. Rating: {rating}/5. Service: {serviceType}',
    '["recipientName", "customerName", "customerEmail", "serviceType", "rating", "reviewText", "businessName"]'
FROM notification_types nt WHERE nt.name = 'customer_feedback'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_id ON notifications(type_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type_id ON notification_preferences(type_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type_id ON notification_templates(type_id);
