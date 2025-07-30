import { db } from "./db";
import { locations, users, devices, inventoryItems, sales, appointments } from "@shared/schema";
import { nanoid } from "nanoid";

async function seedLocations() {
  try {
    console.log("Creating default location...");
    
    // Create default location
    const [defaultLocation] = await db
      .insert(locations)
      .values({
        id: nanoid(),
        name: "Main Store",
        code: "MAIN",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        phone: "(555) 123-4567",
        email: "info@leulnet.com",
        managerName: "Store Manager",
        isActive: true,
        timezone: "America/New_York",
        businessHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: { closed: true }
        },
        notes: "Main headquarters location"
      })
      .returning();

    console.log("Default location created:", defaultLocation);

    console.log("Locations seeded successfully!");
  } catch (error) {
    console.error("Error seeding locations:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLocations().then(() => process.exit(0));
}

export { seedLocations };