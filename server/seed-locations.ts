import { db } from "./db";
import {
  locations,
  users,
  devices,
  inventoryItems,
  sales,
  appointments,
} from "@shared/schema";
import { nanoid } from "nanoid";
async function seedLocations() {
  try {
    // Create default location
    const [defaultLocation] = await db
      .insert(locations)
      .values({
        id: nanoid(),
        name: "Main Store",
        code: "MAIN",
        address: "Halaba Ediget Primary School",
        city: "Halaba",
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
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLocations().then(() => process.exit(0));
}
export { seedLocations };
