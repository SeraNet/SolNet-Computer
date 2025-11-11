import { db } from "./db";
import { users, locations, businessProfile } from "@shared/schema";
import { eq } from "drizzle-orm";
async function seedDemoUsers() {
  try {
    // Get first location
    const [location] = await db.select().from(locations).limit(1);
    const locationId = location?.id;
    // Create demo users with simple passwords
    const demoUsers = [
      {
        username: "admin",
        password: "admin123", // In production, this would be hashed
        email: "admin@solnetcomputer.com",
        firstName: "Solomon",
        lastName: "Tadese",
        role: "admin" as const,
        locationId,
        isActive: true,
      },
      {
        username: "tech",
        password: "tech123",
        email: "tech@solnetcomputer.com",
        firstName: "Hussien",
        lastName: "Rete",
        role: "technician" as const,
        locationId,
        isActive: true,
      },
      {
        username: "sales",
        password: "sales123",
        email: "sales@solnetcomputer.com",
        firstName: "Sara",
        lastName: "Mohammednur",
        role: "sales" as const,
        locationId,
        isActive: true,
      },
    ];
    for (const user of demoUsers) {
      // Check if user already exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.username, user.username))
        .limit(1);

      if (!existing) {
        await db.insert(users).values(user);
      } else {
      }
    }
    // Create business profile if it doesn't exist
    const [existingProfile] = await db.select().from(businessProfile).limit(1);
    if (!existingProfile) {
      await db.insert(businessProfile).values({
        businessName: "SolNet Computer Services",
        ownerName: "Business Owner",
        email: "info@solnetcomputer.com",
        phone: "091 334 1664",
        address: "Halaba Ediget Primary School",
        city: "Halaba",
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
          sunday: { open: "08:00", close: "20:00", closed: true },
        },
        socialLinks: {
          facebook: "https://facebook.com/solnetitsolutions",
          twitter: "https://twitter.com/solnetitsolutions",
          instagram: "https://instagram.com/solnetitsolutions",
        },
      });
    }
  } catch (error) {}
}
// Run the seeding function
seedDemoUsers().then(() => process.exit(0));
export { seedDemoUsers };
