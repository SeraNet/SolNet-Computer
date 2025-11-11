-- Migration: Add landing page content management fields to business_profile table
-- Run this script to add the new fields for features, team members, and why choose us sections

-- Add the new columns to the business_profile table
ALTER TABLE business_profile 
ADD COLUMN IF NOT EXISTS features JSONB,
ADD COLUMN IF NOT EXISTS team_members JSONB,
ADD COLUMN IF NOT EXISTS why_choose_us JSONB;

-- Add comments to document the new columns
COMMENT ON COLUMN business_profile.features IS 'JSON array of feature/benefit items for landing page';
COMMENT ON COLUMN business_profile.team_members IS 'JSON array of team member information for landing page';
COMMENT ON COLUMN business_profile.why_choose_us IS 'JSON array of why choose us items for landing page';

-- Update the public_info column to include the new display settings if it doesn't exist
UPDATE business_profile 
SET public_info = COALESCE(public_info, '{}'::jsonb) || '{
  "showFeatures": true,
  "showTeam": true,
  "showStats": true,
  "showWhyChooseUs": true
}'::jsonb
WHERE public_info IS NULL OR NOT (public_info ? 'showFeatures');

-- Insert default features if none exist
UPDATE business_profile 
SET features = '[
  {
    "title": "Fast Diagnostics",
    "description": "Advanced diagnostic tools provide quick and accurate problem identification, saving you time and money.",
    "icon": "Zap",
    "color": "blue",
    "isActive": true,
    "sortOrder": 0
  },
  {
    "title": "Data Protection",
    "description": "Your data is safe with us. We use industry-standard security measures to protect your valuable information.",
    "icon": "Shield",
    "color": "green",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "title": "Precision Repair",
    "description": "Expert technicians with specialized tools ensure precise repairs that last longer and perform better.",
    "icon": "Target",
    "color": "purple",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "title": "Remote Support",
    "description": "Get instant support from anywhere with our remote assistance services for quick software issues.",
    "icon": "Globe",
    "color": "yellow",
    "isActive": true,
    "sortOrder": 3
  }
]'::jsonb
WHERE features IS NULL;

-- Insert default team members if none exist
UPDATE business_profile 
SET team_members = '[
  {
    "name": "Founder & CEO",
    "title": "Founder & Lead Technician",
    "description": "Passionate about technology with years of experience in computer repair and customer service.",
    "experience": "10 Years Experience",
    "specializations": ["Computer Repair", "Data Recovery", "System Optimization"],
    "icon": "Crown",
    "color": "blue",
    "isActive": true,
    "sortOrder": 0
  },
  {
    "name": "Senior Technician",
    "title": "Hardware Specialist",
    "description": "Expert in laptop and desktop repairs with specialized knowledge in data recovery and system optimization.",
    "experience": "8+ Years Experience",
    "specializations": ["Laptop Repair", "Data Recovery", "System Optimization"],
    "icon": "Wrench",
    "color": "green",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "name": "Customer Support",
    "title": "Support Specialist",
    "description": "Dedicated to providing exceptional customer service and ensuring your satisfaction with every interaction.",
    "experience": "5+ Years Experience",
    "specializations": ["Customer Service", "Technical Support", "Problem Resolution"],
    "icon": "Headphones",
    "color": "purple",
    "isActive": true,
    "sortOrder": 2
  }
]'::jsonb
WHERE team_members IS NULL;

-- Insert default why choose us items if none exist
UPDATE business_profile 
SET why_choose_us = '[
  {
    "title": "Certified Technicians",
    "description": "Our team consists of certified professionals with years of experience in computer repair and maintenance. Every technician is trained and certified in the latest repair techniques.",
    "icon": "Shield",
    "color": "green",
    "isActive": true,
    "sortOrder": 0
  },
  {
    "title": "Fast Turnaround",
    "description": "Most repairs completed within 24-48 hours. We understand your time is valuable and work efficiently to get your devices back to you quickly with same-day service available for urgent repairs.",
    "icon": "Clock",
    "color": "blue",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "title": "Quality Guarantee",
    "description": "All repairs come with a comprehensive warranty. If you are not satisfied, we will make it right at no additional cost. We stand behind our work with industry-leading guarantees.",
    "icon": "CheckCircle",
    "color": "purple",
    "isActive": true,
    "sortOrder": 2
  }
]'::jsonb
WHERE why_choose_us IS NULL;
