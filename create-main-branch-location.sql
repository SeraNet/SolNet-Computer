-- Add main branch location
INSERT INTO locations (id, name, address, city, state, zip_code, country, phone, email, is_active, created_at, updated_at)
VALUES (
  'main-branch-location',
  'Main Branch',
  'Main Office Address',
  'Main City',
  'Main State',
  '12345',
  'Main Country',
  '+1234567890',
  'main@company.com',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
