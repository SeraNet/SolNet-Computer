#!/usr/bin/env node

import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/solnetmanage";

const pool = new Pool({
  connectionString,
});

async function runMigration() {
  try {
    console.log("================================================");

    // 1. Fix purchase orders null values first
    const fixPurchaseOrdersPath = path.join(
      __dirname,
      "../migrations/fix_purchase_orders_location.sql"
    );

    if (fs.existsSync(fixPurchaseOrdersPath)) {
      const sqlContent = fs.readFileSync(fixPurchaseOrdersPath, "utf8");
      const client = await pool.connect();

      try {
        await client.query(sqlContent);
        console.log("✅ Purchase orders null values fixed successfully!");
      } finally {
        client.release();
      }
    } else {
      console.log("⚠️  Purchase orders fix file not found, skipping...");
    }

    // 2. Run the schema inconsistencies fix
    const fixSchemaPath = path.join(
      __dirname,
      "../migrations/fix_schema_inconsistencies.sql"
    );

    if (fs.existsSync(fixSchemaPath)) {
      const sqlContent = fs.readFileSync(fixSchemaPath, "utf8");
      const client = await pool.connect();

      try {
        await client.query(sqlContent);
        console.log("✅ Schema inconsistencies fixed successfully!");
      } finally {
        client.release();
      }
    } else {
      console.log("⚠️  Schema fix file not found, skipping...");
    }

    // 3. Generate new Drizzle migration
    try {
      execSync("npx drizzle-kit generate", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      console.log("✅ New Drizzle migration generated!");
    } catch (error) {
      console.log("⚠️  Drizzle migration generation failed, continuing...");
    }

    // 4. Push schema changes to database
    try {
      execSync("npm run db:push", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      console.log("✅ Schema changes pushed to database!");
    } catch (error) {
      console.log("⚠️  Schema push failed, continuing...");
    }

    // 5. Verify database structure
    const client = await pool.connect();
    try {
      // All 29 tables defined in the schema
      const tables = [
        // Core Business Tables
        "locations",
        "users",
        "business_profile",
        "customers",
        "devices",
        "inventory_items",
        "sales",
        "sale_items",
        "appointments",

        // Reference Tables
        "device_types",
        "brands",
        "models",
        "service_types",
        "accessories",
        "categories",

        // Feedback & Communication
        "device_feedback",
        "customer_messages",
        "customer_feedback",

        // Tracking & History
        "device_status_history",
        "warranties",

        // Financial & Business Management
        "expense_categories",
        "expenses",
        "loan_invoices",
        "loan_invoice_payments",
        "promotions",
        "suppliers",
        "purchase_orders",
        "purchase_order_items",

        // System
        "system_settings",
      ];

      let existingTables = 0;
      let missingTables = 0;

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
          existingTables++;
        } else {
          missingTables++;
        }
      }

      console.log(
        `\n📊 Table Status: ${existingTables}/${tables.length} tables exist`
      );
      if (missingTables > 0) {
      } else {
        console.log("🎉 All tables are present!");
      }

      // Check for key columns
      const keyColumns = [
        { table: "customers", column: "registration_date" },
        { table: "devices", column: "receipt_number" },
        { table: "purchase_orders", column: "supplier_id" },
        { table: "purchase_orders", column: "location_id" },
        { table: "purchase_orders", column: "created_by" },
        { table: "business_profile", column: "monthly_revenue_target" },
        { table: "purchase_order_items", column: "inventory_item_id" },
        { table: "purchase_order_items", column: "item_name" },
      ];

      for (const { table, column } of keyColumns) {
        const result = await client.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = $2
          );
        `,
          [table, column]
        );

        if (result.rows[0].exists) {
        } else {
        }
      }
    } finally {
      client.release();
    }

    console.log("\n📚 Next steps:");
    console.log("   2. Start the server: npm run dev");
  } catch (error) {
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log("❌ DATABASE_URL not set!");
  console.log("Please set the DATABASE_URL environment variable.");
  process.exit(1);
}

runMigration();
