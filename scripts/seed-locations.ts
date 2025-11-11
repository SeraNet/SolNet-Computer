import { db } from "../server/db";
import {
  locations,
  users,
  devices,
  inventoryItems,
  sales,
  appointments,
} from "../shared/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import "dotenv/config";

// Ensure we're using the correct database URL from environment
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
async function seedLocations() {
  try {
    // Check if default location exists
    const existingLocation = await db
      .select()
      .from(locations)
      .where(eq(locations.code, "MAIN"))
      .limit(1);
    if (existingLocation.length > 0) {
      return;
    }
    // Create default location
    const [defaultLocation] = await db
      .insert(locations)
      .values({
        id: nanoid(),
        name: "Main Store",
        code: "MAIN",
        address: "Edget Primary School",
        city: "Halaba Kulito",
        state: "Central Ethiopia",
        zipCode: "1000",
        country: "Ethiopia",
        phone: "091 334 1664",
        email: "info@solnetcomputer.com",
        managerName: "Solomon Tadese",
        isActive: true,
        timezone: "Africa/Addis_Ababa",
        businessHours: {
          monday: { open: "08:00", close: "20:00" },
          tuesday: { open: "08:00", close: "20:00" },
          wednesday: { open: "08:00", close: "20:00" },
          thursday: { open: "08:00", close: "20:00" },
          friday: { open: "08:00", close: "20:00" },
          saturday: { open: "09:00", close: "19:00" },
          sunday: { closed: true },
        },
        notes: "Main headquarters location",
      })
      .returning();
  } catch (error) {
    process.exit(1);
  }
}
// Run if called directly
if (import.meta.url.endsWith("seed-locations.ts")) {
  seedLocations()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}
export { seedLocations };
