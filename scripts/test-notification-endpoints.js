// Test script to debug notification endpoints
// Run this in the browser console

async function testNotificationEndpoints() {
  try {
    console.log("🔍 Testing notification endpoints...");

    // Test 1: Check if server is running
    console.log("1️⃣ Testing server connection...");
    try {
      const response = await fetch("/api/test");
      const data = await response.json();
      console.log("✅ Server is running:", data);
    } catch (error) {
      console.error("❌ Server connection failed:", error);
      return;
    }

    // Test 2: Check notification types
    console.log("2️⃣ Testing notification types...");
    try {
      const typesResponse = await fetch("/api/notifications/types");
      if (typesResponse.ok) {
        const types = await typesResponse.json();
        console.log("✅ Notification types:", types);
      } else {
        console.error(
          "❌ Notification types failed:",
          typesResponse.status,
          typesResponse.statusText
        );
      }
    } catch (error) {
      console.error("❌ Notification types error:", error);
    }

    // Test 3: Check unread count (this is failing)
    console.log("3️⃣ Testing unread count...");
    try {
      const countResponse = await fetch("/api/notifications/unread-count");
      if (countResponse.ok) {
        const count = await countResponse.json();
        console.log("✅ Unread count:", count);
      } else {
        const errorText = await countResponse.text();
        console.error(
          "❌ Unread count failed:",
          countResponse.status,
          countResponse.statusText
        );
        console.error("❌ Error details:", errorText);
      }
    } catch (error) {
      console.error("❌ Unread count error:", error);
    }

    // Test 4: Check debug endpoint
    console.log("4️⃣ Testing debug endpoint...");
    try {
      const debugResponse = await fetch("/api/notifications/debug/types");
      if (debugResponse.ok) {
        const debug = await debugResponse.json();
        console.log("✅ Debug info:", debug);
      } else {
        const errorText = await debugResponse.text();
        console.error(
          "❌ Debug endpoint failed:",
          debugResponse.status,
          debugResponse.statusText
        );
        console.error("❌ Error details:", errorText);
      }
    } catch (error) {
      console.error("❌ Debug endpoint error:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testNotificationEndpoints();


