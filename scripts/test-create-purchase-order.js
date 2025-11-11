async function testCreatePurchaseOrder() {
  try {
    console.log("🧪 Testing purchase order creation...");

    // First, let's get a valid JWT token by logging in
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@solnetcomputer.com",
        password: "password123",
      }),
    });

    if (!loginResponse.ok) {
      console.error("❌ Login failed:", await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log("✅ Login successful, got token");

    // Create a test purchase order with items
    const purchaseOrderData = {
      orderNumber: `TEST-PO-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      supplierId: null,
      locationId: "4b45586a-d460-4d4e-b35f-93650ba9f168", // Use a valid location ID
      totalItems: 2,
      totalEstimatedCost: "1500.00",
      notes: "Test draft order",
      priority: "normal",
      expectedDeliveryDate: null,
      items: [
        {
          name: "Test Item 1",
          sku: "TEST001",
          category: "Test Category",
          description: "Test item for draft order",
          currentStock: 5,
          minStockLevel: 10,
          suggestedQuantity: 10,
          estimatedPrice: 100.0,
          supplier: "",
          priority: "normal",
          notes: "",
          isExistingItem: true,
          includeInOrder: true,
        },
        {
          name: "Test Item 2",
          sku: "TEST002",
          category: "Test Category",
          description: "Another test item",
          currentStock: 3,
          minStockLevel: 8,
          suggestedQuantity: 5,
          estimatedPrice: 100.0,
          supplier: "",
          priority: "high",
          notes: "",
          isExistingItem: true,
          includeInOrder: true,
        },
      ],
    };

    console.log("📦 Creating purchase order with data:");
    console.log(JSON.stringify(purchaseOrderData, null, 2));

    const createResponse = await fetch(
      "http://localhost:5000/api/purchase-orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseOrderData),
      }
    );

    console.log("📊 Response status:", createResponse.status);

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log("✅ Purchase order created successfully!");
      console.log("📊 Created order:", result);

      // Now test fetching the items for this order
      console.log("\n🔍 Testing item fetch for the created order...");
      const itemsResponse = await fetch(
        `http://localhost:5000/api/purchase-orders/${result.id}/items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        console.log("✅ Items fetched successfully:", items);
      } else {
        console.log("❌ Failed to fetch items:", await itemsResponse.text());
      }
    } else {
      console.log("❌ Purchase order creation failed!");
      console.log("📊 Error response:", await createResponse.text());
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testCreatePurchaseOrder();
