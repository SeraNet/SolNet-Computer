import "dotenv/config";
import { db, initializeDb } from "./server/db";
import { inventoryItems } from "./shared/schema";
import { eq } from "drizzle-orm";

async function testInventoryQuery() {
  try {
    console.log("🔍 Initializing database...");
    await initializeDb();

    console.log("🔍 Testing database connection...");

    // Simple count query first
    const count = await db.select().from(inventoryItems);
    console.log("✅ Raw query successful, items count:", count.length);

    // Test with isActive filter
    const activeItems = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true));
    console.log("✅ Active items query successful, count:", activeItems.length);

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Database query failed:", error);
    console.error("❌ Stack trace:", error.stack);
  } finally {
    process.exit(0);
  }
}

console.log("🚀 Starting inventory debug test...");
testInventoryQuery();
