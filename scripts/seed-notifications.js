import { db } from "../server/db.ts";
import { notificationTypes, notificationTemplates } from "../shared/schema.ts";
import { eq } from "drizzle-orm";

async function seedNotifications() {
  try {
    console.log("🌱 Seeding notification system...");

    // Create notification types
    const notificationTypesData = [
      {
        name: "system_alert",
        displayName: "System Alert",
        category: "system",
        description: "System-wide notifications and alerts",
        isActive: true,
      },
      {
        name: "device_registered",
        displayName: "Device Registered",
        category: "devices",
        description: "Notifications when devices are registered",
        isActive: true,
      },
      {
        name: "device_status_change",
        displayName: "Device Status Change",
        category: "devices",
        description: "Notifications when device status changes",
        isActive: true,
      },
      {
        name: "low_stock_alert",
        displayName: "Low Stock Alert",
        category: "inventory",
        description: "Notifications for low inventory items",
        isActive: true,
      },
      {
        name: "customer_feedback",
        displayName: "Customer Feedback",
        category: "customers",
        description: "Notifications for customer feedback",
        isActive: true,
      },
      {
        name: "maintenance_reminder",
        displayName: "Maintenance Reminder",
        category: "system",
        description: "System maintenance reminders",
        isActive: true,
      },
      {
        name: "security_alert",
        displayName: "Security Alert",
        category: "security",
        description: "Security-related notifications",
        isActive: true,
      },
    ];

    console.log("📝 Creating notification types...");
    for (const typeData of notificationTypesData) {
      const [existing] = await db
        .select()
        .from(notificationTypes)
        .where(eq(notificationTypes.name, typeData.name));

      if (!existing) {
        await db.insert(notificationTypes).values(typeData);
        console.log(`✅ Created notification type: ${typeData.name}`);
      } else {
        console.log(`⏭️  Notification type already exists: ${typeData.name}`);
      }
    }

    // Get the created notification types
    const types = await db.select().from(notificationTypes);

    // Create notification templates
    const notificationTemplatesData = [
      {
        typeId: types.find((t) => t.name === "system_alert")?.id,
        title: "System Notification",
        message: "You have a new system notification",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "device_registered")?.id,
        title: "Device Registered",
        message: "A new device has been registered in the system",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "device_status_change")?.id,
        title: "Device Status Updated",
        message: "The status of a device has been updated",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "low_stock_alert")?.id,
        title: "Low Stock Alert",
        message: "An inventory item is running low on stock",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "customer_feedback")?.id,
        title: "Customer Feedback",
        message: "You have received new customer feedback",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "maintenance_reminder")?.id,
        title: "Maintenance Reminder",
        message: "System maintenance is scheduled",
        isActive: true,
      },
      {
        typeId: types.find((t) => t.name === "security_alert")?.id,
        title: "Security Alert",
        message: "A security-related event has occurred",
        isActive: true,
      },
    ];

    console.log("📋 Creating notification templates...");
    for (const templateData of notificationTemplatesData) {
      if (templateData.typeId) {
        const [existing] = await db
          .select()
          .from(notificationTemplates)
          .where(eq(notificationTemplates.typeId, templateData.typeId));

        if (!existing) {
          await db.insert(notificationTemplates).values(templateData);
          console.log(`✅ Created template for type: ${templateData.typeId}`);
        } else {
          console.log(
            `⏭️  Template already exists for type: ${templateData.typeId}`
          );
        }
      }
    }

    console.log("🎉 Notification system seeded successfully!");
    console.log(`📊 Created ${types.length} notification types`);
  } catch (error) {
    console.error("❌ Error seeding notifications:", error);
    process.exit(1);
  }
}

// Run the seeding
seedNotifications()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
