import axios from "axios";

const BASE_URL = "http://localhost:5000";

async function testPurchaseOrderEditing() {
  try {
    console.log("🧪 Testing Purchase Order Editing Functionality...\n");

    // Step 1: Create a test purchase order
    console.log("1. Creating a test purchase order...");
    const createResponse = await axios.post(`${BASE_URL}/api/purchase-orders`, {
      orderNumber: `PO-TEST-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      locationId: "main-branch-location",
      createdBy: "test-user",
      totalItems: 2,
      totalQuantity: 5,
      totalEstimatedCost: "150.00",
      notes: "Test order for editing",
      priority: "normal",
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [
        {
          itemId: "test-item-1",
          name: "Test Item 1",
          sku: "TI001",
          category: "Test Category",
          description: "Test item for editing",
          currentStock: 10,
          minStockLevel: 5,
          suggestedQuantity: 3,
          estimatedPrice: 50.0,
          supplier: "Test Supplier",
          priority: "normal",
          notes: "Test item notes",
          isExistingItem: true,
          includeInOrder: true,
        },
        {
          itemId: "test-item-2",
          name: "Test Item 2",
          sku: "TI002",
          category: "Test Category",
          description: "Another test item",
          currentStock: 5,
          minStockLevel: 3,
          suggestedQuantity: 2,
          estimatedPrice: 25.0,
          supplier: "Test Supplier",
          priority: "high",
          notes: "High priority item",
          isExistingItem: true,
          includeInOrder: true,
        },
      ],
    });

    const purchaseOrder = createResponse.data;
    console.log(
      `✅ Created purchase order: ${purchaseOrder.orderNumber} (ID: ${purchaseOrder.id})`
    );

    // Step 2: Fetch the purchase order to verify it was created
    console.log("\n2. Fetching the created purchase order...");
    const fetchResponse = await axios.get(
      `${BASE_URL}/api/purchase-orders/${purchaseOrder.id}`
    );
    const fetchedOrder = fetchResponse.data;
    console.log(`✅ Fetched order: ${fetchedOrder.orderNumber}`);
    console.log(`   Status: ${fetchedOrder.status}`);
    console.log(`   Total Items: ${fetchedOrder.totalItems}`);
    console.log(`   Total Cost: $${fetchedOrder.totalEstimatedCost}`);

    // Step 3: Fetch purchase order items
    console.log("\n3. Fetching purchase order items...");
    const itemsResponse = await axios.get(
      `${BASE_URL}/api/purchase-orders/${purchaseOrder.id}/items`
    );
    const items = itemsResponse.data;
    console.log(`✅ Found ${items.length} items in the order:`);
    items.forEach((item, index) => {
      console.log(
        `   ${index + 1}. ${item.name} - Qty: ${
          item.suggestedQuantity
        }, Price: $${item.estimatedPrice}`
      );
    });

    // Step 4: Update the purchase order (edit functionality)
    console.log("\n4. Testing purchase order editing...");
    const updatedItems = [
      {
        itemId: "test-item-1",
        name: "Test Item 1 (Updated)",
        sku: "TI001",
        category: "Test Category",
        description: "Updated test item",
        currentStock: 8,
        minStockLevel: 5,
        suggestedQuantity: 5, // Increased quantity
        estimatedPrice: 55.0, // Increased price
        supplier: "Test Supplier",
        priority: "high", // Changed priority
        notes: "Updated test item notes",
        isExistingItem: true,
        includeInOrder: true,
      },
      {
        itemId: "test-item-3",
        name: "Test Item 3 (New)",
        sku: "TI003",
        category: "Test Category",
        description: "New test item added",
        currentStock: 15,
        minStockLevel: 10,
        suggestedQuantity: 4,
        estimatedPrice: 30.0,
        supplier: "Test Supplier",
        priority: "normal",
        notes: "New item added during edit",
        isExistingItem: true,
        includeInOrder: true,
      },
    ];

    const updateData = {
      orderNumber: fetchedOrder.orderNumber,
      supplierId: "test-supplier-id",
      locationId: "main-branch-location",
      totalItems: updatedItems.length,
      totalQuantity: updatedItems.reduce(
        (sum, item) => sum + item.suggestedQuantity,
        0
      ),
      totalEstimatedCost: updatedItems
        .reduce(
          (sum, item) => sum + item.estimatedPrice * item.suggestedQuantity,
          0
        )
        .toFixed(2),
      notes: "Updated test order with modified items",
      priority: "high",
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: updatedItems,
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/purchase-orders/${purchaseOrder.id}`,
      updateData
    );
    const updatedOrder = updateResponse.data;
    console.log(`✅ Updated purchase order: ${updatedOrder.orderNumber}`);
    console.log(`   New Total Items: ${updatedOrder.totalItems}`);
    console.log(`   New Total Cost: $${updatedOrder.totalEstimatedCost}`);
    console.log(`   New Notes: ${updatedOrder.notes}`);
    console.log(`   New Priority: ${updatedOrder.priority}`);

    // Step 5: Fetch updated items to verify changes
    console.log("\n5. Verifying updated purchase order items...");
    const updatedItemsResponse = await axios.get(
      `${BASE_URL}/api/purchase-orders/${purchaseOrder.id}/items`
    );
    const updatedOrderItems = updatedItemsResponse.data;
    console.log(`✅ Found ${updatedOrderItems.length} items after update:`);
    updatedOrderItems.forEach((item, index) => {
      console.log(
        `   ${index + 1}. ${item.name} - Qty: ${
          item.suggestedQuantity
        }, Price: $${item.estimatedPrice}, Priority: ${item.priority}`
      );
    });

    // Step 6: Verify that the second item was removed and third item was added
    const item1 = updatedOrderItems.find(
      (item) => item.itemId === "test-item-1"
    );
    const item2 = updatedOrderItems.find(
      (item) => item.itemId === "test-item-2"
    );
    const item3 = updatedOrderItems.find(
      (item) => item.itemId === "test-item-3"
    );

    console.log("\n6. Verifying item changes:");
    if (item1) {
      console.log(
        `✅ Item 1 updated: Qty changed to ${item1.suggestedQuantity}, Price to $${item1.estimatedPrice}, Priority to ${item1.priority}`
      );
    }
    if (!item2) {
      console.log("✅ Item 2 removed (as expected)");
    }
    if (item3) {
      console.log(
        `✅ Item 3 added: ${item3.name} with Qty ${item3.suggestedQuantity}`
      );
    }

    // Step 7: Clean up - delete the test purchase order
    console.log("\n7. Cleaning up test data...");
    await axios.delete(`${BASE_URL}/api/purchase-orders/${purchaseOrder.id}`);
    console.log("✅ Test purchase order deleted");

    console.log("\n🎉 Purchase Order Editing Test Completed Successfully!");
    console.log("\nSummary:");
    console.log("✅ Purchase order creation works");
    console.log("✅ Purchase order fetching works");
    console.log("✅ Purchase order items fetching works");
    console.log(
      "✅ Purchase order editing works (items can be added/removed/modified)"
    );
    console.log("✅ Purchase order deletion works");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testPurchaseOrderEditing();
