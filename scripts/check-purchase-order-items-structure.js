import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function checkPurchaseOrderItemsStructure() {
  try {
    console.log("🔍 Checking purchase order items table structure...");

    const client = await pool.connect();

    try {
      // Check table structure
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'purchase_order_items'
        ORDER BY ordinal_position
      `);

      console.log("📊 Purchase order items table columns:");
      columns.rows.forEach((col) => {
        console.log(`- ${col.column_name}: ${col.data_type}`);
      });

      // Check if there are any items
      const itemCount = await client.query(`
        SELECT COUNT(*) as count
        FROM purchase_order_items
      `);

      console.log(
        `\n📊 Total purchase order items: ${itemCount.rows[0].count}`
      );

      // Check items for the specific purchase order
      const specificItems = await client.query(`
        SELECT *
        FROM purchase_order_items
        WHERE purchase_order_id = '1e3bc310-9ee6-4f4f-bfc9-d9d16119509b'
      `);

      console.log(
        `\n📊 Items for PO-2025-678343: ${specificItems.rows.length}`
      );
      if (specificItems.rows.length > 0) {
        console.log("Items found:", specificItems.rows);
      }

      // Check all purchase orders and their item counts
      const orderItemCounts = await client.query(`
        SELECT 
          po.id,
          po.order_number,
          COUNT(poi.id) as item_count
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
        GROUP BY po.id, po.order_number
        ORDER BY po.created_at DESC
      `);

      console.log("\n📊 Purchase orders and their item counts:");
      orderItemCounts.rows.forEach((order) => {
        console.log(`- ${order.order_number}: ${order.item_count} items`);
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

checkPurchaseOrderItemsStructure();
