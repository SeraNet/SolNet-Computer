// Simple script to check notification types in the database
// Run this in the browser console on the notification preferences page

async function checkNotificationTypes() {
  try {
    console.log("🔍 Checking notification types...");

    // Check notification types
    const typesResponse = await fetch("/api/notifications/types");
    const types = await typesResponse.json();
    console.log("📋 Notification Types:", types);

    // Check debug endpoint
    const debugResponse = await fetch("/api/notifications/debug/types");
    const debug = await debugResponse.json();
    console.log("🔧 Debug Info:", debug);

    // Check if device_registered type exists
    const deviceRegisteredType = types.find(
      (t) => t.name === "device_registered"
    );
    if (deviceRegisteredType) {
      console.log(
        "✅ device_registered notification type found:",
        deviceRegisteredType
      );
    } else {
      console.log("❌ device_registered notification type NOT found");
    }

    return { types, debug, deviceRegisteredType };
  } catch (error) {
    console.error("❌ Error checking notification types:", error);
    return null;
  }
}

// Run the check
checkNotificationTypes();
