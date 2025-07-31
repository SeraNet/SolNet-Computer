import { db } from "./db";
import { users, locations, businessProfile } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDemoUsers() {
  console.log("Seeding demo users...");

  try {
    // Get first location
    const [location] = await db.select().from(locations).limit(1);
    const locationId = location?.id;

    // Create demo users with simple passwords
    const demoUsers = [
      {
        username: "admin",
        password: "admin123", // In production, this would be hashed
        email: "admin@leulnet.com",
        firstName: "System",
        lastName: "Administrator",
        role: "admin" as const,
        locationId,
        isActive: true,
      },
      {
        username: "tech",
        password: "tech123",
        email: "tech@leulnet.com",
        firstName: "John",
        lastName: "Technician",
        role: "technician" as const,
        locationId,
        isActive: true,
      },
      {
        username: "sales",
        password: "sales123",
        email: "sales@leulnet.com",
        firstName: "Sarah",
        lastName: "Sales",
        role: "sales" as const,
        locationId,
        isActive: true,
      },
    ];

    for (const user of demoUsers) {
      // Check if user already exists
      const [existing] = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
      
      if (!existing) {
        await db.insert(users).values(user);
        console.log(`Created user: ${user.username} (${user.role})`);
      } else {
        console.log(`User ${user.username} already exists`);
      }
    }

    // Create business profile if it doesn't exist
    const [existingProfile] = await db.select().from(businessProfile).limit(1);
    if (!existingProfile) {
      await db.insert(businessProfile).values({
        businessName: "LeulNet Computer Services",
        ownerName: "Business Owner",
        email: "info@leulnet.com",
        phone: "(555) 123-4567",
        address: "123 Technology Drive",
        city: "Tech City",
        state: "CA",
        zipCode: "12345",
        country: "USA",
        website: "https://leulnet.com",
        businessType: "Computer Repair Shop",
        description: "Professional computer repair and technology services. We specialize in laptop repair, desktop maintenance, phone repair, and data recovery services.",
        workingHours: {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "10:00", close: "16:00", closed: false },
          sunday: { open: "12:00", close: "16:00", closed: false }
        },
        socialLinks: {
          facebook: "https://facebook.com/leulnet",
          twitter: "https://twitter.com/leulnet",
          instagram: "https://instagram.com/leulnet"
        }
      });
      console.log("Created business profile");
    }

    console.log("Demo users seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo users:", error);
  }
}

// Run the seeding function
seedDemoUsers().then(() => process.exit(0));

export { seedDemoUsers };