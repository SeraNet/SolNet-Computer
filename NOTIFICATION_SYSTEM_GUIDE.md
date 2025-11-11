# Notification System Guide

## Overview

The notification system provides real-time alerts and updates to users about various events in the SolNetManage application. It supports multiple notification types, user preferences, and delivery methods.

## Features

- **Real-time notifications** with live unread count
- **Multiple notification types** (device, inventory, system, etc.)
- **User preferences** for email, SMS, and in-app notifications
- **Priority levels** (low, normal, high, urgent)
- **Notification templates** with customizable messages
- **Automatic cleanup** of expired notifications
- **Rich notification data** with related entity information

## Database Schema

### Tables

1. **notification_types** - Defines different types of notifications
2. **notifications** - Stores individual notifications
3. **notification_preferences** - User preferences for each notification type
4. **notification_templates** - Templates for notification messages

### Default Notification Types

- `device_registered` - New device registration
- `device_status_update` - Device status changes
- `repair_completed` - Repair completion
- `low_stock_alert` - Inventory low stock alerts
- `inventory_reorder` - Inventory reorder reminders
- `customer_feedback` - New customer feedback
- `appointment_reminder` - Appointment reminders
- `payment_received` - Payment notifications
- `system_alert` - System maintenance/error alerts
- `new_customer` - New customer registration
- `urgent_repair` - Urgent repair assignments
- `daily_summary` - Daily business summaries
- `weekly_report` - Weekly business reports
- `monthly_report` - Monthly business reports

## Installation

### 1. Run the Migration

```bash
node scripts/run-notification-migration.js
```

This will:

- Create all notification tables
- Insert default notification types
- Create notification templates
- Set up database indexes

### 2. Restart the Server

The notification service is automatically loaded when the server starts.

### 3. Verify Installation

Check that the notification bell in the header shows real notifications instead of the hardcoded "3".

## Usage

### Frontend Components

#### NotificationDropdown

The main notification component that replaces the hardcoded notification bell:

```tsx
import { NotificationDropdown } from "@/components/notification-dropdown";

// Automatically included in the header
```

Features:

- Real-time unread count
- Notification list with priority indicators
- Mark as read/archive actions
- Notification preferences settings
- Time-ago formatting

### Backend Service

#### NotificationService

The main service for creating and managing notifications:

```typescript
import { NotificationService } from "./notification-service";

// Create a simple notification
await NotificationService.createNotification({
  typeName: "system_alert",
  recipientId: userId,
  title: "System Maintenance",
  message: "Scheduled maintenance in 30 minutes",
  priority: "high",
});

// Create device-related notification
await NotificationService.createDeviceNotification(
  "device_registered",
  deviceId,
  recipientId,
  { additionalData: "custom data" }
);

// Create inventory notification
await NotificationService.createInventoryNotification(
  "low_stock_alert",
  itemId,
  recipientId,
  { currentStock: 5, minThreshold: 10 }
);
```

### API Endpoints

#### Get Notifications

```
GET /api/notifications?status=unread&limit=50&offset=0
```

#### Get Unread Count

```
GET /api/notifications/unread-count
```

#### Mark as Read

```
POST /api/notifications/:id/read
```

#### Mark All as Read

```
POST /api/notifications/mark-all-read
```

#### Archive Notification

```
POST /api/notifications/:id/archive
```

#### Get Preferences

```
GET /api/notifications/preferences
```

#### Update Preferences

```
PUT /api/notifications/preferences/:typeId
{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "inAppEnabled": true
}
```

## Integration Examples

### Device Registration

Notifications are automatically created when devices are registered:

```typescript
// In device creation route
const device = await storage.createDevice(deviceData);

// Create notification for all admin users
const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
for (const adminUser of adminUsers) {
  await NotificationService.createDeviceNotification(
    "device_registered",
    device.id,
    adminUser.id,
    { registeredBy: req.user?.id }
  );
}
```

