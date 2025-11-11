import axios from "axios";

interface EthiopianSMSConfig {
  provider:
    | "africas_talking"
    | "bulksms"
    | "local_aggregator"
    | "ethio_telecom"
    | "custom";
  apiKey?: string;
  username?: string;
  password?: string;
  senderId?: string;
  baseUrl?: string;
  // For custom providers
  customEndpoint?: string;
  customHeaders?: Record<string, string>;
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

class EthiopianSMSService {
  private config: EthiopianSMSConfig;
  private isEnabled: boolean;

  constructor(config: EthiopianSMSConfig) {
    this.config = config;
    // Enable service even without credentials for demo/testing purposes
    this.isEnabled = config.provider && true;
  }

  private async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      console.log(
        "📱 Ethiopian SMS disabled - would send to",
        to,
        ":",
        message
      );
      return true;
    }

    // Check if we have credentials for the selected provider
    const hasCredentials =
      this.config.apiKey ||
      (this.config.username && this.config.password) ||
      this.config.customEndpoint;

    if (!hasCredentials) {
      console.log(
        "📱 Ethiopian SMS (DEMO MODE) - would send to",
        to,
        "via",
        this.config.provider,
        ":",
        message
      );
      return true; // Return true to simulate successful send
    }

    try {
      switch (this.config.provider) {
        case "africas_talking":
          return await this.sendViaAfricasTalking(to, message);
        case "bulksms":
          return await this.sendViaBulkSMS(to, message);
        case "ethio_telecom":
          return await this.sendViaEthioTelecom(to, message);
        case "local_aggregator":
          return await this.sendViaLocalAggregator(to, message);
        case "custom":
          return await this.sendViaCustomProvider(to, message);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  private async sendViaAfricasTalking(
    to: string,
    message: string
  ): Promise<boolean> {
    // AfricasTalking SMS integration
    const payload = {
      username: this.config.username || "sandbox",
      to: this.formatEthiopianNumber(to),
      message: message,
      from: this.config.senderId || "SolNet",
    };

    try {
      const response = await axios.post(
        this.config.baseUrl ||
          "https://api.africastalking.com/version1/messaging",
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            apiKey: this.config.apiKey || "",
            ...this.config.customHeaders,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error(
        "❌ AfricasTalking SMS error:",
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data || String(error)
      );
      return false;
    }
  }

  private async sendViaBulkSMS(to: string, message: string): Promise<boolean> {
    // BulkSMS integration
    const payload = {
      api_key: this.config.apiKey,
      sender_id: this.config.senderId || "SolNet",
      phone: this.formatEthiopianNumber(to),
      message: message,
    };

    try {
      const response = await axios.post(
        this.config.baseUrl || "https://api.bulksms.com/v1/messages",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...this.config.customHeaders,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async sendViaEthioTelecom(
    to: string,
    message: string
  ): Promise<boolean> {
    // Ethio Telecom SMS integration
    const payload = {
      username: this.config.username,
      password: this.config.password,
      sender_id: this.config.senderId || "SolNet",
      phone: this.formatEthiopianNumber(to),
      message: message,
      // Ethio Telecom specific parameters
      message_type: "text",
      encoding: "UTF-8",
    };

    try {
      const response = await axios.post(
        this.config.baseUrl || "https://sms.ethiotelecom.et/api/send",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...this.config.customHeaders,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error(
        "❌ Ethio Telecom SMS error:",
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data || String(error)
      );
      return false;
    }
  }

  private async sendViaLocalAggregator(
    to: string,
    message: string
  ): Promise<boolean> {
    // Local SMS aggregator integration
    const payload = {
      api_key: this.config.apiKey,
      sender_id: this.config.senderId || "SolNet",
      phone: this.formatEthiopianNumber(to),
      message: message,
      // Add any additional local aggregator specific parameters
    };

    try {
      const response = await axios.post(
        this.config.baseUrl || "https://api.ethiopiansms.com/send",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...this.config.customHeaders,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error(
        "❌ Local aggregator SMS error:",
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data || String(error)
      );
      return false;
    }
  }

  private async sendViaCustomProvider(
    to: string,
    message: string
  ): Promise<boolean> {
    // Custom SMS provider integration
    const payload = {
      to: this.formatEthiopianNumber(to),
      message: message,
      from: this.config.senderId || "SolNet",
      // Add any additional custom provider specific parameters
    };

    try {
      const response = await axios.post(this.config.customEndpoint!, payload, {
        headers: {
          "Content-Type": "application/json",
          ...this.config.customHeaders,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error(
        "❌ Custom provider SMS error:",
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data || String(error)
      );
      return false;
    }
  }

  private formatEthiopianNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If it already has +, return as is
    if (phone.startsWith("+")) {
      return phone;
    }

    // For Ethiopian numbers (251 country code)
    if (cleaned.length === 12 && cleaned.startsWith("251")) {
      return `+${cleaned}`;
    }

    // For Ethiopian numbers without country code (9 digits starting with 9)
    if (cleaned.length === 9 && cleaned.startsWith("9")) {
      return `+251${cleaned}`;
    }

    // For Ethiopian numbers without country code (10 digits starting with 09)
    if (cleaned.length === 10 && cleaned.startsWith("09")) {
      return `+251${cleaned.substring(1)}`;
    }

    // Default: assume it's already in correct format
    return phone;
  }

  private formatMessage(template: string, device: DeviceInfo): string {
    const costInfo = device.totalCost
      ? `\n💰 አጠቃላይ ወጪ፦ ${device.totalCost} ብር`
      : "";
    const completionInfo = device.estimatedCompletionDate
      ? `\n📅 የተገመተ የመጨረሻ ቀን፦ ${new Date(
          device.estimatedCompletionDate
        ).toLocaleDateString("am-ET")}`
      : "";

    return template
      .replace(/{customerName}/g, device.customerName)
      .replace(/{customerPhone}/g, device.customerPhone)
      .replace(/{deviceType}/g, device.deviceType)
      .replace(/{brand}/g, device.brand)
      .replace(/{model}/g, device.model)
      .replace(/{problemDescription}/g, device.problemDescription)
      .replace(/{receiptNumber}/g, device.receiptNumber)
      .replace(/{status}/g, device.status)
      .replace(/{totalCost}/g, device.totalCost || "")
      .replace(/{costInfo}/g, costInfo)
      .replace(
        /{estimatedCompletionDate}/g,
        device.estimatedCompletionDate || ""
      )
      .replace(/{completionInfo}/g, completionInfo);
  }

  // SMS Templates for Ethiopian Business
  async sendDeviceRegistrationSMS(device: DeviceInfo): Promise<boolean> {
    try {
      // Get SMS templates from database
      const { storage } = await import("./storage.ts");
      const templates = await storage.getSMSTemplates();

      let template = templates[0]; // Use the first template
      if (!template) {
        // Fallback to default template if none found
        template = {
          deviceRegistration: `🔧 መሣሪያ ምዝገባ የተረጋገጠ ነው

ውድ {customerName}፣

የእርስዎ መሣሪያ ለጥገና አገልግሎት በተሳካተ ሁኔታ ተመዝግቧል።

📱 የመሣሪያ ዝርዝር፦
• አይነት፦ {deviceType}
• የምርት ስም፦ {brand}
• ሞዴል፦ {model}
• ችግር፦ {problemDescription}

🔢 የመከታተል ቁጥር፦ {receiptNumber}

የጥገና ሂደቱን እንደቀጥለን እንወቃለን። የመከታተል ቁጥሩን በመጠቀም የመሣሪያዎን ሁኔታ መከታተል ይችላሉ።

አገልግሎታችንን ስለመረጡ እናመሰግናለን!`,
        };
      }

      const message = this.formatMessage(template.deviceRegistration, device);
      return this.sendSMS(device.customerPhone, message);
    } catch (error) {
      return false;
    }
  }

  async sendDeviceStatusUpdateSMS(
    device: DeviceInfo,
    oldStatus: string
  ): Promise<boolean> {
    try {
      // Get SMS templates from database
      const { storage } = await import("./storage.ts");
      const templates = await storage.getSMSTemplates();

      let template = templates[0]; // Use the first template
      if (!template) {
        // Fallback to default template if none found
        template = {
          deviceStatusUpdate: `📱 የመሣሪያ ሁኔታ ዝመና

ውድ {customerName}፣

{statusMessage}

🔢 የመከታተል ቁጥር፦ {receiptNumber}
📱 መሣሪያ፦ {deviceType} {brand} {model}{costInfo}{completionInfo}

እባክዎ ትዕግስት ያድርጉ!`,
        };
      }

      const statusMessages: Record<string, string> = {
        diagnosed: "🔍 የእርስዎ መሣሪያ ተሰምሯል እና የጥገና እቅዱን እያዘጋጅን ነው።",
        in_progress: "⚙️ በእርስዎ መሣሪያ ላይ እያሰራን ነው።",
        waiting_parts: "📦 የጥገና ክፍሎች እስኪመጡ ድረስ እያጠበን ነው።",
        completed: "✅ የእርስዎ መሣሪያ ጥገና በተሳካተ ሁኔታ ተጠናቅቋል!",
        ready_for_pickup: "🎉 የእርስዎ መሣሪያ ለመውሰድ ዝግጁ ነው! እባክዎ እንድትመጡ እንጠይቃለን።",
        delivered: "📱 የእርስዎ መሣሪያ ተላክቷል። አገልግሎታችንን ስለመረጡ እናመሰግናለን!",
        cancelled: "❌ የእርስዎ መሣሪያ ጥገና ተሰርዟል። ለተጨማሪ መረጃ እባክዎ ያግኙን።",
      };

      const statusMessage =
        statusMessages[device.status] || "የመሣሪያዎ ሁኔታ ተዘምኗል።";

      // Add statusMessage to device object for template formatting
      const deviceWithStatus = {
        ...device,
        statusMessage: statusMessage,
      };

      const message = this.formatMessage(
        template.deviceStatusUpdate,
        deviceWithStatus
      );
      return this.sendSMS(device.customerPhone, message);
    } catch (error) {
      return false;
    }
  }

  async sendDeviceReadyForPickupSMS(device: DeviceInfo): Promise<boolean> {
    try {
      // Get SMS templates from database
      const { storage } = await import("./storage.ts");
      const templates = await storage.getSMSTemplates();

      let template = templates[0]; // Use the first template
      if (!template) {
        // Fallback to default template if none found
        template = {
          deviceReadyForPickup: `🎉 መሣሪያ ለመውሰድ ዝግጁ ነው!

ውድ {customerName}፣

የእርስዎ መሣሪያ ጥገና ተጠናቅቋል እና ለመውሰድ ዝግጁ ነው!

📱 መሣሪያ፦ {deviceType} {brand} {model}
🔢 የመከታተል ቁጥር፦ {receiptNumber}{costInfo}

እባክዎ መሣሪያዎን ሲወስዱ የመከታተል ቁጥሩን ያመጡ።

እርስዎን እንድናይ እንጠብቃለን!`,
        };
      }

      const message = this.formatMessage(template.deviceReadyForPickup, device);
      return this.sendSMS(device.customerPhone, message);
    } catch (error) {
      return false;
    }
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create and export the Ethiopian SMS service instance
let ethiopianSmsService: EthiopianSMSService | null = null;

// Initialize Ethiopian SMS service with database settings
async function initializeEthiopianSMSService() {
  try {
    console.log("🔧 Initializing Ethiopian SMS service...");
    const { storage } = await import("./storage.ts");
    const settings = await storage.getEthiopianSMSSettings();

    console.log("📱 Ethiopian SMS Settings from database:", {
      provider: settings.provider || "NOT SET",
      senderId: settings.senderId || "NOT SET",
    });

    if (!settings.provider) {
      console.log("⚠️ Ethiopian SMS settings incomplete");
      ethiopianSmsService = new EthiopianSMSService({
        provider: "africas_talking",
        username: process.env.ETHIOPIAN_SMS_USERNAME || "",
        apiKey: process.env.ETHIOPIAN_SMS_API_KEY || "",
        senderId: process.env.ETHIOPIAN_SMS_SENDER_ID || "SolNet",
        baseUrl: process.env.ETHIOPIAN_SMS_BASE_URL || "",
      });
    } else {
      console.log("✅ Using database Ethiopian SMS settings");
      ethiopianSmsService = new EthiopianSMSService({
        provider: settings.provider as any,
        username: settings.username,
        password: settings.password,
        apiKey: settings.apiKey,
        senderId: settings.senderId,
        baseUrl: settings.baseUrl,
        customEndpoint: settings.customEndpoint,
        customHeaders: settings.customHeaders
          ? JSON.parse(settings.customHeaders)
          : undefined,
      });
    }
  } catch (error) {
    // Fallback to environment variables
    ethiopianSmsService = new EthiopianSMSService({
      provider: "africas_talking",
      username: process.env.ETHIOPIAN_SMS_USERNAME || "",
      apiKey: process.env.ETHIOPIAN_SMS_API_KEY || "",
      senderId: process.env.ETHIOPIAN_SMS_SENDER_ID || "SolNet",
      baseUrl: process.env.ETHIOPIAN_SMS_BASE_URL || "",
    });
  }
}

// Export a function to get the Ethiopian SMS service instance
export async function getEthiopianSMSService(): Promise<EthiopianSMSService> {
  if (!ethiopianSmsService) {
    await initializeEthiopianSMSService();
  }
  return ethiopianSmsService!;
}

export { EthiopianSMSService, type EthiopianSMSConfig, type DeviceInfo };
