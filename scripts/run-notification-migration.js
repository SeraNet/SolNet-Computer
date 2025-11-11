import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/solnetmanage",
});

async function runNotificationMigration() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting notification system migration...");
    console.log(
      "📊 Using database:",
      process.env.DATABASE_URL?.split("@")[1] || "unknown"
    );

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "..",
      "migrations",
      "create_notification_system.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    await client.query(migrationSQL);

    console.log("✅ Notification system migration completed successfully!");

    // Verify the tables were created
    const tables = [
      "notification_types",
      "notifications",
      "notification_preferences",
      "notification_templates",
    ];

    for (const table of tables) {
      const result = await client.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [table]
      );

      if (result.rows[0].exists) {
      } else {
      }
    }

    // Check if default notification types were inserted
    const typeCount = await client.query(
      "SELECT COUNT(*) FROM notification_types;"
    );

    // Check if default templates were inserted
    const templateCount = await client.query(
      "SELECT COUNT(*) FROM notification_templates;"
    );
    console.log(
      `📋 Notification templates created: ${templateCount.rows[0].count}`
    );

    console.log("🎉 Notification system setup complete!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Restart your server to load the new notification service");
    console.log(
      "2. The notification bell in the header will now show real notifications"
    );
    console.log(
      "4. System will automatically create notifications for various events"
    );
  } catch (error) {
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runNotificationMigration()
  .then(() => {
    console.log("✅ Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
