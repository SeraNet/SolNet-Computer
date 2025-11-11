import { db, initializeDb } from "../server/db.ts";
import { notificationTypes } from "../shared/schema.ts";
import { eq } from "drizzle-orm";

async function testNotificationTypes() {
  // Initialize database
  await initializeDb();
  try {
    console.log("🔍 Testing notification types...");

    // Check if customer_feedback type exists
    const customerFeedbackType = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.name, "customer_feedback"))
      .limit(1);

    if (customerFeedbackType.length > 0) {
      console.log(
        "✅ customer_feedback notification type exists:",
        customerFeedbackType[0]
      );
    } else {
      console.log("❌ customer_feedback notification type NOT found");
    }

    // Check if system_alert type exists
    const systemAlertType = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.name, "system_alert"))
      .limit(1);

    if (systemAlertType.length > 0) {
      console.log(
        "✅ system_alert notification type exists:",
        systemAlertType[0]
      );
    } else {
      console.log("❌ system_alert notification type NOT found");
    }

    // List all notification types
    const allTypes = await db.select().from(notificationTypes);
    console.log(
      "📋 All notification types:",
      allTypes.map((t) => ({ name: t.name, category: t.category }))
    );
  } catch (error) {
    console.error("❌ Error testing notification types:", error);
  }
}

testNotificationTypes()
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
