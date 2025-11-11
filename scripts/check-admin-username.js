import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function checkAdminUsername() {
  try {
    console.log("🔍 Checking admin user details...");

    const client = await pool.connect();

    try {
      // Get admin user details
      const result = await client.query(`
        SELECT id, username, email, first_name, last_name, role, password
        FROM users
        WHERE email = 'admin@solnetcomputer.com'
      `);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log("✅ Admin user found:");
        console.log("ID:", user.id);
        console.log("Username:", user.username);
        console.log("Email:", user.email);
        console.log("Name:", user.first_name, user.last_name);
        console.log("Role:", user.role);
        console.log("Has password:", user.password ? "Yes" : "No");
      } else {
        console.log("❌ Admin user not found");
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error checking admin user:", error);
  } finally {
    await pool.end();
  }
}

checkAdminUsername();
