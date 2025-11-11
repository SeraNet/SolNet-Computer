import fetch from "node-fetch";

async function testPurchaseOrderAPI() {
  try {
    console.log("🧪 Testing purchase order API...");

    // First, let's get a valid JWT token by logging in
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "solomon@solnet.com",
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

    // Get all purchase orders
    const ordersResponse = await fetch(
      "http://localhost:5000/api/purchase-orders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!ordersResponse.ok) {
      console.error(
        "❌ Failed to fetch purchase orders:",
        await ordersResponse.text()
      );
      return;
    }

    const orders = await ordersResponse.json();
    console.log("📊 Purchase Orders:", orders);

    // Test fetching items for each purchase order
    for (const order of orders) {
      console.log(
        `\n🔍 Testing items for order: ${order.orderNumber} (ID: ${order.id})`
      );

      const itemsResponse = await fetch(
        `http://localhost:5000/api/purchase-orders/${order.id}/items`,
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
        console.log(`✅ Items for ${order.orderNumber}:`, items);
      } else {
        console.log(
          `❌ Failed to fetch items for ${order.orderNumber}:`,
          await itemsResponse.text()
        );
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testPurchaseOrderAPI();
