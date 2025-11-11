import pkg from "pg";
const { Pool } = pkg;

const connectionString = "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function testPurchaseOrderCreation() {
  try {
    console.log("🧪 Testing purchase order creation...");
    
    const client = await pool.connect();
    
    try {
      // First, let's create a test purchase order with items
      const testOrderData = {
        orderNumber: "TEST-PO-001",
        date: new Date().toISOString().split("T")[0],
        status: "draft",
        supplierId: null,
        locationId: "main-branch-location",
        totalItems: 2,
        totalQuantity: 15,
        totalEstimatedCost: "1500.00",
        notes: "Test order",
        priority: "normal",
        expectedDeliveryDate: null
      };
      
      const testItems = [
        {
          name: "Test Item 1",
          description: "Test description 1",
          suggestedQuantity: 10,
          estimatedPrice: "100.00",
          notes: "",
          sku: "TEST001",
          category: "Test Category",
          currentStock: 5,
          minStockLevel: 10,
          supplier: "",
          priority: "normal",
          isExistingItem: true
        },
        {
          name: "Test Item 2", 
          description: "Test description 2",
          suggestedQuantity: 5,
          estimatedPrice: "100.00",
          notes: "",
          sku: "TEST002",
          category: "Test Category",
          currentStock: 3,
          minStockLevel: 8,
          supplier: "",
          priority: "high",
          isExistingItem: true
        }
      ];
      
      console.log("📝 Creating test purchase order...");
      console.log("Order data:", JSON.stringify(testOrderData, null, 2));
      console.log("Items data:", JSON.stringify(testItems, null, 2));
      
      // Insert the purchase order
      const orderResult = await client.query(`
        INSERT INTO purchase_orders (
          order_number, date, status, supplier_id, location_id, 
          created_by, total_items, total_quantity, total_estimated_cost,
          notes, priority, expected_delivery_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, order_number
      `, [
        testOrderData.orderNumber,
        testOrderData.date,
        testOrderData.status,
        testOrderData.supplierId,
        testOrderData.locationId,
        "test-user", // created_by
        testOrderData.totalItems,
        testOrderData.totalQuantity,
        testOrderData.totalEstimatedCost,
        testOrderData.notes,
        testOrderData.priority,
        testOrderData.expectedDeliveryDate
      ]);
      
      const purchaseOrderId = orderResult.rows[0].id;
      console.log("✅ Purchase order created with ID:", purchaseOrderId);
      
      // Insert the items
      for (const item of testItems) {
        await client.query(`
          INSERT INTO purchase_order_items (
            purchase_order_id, name, description, suggested_quantity,
            estimated_price, notes, sku, category, current_stock,
            min_stock_level, supplier, priority, is_existing_item
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          purchaseOrderId,
          item.name,
          item.description,
          item.suggestedQuantity,
          item.estimatedPrice,
          item.notes,
          item.sku,
          item.category,
          item.currentStock,
          item.minStockLevel,
          item.supplier,
          item.priority,
          item.isExistingItem
        ]);
      }
      
      console.log("✅ Items inserted successfully");
      
      // Verify the results
      const verifyOrder = await client.query(`
        SELECT * FROM purchase_orders WHERE id = $1
      `, [purchaseOrderId]);
      
      const verifyItems = await client.query(`
        SELECT * FROM purchase_order_items WHERE purchase_order_id = $1
      `, [purchaseOrderId]);
      
      console.log("📊 Verification Results:");
      console.log("Purchase Order:", verifyOrder.rows[0]);
      console.log("Items:", verifyItems.rows);
      
      // Clean up - delete the test order
      await client.query(`
        DELETE FROM purchase_order_items WHERE purchase_order_id = $1
      `, [purchaseOrderId]);
      
      await client.query(`
        DELETE FROM purchase_orders WHERE id = $1
      `, [purchaseOrderId]);
      
      console.log("🧹 Test data cleaned up");
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await pool.end();
  }
}

testPurchaseOrderCreation();
