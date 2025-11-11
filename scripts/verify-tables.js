#!/usr/bin/env node

import pkg from "pg";
const { Pool } = pkg;

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/solnetmanage";

const pool = new Pool({
  connectionString,
});

async function verifyTables() {
  try {
    console.log("🔍 Verifying all 30 database tables...");
    console.log("=====================================");

    const client = await pool.connect();

    try {
      // All 30 tables defined in the schema
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
        "ethiopian_sms_settings",
      ];

      let existingTables = 0;
      let missingTables = [];

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
          missingTables.push(table);
        }
      }

      console.log(`   Total tables: ${tables.length}`);
      console.log(`   Missing: ${tables.length - existingTables}`);

      if (missingTables.length > 0) {
        missingTables.forEach((table) => console.log(`   - ${table}`));
      } else {
      }
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 Make sure your database is running and DATABASE_URL is set correctly"
      );
    }
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

verifyTables();
