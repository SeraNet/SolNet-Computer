import pkg from "pg";
const { Pool } = pkg;

const connectionString = "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function checkPurchaseOrderItems() {
  try {
    console.log("🔍 Checking purchase order items...");
    
    const client = await pool.connect();
    
    try {
      // Check all purchase order items
      const items = await client.query(`
        SELECT 
          poi.id,
          poi.purchase_order_id,
          poi.name,
          poi.suggested_quantity,
          poi.estimated_price,
          po.order_number
        FROM purchase_order_items poi
        JOIN purchase_orders po ON po.id = poi.purchase_order_id
        ORDER BY po.created_at DESC, poi.name
      `);
      
      console.log("📊 Purchase Order Items:");
      items.rows.forEach(item => {
        console.log(`- ${item.order_number}: ${item.name} - Qty: ${item.suggested_quantity}, Price: ${item.estimated_price}`);
      });
      
      // Check purchase orders summary
      const summary = await client.query(`
        SELECT 
          po.order_number,
          po.total_items,
          po.total_quantity,
          COUNT(poi.id) as actual_items,
          COALESCE(SUM(poi.suggested_quantity), 0) as actual_quantity
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
        GROUP BY po.id, po.order_number, po.total_items, po.total_quantity
        ORDER BY po.created_at DESC
      `);
      
      console.log("\n📊 Purchase Orders Summary:");
      summary.rows.forEach(po => {
        console.log(`- ${po.order_number}: ${po.total_items} items (actual: ${po.actual_items}), ${po.total_quantity} qty (actual: ${po.actual_quantity})`);
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

checkPurchaseOrderItems();
