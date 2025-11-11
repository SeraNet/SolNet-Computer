import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...");

    const client = await pool.connect();

    try {
      // Check if users table exists
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        );
      `);

      if (!tableResult.rows[0].exists) {
        console.log("❌ Users table does not exist");
        return;
      }

      // Check the actual columns in the users table
      const columnsResult = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      console.log("📋 Users table columns:");
      columnsResult.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      // Get all users with available columns
      const usersResult = await client.query(`
        SELECT id, email, first_name, last_name, role
        FROM users
        ORDER BY created_at DESC
      `);

      console.log(`\n✅ Found ${usersResult.rows.length} users:`);
      usersResult.rows.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.first_name || "N/A"} ${
            user.last_name || "N/A"
          } (${user.email || "N/A"}) - Role: ${user.role || "N/A"}`
        );
      });

      // Check for admin users specifically
      const adminResult = await client.query(`
        SELECT id, email, first_name, last_name
        FROM users
        WHERE role = 'admin'
        ORDER BY created_at DESC
      `);

      console.log(`\n👑 Admin users: ${adminResult.rows.length}`);
      adminResult.rows.forEach((admin, index) => {
        console.log(
          `  ${index + 1}. ${admin.first_name || "N/A"} ${
            admin.last_name || "N/A"
          } (${admin.email || "N/A"})`
        );
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    await pool.end();
  }
}

checkUsers();
