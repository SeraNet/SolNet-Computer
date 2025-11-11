import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";
import bcrypt from "bcryptjs";
// Standalone database client for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });
async function seedDemoUsers() {
  try {
    // Get first location
    // const [location] = await db.select().from(schema.locations).limit(1);
    // const locationId = location?.id;
    // if (!locationId) {
    //   console.warn(
    //     "No locations found. Skipping user creation. Please seed locations first."
    //   );
    //   return;
    // }
    // Create demo users with simple passwords
    const demoUsers = [
      {
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        email: "admin@solnetcomputer.com",
        firstName: "Solomon",
        lastName: "Tadese",
        role: "admin" as const,
        // locationId,
        isActive: true,
      },
      {
        username: "tech",
        password: bcrypt.hashSync("tech123", 10),
        email: "tech@solnetcomputer.com",
        firstName: "Hussien",
        lastName: "Rete",
        role: "technician" as const,
        // locationId,
        isActive: true,
      },
      {
        username: "sales",
        password: bcrypt.hashSync("sales123", 10),
        email: "sales@solnetcomputer.com",
        firstName: "Sara",
        lastName: "Mohammednur",
        role: "sales" as const,
        // locationId,
        isActive: true,
      },
    ];
    for (const user of demoUsers) {
      // Check if user already exists
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, user.username))
        .limit(1);
      if (!existing) {
        await db.insert(schema.users).values(user);
      } else {
      }
    }
    // Create business profile if it doesn't exist
    const [existingProfile] = await db
      .select()
      .from(schema.businessProfile)
      .limit(1);
    if (!existingProfile) {
      await db.insert(schema.businessProfile).values({
        businessName: "SolNet Computer Services",
        ownerName: "Business Owner",
        email: "info@solnetcomputer.com",
        phone: "091 334 1664",
        address: "Edget Primary School",
        city: "Halaba Kulito",
        state: "Central Ethiopia",
        zipCode: "1000",
        country: "Ethiopia",
        website: "https://solnetcomputer.com",
        businessType: "Computer Repair Shop",
        description:
          "Professional computer repair and technology services. We specialize in laptop repair, desktop maintenance, and data recovery services.",
        workingHours: {
          monday: { open: "08:00", close: "20:00", closed: false },
          tuesday: { open: "08:00", close: "20:00", closed: false },
          wednesday: { open: "08:00", close: "20:00", closed: false },
          thursday: { open: "08:00", close: "20:00", closed: false },
          friday: { open: "08:00", close: "20:00", closed: false },
          saturday: { open: "09:00", close: "19:00", closed: false },
          sunday: { closed: true },
        },
        socialLinks: {
          facebook: "https://facebook.com/solnetitsolutions",
          twitter: "https://twitter.com/solnetitsolutions",
          instagram: "https://instagram.com/solnetitsolutions",
        },
      });
    }
  } catch (error) {
  } finally {
    // Ensure the connection is closed
    await pool.end();
  }
}
// Run the seeding function
seedDemoUsers().then(() => process.exit(0));
export { seedDemoUsers };
