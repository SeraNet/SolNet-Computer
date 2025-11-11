import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixRecipientGroups() {
  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Read the SQL file
    const sqlPath = path.join(
      process.cwd(),
      "scripts",
      "fix-recipient-groups.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("🔧 Fixing recipient groups tables...");

    // Execute the SQL
    await client.query(sql);


    // Verify the tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('recipient_groups', 'recipient_group_members')
      ORDER BY table_name;
    `);

    console.log(
      "Tables found:",
      tablesResult.rows.map((row) => row.table_name)
    );

    // Check groups
    const groupsResult = await client.query(`
      SELECT id, name, description 
      FROM recipient_groups 
      ORDER BY created_at;
    `);

    groupsResult.rows.forEach((group) => {
    });
  } catch (error) {
  } finally {
    await client.end();
  }
}

fixRecipientGroups();