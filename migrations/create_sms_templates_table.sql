-- Create SMS templates table for storing customizable SMS message templates
CREATE TABLE IF NOT EXISTS sms_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    device_registration TEXT NOT NULL,
    device_status_update TEXT NOT NULL,
    device_ready_for_pickup TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'amharic' CHECK (language IN ('amharic', 'english', 'mixed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default SMS templates
INSERT INTO sms_templates (device_registration, device_status_update, device_ready_for_pickup, language) VALUES 
    ('🔧 መሣሪያ ምዝገባ የተረጋገጠ ነው

ውድ {customerName}፣

የእርስዎ መሣሪያ ለጥገና አገልግሎት በተሳካተ ሁኔታ ተመዝግቧል።

📱 የመሣሪያ ዝርዝር፦
• አይነት፦ {deviceType}
• የምርት ስም፦ {brand}
• ሞዴል፦ {model}
• ችግር፦ {problemDescription}

🔢 የመከታተል ቁጥር፦ {receiptNumber}

የጥገና ሂደቱን እንደቀጥለን እንወቃለን። የመከታተል ቁጥሩን በመጠቀም የመሣሪያዎን ሁኔታ መከታተል ይችላሉ።

አገልግሎታችንን ስለመረጡ እናመሰግናለን!', 
    '📱 የመሣሪያ ሁኔታ ዝመና

ውድ {customerName}፣

{statusMessage}

🔢 የመከታተል ቁጥር፦ {receiptNumber}
📱 መሣሪያ፦ {deviceType} {brand} {model}{costInfo}{completionInfo}

እባክዎ ትዕግስት ያድርጉ!',
    '🎉 መሣሪያ ለመውሰድ ዝግጁ ነው!

ውድ {customerName}፣

የእርስዎ መሣሪያ ጥገና ተጠናቅቋል እና ለመውሰድ ዝግጁ ነው!

📱 መሣሪያ፦ {deviceType} {brand} {model}
🔢 የመከታተል ቁጥር፦ {receiptNumber}{costInfo}

እባክዎ መሣሪያዎን ሲወስዱ የመከታተል ቁጥሩን ያመጡ።

እርስዎን እንድናይ እንጠብቃለን!',
    'amharic')
ON CONFLICT (id) DO NOTHING;
