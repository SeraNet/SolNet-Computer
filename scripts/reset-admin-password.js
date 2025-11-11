import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function resetAdminPassword() {
  try {
    console.log("🔧 Resetting admin password...");

    const client = await pool.connect();

    try {
      // Hash the new password
      const newPassword = "admin123";
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the admin user's password
      const result = await client.query(
        `
        UPDATE users 
        SET password = $1 
        WHERE email = 'admin@solnetcomputer.com'
        RETURNING id, email, first_name, last_name, role
      `,
        [hashedPassword]
      );

      if (result.rows.length > 0) {
        console.log("✅ Admin password reset successfully");
        console.log(
          "User:",
          result.rows[0].first_name,
          result.rows[0].last_name
        );
        console.log("Email:", result.rows[0].email);
        console.log("Role:", result.rows[0].role);
        console.log("New password:", newPassword);
      } else {
        console.log("❌ Admin user not found");
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error resetting password:", error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
