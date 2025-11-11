import axios from "axios";

const BASE_URL = "http://localhost:5000";

async function debugPurchaseOrderEdit() {
  try {
    console.log("🔍 Debugging Purchase Order Edit Functionality...\n");

    // Step 1: Check if server is running
    console.log("1. Checking server status...");
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      console.log("✅ Server is running");
    } catch (error) {
      console.log("❌ Server is not running or not accessible");
      console.log("Please start the server with: npm run dev");
      return;
    }

    // Step 2: Get all purchase orders
    console.log("\n2. Fetching all purchase orders...");
    const ordersResponse = await axios.get(`${BASE_URL}/api/purchase-orders`, {
      headers: {
        Authorization: "Bearer test-token",
        "X-Selected-Location": "main-branch-location",
      },
    });

    const orders = ordersResponse.data;
    console.log(`Found ${orders.length} purchase orders`);

    if (orders.length === 0) {
      console.log("❌ No purchase orders found. Please create a purchase order first.");
      return;
    }

    // Step 3: Find a purchase order with items
    console.log("\n3. Looking for purchase orders with items...");
    let testOrder = null;
    let testOrderItems = [];

    for (const order of orders) {
      console.log(`Checking order: ${order.orderNumber} (ID: ${order.id})`);
      
      try {
        const itemsResponse = await axios.get(`${BASE_URL}/api/purchase-orders/${order.id}/items`, {
          headers: {
            Authorization: "Bearer test-token",
            "X-Selected-Location": "main-branch-location",
          },
        });
        
        const items = itemsResponse.data;
        console.log(`  - Found ${items.length} items`);
        
        if (items.length > 0 && !testOrder) {
          testOrder = order;
          testOrderItems = items;
          console.log(`  ✅ Selected this order for testing`);
          break;
        }
      } catch (error) {
        console.log(`  ❌ Error fetching items: ${error.message}`);
      }
    }

    if (!testOrder) {
      console.log("❌ No purchase orders with items found. Please create a purchase order with items first.");
      return;
    }

    // Step 4: Test the specific order and its items
    console.log(`\n4. Testing purchase order: ${testOrder.orderNumber}`);
    console.log("Order details:", {
      id: testOrder.id,
      orderNumber: testOrder.orderNumber,
      status: testOrder.status,
      totalItems: testOrder.totalItems,
      totalEstimatedCost: testOrder.totalEstimatedCost,
    });

    console.log("\nItems in this order:");
    testOrderItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     - ID: ${item.id || item.itemId}`);
      console.log(`     - SKU: ${item.sku}`);
      console.log(`     - Quantity: ${item.suggestedQuantity}`);
      console.log(`     - Price: $${item.estimatedPrice}`);
      console.log(`     - Priority: ${item.priority}`);
    });

    // Step 5: Test the exact API call that the frontend makes
    console.log("\n5. Testing the exact API call the frontend makes...");
    const exactUrl = `${BASE_URL}/api/purchase-orders/${testOrder.id}/items`;
    console.log(`URL: ${exactUrl}`);
    
    const exactResponse = await axios.get(exactUrl, {
      headers: {
        Authorization: "Bearer test-token",
        "X-Selected-Location": "main-branch-location",
      },
    });

    console.log("✅ API call successful");
    console.log("Response status:", exactResponse.status);
    console.log("Response data length:", exactResponse.data.length);
    console.log("Sample response data:", JSON.stringify(exactResponse.data[0], null, 2));

    console.log("\n✅ Debug completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`- Server: ✅ Running`);
    console.log(`- Purchase Orders: ✅ ${orders.length} found`);
    console.log(`- Test Order: ✅ ${testOrder.orderNumber} with ${testOrderItems.length} items`);
    console.log(`- API Endpoint: ✅ Working correctly`);
    console.log("\n🔧 If the frontend is still not working, the issue is likely:");
    console.log("1. Authentication token mismatch");
    console.log("2. Frontend query configuration");
    console.log("3. React Query cache issues");

  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the debug
debugPurchaseOrderEdit();
