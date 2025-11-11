import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listAllTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("\n===========================================");
    console.log(`Total tables in database: ${result.rows.length}`);
    console.log("===========================================\n");

    result.rows.forEach((row, i) => {
      console.log(`${String(i + 1).padStart(2, " ")}. ${row.table_name}`);
    });

    console.log("\n===========================================\n");

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

listAllTables();
