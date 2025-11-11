-- Create locations table
CREATE TABLE IF NOT EXISTS "locations" (
    "num_id" serial UNIQUE,
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "code" varchar(10) NOT NULL UNIQUE,
    "address" text NOT NULL,
    "city" varchar NOT NULL,
    "state" varchar,
    "zip_code" varchar,
    "country" varchar NOT NULL DEFAULT 'USA',
    "phone" varchar,
    "email" varchar,
    "manager_name" varchar,
    "is_active" boolean NOT NULL DEFAULT true,
    "timezone" varchar DEFAULT 'America/New_York',
    "business_hours" jsonb,
    "notes" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS "locations_code_idx" ON "locations" ("code");

-- Create index on is_active for filtering active locations
CREATE INDEX IF NOT EXISTS "locations_is_active_idx" ON "locations" ("is_active");
