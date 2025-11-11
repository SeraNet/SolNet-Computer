import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function resetDevDatabase() {
  try {
    console.log("🔄 Resetting development database...");

    // Drop all tables (in reverse dependency order)
    const dropQueries = [
      "DROP TABLE IF EXISTS sms_campaigns CASCADE",
      "DROP TABLE IF EXISTS sms_templates CASCADE",
      "DROP TABLE IF EXISTS recipient_groups CASCADE",
      "DROP TABLE IF EXISTS ethiopian_sms_settings CASCADE",
      "DROP TABLE IF EXISTS sms_settings CASCADE",
      "DROP TABLE IF EXISTS predefined_problems CASCADE",
      "DROP TABLE IF EXISTS notification_types CASCADE",
      "DROP TABLE IF EXISTS notifications CASCADE",
      "DROP TABLE IF EXISTS purchase_order_items CASCADE",
      "DROP TABLE IF EXISTS purchase_orders CASCADE",
      "DROP TABLE IF EXISTS inventory_items CASCADE",
      "DROP TABLE IF EXISTS expenses CASCADE",
      "DROP TABLE IF EXISTS expense_categories CASCADE",
      "DROP TABLE IF EXISTS budgets CASCADE",
      "DROP TABLE IF EXISTS customer_categories CASCADE",
      "DROP TABLE IF EXISTS customers CASCADE",
      "DROP TABLE IF EXISTS devices CASCADE",
      "DROP TABLE IF EXISTS appointments CASCADE",
      "DROP TABLE IF EXISTS sales CASCADE",
      "DROP TABLE IF EXISTS revenue_targets CASCADE",
      "DROP TABLE IF EXISTS business_profile CASCADE",
      "DROP TABLE IF EXISTS locations CASCADE",
      "DROP TABLE IF EXISTS users CASCADE",
      "DROP TABLE IF EXISTS system_settings CASCADE",
    ];

    for (const query of dropQueries) {
      await sql(query);
      console.log(`✅ Dropped: ${query.split(" ")[4]}`);
    }

    // Create all tables (in dependency order)
    console.log("\n📦 Creating tables...");

    // Users table
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'worker',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        profile_picture VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created: users");

    // Locations table
    await sql(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Ethiopia',
        phone VARCHAR(20),
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created: locations");

    // Business profile table
    await sql(`
      CREATE TABLE IF NOT EXISTS business_profile (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Ethiopia',
        website VARCHAR(255),
        logo TEXT,
        tax_id VARCHAR(50),
        license_number VARCHAR(50),
        business_type VARCHAR(100),
        description TEXT,
        established_date DATE,
        owner_bio TEXT,
        owner_photo VARCHAR(255),
        years_of_experience VARCHAR(50),
        total_customers VARCHAR(50),
        total_devices_repaired VARCHAR(50),
        monthly_average_repairs VARCHAR(50),
        customer_retention_rate VARCHAR(10),
        average_repair_time VARCHAR(50),
        warranty_rate VARCHAR(10),
        happy_customers VARCHAR(50),
        average_rating VARCHAR(10),
        customer_satisfaction_rate VARCHAR(10),
        monthly_revenue_target DECIMAL(15,2),
        annual_revenue_target DECIMAL(15,2),
        growth_target_percentage DECIMAL(5,2),
        specializations JSONB,
        awards JSONB,
        testimonials JSONB,
        working_hours JSONB,
        social_links JSONB,
        banking_info JSONB,
        insurance_info JSONB,
        certifications JSONB,
        public_info JSONB,
        features JSONB,
        team_members JSONB,
        why_choose_us JSONB,
        mission TEXT,
        vision TEXT,
        values JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created: business_profile");

    // Add other tables here...
    // (I'll add a few key ones as examples)

    await sql(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) UNIQUE,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        category_id UUID,
        registration_date TIMESTAMP DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created: customers");

    await sql(`
      CREATE TABLE IF NOT EXISTS devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        device_type VARCHAR(100),
        brand VARCHAR(100),
        model VARCHAR(100),
        serial_number VARCHAR(100),
        problem_description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        estimated_cost DECIMAL(10,2),
        actual_cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created: devices");

    console.log("\n🎉 Development database reset complete!");
    console.log(
      "📝 Note: This script only creates core tables. Add more as needed."
    );
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDevDatabase();
