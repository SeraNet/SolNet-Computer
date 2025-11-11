import { db } from "./db";
import {
  notifications,
  notificationTypes,
  notificationTemplates,
  notificationPreferences,
  users,
  customers,
  devices,
  deviceTypes,
  brands,
  models,
  serviceTypes,
} from "../shared/schema";
import { eq, and, desc, sql, isNull, or, lt } from "drizzle-orm";
import { formatCurrency } from "../client/src/lib/currency";

export interface NotificationData {
  [key: string]: any;
}

export interface CreateNotificationParams {
  typeName: string;
  recipientId: string;
  title?: string;
  message?: string;
  data?: NotificationData;
  priority?: "low" | "normal" | "high" | "urgent";
  senderId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  expiresAt?: Date;
}

export interface NotificationWithDetails {
  id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: Date;
  readAt: Date | null;
  expiresAt: Date | null;
  data: NotificationData | null;
  type: {
    id: string;
    name: string;
    category: string | null;
  };
  sender?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string;
  };
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      // Get notification type
      const notificationType = await db
        .select()
        .from(notificationTypes)
        .where(eq(notificationTypes.name, params.typeName))
        .limit(1);

      if (!notificationType.length) {
        throw new Error(`Notification type '${params.typeName}' not found`);
      }

      const type = notificationType[0];

      // Get template for this notification type
      const template = await db
        .select()
        .from(notificationTemplates)
        .where(
          and(
            eq(notificationTemplates.typeId, type.id),
            eq(notificationTemplates.isActive, true)
          )
        )
        .limit(1);

      // Use template or provided values
      const title = params.title || template[0]?.title || "Notification";
      const message =
        params.message || template[0]?.message || "You have a new notification";

      // Create the notification
      const [notification] = await db
        .insert(notifications)
        .values({
          typeId: type.id,
          title,
          message,
          data: params.data || null,
          priority: params.priority || "normal",
          recipientId: params.recipientId,
          senderId: params.senderId || null,
          relatedEntityType: params.relatedEntityType || null,
          relatedEntityId: params.relatedEntityId || null,
          expiresAt: params.expiresAt || null,
        })
        .returning();

      // Check user preferences and send external notifications if enabled
      await this.sendExternalNotifications(notification, type, template[0]);

      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      status?: "unread" | "read" | "archived" | "all";
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
    } = {}
  ): Promise<NotificationWithDetails[]> {
    const {
      status = "all",
      limit = 50,
      offset = 0,
      includeExpired = false,
    } = options;

    try {
      let whereClause: any = eq(notifications.recipientId, userId);

      if (status !== "all") {
        whereClause = and(whereClause, eq(notifications.status, status));
      }

      if (!includeExpired) {
        whereClause = and(
          whereClause,
          or(
            isNull(notifications.expiresAt),
            sql`${notifications.expiresAt} > NOW()`
          )
        );
      }

      const results = await db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          priority: notifications.priority,
          status: notifications.status,
          createdAt: notifications.createdAt,
          readAt: notifications.readAt,
          expiresAt: notifications.expiresAt,
          data: notifications.data,
          relatedEntityType: notifications.relatedEntityType,
          relatedEntityId: notifications.relatedEntityId,
          type: {
            id: notificationTypes.id,
            name: notificationTypes.name,
            category: notificationTypes.category,
          },
          sender: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
          },
        })
        .from(notifications)
        .leftJoin(
          notificationTypes,
          eq(notifications.typeId, notificationTypes.id)
        )
        .leftJoin(users, eq(notifications.senderId, users.id))
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      // Filter out results where createdAt is null and transform to match NotificationWithDetails
      return results
        .filter(
          (result): result is typeof result & { createdAt: Date } =>
            result.createdAt !== null
        )
        .map((result) => ({
          ...result,
          createdAt: result.createdAt as Date,
          data: result.data as NotificationData | null,
          type: result.type || {
            id: "",
            name: "",
            category: "",
          },
          sender: result.sender || undefined,
        }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const [updated] = await db
        .update(notifications)
        .set({
          status: "read",
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.recipientId, userId)
          )
        )
        .returning();

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await db
        .update(notifications)
        .set({
          status: "read",
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.recipientId, userId),
            eq(notifications.status, "unread")
          )
        );

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive a notification
   */
  static async archiveNotification(notificationId: string, userId: string) {
    try {
      const [updated] = await db
        .update(notifications)
        .set({
          status: "archived",
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.recipientId, userId)
          )
        )
        .returning();

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientId, userId),
            eq(notifications.status, "unread"),
            or(
              isNull(notifications.expiresAt),
              sql`${notifications.expiresAt} > NOW()`
            )
          )
        );

      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Delete expired notifications
   */
  static async cleanupExpiredNotifications() {
    try {
      const result = await db
        .delete(notifications)
        .where(
          and(
            sql`${notifications.expiresAt} IS NOT NULL`,
            sql`${notifications.expiresAt} < NOW()`
          )
        );

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send external notifications (email, SMS) based on user preferences
   */
  private static async sendExternalNotifications(
    notification: any,
    type: any,
    template: any
  ) {
    try {
      // Get user preferences
      const preferences = await db
        .select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, notification.recipientId),
            eq(notificationPreferences.typeId, type.id)
          )
        );

      if (!preferences.length) {
        // Create default preferences
        await db.insert(notificationPreferences).values({
          userId: notification.recipientId,
          typeId: type.id,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
        });
        return;
      }

      const preference = preferences[0];

      // Send email notification if enabled
      if (
        preference.emailEnabled &&
        template?.emailSubject &&
        template?.emailBody
      ) {
        await this.sendEmailNotification(notification, template);
      }

      // Send SMS notification if enabled
      if (preference.smsEnabled && template?.smsMessage) {
        await this.sendSMSNotification(notification, template);
      }

      // TODO: Implement push notifications
      if (preference.pushEnabled) {
        // await this.sendPushNotification(notification, template);
      }
    } catch (error) {}
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: any, template: any) {
    try {
      // Get user details
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, notification.recipientId))
        .limit(1);

      if (!user.length || !user[0].email) {
        return;
      }

      // TODO: Implement email sending logic
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      console.log("Subject:", template.emailSubject);
    } catch (error) {}
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(notification: any, template: any) {
    try {
      // Get user details
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, notification.recipientId))
        .limit(1);

      if (!user.length) {
        return;
      }

      // TODO: Implement SMS sending logic
      // This would integrate with your SMS service
      console.log("Message:", template.smsMessage);
    } catch (error) {}
  }

  /**
   * Create device-related notifications
   */
  static async createDeviceNotification(
    typeName: string,
    deviceId: string,
    recipientId: string,
    additionalData?: NotificationData
  ) {
    try {
      // Get device details with related data
      const deviceDetails = await db
        .select({
          device: devices,
          customer: customers,
          deviceType: deviceTypes,
          brand: brands,
          model: models,
          serviceType: serviceTypes,
        })
        .from(devices)
        .leftJoin(customers, eq(devices.customerId, customers.id))
        .leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
        .leftJoin(brands, eq(devices.brandId, brands.id))
        .leftJoin(models, eq(devices.modelId, models.id))
        .leftJoin(serviceTypes, eq(devices.serviceTypeId, serviceTypes.id))
        .where(eq(devices.id, deviceId))
        .limit(1);

      if (!deviceDetails.length) {
        throw new Error("Device not found");
      }

      const details = deviceDetails[0];
      const data = {
        deviceId,
        customerName: details.customer?.name || "Unknown Customer",
        deviceType: details.deviceType?.name || "Unknown Device",
        brand: details.brand?.name || "Unknown Brand",
        model: details.model?.name || "Not Specified",
        serviceType: details.serviceType?.name || "Unknown Service",
        problemDescription:
          details.device.problemDescription || "No description",
        totalCost: details.device.totalCost
          ? formatCurrency(parseFloat(details.device.totalCost))
          : "TBD",
        ...additionalData,
      };

      return await this.createNotification({
        typeName,
        recipientId,
        data,
        relatedEntityType: "device",
        relatedEntityId: deviceId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create inventory-related notifications
   */
  static async createInventoryNotification(
    typeName: string,
    itemId: string,
    recipientId: string,
    additionalData?: NotificationData
  ) {
    try {
      return await this.createNotification({
        typeName,
        recipientId,
        data: {
          itemId,
          ...additionalData,
        },
        relatedEntityType: "inventory",
        relatedEntityId: itemId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create customer feedback notifications
   */
  static async createCustomerFeedbackNotification(
    feedbackId: string,
    recipientId: string,
    feedbackData: {
      customerName: string;
      customerEmail: string;
      serviceType: string;
      rating?: number;
      comment?: string;
    }
  ) {
    try {
      return await this.createNotification({
        typeName: "customer_feedback",
        recipientId,
        data: {
          feedbackId,
          customerName: feedbackData.customerName,
          customerEmail: feedbackData.customerEmail,
          serviceType: feedbackData.serviceType,
          rating: feedbackData.rating || 0,
          comment: feedbackData.comment || "",
        },
        relatedEntityType: "customer_feedback",
        relatedEntityId: feedbackId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  static async getUserPreferences(userId: string) {
    try {
      const preferences = await db
        .select({
          preference: notificationPreferences,
          type: notificationTypes,
        })
        .from(notificationPreferences)
        .leftJoin(
          notificationTypes,
          eq(notificationPreferences.typeId, notificationTypes.id)
        )
        .where(eq(notificationPreferences.userId, userId));

      return preferences;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(
    userId: string,
    typeId: string,
    preferences: {
      enabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
    }
  ) {
    try {
      console.log("🔔 NotificationService.updatePreferences called:", {
        userId,
        typeId,
        preferences,
      });

      const [updated] = await db
        .update(notificationPreferences)
        .set({
          enabled: preferences.enabled,
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled,
          pushEnabled: preferences.pushEnabled,
          inAppEnabled: preferences.inAppEnabled,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.typeId, typeId)
          )
        )
        .returning();

      console.log("🔔 Update result:", updated);

      if (updated) {
        console.log("🔔 Existing preference updated successfully");
        return updated;
      }

      // If no existing preference row, create one with provided values
      const [inserted] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          typeId,
          enabled:
            preferences.enabled !== undefined ? preferences.enabled : true,
          emailEnabled:
            preferences.emailEnabled !== undefined
              ? preferences.emailEnabled
              : true,
          smsEnabled:
            preferences.smsEnabled !== undefined
              ? preferences.smsEnabled
              : false,
          pushEnabled:
            preferences.pushEnabled !== undefined
              ? preferences.pushEnabled
              : true,
          inAppEnabled:
            preferences.inAppEnabled !== undefined
              ? preferences.inAppEnabled
              : true,
        })
        .returning();

      return inserted;
    } catch (error) {
      console.error("🔔 NotificationService.updatePreferences error:", error);
      console.error("🔔 Error details:", {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        detail: (error as any)?.detail,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
