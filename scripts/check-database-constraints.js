import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function checkDatabaseConstraints() {
  try {
    console.log("🔍 Checking database constraints...");

    const client = await pool.connect();

    try {
      // Check foreign key constraints
      const constraints = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'purchase_order_items'
      `);

      console.log("📊 Foreign key constraints on purchase_order_items:");
      constraints.rows.forEach((constraint) => {
        console.log(
          `- ${constraint.constraint_name}: ${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`
        );
      });

      // Check if purchase_orders table exists and has the referenced ID
      const purchaseOrders = await client.query(`
        SELECT id, order_number
        FROM purchase_orders
        ORDER BY created_at DESC
        LIMIT 5
      `);

      console.log("\n📊 Recent purchase orders:");
      purchaseOrders.rows.forEach((order) => {
        console.log(`- ${order.id}: ${order.order_number}`);
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Check failed:", error);
  } finally {
    await pool.end();
  }
}

checkDatabaseConstraints();
