import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyProblems() {
  try {
    console.log("🔍 Verifying predefined problems...");

    // Check table exists
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'predefined_problems'
    `);

    if (tableResult.rows.length === 0) {
      console.log("❌ predefined_problems table not found");
      return;
    }

    console.log("✅ predefined_problems table exists");

    // Get count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM predefined_problems"
    );

    // Get sample problems
    const sampleResult = await pool.query(`
      SELECT name, category, severity, estimated_cost, estimated_duration 
      FROM predefined_problems 
      ORDER BY sort_order, name 
      LIMIT 10
    `);

    sampleResult.rows.forEach((row, index) => {
      const cost = row.estimated_cost
        ? `$${parseFloat(row.estimated_cost).toFixed(2)}`
        : "N/A";
      const duration = row.estimated_duration
        ? `${row.estimated_duration} min`
        : "N/A";
      console.log(
        `${index + 1}. ${row.name} (${row.category}, ${
          row.severity
        }) - ${cost}, ${duration}`
      );
    });

    // Check categories
    const categoriesResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM predefined_problems 
      GROUP BY category 
      ORDER BY count DESC
    `);

    categoriesResult.rows.forEach((row) => {
    });
  } catch (error) {
  } finally {
    await pool.end();
  }
}

verifyProblems();