-- Seed locations table with default data
-- Only insert if no location with code 'MAIN' exists
INSERT INTO "locations" (
    "id",
    "name", 
    "code", 
    "address", 
    "city", 
    "state", 
    "zip_code", 
    "country", 
    "phone", 
    "email", 
    "manager_name", 
    "is_active", 
    "timezone", 
    "business_hours", 
    "notes"
) 
SELECT 
    gen_random_uuid(),
    'Main Store',
    'MAIN',
    'Edget Primary School',
    'Halaba Kulito',
    'Central Ethiopia',
    '1000',
    'Ethiopia',
    '091 334 1664',
    'info@solnetcomputer.com',
    'Solomon Tadese',
    true,
    'Africa/Addis_Ababa',
    '{
        "monday": {"open": "08:00", "close": "20:00"},
        "tuesday": {"open": "08:00", "close": "20:00"},
        "wednesday": {"open": "08:00", "close": "20:00"},
        "thursday": {"open": "08:00", "close": "20:00"},
        "friday": {"open": "08:00", "close": "20:00"},
        "saturday": {"open": "09:00", "close": "19:00"},
        "sunday": {"closed": true}
    }'::jsonb,
    'Main headquarters location'
WHERE NOT EXISTS (
    SELECT 1 FROM "locations" WHERE "code" = 'MAIN'
);
