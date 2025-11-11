// Simple script to seed notification types
// Run this in the browser console or as a server script

const notificationTypes = [
  {
    name: "system_alert",
    displayName: "System Alert",
    category: "system",
    description: "System-wide notifications and alerts",
    isActive: true,
  },
  {
    name: "customer_feedback",
    displayName: "Customer Feedback",
    category: "customer",
    description: "New customer feedback received",
    isActive: true,
  },
  {
    name: "device_registered",
    displayName: "Device Registered",
    category: "device",
    description: "Device registration notification",
    isActive: true,
  },
  {
    name: "device_status_change",
    displayName: "Device Status Change",
    category: "device",
    description: "Device status change notification",
    isActive: true,
  },
  {
    name: "low_stock_alert",
    displayName: "Low Stock Alert",
    category: "inventory",
    description: "Low stock inventory alert",
    isActive: true,
  },
  {
    name: "maintenance_reminder",
    displayName: "Maintenance Reminder",
    category: "system",
    description: "System maintenance reminders",
    isActive: true,
  },
];

console.log("Notification types to seed:", notificationTypes);

// You can run this in the browser console to test the API
async function testNotificationAPI() {
  try {
    // Test getting notification types
    const typesResponse = await fetch("/api/notifications/types");
    const types = await typesResponse.json();
    console.log("Current notification types:", types);

    // Test getting preferences
    const prefsResponse = await fetch("/api/notifications/preferences");
    const prefs = await prefsResponse.json();
    console.log("Current notification preferences:", prefs);

    // Test creating a notification
    const testResponse = await fetch(
      "/api/notifications/test-customer-feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const testResult = await testResponse.json();
    console.log("Test notification result:", testResult);
  } catch (error) {
    console.error("Error testing notification API:", error);
  }
}

// Run the test
testNotificationAPI();
