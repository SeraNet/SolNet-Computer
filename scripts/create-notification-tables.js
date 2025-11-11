// Script to create notification tables if they don't exist
// Run this to ensure the notification system tables are created

import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const { Pool } = pg;

async function createNotificationTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔧 Creating notification tables...");

    // Create notification_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ notification_types table created/verified");

    // Create notifications table
    await pool.query(`
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
      )
    `);
    console.log("✅ notifications table created/verified");

    // Create notification_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
        email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, type_id)
      )
    `);
    console.log("✅ notification_preferences table created/verified");

    // Create notification_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        email_subject TEXT,
        email_body TEXT,
        sms_message TEXT,
        variables JSONB,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ notification_templates table created/verified");

    // Insert default notification types if they don't exist
    const defaultTypes = [
      {
        name: "system_alert",
        description: "System-wide notifications and alerts",
        category: "system",
      },
      {
        name: "customer_feedback",
        description: "New customer feedback received",
        category: "customer",
      },
      {
        name: "customer_message",
        description: "New customer message received",
        category: "customer",
      },
      {
        name: "device_registered",
        description: "Device registration notification",
        category: "device",
      },
      {
        name: "device_status_change",
        description: "Device status change notification",
        category: "device",
      },
      {
        name: "device_tracked",
        description: "Device tracking activity notification",
        category: "device",
      },
      {
        name: "device_feedback",
        description: "Device feedback received",
        category: "device",
      },
      {
        name: "payment_status_update",
        description: "Payment status change notification",
        category: "sales",
      },
      {
        name: "low_stock_alert",
        description: "Low stock inventory alert",
        category: "inventory",
      },
      {
        name: "maintenance_reminder",
        description: "System maintenance reminders",
        category: "system",
      },
    ];

    for (const type of defaultTypes) {
      await pool.query(
        `
        INSERT INTO notification_types (name, description, category)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING
      `,
        [type.name, type.description, type.category]
      );
    }
    console.log("✅ Default notification types inserted/verified");

    console.log("🎉 Notification tables setup complete!");
  } catch (error) {
    console.error("❌ Error creating notification tables:", error);
  } finally {
    await pool.end();
  }
}

createNotificationTables();
