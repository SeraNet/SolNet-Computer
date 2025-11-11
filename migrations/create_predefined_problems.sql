-- Create predefined problems table
CREATE TABLE IF NOT EXISTS "predefined_problems" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "category" text NOT NULL DEFAULT 'General',
  "severity" text NOT NULL DEFAULT 'medium',
  "estimated_cost" decimal(10,2),
  "estimated_duration" integer,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create device problems junction table
CREATE TABLE IF NOT EXISTS "device_problems" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "device_id" varchar NOT NULL REFERENCES "devices"("id") ON DELETE CASCADE,
  "problem_id" uuid NOT NULL REFERENCES "predefined_problems"("id") ON DELETE CASCADE,
  "custom_description" text,
  "created_at" timestamp DEFAULT now()
);

-- Insert some common predefined problems
INSERT INTO "predefined_problems" ("name", "description", "category", "severity", "estimated_cost", "estimated_duration", "sort_order") VALUES
-- Hardware Issues
('Screen not working', 'Device screen is black, cracked, or unresponsive', 'Hardware', 'high', 150.00, 120, 1),
('Battery not charging', 'Battery does not hold charge or device does not charge', 'Battery', 'medium', 80.00, 90, 2),
('Power button not working', 'Power button is stuck or unresponsive', 'Hardware', 'medium', 50.00, 60, 3),
('Speaker not working', 'No sound or distorted audio output', 'Hardware', 'low', 40.00, 45, 4),
('Camera not working', 'Front or back camera not functioning', 'Hardware', 'medium', 70.00, 75, 5),
('Charging port damaged', 'USB/charging port is loose or broken', 'Hardware', 'medium', 60.00, 60, 6),
('Volume buttons not working', 'Volume up/down buttons unresponsive', 'Hardware', 'low', 30.00, 30, 7),
('Home button not working', 'Home button stuck or unresponsive', 'Hardware', 'medium', 45.00, 45, 8),

-- Software Issues
('Device not turning on', 'Device does not power on at all', 'Software', 'critical', 100.00, 120, 9),
('Slow performance', 'Device is very slow or laggy', 'Software', 'medium', 50.00, 60, 10),
('Apps crashing', 'Applications keep crashing or freezing', 'Software', 'medium', 40.00, 45, 11),
('WiFi not connecting', 'Cannot connect to WiFi networks', 'Network', 'medium', 35.00, 30, 12),
('Bluetooth not working', 'Bluetooth connectivity issues', 'Network', 'low', 25.00, 20, 13),
('Touch screen unresponsive', 'Touch screen not responding to touches', 'Hardware', 'high', 120.00, 90, 14),
('Water damage', 'Device exposed to water or liquid', 'Hardware', 'critical', 200.00, 180, 15),
('Overheating', 'Device gets very hot during use', 'Hardware', 'high', 80.00, 60, 16),

-- Mobile Specific
('SIM card not detected', 'SIM card not recognized by device', 'Hardware', 'medium', 20.00, 15, 17),
('Microphone not working', 'Microphone not picking up sound', 'Hardware', 'medium', 55.00, 45, 18),
('Vibration not working', 'Device vibration function not working', 'Hardware', 'low', 35.00, 30, 19),
('Fingerprint sensor not working', 'Fingerprint scanner not functioning', 'Hardware', 'medium', 65.00, 60, 20),

-- Laptop Specific
('Keyboard not working', 'Keyboard keys not responding', 'Hardware', 'high', 90.00, 75, 21),
('Trackpad not working', 'Trackpad not responding to gestures', 'Hardware', 'medium', 70.00, 60, 22),
('Fan noise', 'Loud fan noise or overheating', 'Hardware', 'medium', 60.00, 45, 23),
('CD/DVD drive not working', 'Optical drive not functioning', 'Hardware', 'low', 40.00, 30, 24),

-- General Issues
('Data recovery needed', 'Need to recover lost data from device', 'Software', 'high', 150.00, 240, 25),
('Virus/malware removal', 'Device infected with viruses or malware', 'Software', 'medium', 80.00, 90, 26),
('Operating system issues', 'OS not booting or system errors', 'Software', 'high', 100.00, 120, 27),
('Password reset needed', 'Forgotten password or lock screen', 'Software', 'low', 30.00, 20, 28),
('Software update issues', 'Problems with system updates', 'Software', 'medium', 40.00, 45, 29),
('Backup and restore', 'Need to backup data or restore device', 'Software', 'medium', 60.00, 90, 30);
