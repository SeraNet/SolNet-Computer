const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db",
});

async function checkNotificationTables() {
  try {
    const client = await pool.connect();

    // Check if notification tables exist
    const tables = [
      "notification_types",
      "notification_preferences",
      "notifications",
      "notification_templates",
    ];

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table} table exists (${result.rows[0].count} rows)`);
      } catch (error) {
        console.log(`❌ ${table} table missing: ${error.message}`);
      }
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("Database connection error:", error.message);
    await pool.end();
  }
}

checkNotificationTables();


