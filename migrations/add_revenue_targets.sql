-- Add revenue target columns to business_profile table
ALTER TABLE business_profile 
ADD COLUMN IF NOT EXISTS monthly_revenue_target DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS annual_revenue_target DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS growth_target_percentage DECIMAL(5,2) DEFAULT 15.00;

-- Add comment to explain the new columns
COMMENT ON COLUMN business_profile.monthly_revenue_target IS 'Monthly revenue target for the business';
COMMENT ON COLUMN business_profile.annual_revenue_target IS 'Annual revenue target for the business';
COMMENT ON COLUMN business_profile.growth_target_percentage IS 'Target growth percentage for revenue projections';
