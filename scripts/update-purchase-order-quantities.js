import pkg from "pg";
const { Pool } = pkg;

const connectionString = "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function updatePurchaseOrderQuantities() {
  try {
    console.log("🔧 Updating purchase order quantities...");
    
    const client = await pool.connect();
    
    try {
      // First, let's see what purchase orders we have
      const purchaseOrders = await client.query(`
        SELECT id, order_number, total_items, total_quantity
        FROM purchase_orders
        ORDER BY created_at DESC
      `);
      
      console.log("📊 Current purchase orders:");
      purchaseOrders.rows.forEach(po => {
        console.log(`- ${po.order_number}: ${po.total_items} items, ${po.total_quantity} total qty`);
      });
      
      // Update all purchase orders with actual quantities
      const updateResult = await client.query(`
        UPDATE purchase_orders 
        SET total_quantity = (
          SELECT COALESCE(SUM(suggested_quantity), 0)
          FROM purchase_order_items 
          WHERE purchase_order_items.purchase_order_id = purchase_orders.id
        )
        WHERE id IN (
          SELECT DISTINCT purchase_order_id 
          FROM purchase_order_items
        )
      `);
      
      console.log(`✅ Updated ${updateResult.rowCount} purchase orders`);
      
      // Show the updated results
      const updatedOrders = await client.query(`
        SELECT po.id, po.order_number, po.total_items, po.total_quantity,
               COALESCE(SUM(poi.suggested_quantity), 0) as calculated_quantity
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
        GROUP BY po.id, po.order_number, po.total_items, po.total_quantity
        ORDER BY po.created_at DESC
      `);
      
      console.log("📊 Updated purchase orders:");
      updatedOrders.rows.forEach(po => {
        console.log(`- ${po.order_number}: ${po.total_items} items, ${po.total_quantity} total qty (calculated: ${po.calculated_quantity})`);
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("❌ Update failed:", error);
  } finally {
    await pool.end();
  }
}

updatePurchaseOrderQuantities();
