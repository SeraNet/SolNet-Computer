-- Create business_profile table
CREATE TABLE IF NOT EXISTS "business_profile" (
    "num_id" serial UNIQUE,
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_name" text NOT NULL,
    "owner_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text NOT NULL,
    "address" text NOT NULL,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "zip_code" text NOT NULL,
    "country" text NOT NULL DEFAULT 'USA',
    "website" text,
    "logo" text,
    "tax_id" text,
    "license_number" text,
    "business_type" text DEFAULT 'Computer Repair Shop',
    "description" text,
    "established_date" date,
    "owner_bio" text,
    "owner_photo" text,
    "years_of_experience" text,
    -- Landing page statistics
    "total_customers" text,
    "total_devices_repaired" text,
    "monthly_average_repairs" text,
    "customer_retention_rate" text,
    "average_repair_time" text,
    "warranty_rate" text,
    "happy_customers" text,
    "average_rating" text,
    "customer_satisfaction_rate" text,
    -- Business goals and targets
    "monthly_revenue_target" decimal(10,2),
    "annual_revenue_target" decimal(10,2),
    "growth_target_percentage" decimal(5,2) DEFAULT 15.00,
    "specializations" jsonb,
    "awards" jsonb,
    "testimonials" jsonb,
    "working_hours" jsonb,
    "social_links" jsonb,
    "banking_info" jsonb,
    "insurance_info" jsonb,
    "certifications" jsonb,
    "public_info" jsonb,
    -- Landing page content management
    "features" jsonb,
    "team_members" jsonb,
    "why_choose_us" jsonb,
    -- Mission, Vision & Values
    "mission" text,
    "vision" text,
    "values" jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "business_profile_email_idx" ON "business_profile" ("email");
CREATE INDEX IF NOT EXISTS "business_profile_business_name_idx" ON "business_profile" ("business_name");
