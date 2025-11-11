import pkg from "twilio";
const { Twilio } = pkg;
import type { Twilio as TwilioType } from "twilio";
import { formatCurrency } from "../client/src/lib/currency";

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface DeviceInfo {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  brand: string;
  model: string;
  problemDescription: string;
  status: string;
  totalCost?: string;
  estimatedCompletionDate?: string;
}

class SMSService {
  private client!: TwilioType;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor(config: SMSConfig) {
    this.fromNumber = config.fromNumber;
    this.isEnabled = !!(
      config.accountSid &&
      config.authToken &&
      config.fromNumber
    );

    if (this.isEnabled) {
      this.client = new Twilio(config.accountSid, config.authToken);
    }
  }

  private async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to),
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // If it already has +, return as is (international format)
    if (phone.startsWith("+")) {
      return phone;
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If it's a 10-digit number, add +1 (US)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // If it already has country code, add +
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`;
    }

    // For Ethiopian numbers (251 country code)
    if (cleaned.length === 12 && cleaned.startsWith("251")) {
      return `+${cleaned}`;
    }

    // For Ethiopian numbers without country code (9 digits starting with 9)
    if (cleaned.length === 9 && cleaned.startsWith("9")) {
      return `+251${cleaned}`;
    }

    // Default: add +1 for US numbers
    return `+1${cleaned}`;
  }

  async sendDeviceRegistrationSMS(device: DeviceInfo): Promise<boolean> {
    const message = `🔧 Device Registration Confirmed

Dear ${device.customerName},

Your device has been successfully registered for repair service.

📱 Device Details:
• Type: ${device.deviceType}
• Brand: ${device.brand}
• Model: ${device.model}
• Problem: ${device.problemDescription}

🔢 Tracking Number: ${device.receiptNumber}

We'll keep you updated on the repair progress. You can track your device status using the tracking number above.

Thank you for choosing our service!`;

    return this.sendSMS(device.customerPhone, message);
  }

  async sendDeviceStatusUpdateSMS(
    device: DeviceInfo,
    oldStatus: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      diagnosed:
        "🔍 Your device has been diagnosed and we're preparing the repair plan.",
      in_progress: "⚙️ We're now working on your device repair.",
      waiting_parts:
        "📦 We're waiting for parts to arrive to complete your repair.",
      completed: "✅ Your device repair has been completed successfully!",
      ready_for_pickup:
        "🎉 Your device is ready for pickup! Please visit us to collect it.",
      delivered:
        "📱 Your device has been delivered. Thank you for choosing our service!",
      cancelled:
        "❌ Your device repair has been cancelled. Please contact us for more information.",
    };

    const statusMessage =
      statusMessages[device.status] || "Your device status has been updated.";
    const costInfo = device.totalCost
      ? `\n💰 Total Cost: ${formatCurrency(device.totalCost)}`
      : "";
    const completionInfo = device.estimatedCompletionDate
      ? `\n📅 Estimated Completion: ${new Date(
          device.estimatedCompletionDate
        ).toLocaleDateString()}`
      : "";

    const message = `📱 Device Status Update

Dear ${device.customerName},

${statusMessage}

🔢 Tracking Number: ${device.receiptNumber}
📱 Device: ${device.deviceType} ${device.brand} ${device.model}${costInfo}${completionInfo}

Thank you for your patience!`;

    return this.sendSMS(device.customerPhone, message);
  }

  async sendDeviceReadyForPickupSMS(device: DeviceInfo): Promise<boolean> {
    const costInfo = device.totalCost
      ? `\n💰 Total Cost: ${formatCurrency(device.totalCost)}`
      : "";

    const message = `🎉 Device Ready for Pickup!

Dear ${device.customerName},

Your device repair is complete and ready for pickup!

📱 Device: ${device.deviceType} ${device.brand} ${device.model}
🔢 Tracking Number: ${device.receiptNumber}${costInfo}

Please bring your tracking number when picking up your device.

We look forward to seeing you!`;

    return this.sendSMS(device.customerPhone, message);
  }

  async sendDeviceDeliveredSMS(device: DeviceInfo): Promise<boolean> {
    const message = `📱 Device Successfully Delivered

Dear ${device.customerName},

Your device has been successfully delivered!

📱 Device: ${device.deviceType} ${device.brand} ${device.model}
🔢 Tracking Number: ${device.receiptNumber}

Thank you for choosing our service. We hope you're satisfied with the repair!

Please consider leaving us a review.`;

    return this.sendSMS(device.customerPhone, message);
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create and export the SMS service instance
let smsService: SMSService | null = null;

// Initialize SMS service with database settings
async function initializeSMSService() {
  try {
    console.log("🔧 Initializing SMS service with database settings...");
    const { storage } = await import("./storage.ts");
    const settings = await storage.getSMSSettings();

    console.log("📱 SMS Settings from database:", {
      accountSid: settings.twilioAccountSid ? "SET" : "NOT SET",
      authToken: settings.twilioAuthToken ? "SET" : "NOT SET",
      fromNumber: settings.twilioFromNumber || "NOT SET",
    });

    if (
      !settings.twilioAccountSid ||
      !settings.twilioAuthToken ||
      !settings.twilioFromNumber
    ) {
      console.log(
        "⚠️ SMS settings incomplete, using environment variables as fallback"
      );
      smsService = new SMSService({
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        fromNumber: process.env.TWILIO_FROM_NUMBER || "",
      });
    } else {
      console.log("✅ Using database SMS settings");
      smsService = new SMSService({
        accountSid: settings.twilioAccountSid,
        authToken: settings.twilioAuthToken,
        fromNumber: settings.twilioFromNumber,
      });
    }
  } catch (error) {
    // Fallback to environment variables
    smsService = new SMSService({
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      fromNumber: process.env.TWILIO_FROM_NUMBER || "",
    });
  }
}

// Export a function to get the SMS service instance
export async function getSMSService(): Promise<SMSService> {
  if (!smsService) {
    await initializeSMSService();
  }
  return smsService!;
}

export { SMSService, type DeviceInfo };