### Device Status Updates

Notifications are created when device status changes:

```typescript
// In device status update route
const device = await storage.updateDeviceStatus(
  deviceId,
  newStatus,
  notes,
  userId
);

// Create notification
await NotificationService.createDeviceNotification(
  "device_status_update",
  device.id,
  adminUserId,
  { newStatus, oldStatus: device.status, notes }
);
```

### Low Stock Alerts

Create inventory notifications:

```typescript
// When inventory is low
await NotificationService.createInventoryNotification(
  "low_stock_alert",
  itemId,
  adminUserId,
  {
    currentStock: item.quantity,
    minThreshold: item.minThreshold,
    itemName: item.name,
  }
);
```

## Notification Templates

Templates are stored in the database and support variable substitution:

### Template Variables

- `{customerName}` - Customer name
- `{deviceType}` - Device type
- `{brand}` - Device brand
- `{model}` - Device model
- `{status}` - Device status
- `{totalCost}` - Repair cost
- `{itemName}` - Inventory item name
- `{currentStock}` - Current stock level
- `{businessName}` - Business name

### Example Template

```json
{
  "title": "Device Registered",
  "message": "A new device has been registered for {customerName}",
  "emailSubject": "Device Registration - {deviceType}",
  "emailBody": "Dear {customerName},<br><br>Your {deviceType} has been successfully registered...",
  "smsMessage": "Device registered for {customerName}. {deviceType} - {brand} {model}.",
  "variables": [
    "customerName",
    "deviceType",
    "brand",
    "model",
    "problemDescription",
    "businessName"
  ]
}
```

## User Preferences

Users can configure notification preferences for each type:

- **Email** - Send email notifications
- **SMS** - Send SMS notifications (requires SMS service setup)
- **In-App** - Show notifications in the application
- **Push** - Browser push notifications (future feature)

## Priority Levels

- **Low** - Informational notifications
- **Normal** - Standard notifications
- **High** - Important notifications
- **Urgent** - Critical notifications requiring immediate attention

## Customization

### Adding New Notification Types

1. Add the type to the migration script
2. Create a template for the type
3. Use the service to create notifications

### Custom Notification Components

You can create custom notification components for specific use cases:

```tsx
// Custom notification component
function CustomNotification({ notification }) {
  const { data } = notification;

  return (
    <div className="custom-notification">
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
      {data.customField && (
        <div className="custom-data">{data.customField}</div>
      )}
    </div>
  );
}
```

## Maintenance

### Cleanup Expired Notifications

The system automatically cleans up expired notifications:

```typescript
// Run cleanup manually
await NotificationService.cleanupExpiredNotifications();
```

### Performance Optimization

- Notifications are paginated (default 50 per page)
- Unread count is cached and refreshed every 30 seconds
- Database indexes optimize query performance

## Troubleshooting

### Common Issues

1. **Notifications not showing**

   - Check if migration was run successfully
   - Verify user authentication
   - Check browser console for errors

2. **Unread count not updating**

   - Refresh the page
   - Check network requests
   - Verify API endpoints are working

3. **Database errors**
   - Check database connection
   - Verify table structure
   - Check for missing indexes

### Debug Mode

Enable debug logging in the notification service:

```typescript
// Add to notification service
console.log("Creating notification:", { typeName, recipientId, data });
```

## Future Enhancements

- **Push notifications** - Browser push notifications
- **Email integration** - SendGrid, AWS SES integration
- **SMS integration** - Twilio, Ethiopian SMS integration
- **Notification scheduling** - Delayed notifications
- **Notification channels** - Slack, Discord integration
- **Advanced filtering** - Filter by type, priority, date range
- **Bulk actions** - Bulk mark as read, archive, delete
- **Notification analytics** - Track notification engagement

## Support

For issues or questions about the notification system:

1. Check this guide
2. Review the database schema
3. Check server logs for errors
4. Verify API endpoints are working
5. Test with different user roles and preferences
