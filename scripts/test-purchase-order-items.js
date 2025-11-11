import axios from "axios";

const BASE_URL = "http://localhost:5000";

async function testPurchaseOrderItems() {
  try {
    console.log("🧪 Testing Purchase Order Items API...\n");

    // Step 1: Get all purchase orders to find one to test with
    console.log("1. Fetching all purchase orders...");
    const ordersResponse = await axios.get(`${BASE_URL}/api/purchase-orders`, {
      headers: {
        Authorization: "Bearer test-token",
        "X-Selected-Location": "main-branch-location",
      },
    });

    const orders = ordersResponse.data;
    console.log(`Found ${orders.length} purchase orders`);

    if (orders.length === 0) {
      console.log(
        "❌ No purchase orders found. Please create a purchase order first."
      );
      return;
    }

    // Step 2: Test fetching items for the first purchase order
    const testOrder = orders[0];
    console.log(
      `\n2. Testing items for purchase order: ${testOrder.orderNumber} (ID: ${testOrder.id})`
    );

    const itemsResponse = await axios.get(
      `${BASE_URL}/api/purchase-orders/${testOrder.id}/items`,
      {
        headers: {
          Authorization: "Bearer test-token",
          "X-Selected-Location": "main-branch-location",
        },
      }
    );

    const items = itemsResponse.data;
    console.log(
      `✅ Successfully fetched ${items.length} items for purchase order`
    );

    if (items.length > 0) {
      console.log("\nSample item:");
      console.log(JSON.stringify(items[0], null, 2));
    } else {
      console.log("⚠️  No items found for this purchase order");
    }

    // Step 3: Test with a non-existent ID
    console.log("\n3. Testing with non-existent purchase order ID...");
    try {
      await axios.get(`${BASE_URL}/api/purchase-orders/non-existent-id/items`, {
        headers: {
          Authorization: "Bearer test-token",
          "X-Selected-Location": "main-branch-location",
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Correctly returned 404 for non-existent ID");
      } else {
        console.log("❌ Unexpected error for non-existent ID:", error.message);
      }
    }

    console.log("\n✅ Purchase order items API test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testPurchaseOrderItems();
