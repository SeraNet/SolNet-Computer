import type { Express } from "express";
import jwt from "jsonwebtoken";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AnalyticsDataOrganizer } from "./analytics-data-organizer";
import { db } from "./db";
import { SystemMonitor } from "./system-monitor";
import { NotificationService } from "./notification-service";
import QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import {
  appointments,
  devices,
  users,
  notificationTypes,
  customers,
  notificationTemplates,
  smsQueue,
} from "@shared/schema";
import { accessories } from "@shared/schema";
import {
  insertCustomerSchema,
  insertDeviceSchema,
  insertInventoryItemSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertAppointmentSchema,
  insertDeviceTypeSchema,
  insertBrandSchema,
  insertModelSchema,
  insertServiceTypeSchema,
  insertLocationSchema,
  insertUserSchema,
  insertBusinessProfileSchema,
  insertExpenseSchema,
  insertExpenseCategorySchema,
  insertCustomerMessageSchema,
  insertSupplierSchema,
  feedbackSchema,
  insertPredefinedProblemSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import {
  utils as ExcelUtils,
  setColumnWidths,
  XLSXWorksheet,
  XLSXWorkbook,
  createWorksheetFromJson,
  writeWorkbookToBuffer,
} from "./utils/excel-helper";
import * as ExcelJS from "exceljs";
import { sql, eq, desc } from "drizzle-orm";
import path from "path";
import * as fs from "fs";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";
import {
  validateLocationAccess,
  enforceLocationOwnership,
  authenticateAndFilter,
  authenticateUser,
  AuthenticatedRequest,
} from "./middleware/locationAuth";
import { authLimiter, apiLimiter, authenticatedLimiter } from "./middleware/rateLimiter";
import { asyncHandler } from "./middleware/errorHandler";
import { NotFoundError, AuthorizationError, ValidationError } from "./utils/errors";
import { validateBody, validateParams, validateQuery, commonSchemas } from "./middleware/validation";
import { parsePaginationParams, createPaginatedResponse, isPaginationRequested } from "./utils/pagination";
import { importValidator } from "./utils/import-validator";

export async function registerRoutes(app: Express): Promise<Server> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });
  // Enhanced file upload validation middleware with security checks
  const validateFileUpload = (req: any, res: any, next: any) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Whitelist allowed MIME types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      logger.warn('Invalid file type uploaded', {
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({
        message: "Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed",
        receivedType: req.file.mimetype,
      });
    }

    // 2. Validate file extension matches MIME type
    const ext = path.extname(req.file.originalname).toLowerCase();
    const validExtensions: { [key: string]: string[] } = {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/jpg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    };

    if (!validExtensions[req.file.mimetype]?.includes(ext)) {
      logger.warn('File extension mismatch', {
        extension: ext,
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({
        message: "File extension does not match content type",
        extension: ext,
        mimeType: req.file.mimetype,
      });
    }

    // 3. Sanitize filename - remove special characters and limit length
    const sanitizedName = req.file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 255);
    req.file.originalname = sanitizedName;

    // 4. Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      logger.warn('File too large uploaded', {
        size: req.file.size,
        maxSize,
        filename: req.file.originalname,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({
        message: "File too large. Maximum size is 10MB",
        receivedSize: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
        maxSize: "10MB",
      });
    }

    // 5. Verify file content matches declared type (magic bytes)
    if (req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf') {
      const fileSignatures: { [key: string]: number[] } = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/jpg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46],
        'application/pdf': [0x25, 0x50, 0x44, 0x46],
      };

      const signature = fileSignatures[req.file.mimetype];
      if (signature) {
        const headerBytes = Array.from(req.file.buffer.slice(0, signature.length));
        const matches = signature.every((byte, i) => headerBytes[i] === byte);

        if (!matches) {
          logger.warn('File header mismatch - possible file type spoofing', {
            expectedType: req.file.mimetype,
            filename: req.file.originalname,
            userId: req.user?.userId,
            ip: req.ip,
            headerBytes: headerBytes.map((b: unknown) => `0x${(b as number).toString(16).toUpperCase()}`),
          });
          return res.status(400).json({
            message: "File content does not match declared type",
          });
        }
      }
    }

    // 6. Log successful upload validation for security audit
    logger.info('File upload validated successfully', {
      filename: sanitizedName,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user?.userId,
      ip: req.ip,
    });

    next();
  };
  // Serve static files from uploads directory
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(process.cwd(), "uploads", req.path);
    console.log("Request path:", req.path);
    // List all files in uploads directory for debugging
    try {
      const files = fs.readdirSync(path.join(process.cwd(), "uploads"));
      console.log("Looking for file matching:", req.path);
      // Check if any file matches the requested path (case-insensitive)
      const matchingFile = files.find(
        (file) =>
          file.toLowerCase() === req.path.replace("/", "").toLowerCase() ||
          file.replace(/\s+/g, "") ===
            req.path.replace("/", "").replace(/\s+/g, "")
      );
      if (matchingFile) {
        const actualFilePath = path.join(
          process.cwd(),
          "uploads",
          matchingFile
        );
        // CORS headers already handled by middleware
        res.sendFile(actualFilePath);
        return;
      }
    } catch (error) {
      logger.warn('File not found, trying fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestedPath: (req.params as any)[0],
      });
    }
    if (fs.existsSync(filePath)) {
      // CORS headers already handled by middleware
      res.sendFile(filePath);
    } else {
      next();
    }
  });
  function getAuthPayload(req: any, res: any): any | null {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }
    const token = authHeader.slice(7);
    try {
      return jwt.verify(token, JWT_SECRET!) as any;
    } catch {
      res.status(401).json({ message: "Invalid token" });
      return null;
    }
  }
  function enforceRole(
    payload: any,
    res: any,
    roles: Array<"admin" | "technician" | "sales">
  ): boolean {
    if (!payload || !roles.includes(payload.role)) {
      res.status(403).json({ message: "Forbidden" });
      return false;
    }
    return true;
  }
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection
      await db.execute(sql`SELECT 1`);

      res.status(200).json({
        status: "ok",
        env: process.env.NODE_ENV,
        time: new Date().toISOString(),
        database: "connected",
        version: "1.0.0",
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        env: process.env.NODE_ENV,
        time: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Public API endpoints (no authentication required)
  app.get("/api/public/business-info", async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business info" });
    }
  });
  app.get("/api/public/track-device/:trackingCode", async (req, res) => {
    try {
      const { trackingCode } = req.params;

      // Search for device by receipt number first, then fallback to old methods
      let device;
      try {
        // First, try to find by receipt number (most efficient)
        if (trackingCode.startsWith("SolNet-")) {
          device = await storage.getDeviceByReceiptNumber(trackingCode);
        }

        // If not found by receipt number, try legacy methods
        if (!device) {
          if (trackingCode.startsWith("SolNet-")) {
            // New tracking code format: SolNet-MMDDXX
            const shortId = trackingCode.slice(-2); // Last 2 characters after SolNet-MMDD
            const devices = await storage.getDevices();
            device = devices.find((d: any) => d.id.slice(-2) === shortId);
          } else if (trackingCode.length === 8) {
            // Legacy 8-character tracking code - search devices where ID ends with this code
            const devices = await storage.getDevices();
            device = devices.find(
              (d: any) =>
                d.id.slice(-8).toUpperCase() === trackingCode.toUpperCase()
            );
          } else {
            // Full device ID provided
            device = await storage.getDevice(trackingCode);
          }
        }
      } catch (storageError) {
        console.error("Storage error:", storageError);
        return res.status(500).json({
          error: "Unable to search for device. Please try again later.",
        });
      }

      if (!device) {
        return res.status(404).json({
          error: "Device not found. Please check your tracking code.",
        });
      }

      // Create notification for device tracking (when customer views device status)
      try {
        // Get all admin users to notify
        const adminUsers = await storage.getUsers();
        const adminUsersList = adminUsers.filter(
          (user: any) => user.role === "admin"
        );

        for (const adminUser of adminUsersList) {
          await NotificationService.createDeviceNotification(
            "device_tracked",
            device.id,
            adminUser.id,
            {
              trackedAt: new Date().toISOString(),
              trackingCode: trackingCode,
              customerName: device.customerName,
              deviceType: device.deviceType,
              status: device.status,
            }
          );
        }
        console.log("✅ Device tracking notification created successfully");
      } catch (notificationError) {
        console.error(
          "Error creating device tracking notification:",
          notificationError
        );
        // Don't fail the tracking if notification fails
      }

      // Return public-safe device info with all necessary details
      res.json({
        customerName: device.customerName || "Unknown",
        deviceType: device.deviceType || "Device",
        brand: device.brand || "Unknown Brand",
        model: device.model || "Not specified",
        serviceType: device.serviceType || "General Service",
        deviceDescription: `${device.deviceType || "Device"} - ${
          device.brand || "Unknown Brand"
        } ${device.model || ""}`,
        status: device.status || "registered",
        updatedAt: device.updatedAt || device.createdAt,
        trackingCode:
          device.receiptNumber ||
          (() => {
            const date = device.createdAt
              ? new Date(device.createdAt)
              : new Date();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const shortId = device.id.slice(-2);
            return `SolNet-${month}${day}${shortId}`;
          })(),
      });
    } catch (error) {
      res.status(500).json({
        error: "Unable to track device. Please try again later.",
      });
    }
  });
  // Authentication endpoints
  // Test route
  app.get("/api/test", (req, res) => {
    res.json({
      message: "Server is working",
      timestamp: new Date().toISOString(),
    });
  });

  // Apply rate limiting to login endpoint
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          locationId: user.locationId,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      // Create welcome notification (temporarily disabled for debugging)
      /*
      try {
        await NotificationService.createNotification({
          typeName: "system_alert",
          recipientId: user.id,
          title: "Welcome Back!",
          message: `Welcome back, ${
            user.firstName || user.username
          }! You have successfully logged into the SolNet Management System.`,
          priority: "normal",
          data: { loginTime: new Date().toISOString() },
        });
      } catch (error) {
        console.error("Failed to create welcome notification:", error);
      }
      */

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          locationId: user.locationId,
          isActive: user.isActive,
        },
        token,
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "No token provided" });
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUser(payload.id);
      if (!user || !user.isActive)
        return res.status(401).json({ message: "Invalid token" });
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });
  // Locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  app.get("/api/locations/active", async (req, res) => {
    try {
      const locations = await storage.getActiveLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active locations" });
    }
  });
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });
  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });
  app.put("/api/locations/:id", async (req, res) => {
    try {
      const locationData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(
        req.params.id,
        locationData
      );
      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location" });
    }
  });
  // Dashboard stats - keeping only one version
  app.get(
    "/api/dashboard/stats",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const stats = await storage.getDashboardStats(req.locationFilter);
        res.json(stats);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
      }
    }
  );

  // Device status distribution for pie chart
  app.get(
    "/api/dashboard/device-status-distribution",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const distribution = await storage.getDeviceStatusDistribution(req.locationFilter);
        res.json(distribution);
      } catch (error) {
        console.error("Error fetching device status distribution:", error);
        res.status(500).json({ message: "Failed to fetch device status distribution" });
      }
    }
  );

  // Recent activities for dashboard
  app.get(
    "/api/dashboard/recent-activities",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const activities = await storage.getRecentActivities(
          req.user.id,
          req.locationFilter
        );
        res.json(activities);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch recent activities" });
      }
    }
  );

  // Top services analytics for dashboard
  app.get(
    "/api/dashboard/top-services",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const services = await storage.getTopServices(req.locationFilter);
        res.json(services);
      } catch (error) {
        console.error("Error fetching top services:", error);
        res.status(500).json({ message: "Failed to fetch top services" });
      }
    }
  );
  // Customers - consolidated with location filtering
  app.get(
    "/api/customers",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const { search } = req.query;
        let customers;
        if (search && typeof search === "string") {
          customers = await storage.searchCustomers(search);
        } else {
          customers = await storage.getCustomers(req.locationFilter);
        }
        res.json(customers);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch customers" });
      }
    }
  );
  // Public customer search endpoint for device registration and customer portal
  app.get("/api/public/customers/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const customers = await storage.searchCustomers(q);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to search customers" });
    }
  });

  // Public customers endpoint for frontend (no authentication required)
  app.get("/api/public/customers", async (req, res) => {
    try {
      const { search } = req.query;
      let customers;
      if (search && typeof search === "string") {
        customers = await storage.searchCustomers(search);
      } else {
        customers = await storage.getCustomers();
      }
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Simple test endpoint
  app.get("/api/test", (req, res) => {
    res.json({
      message: "Server is working",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/customers/:id", asyncHandler(async (req: any, res: any) => {
    const customer = await storage.getCustomer(req.params.id);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    res.json(customer);
  }));
  app.get("/api/customers/:id/devices", async (req, res) => {
    try {
      const devices = await storage.getCustomerDevices(req.params.id);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer devices" });
    }
  });
  app.get("/api/customers/:id/sales", async (req, res) => {
    try {
      const customerId = req.params.id;
      const sales = await storage.getSalesByCustomerId(customerId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer sales" });
    }
  });
  app.get("/api/customers/:id/loan-invoices", async (req, res) => {
    try {
      const customerId = req.params.id;
      const invoices = await storage.getLoanInvoicesByCustomerId(customerId);
      res.json(invoices);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch customer loan invoices" });
    }
  });
  app.get("/api/customers/:id/appointments", async (req, res) => {
    try {
      const customerId = req.params.id;
      const appointments = await storage.getAppointmentsByCustomerId(
        customerId
      );
      res.json(appointments);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch customer appointments" });
    }
  });
  // Search customer by phone number
  app.get("/api/customers/search/phone", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { phone } = req.query;
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      const customer = await storage.getCustomerByPhone(phone as string);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to search customer" });
    }
  });
  app.post(
    "/api/customers",
    authenticateAndFilter,
    validateBody(insertCustomerSchema),
    asyncHandler(async (req: any, res: any) => {
      // req.body is now validated and sanitized
      const customerData = req.body;
      console.log("🔄 Creating customer with data:", JSON.stringify(customerData, null, 2));

      // Add location ID from the authenticated user
      if (req.user && req.user.locationId) {
        customerData.locationId = req.user.locationId;
      } else if (req.locationFilter && req.locationFilter.locationId) {
        customerData.locationId = req.locationFilter.locationId;
      }

      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    })
  );
  app.put(
    "/api/customers/:id",
    authenticateAndFilter,
    validateParams(commonSchemas.idParam),
    validateBody(insertCustomerSchema.partial()),
    asyncHandler(async (req: any, res: any) => {
      const customer = await storage.updateCustomer(req.params.id, req.body);
      if (!customer) {
        throw new NotFoundError('Customer');
      }
      res.json(customer);
    })
  );
  // Devices - consolidated
  app.get("/api/devices", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    // Check if pagination is requested
    if (isPaginationRequested(req.query)) {
      const paginationParams = parsePaginationParams(req.query);
      const allDevices = await storage.getDevices(req.locationFilter);
      
      // Apply pagination manually (until storage layer is updated)
      const offset = (paginationParams.page! - 1) * paginationParams.limit!;
      const paginatedData = allDevices.slice(offset, offset + paginationParams.limit!);
      
      const response = createPaginatedResponse(
        paginatedData,
        allDevices.length,
        paginationParams.page!,
        paginationParams.limit!
      );
      
      res.json(response);
    } else {
      const devices = await storage.getDevices(req.locationFilter);
      res.json(devices);
    }
  }));
  app.get(
    "/api/devices/active-repairs",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const repairs = await storage.getActiveRepairs(req.locationFilter);
        res.json(repairs);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch active repairs" });
      }
    }
  );
  app.get(
    "/api/devices/outstanding-services",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const services = await storage.getOutstandingServices(
          req.locationFilter
        );
        res.json(services);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch outstanding services" });
      }
    }
  );
  app.get(
    "/api/sales/outstanding",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const sales = await storage.getOutstandingSales(req.locationFilter);
        res.json(sales);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch outstanding sales" });
      }
    }
  );
  app.get("/api/devices/:id", async (req, res) => {
    try {
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });
  app.post("/api/devices", authenticateAndFilter, async (req: any, res) => {
    try {
      console.log("🔧 Device registration request received:", req.body);

      // Convert ID references to text values for the schema
      const processedData = { ...req.body };

      // If deviceTypeId is provided, get the device type name
      if (processedData.deviceTypeId) {
        const deviceType = await storage.getDeviceType(
          processedData.deviceTypeId
        );
        processedData.deviceType =
          deviceType?.name || processedData.deviceTypeId;
      }

      // If brandId is provided, get the brand name
      if (processedData.brandId) {
        const brand = await storage.getBrand(processedData.brandId);
        processedData.brand = brand?.name || processedData.brandId;
      }

      // If modelId is provided, get the model name
      if (processedData.modelId) {
        const model = await storage.getModel(processedData.modelId);
        processedData.model = model?.name || processedData.modelId;
      }

      // Map frontend service type IDs to database service type IDs
      if (processedData.serviceTypeId) {
        console.log(`🔍 Mapping serviceTypeId: ${processedData.serviceTypeId}`);

        // Map frontend default IDs to actual database IDs
        const serviceTypeMapping: Record<string, string> = {
          "default-1": "993d5477-d341-49fa-b162-527ce423cd3d", // Software Development
          "default-2": "ee5a8506-ed97-4217-ac58-351343ce109a", // Installation
          "default-3": "0998ae35-fcb7-452c-86ed-8c1e2e016daf", // Maintenance
        };

        const serviceTypeId = String(processedData.serviceTypeId);
        const mappedId = serviceTypeMapping[serviceTypeId];
        if (mappedId) {
          console.log(`✅ Mapped ${serviceTypeId} to ${mappedId}`);
          processedData.serviceTypeId = mappedId;
        } else {
          console.log(
            `⚠️ Unknown serviceTypeId: ${serviceTypeId}, removing it`
          );
          delete processedData.serviceTypeId;
        }
      }

      const deviceData = insertDeviceSchema.parse(processedData);

      // Add location ID from the authenticated user
      if (req.user && req.user.locationId) {
        deviceData.locationId = req.user.locationId;
      } else if (req.locationFilter && req.locationFilter.locationId) {
        deviceData.locationId = req.locationFilter.locationId;
      }

      console.log("🔧 Processed device data:", deviceData);
      console.log("🔍 serviceTypeId in final data:", deviceData.serviceTypeId);

      const device = await storage.createDevice(deviceData);
      console.log("✅ Device created successfully:", device.id);

      // Create notification for device registration
      try {
        console.log("🔔 Creating device registration notifications...");

        // Get all admin users to notify
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));

        console.log(`📧 Found ${adminUsers.length} admin users to notify`);

        for (const adminUser of adminUsers) {
          console.log(
            `📨 Creating notification for admin user: ${adminUser.id}`
          );
          await NotificationService.createDeviceNotification(
            "device_registered",
            device.id,
            adminUser.id,
            {
              registeredBy: req.user?.id || "system",
              priority: deviceData.priority || "normal",
            }
          );
        }

        console.log(
          "✅ Device registration notifications created successfully"
        );
      } catch (notificationError) {
        console.error(
          "❌ Error creating device registration notification:",
          notificationError
        );
        // Don't fail the device creation if notification fails
      }
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({
        message: "Failed to create device",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  app.put("/api/devices/:id", async (req, res) => {
    try {
      const updates = insertDeviceSchema.partial().parse(req.body);
      const device = await storage.updateDevice(req.params.id, updates);
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update device" });
    }
  });
  app.put("/api/devices/:id/status", async (req, res) => {
    try {
      const { status, notes, userId, paymentStatus } = req.body;

      // Prepare updates object
      const updates: any = { status, notes, userId };

      // Auto-update payment status for completed/delivered devices
      if (status === "completed" || status === "delivered") {
        if (paymentStatus) {
          updates.paymentStatus = paymentStatus;
        } else {
          // If no payment status provided, check if payment is required
          const currentDevice = await storage.getDevice(req.params.id);
          if (
            currentDevice &&
            currentDevice.totalCost &&
            parseFloat(currentDevice.totalCost) > 0
          ) {
            // If device has a cost and status is delivered, mark as paid
            if (status === "delivered") {
              updates.paymentStatus = "paid";
            } else {
              // For completed status, payment is likely required
              updates.paymentStatus = "pending";
            }
          } else {
            // If no cost, mark as paid
            updates.paymentStatus = "paid";
          }
        }
      }

      const device = await storage.updateDeviceStatus(
        req.params.id,
        status,
        notes,
        userId,
        updates.paymentStatus
      );

      // Create notification for device status update
      try {
        // Get all admin users to notify
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));
        for (const adminUser of adminUsers) {
          await NotificationService.createDeviceNotification(
            "device_status_update",
            device.id,
            adminUser.id,
            {
              updatedBy: userId || "system",
              oldStatus: device.status,
              newStatus: status,
              paymentStatus: device.paymentStatus,
              notes: notes || "",
            }
          );
        }
      } catch (notificationError) {
        console.error(
          "Error creating device status notification:",
          notificationError
        );
        // Don't fail the status update if notification fails
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device status" });
    }
  });

  // Update device payment status
  app.put("/api/devices/:id/payment", async (req, res) => {
    try {
      const { paymentStatus, notes, userId } = req.body;

      if (
        !paymentStatus ||
        !["pending", "paid", "partial", "refunded"].includes(paymentStatus)
      ) {
        return res.status(400).json({
          message:
            "Invalid payment status. Must be: pending, paid, partial, or refunded",
        });
      }

      const device = await storage.updateDevice(req.params.id, {
        paymentStatus: paymentStatus as any,
        ...(notes && { technicianNotes: notes }),
        updatedAt: new Date(),
      });

      // Create notification for payment status update
      try {
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));
        for (const adminUser of adminUsers) {
          await NotificationService.createDeviceNotification(
            "payment_status_update",
            device.id,
            adminUser.id,
            {
              updatedBy: userId || "system",
              paymentStatus: paymentStatus,
              notes: notes || "",
            }
          );
        }
      } catch (notificationError) {
        console.error(
          "Error creating payment notification:",
          notificationError
        );
      }

      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Get device cost information (actual vs estimated)
  app.get("/api/devices/:id/cost", async (req, res) => {
    try {
      const costInfo = await storage.getDeviceCost(req.params.id);
      res.json(costInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to get device cost" });
    }
  });
  // Customer messages endpoint for landing page
  app.post("/api/customer-messages", async (req, res) => {
    try {
      const messageData = insertCustomerMessageSchema.parse(req.body);
      const message = await storage.createCustomerMessage(messageData);

      // Create notification for customer message
      try {
        // Get all admin users to notify
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));

        for (const adminUser of adminUsers) {
          await NotificationService.createNotification({
            typeName: "customer_message",
            recipientId: adminUser.id,
            title: "New Customer Message",
            message: `New message received from ${
              messageData.name || "Customer"
            }: ${messageData.message?.substring(0, 100)}${
              messageData.message && messageData.message.length > 100
                ? "..."
                : ""
            }`,
            priority: "normal",
            data: {
              messageId: message.id,
              customerName: messageData.name,
              customerEmail: messageData.email,
              customerPhone: messageData.phone,
              message: messageData.message,
              subject: messageData.subject,
            },
            relatedEntityType: "customer_message",
            relatedEntityId: message.id,
          });
        }
        console.log("✅ Customer message notifications created successfully");
      } catch (notificationError) {
        console.error(
          "Error creating customer message notification:",
          notificationError
        );
        // Don't fail the message creation if notification fails
      }

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  // SMS settings endpoints
  app.get("/api/settings/sms", async (req, res) => {
    try {
      const settings = await storage.getSMSSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get SMS settings" });
    }
  });
  app.post("/api/settings/sms", async (req, res) => {
    try {
      const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = req.body;
      if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
        return res.status(400).json({
          message: "All Twilio configuration fields are required",
        });
      }
      // Save to database
      await storage.updateSMSSettings({
        twilioAccountSid,
        twilioAuthToken,
        twilioFromNumber,
      });
      res.json({
        success: true,
        message: "SMS settings saved successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save SMS settings" });
    }
  });
  // SMS test endpoint (Twilio)
  app.post("/api/sms/test", async (req, res) => {
    try {
      // Import SMS service dynamically
      const { getSMSService } = await import("./sms-service.ts");
      const smsService = await getSMSService();
      if (!smsService.isServiceEnabled()) {
        return res.status(400).json({
          success: false,
          message:
            "SMS service is not configured. Please check your Twilio settings.",
        });
      }
      // Send a test SMS to a default number (you can modify this)
      const testDevice = {
        id: "test-device",
        receiptNumber: "TEST123",
        customerName: "Test Customer",
        customerPhone: process.env.TEST_SMS_NUMBER || "+251926545505", // Add this to your .env
        deviceType: "Test Device",
        brand: "Test Brand",
        model: "Test Model",
        problemDescription: "Test problem description",
        status: "registered",
      };
      const success = await smsService.sendDeviceRegistrationSMS(testDevice);
      if (success) {
        res.json({
          success: true,
          message: "Test SMS sent successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send test SMS",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to send test SMS",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Ethiopian SMS test endpoint
  app.post("/api/ethiopian-sms/test", async (req, res) => {
    try {
      // Import Ethiopian SMS service dynamically
      const { getEthiopianSMSService } = await import(
        "./ethiopian-sms-service.ts"
      );
      const ethiopianSmsService = await getEthiopianSMSService();
      if (!ethiopianSmsService.isServiceEnabled()) {
        return res.status(400).json({
          success: false,
          message:
            "Ethiopian SMS service is not configured. Please check your local SMS provider settings.",
        });
      }
      // Send a test SMS to a default number (you can modify this)
      const testDevice = {
        id: "test-device",
        receiptNumber: "TEST123",
        customerName: "የምሳሌ ደንበኛ",
        customerPhone: process.env.TEST_SMS_NUMBER || "+251926545505",
        deviceType: "ስልክ",
        brand: "Samsung",
        model: "Galaxy S21",
        problemDescription: "ስክሪን ችግር",
        status: "registered",
      };
      const success = await ethiopianSmsService.sendDeviceRegistrationSMS(
        testDevice
      );
      if (success) {
        res.json({
          success: true,
          message: "Ethiopian test SMS sent successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send Ethiopian test SMS",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to send Ethiopian test SMS",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Ethiopian SMS settings endpoints
  app.get(
    "/api/ethiopian-sms-settings",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const settings = await storage.getEthiopianSMSSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch Ethiopian SMS settings",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // SMS Templates endpoints
  app.get(
    "/api/sms-templates",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const templates = await storage.getSMSTemplates();
        res.json(templates);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch SMS templates",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.put(
    "/api/sms-templates",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const templates = req.body;
        await storage.updateSMSTemplates(templates);
        res.json({ message: "SMS templates updated successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update SMS templates",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/sms-templates/reset",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { language } = req.body;
        await storage.resetSMSTemplates(language);
        res.json({ message: "SMS templates reset successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to reset SMS templates",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // SMS Campaigns endpoints
  app.get(
    "/api/sms-campaigns",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const campaigns = await storage.getSMSCampaigns();
        res.json(campaigns);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch SMS campaigns",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/sms-campaigns/send",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const campaignData = req.body;
        // Create campaign
        const campaign = await storage.createSMSCampaign(campaignData);
        // Send campaign immediately
        await storage.sendSMSCampaign(campaign.id);
        res.json({
          message: "SMS campaign sent successfully",
          campaignId: campaign.id,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to send SMS campaign",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/sms-campaigns/schedule",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const campaignData = req.body;
        // Create campaign (will be scheduled)
        const campaign = await storage.createSMSCampaign(campaignData);
        res.json({
          message: "SMS campaign scheduled successfully",
          campaignId: campaign.id,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to schedule SMS campaign",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Update SMS campaign
  app.put(
    "/api/sms-campaigns/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const campaignData = req.body;
        const updatedCampaign = await storage.updateSMSCampaign(
          id,
          campaignData
        );
        res.json({
          message: "SMS campaign updated successfully",
          campaign: updatedCampaign,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update SMS campaign",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Delete SMS campaign
  app.delete(
    "/api/sms-campaigns/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        await storage.deleteSMSCampaign(id);
        res.json({
          message: "SMS campaign deleted successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete SMS campaign",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Recipient Groups API
  app.get(
    "/api/recipient-groups",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const groups = await storage.getRecipientGroups();
        res.json(groups);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch recipient groups",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/recipient-groups",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const groupData = req.body;
        const group = await storage.createRecipientGroup(groupData);
        res.json({
          message: "Recipient group created successfully",
          group,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create recipient group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.put(
    "/api/recipient-groups/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const groupData = req.body;
        const updatedGroup = await storage.updateRecipientGroup(id, groupData);
        res.json({
          message: "Recipient group updated successfully",
          group: updatedGroup,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update recipient group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.delete(
    "/api/recipient-groups/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        await storage.deleteRecipientGroup(id);
        res.json({
          message: "Recipient group deleted successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete recipient group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.get(
    "/api/recipient-groups/:id/customers",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const customers = await storage.getCustomersInGroup(id);
        res.json(customers);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch customers in group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.get(
    "/api/recipient-groups/member-counts",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const counts = await storage.getAllGroupMemberCounts();
        res.json(counts);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch group member counts",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/recipient-groups/:groupId/customers/:customerId",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { groupId, customerId } = req.params;
        await storage.addCustomerToGroup(groupId, customerId);
        res.json({
          message: "Customer added to group successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to add customer to group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.delete(
    "/api/recipient-groups/:groupId/customers/:customerId",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { groupId, customerId } = req.params;
        await storage.removeCustomerFromGroup(groupId, customerId);
        res.json({
          message: "Customer removed from group successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to remove customer from group",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.put(
    "/api/ethiopian-sms-settings",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const settings = req.body;
        await storage.updateEthiopianSMSSettings(settings);
        res.json({ message: "Ethiopian SMS settings updated successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update Ethiopian SMS settings",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Customer feedback endpoints
  app.get(
    "/api/customer-feedback",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const feedback = await storage.getAllCustomerFeedback(
          req.locationFilter
        );
        res.json(feedback);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch feedback",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Public business statistics (for landing page)
  app.get("/api/public/business-statistics", async (req: any, res) => {
    try {
      const stats = await storage.getBusinessStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch business statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Protected business statistics (for admin dashboard)
  app.get(
    "/api/business-statistics",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const stats = await storage.getBusinessStatistics(req.locationFilter);
        res.json(stats);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch business statistics",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Individual service management export routes
  app.get(
    "/api/export/service-types",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const serviceTypes = await storage.getServiceTypes();
        const workbook = ExcelUtils.book_new();
        const worksheet = ExcelUtils.json_to_sheet(
          serviceTypes.map((st) => ({
            name: st.name,
            description: st.description || "",
            category: st.category,
            estimatedDuration: st.estimatedDuration || "",
            basePrice: st.basePrice || "",
            isPublic: st.isPublic,
            features: st.features ? JSON.stringify(st.features) : "",
            requirements: st.requirements
              ? JSON.stringify(st.requirements)
              : "",
            warranty: st.warranty || "",
            imageUrl: st.imageUrl || "",
            isActive: st.isActive,
            sortOrder: st.sortOrder,
            createdAt: st.createdAt,
            updatedAt: st.updatedAt,
          }))
        );
        // Note: Column width setting is not supported in ExcelJS, removing worksheet["!cols"]
        ExcelUtils.book_append_sheet(workbook, worksheet, "Service Types");
        const buffer = await ExcelUtils.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=service-types.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/brands",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const brands = await storage.getBrands();
        const { workbook, worksheet } = createWorksheetFromJson(
          brands.map((brand) => ({
            name: brand.name,
            description: brand.description || "",
            website: brand.website || "",
            isActive: brand.isActive,
            createdAt: brand.createdAt,
          })),
          "Brands"
        );
        const buffer = await writeWorkbookToBuffer(workbook);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=brands.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/device-types",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const deviceTypes = await storage.getDeviceTypes();
        const { workbook, worksheet } = createWorksheetFromJson(
          deviceTypes.map((dt) => ({
            name: dt.name,
            description: dt.description || "",
            isActive: dt.isActive,
            createdAt: dt.createdAt,
          })),
          "Device Types"
        );
        const buffer = await writeWorkbookToBuffer(workbook);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=device-types.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/models",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const models = await storage.getModels();
        const { workbook, worksheet } = createWorksheetFromJson(
          models.map((model) => ({
            name: model.name,
            brandId: model.brandId,
            deviceTypeId: model.deviceTypeId,
            description: model.description || "",
            specifications: model.specifications || "",
            releaseYear: model.releaseYear || "",
            isActive: model.isActive,
            createdAt: model.createdAt,
          })),
          "Models"
        );
        const buffer = await writeWorkbookToBuffer(workbook);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=models.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/accessories",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const accessories = await storage.getAccessories();
        const { workbook, worksheet } = createWorksheetFromJson(
          accessories.map((acc) => ({
            name: acc.name,
            sku: acc.sku,
            description: acc.description || "",
            category: acc.category,
            brand: acc.brand || "",
            model: acc.model || "",
            purchasePrice: acc.purchasePrice || "",
            salePrice: acc.salePrice,
            quantity: acc.quantity,
            minStockLevel: acc.minStockLevel,
            reorderPoint: acc.reorderPoint,
            reorderQuantity: acc.reorderQuantity,
            isPublic: acc.isPublic,
            isActive: acc.isActive,
            sortOrder: acc.sortOrder,
            imageUrl: acc.imageUrl || "",
            specifications: acc.specifications
              ? JSON.stringify(acc.specifications)
              : "",
            compatibility: acc.compatibility
              ? JSON.stringify(acc.compatibility)
              : "",
            warranty: acc.warranty || "",
            createdAt: acc.createdAt,
            updatedAt: acc.updatedAt,
          })),
          "Accessories"
        );
        const buffer = await writeWorkbookToBuffer(workbook);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=accessories.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.post("/api/customer-feedback", async (req, res) => {
    try {
      const feedbackData = req.body;
      // Validate required fields
      if (
        !feedbackData.name ||
        !feedbackData.phone ||
        !feedbackData.serviceType
      ) {
        console.log("❌ Missing required fields:", {
          name: !!feedbackData.name,
          phone: !!feedbackData.phone,
          serviceType: !!feedbackData.serviceType,
        });
        return res.status(400).json({
          message: "Missing required fields: name, phone, serviceType",
        });
      }
      console.log("📝 Customer Name:", feedbackData.name);
      const feedback = await storage.createLandingPageFeedback(feedbackData);
      // Create notification for customer feedback
      try {
        // Get all admin users to notify
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));
        for (const adminUser of adminUsers) {
          await NotificationService.createCustomerFeedbackNotification(
            feedback.id,
            adminUser.id,
            {
              customerName: feedbackData.name,
              customerEmail: feedbackData.email,
              serviceType: feedbackData.serviceType,
              rating: feedbackData.rating,
              comment: feedbackData.reviewText,
            }
          );
        }
        console.log("✅ Customer feedback notifications created successfully");
      } catch (notificationError) {
        console.error(
          "Error creating customer feedback notification:",
          notificationError
        );
        // Don't fail the feedback creation if notification fails
      }
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  app.post(
    "/api/customer-feedback/:id/respond",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { response } = req.body;
        if (!response || !response.trim()) {
          return res.status(400).json({ message: "Response text is required" });
        }
        const updatedFeedback = await storage.respondToFeedback(
          id,
          response.trim()
        );
        res.json(updatedFeedback);
      } catch (error) {
        res.status(500).json({
          message: "Failed to respond to feedback",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.delete(
    "/api/customer-feedback/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        await storage.deleteFeedback(id);
        res.status(200).json({ message: "Feedback deleted successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete feedback",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Test endpoint
  app.get("/api/test", async (req, res) => {
    try {
      res.json({
        message: "Test endpoint working",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Test endpoint failed" });
    }
  });
  // Inventory - consolidated
  app.get("/api/inventory", async (req: any, res) => {
    try {
      console.log("🔍 Inventory route accessed");
      console.log("🔍 req.query:", req.query);
      // Test database connection first
      try {
        await db.execute(sql`SELECT 1`);
        console.log("✅ Database connection test successful");
      } catch (dbError) {
        return res.status(500).json({ message: "Database connection failed" });
      }
      // Handle location filtering from query params
      let locationFilter = undefined;
      if (req.query.locationId && req.query.locationId !== "all") {
        locationFilter = {
          locationId: req.query.locationId,
          includeAllLocations: false,
        };
      } else {
        locationFilter = {
          includeAllLocations: true,
        };
      }
      const items = await storage.getInventoryItems(locationFilter);
      res.json(items);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Failed to fetch inventory", error: error.message });
    }
  });
  app.get(
    "/api/inventory/low-stock",
    authenticateAndFilter,
    async (req: AuthenticatedRequest, res) => {
      try {
        const items = await storage.getLowStockItems(req.locationFilter);
        res.json(items);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch low stock items" });
      }
    }
  );
  // Public inventory items for landing page
  app.get("/api/inventory/public", async (req, res) => {
    try {
      const publicItems = await storage.getPublicInventoryItems();
      res.json(publicItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public inventory" });
    }
  });
  // Smart inventory prediction endpoints - MUST come before /api/inventory/:id
  app.get(
    "/api/inventory/predictions",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log(
          "🔍 Fetching inventory predictions with locationFilter:",
          req.locationFilter
        );
        const predictions = await storage.getInventoryPredictions(
          req.locationFilter
        );
        res.json(predictions);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch inventory predictions" });
      }
    }
  );
  app.get(
    "/api/inventory/alerts",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log(
          "🔍 Fetching stock alerts with locationFilter:",
          req.locationFilter
        );
        const alerts = await storage.getStockAlerts(req.locationFilter);
        res.json(alerts);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch stock alerts" });
      }
    }
  );
  // AI Insights endpoint - must come before /api/inventory/:id
  app.get("/api/inventory/ai-insights", authenticateAndFilter, async (req: any, res) => {
    try {
      const insights = await storage.generateAIInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Prediction Settings endpoints - must come before /api/inventory/:id
  app.get("/api/inventory/prediction-settings", authenticateAndFilter, async (req: any, res) => {
    try {
      const settings = await storage.getPredictionSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prediction settings" });
    }
  });

  app.put("/api/inventory/prediction-settings", authenticateAndFilter, async (req: any, res) => {
    try {
      const settings = await storage.updatePredictionSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update prediction settings" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });
  app.post("/api/inventory", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin", "sales"])) return;
      // Handle both JSON and multipart form data
      let itemData;
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        // Handle multipart form data with image
        upload.single("image")(req, res, async (err: any) => {
          try {
            if (err) {
              return res.status(400).json({ message: "File upload error" });
            }
            // Parse the form data
            const formData = req.body;
            itemData = {
              name: formData.name,
              sku: formData.sku,
              description: formData.description,
              category: formData.category,
              brand: formData.brand,
              model: formData.model,
              purchasePrice: formData.purchasePrice
                ? parseFloat(formData.purchasePrice).toString()
                : undefined,
              salePrice: parseFloat(formData.salePrice).toString(),
              quantity: parseInt(formData.quantity),
              minStockLevel: parseInt(formData.minStockLevel),
              reorderPoint: parseInt(formData.reorderPoint),
              reorderQuantity: parseInt(formData.reorderQuantity),
              leadTimeDays: formData.leadTimeDays
                ? parseInt(formData.leadTimeDays)
                : undefined,
              supplier: formData.supplier,
              barcode: formData.barcode,
              isPublic: formData.isPublic === "true",
              isActive: formData.isActive === "true",
              sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 0,
              imageUrl: null,
              specifications: formData.specifications
                ? JSON.parse(formData.specifications)
                : null,
              compatibility: formData.compatibility
                ? JSON.parse(formData.compatibility)
                : null,
              warranty: formData.warranty,
              locationId: formData.locationId || null,
            };
            // Handle image upload if provided
            if (req.file) {
              // Validate file type
              if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                  message: "Invalid file type. Only images are allowed.",
                });
              }
              // Validate file size (5MB limit)
              if (req.file.size > 5 * 1024 * 1024) {
                return res
                  .status(400)
                  .json({ message: "File too large. Maximum size is 5MB." });
              }
              // Convert buffer to base64 for storage
              const base64Image = req.file.buffer.toString("base64");
              itemData.imageUrl =
                `data:${req.file.mimetype};base64,${base64Image}` as any;
            }
            // Validate the data
            const validatedData = insertInventoryItemSchema.parse(itemData);
            const item = await storage.createInventoryItem(validatedData);
            res.status(201).json(item);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({
                message: "Invalid inventory item data",
                errors: error.errors,
              });
            }
            res
              .status(500)
              .json({ message: "Failed to create inventory item" });
          }
        });
      } else {
        // Handle JSON data
        // Convert decimal fields to strings for Drizzle schema
        const processedData = {
          ...req.body,
          purchasePrice: req.body.purchasePrice
            ? req.body.purchasePrice.toString()
            : undefined,
          salePrice: req.body.salePrice
            ? req.body.salePrice.toString()
            : undefined,
          avgDailySales: req.body.avgDailySales
            ? req.body.avgDailySales.toString()
            : undefined,
        };

        itemData = insertInventoryItemSchema.parse(processedData);
        // Handle empty locationId - convert empty string to null
        if (itemData.locationId === "") {
          itemData.locationId = null;
        }
        const item = await storage.createInventoryItem(itemData);
        res.status(201).json(item);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid inventory item data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin", "sales"])) return;
      // Handle both JSON and multipart form data
      let updates: any;
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        // Handle multipart form data with image
        upload.single("image")(req, res, async (err: any) => {
          try {
            if (err) {
              return res.status(400).json({ message: "File upload error" });
            }
            // Parse the form data
            const formData = req.body;
            updates = {
              name: formData.name,
              sku: formData.sku,
              description: formData.description,
              category: formData.category,
              brand: formData.brand,
              model: formData.model,
              purchasePrice: formData.purchasePrice
                ? parseFloat(formData.purchasePrice).toString()
                : undefined,
              salePrice: formData.salePrice
                ? parseFloat(formData.salePrice).toString()
                : undefined,
              quantity: formData.quantity
                ? parseInt(formData.quantity)
                : undefined,
              minStockLevel: formData.minStockLevel
                ? parseInt(formData.minStockLevel)
                : undefined,
              reorderPoint: formData.reorderPoint
                ? parseInt(formData.reorderPoint)
                : undefined,
              reorderQuantity: formData.reorderQuantity
                ? parseInt(formData.reorderQuantity)
                : undefined,
              leadTimeDays: formData.leadTimeDays
                ? parseInt(formData.leadTimeDays)
                : undefined,
              supplier: formData.supplier,
              barcode: formData.barcode,
              isPublic: formData.isPublic === "true",
              isActive: formData.isActive === "true",
              sortOrder: formData.sortOrder
                ? parseInt(formData.sortOrder)
                : undefined,
              specifications: formData.specifications
                ? JSON.parse(formData.specifications)
                : undefined,
              compatibility: formData.compatibility
                ? JSON.parse(formData.compatibility)
                : undefined,
              warranty: formData.warranty,
              locationId: formData.locationId || null,
            };
            // Handle image upload if provided
            if (req.file) {
              // Validate file type
              if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                  message: "Invalid file type. Only images are allowed.",
                });
              }
              // Validate file size (5MB limit)
              if (req.file.size > 5 * 1024 * 1024) {
                return res
                  .status(400)
                  .json({ message: "File too large. Maximum size is 5MB." });
              }
              // Convert buffer to base64 for storage
              const base64Image = req.file.buffer.toString("base64");
              updates.imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            }
            // Validate the data
            const validatedUpdates = insertInventoryItemSchema
              .partial()
              .parse(updates);
            const item = await storage.updateInventoryItem(
              req.params.id,
              validatedUpdates
            );
            res.json(item);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({
                message: "Invalid inventory item data",
                errors: error.errors,
              });
            }
            res
              .status(500)
              .json({ message: "Failed to update inventory item" });
          }
        });
      } else {
        // Handle JSON data
        // Convert decimal fields to strings for Drizzle schema
        const processedData = {
          ...req.body,
          purchasePrice: req.body.purchasePrice
            ? req.body.purchasePrice.toString()
            : undefined,
          salePrice: req.body.salePrice
            ? req.body.salePrice.toString()
            : undefined,
          avgDailySales: req.body.avgDailySales
            ? req.body.avgDailySales.toString()
            : undefined,
        };

        updates = insertInventoryItemSchema.partial().parse(processedData);
        // Handle empty locationId - convert empty string to null
        if (updates.locationId === "") {
          updates.locationId = null;
        }
        const item = await storage.updateInventoryItem(req.params.id, updates);
        res.json(item);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid inventory item data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      await storage.deleteInventoryItem(req.params.id);
      res.status(200).json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });
  // Test endpoint to verify server is working
  app.get("/api/test", (req, res) => {
    console.log("✅ Test endpoint hit!");
    res.json({
      message: "Server is working!",
      timestamp: new Date().toISOString(),
    });
  });
  app.post("/api/inventory/update-predictions", async (req, res) => {
    try {
      await storage.updateInventoryPredictions();
      res.json({ message: "Inventory predictions updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update inventory predictions" });
    }
  });

  app.post(
    "/api/inventory/alerts/:alertId/acknowledge",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { alertId } = req.params;
        await storage.acknowledgeAlert(alertId);
        res.json({ message: "Alert acknowledged successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to acknowledge alert" });
      }
    }
  );
  // Business Profile
  app.get("/api/business-profile", async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile();
      
      // If no profile exists, return null (the getBusinessProfile method already returns a default)
      if (!profile) {
        console.log("No business profile found, returning null");
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ 
        message: "Failed to fetch business profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app.put("/api/business-profile", async (req, res) => {
    try {
      console.log(
        "Received business profile update data:",
        JSON.stringify(req.body, null, 2)
      );
      const data = insertBusinessProfileSchema.partial().parse(req.body);
      const profile = await storage.upsertBusinessProfile(data);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid business profile data",
          errors: error.errors,
        });
      }
      res.status(500).json({
        message: "Failed to update business profile",
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      });
    }
  });

  // Business settings (subset of business profile)
  app.put("/api/settings/business", async (req, res) => {
    try {
      // Only allow a safe subset of fields from the business profile
      const data = insertBusinessProfileSchema
        .pick({
          businessName: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          email: true,
          website: true,
          taxId: true,
          licenseNumber: true,
        })
        .partial()
        .parse(req.body);
      const profile = await storage.upsertBusinessProfile(data);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid business settings data",
          errors: error.errors,
        });
      }
      res.status(500).json({
        message: "Failed to update business settings",
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      });
    }
  });
  // Users/Workers
  app.get("/api/users", authenticateAndFilter, async (req: any, res) => {
    try {
      const users = await storage.getUsers(req.locationFilter);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Apply rate limiting to user creation (prevent abuse)
  app.post("/api/users", authLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app.put("/api/users/:id", async (req, res) => {
    try {
      console.log("🔄 User update request:", req.params.id);
      console.log("📝 Request body:", JSON.stringify(req.body, null, 2));
      const { currentPassword, ...updates } = req.body;
      // If password is being updated, validate current password
      if (updates.password) {
        console.log("🔐 Password update detected");
        if (!currentPassword) {
        console.log("❌ No current password provided");
        return res.status(400).json({
          message: "Current password is required when changing password. Please provide your current password to verify your identity.",
          details: "The request body should include both 'password' (new password) and 'currentPassword' (current password) fields.",
          example: {
            password: "newPassword123",
            currentPassword: "currentPassword123"
          }
        });
        }
        const currentUser = await storage.getUser(req.params.id);
        if (!currentUser) {
          return res.status(404).json({ message: "User not found" });
        }
        const isValidPassword = await storage.authenticateUser(
          currentUser.username,
          currentPassword
        );
        if (!isValidPassword) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }
      }
      console.log("✅ Validating updates:", updates);
      const validatedUpdates = insertUserSchema.partial().parse(updates);
      console.log("✅ Validated updates:", validatedUpdates);
      const user = await storage.updateUser(req.params.id, validatedUpdates);
      console.log("✅ User updated successfully");
      res.json(user);
    } catch (error: any) {
      console.error("❌ User update error:", error);
      if (error instanceof z.ZodError) {
        console.error("❌ Validation errors:", error.errors);
        return res
          .status(400)
          .json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("❌ Server error:", error.message);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  // Profile picture upload endpoint
  app.post(
    "/api/users/:id/profile-picture",
    upload.single("profilePicture"),
    validateFileUpload,
    async (req, res) => {
      try {
        console.log("User ID:", req.params.id);
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "Only image files are allowed" });
        }
        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "File size must be less than 5MB" });
        }
        // Generate unique filename
        const fileExtension = req.file.originalname.split(".").pop() || "jpg";
        const fileName = `profile_${
          req.params.id
        }_${Date.now()}.${fileExtension}`.replace(/[\r\n\s]/g, "");
        console.log("Filename length:", fileName.length);
        console.log("Filename includes newlines:", fileName.includes("\n"));
        console.log(
          "Filename includes carriage returns:",
          fileName.includes("\r")
        );
        // Save file to uploads directory
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        try {
          fs.writeFileSync(filePath, req.file.buffer);
        } catch (writeError) {
          throw writeError as Error;
        }
        // Update user profile picture in database
        const profilePictureUrl = `/uploads/${fileName}`;
        let updatedUser;
        try {
          updatedUser = await storage.updateUser(req.params.id, {
            profilePicture: profilePictureUrl,
          });
        } catch (dbError) {
          // Clean up the uploaded file if database update fails
          try {
            fs.unlinkSync(filePath);
          } catch (cleanupError) {}
          throw dbError as Error;
        }
        res.json({
          message: "Profile picture updated successfully",
          profilePicture: profilePictureUrl,
          user: updatedUser,
        });
      } catch (error) {
        console.error("Error stack:", (error as Error).stack);
        res.status(500).json({
          message: "Failed to upload profile picture",
          error: (error as Error).message,
        });
      }
    }
  );
  // Business Profile Photo Upload
  app.post(
    "/api/business-profile/photo/upload",
    upload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No photo file provided" });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "Only image files are allowed" });
        }
        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "File size must be less than 5MB" });
        }
        // Generate unique filename
        const fileExtension = req.file.originalname.split(".").pop() || "jpg";
        const fileName = `owner_${Date.now()}.${fileExtension}`.replace(
          /[\r\n\s]/g,
          ""
        );
        // Save file to uploads directory
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        try {
          fs.writeFileSync(filePath, req.file.buffer);
        } catch (writeError) {
          throw writeError as Error;
        }
        // Update business profile owner photo in database
        const ownerPhotoUrl = fileName; // Just save the filename, not the full path
        let updatedProfile;
        try {
          updatedProfile = await storage.upsertBusinessProfile({
            ownerPhoto: ownerPhotoUrl,
          });
        } catch (dbError) {
          // Clean up the uploaded file if database update fails
          try {
            fs.unlinkSync(filePath);
          } catch (cleanupError) {}
          throw dbError as Error;
        }
        res.json({
          message: "Owner photo updated successfully",
          ownerPhoto: ownerPhotoUrl,
          profile: updatedProfile,
        });
      } catch (error) {
        console.error("Error stack:", (error as Error).stack);
        res.status(500).json({
          message: "Failed to upload owner photo",
          error: (error as Error).message,
        });
      }
    }
  );
  // Predefined Problems - consolidated
  app.get("/api/predefined-problems", async (req, res) => {
    try {
      const problems = await storage.getPredefinedProblems();
      res.json(problems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch predefined problems" });
    }
  });
  app.post(
    "/api/predefined-problems",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const data = insertPredefinedProblemSchema.parse(req.body);
        const problem = await storage.createPredefinedProblem(data);
        res.status(201).json(problem);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Invalid predefined problem data",
            errors: error.errors,
          });
        }
        res
          .status(500)
          .json({ message: "Failed to create predefined problem" });
      }
    }
  );
  app.put(
    "/api/predefined-problems/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const updates = insertPredefinedProblemSchema.partial().parse(req.body);
        const problem = await storage.updatePredefinedProblem(
          req.params.id,
          updates
        );
        res.json(problem);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Invalid predefined problem data",
            errors: error.errors,
          });
        }
        res
          .status(500)
          .json({ message: "Failed to update predefined problem" });
      }
    }
  );
  app.delete(
    "/api/predefined-problems/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        // Check if problem is in use before attempting to delete
        const isInUse = await storage.isPredefinedProblemInUse(req.params.id);
        if (isInUse) {
          return res.status(400).json({
            message: "Cannot delete predefined problem",
            error:
              "This problem is currently being used by one or more devices. Please remove the problem from all devices first, or set the problem to inactive instead of deleting it.",
            suggestion:
              "Use PUT /api/predefined-problems/:id with { isActive: false } to deactivate instead of deleting",
          });
        }
        await storage.deletePredefinedProblem(req.params.id);
        res
          .status(200)
          .json({ message: "Predefined problem deleted successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to delete predefined problem" });
      }
    }
  );
  // Service Types - consolidated
  app.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service types" });
    }
  });
  app.post(
    "/api/service-types",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log("📋 Service type creation request received:", req.body);
        const data = insertServiceTypeSchema.parse(req.body);
        console.log("✅ Service type data validated:", data);
        const serviceType = await storage.createServiceType(data);
        console.log("✅ Service type created successfully:", serviceType);
        res.status(201).json(serviceType);
      } catch (error) {
        console.error("❌ Error creating service type:", error);
        if (error instanceof z.ZodError) {
          console.error("❌ Zod validation errors:", error.errors);
          return res.status(400).json({
            message: "Invalid service type data",
            errors: error.errors,
          });
        }
        console.error("❌ Database/Storage error:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        res.status(500).json({
          message: "Failed to create service type",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
  app.put(
    "/api/service-types/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log("PUT /api/service-types/:id called with:", {
          id: req.params.id,
          body: req.body,
          headers: req.headers,
        });
        const updates = insertServiceTypeSchema.partial().parse(req.body);
        const serviceType = await storage.updateServiceType(
          req.params.id,
          updates
        );
        res.json(serviceType);
      } catch (error: any) {
        console.error("❌ Service type update error:", error);
        if (error instanceof z.ZodError) {
          console.error("❌ Zod validation error:", error.errors);
          return res.status(400).json({
            message: "Invalid service type data",
            errors: error.errors,
          });
        }
        console.error("❌ Server error details:", error.message, error.stack);
        res.status(500).json({
          message: "Failed to update service type",
          error: error.message,
          details: error.stack,
        });
      }
    }
  );
  app.delete(
    "/api/service-types/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log("DELETE /api/service-types/:id called with:", {
          id: req.params.id,
          headers: req.headers,
        });
        // Check if service type is in use before attempting to delete
        const isInUse = await storage.isServiceTypeInUse(req.params.id);
        if (isInUse) {
          return res.status(400).json({
            message: "Cannot delete service type",
            error:
              "This service type is currently being used by one or more devices. Please remove the service type from all devices first, or set the service type to inactive instead of deleting it.",
            suggestion:
              "Use PUT /api/service-types/:id with { isActive: false } to deactivate instead of deleting",
          });
        }
        await storage.deleteServiceType(req.params.id);
        res.status(200).json({ message: "Service type deleted successfully" });
      } catch (error) {
        // Check if it's a foreign key constraint error (fallback)
        if (
          error instanceof Error &&
          error.message.includes("foreign key constraint")
        ) {
          return res.status(400).json({
            message: "Cannot delete service type",
            error:
              "This service type is currently being used by one or more devices. Please remove the service type from all devices first, or set the service type to inactive instead of deleting it.",
            suggestion:
              "Use PUT /api/service-types/:id with { isActive: false } to deactivate instead of deleting",
          });
        }
        res.status(500).json({ message: "Failed to delete service type" });
      }
    }
  );
  // Deactivate service type (alternative to delete)
  app.patch(
    "/api/service-types/:id/deactivate",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const updates: any = { isActive: false, updatedAt: new Date() };
        const serviceType = await storage.updateServiceType(
          req.params.id,
          updates
        );
        res.json({
          message: "Service type deactivated successfully",
          serviceType,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to deactivate service type" });
      }
    }
  );
  // Public service types API (for landing page)
  app.get("/api/public/services", async (req, res) => {
    try {
      const serviceTypes = await storage.getPublicServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public services" });
    }
  });
  // Accessories API
  app.get("/api/accessories", async (req, res) => {
    try {
      const accessories = await storage.getAccessories();
      res.json(accessories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accessories" });
    }
  });
  // Public accessories API (for landing page) - now uses inventory items
  app.get("/api/public/accessories", async (req, res) => {
    try {
      const accessories = await storage.getAccessories();
      res.json(accessories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public accessories" });
    }
  });
  // Create accessory (now creates inventory item)
  app.post("/api/accessories", async (req, res) => {
    try {
      const data = insertInventoryItemSchema.parse(req.body);
      const accessory = await storage.createInventoryItem(data);
      res.status(201).json(accessory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid accessory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create accessory" });
    }
  });
  // Update accessory (now updates inventory item)
  app.put("/api/accessories/:id", async (req, res) => {
    try {
      const updates = insertInventoryItemSchema.partial().parse(req.body);
      const accessory = await storage.updateInventoryItem(
        req.params.id,
        updates
      );
      res.json(accessory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid accessory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update accessory" });
    }
  });
  // Delete accessory (now deletes inventory item)
  app.delete("/api/accessories/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.status(200).json({ message: "Accessory deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete accessory" });
    }
  });
  // Device Types
  app.get("/api/device-types", async (req, res) => {
    try {
      const deviceTypes = await storage.getDeviceTypes();
      res.json(deviceTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device types" });
    }
  });
  app.post("/api/device-types", async (req, res) => {
    try {
      const deviceTypeData = insertDeviceTypeSchema.parse(req.body);
      const deviceType = await storage.createDeviceType(deviceTypeData);
      res.status(201).json(deviceType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid device type data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device type" });
    }
  });
  app.put("/api/device-types/:id", async (req, res) => {
    try {
      const updates = insertDeviceTypeSchema.partial().parse(req.body);
      const deviceType = await storage.updateDeviceType(req.params.id, updates);
      res.json(deviceType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid device type data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update device type" });
    }
  });
  app.delete("/api/device-types/:id", async (req, res) => {
    try {
      await storage.deleteDeviceType(req.params.id);
      res.status(200).json({ message: "Device type deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device type" });
    }
  });
  // Brands
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });
  app.post("/api/brands", async (req, res) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create brand" });
    }
  });
  app.put("/api/brands/:id", async (req, res) => {
    try {
      const updates = insertBrandSchema.partial().parse(req.body);
      const brand = await storage.updateBrand(req.params.id, updates);
      res.json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand" });
    }
  });
  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await storage.deleteBrand(req.params.id);
      res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });
  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const updates = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, updates);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });
  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });
  // Models
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });
  app.post("/api/models", async (req, res) => {
    try {
      const modelData = insertModelSchema.parse(req.body);
      const model = await storage.createModel(modelData);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid model data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create model" });
    }
  });
  app.put("/api/models/:id", async (req, res) => {
    try {
      const updates = insertModelSchema.partial().parse(req.body);
      const model = await storage.updateModel(req.params.id, updates);
      res.json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid model data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update model" });
    }
  });
  app.delete("/api/models/:id", async (req, res) => {
    try {
      await storage.deleteModel(req.params.id);
      res.status(200).json({ message: "Model deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete model" });
    }
  });
  // Sales
  app.get("/api/sales", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    // Check if pagination is requested
    if (isPaginationRequested(req.query)) {
      const paginationParams = parsePaginationParams(req.query);
      const allSales = await storage.getSales(req.locationFilter);
      
      // Apply pagination
      const offset = (paginationParams.page! - 1) * paginationParams.limit!;
      const paginatedData = allSales.slice(offset, offset + paginationParams.limit!);
      
      const response = createPaginatedResponse(
        paginatedData,
        allSales.length,
        paginationParams.page!,
        paginationParams.limit!
      );
      
      res.json(response);
    } else {
      const sales = await storage.getSales(req.locationFilter);
      res.json(sales);
    }
  }));
  app.get("/api/sales/today", authenticateAndFilter, async (req: any, res) => {
    try {
      const sales = await storage.getTodaysSales(req.locationFilter);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's sales" });
    }
  });
  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });
  const createSaleSchema = z.object({
    sale: insertSaleSchema,
    items: z.array(insertSaleItemSchema),
  });
  app.post("/api/sales", async (req, res) => {
    try {
      console.log(
        "🛒 Sales POST request received:",
        JSON.stringify(req.body, null, 2)
      );
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin", "sales"])) return;
      const { sale: saleData, items } = createSaleSchema.parse(req.body);
      console.log("✅ Sale data validated successfully:", saleData);
      console.log("🔄 Creating sale in database...");
      const sale = await storage.createSale(saleData, items);
      console.log("✅ Sale created successfully:", sale.id);
      res.status(201).json(sale);
    } catch (error: any) {
      console.error("❌ Sales creation error:", error);
      console.error("❌ Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        detail: error?.detail,
        constraint: error?.constraint,
        table: error?.table,
        column: error?.column,
      });
      if (error instanceof z.ZodError) {
        console.error("❌ Zod validation errors:", error.errors);
        return res
          .status(400)
          .json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({
        message: "Failed to create sale",
        error: error?.message || "Unknown error",
        details: error?.detail || error?.code || "Unknown error",
      });
    }
  });
  // Appointments
  app.get("/api/appointments", authenticateAndFilter, async (req: any, res) => {
    try {
      console.log(
        "🔍 Appointments endpoint called with locationFilter:",
        req.locationFilter
      );
      const appointments = await storage.getAppointments(req.locationFilter);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  app.get(
    "/api/appointments/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const appointment = await storage.getAppointment(req.params.id);
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        res.json(appointment);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch appointment" });
      }
    }
  );
  // Debug endpoint to check all appointments without filtering
  app.get("/api/debug/appointments", async (req, res) => {
    try {
      const allAppointments = await db.select().from(appointments);
      console.log(
        "🔍 Debug: All appointments in database:",
        allAppointments.length
      );
      res.json({
        count: allAppointments.length,
        appointments: allAppointments,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch debug appointments" });
    }
  });
  app.post(
    "/api/appointments",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log("📅 Appointment creation request received:", req.body);
        console.log("👤 User info:", {
          locationId: req.user.locationId,
          userId: req.user.id,
        });

        // First, create or find customer if customer info provided
        let customerId = req.body.customerId;

        // If no customerId provided, try to find existing customer or create new one
        if (!customerId) {
          if (req.body.customerName && req.body.customerPhone) {
            try {
              // First, try to find existing customer by phone number
              console.log(
                "🔍 Searching for existing customer with phone:",
                req.body.customerPhone
              );
              const existingCustomer = await storage.getCustomerByPhone(
                req.body.customerPhone
              );

              if (existingCustomer) {
                customerId = existingCustomer.id;
                console.log("✅ Found existing customer with ID:", customerId);
              } else {
                // Customer doesn't exist, create new one
                console.log("👥 Creating new customer:", req.body.customerName);
                const customerData = {
                  name: req.body.customerName,
                  firstName: req.body.customerName?.split(" ")[0] || "",
                  lastName:
                    req.body.customerName?.split(" ").slice(1).join(" ") || "",
                  phone: req.body.customerPhone,
                  email: req.body.customerEmail || "",
                  locationId: req.user.locationId, // Add location for the customer
                  registrationDate: new Date().toISOString().split("T")[0], // Add required registration date
                };
                console.log("📋 Customer data to create:", customerData);

                const customer = await storage.createCustomer(customerData);
                customerId = customer.id;
                console.log("✅ Customer created with ID:", customerId);
              }
            } catch (error: any) {
              console.error("❌ Failed to find/create customer:", error);
              console.error("Customer operation error details:", {
                message: error.message,
                code: error.code,
                detail: error.detail,
              });
              return res.status(400).json({
                message: "Failed to find or create customer for appointment",
                error: error.message,
                details: error?.detail || error?.code || "Unknown error",
              });
            }
          } else {
            return res.status(400).json({
              message:
                "Either customerId or both customerName and customerPhone are required for appointment creation",
            });
          }
        }

        // Final validation
        if (!customerId) {
          return res.status(400).json({
            message: "Customer ID is required for appointment creation",
          });
        }

        const appointmentData = {
          customerId: customerId,
          title: req.body.serviceType || req.body.title || "Appointment",
          description: req.body.notes || req.body.description || null,
          appointmentDate: req.body.appointmentDate
            ? req.body.appointmentDate
            : new Date().toISOString().split("T")[0],
          duration: req.body.duration || 60,
          status: req.body.status || "scheduled",
          locationId: req.user.locationId, // Add location ID from authenticated user
          assignedTo: req.body.assignedTo || null,
          notes: req.body.notes || null,
          createdBy: req.user.id,
        };

        console.log("📋 Appointment data to create:", appointmentData);
        const appointment = await storage.createAppointment(appointmentData);
        console.log("✅ Appointment created successfully:", appointment.id);
        res.status(201).json(appointment);
      } catch (error: any) {
        console.error("❌ Error creating appointment:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
        });
        res.status(500).json({
          message: "Failed to create appointment",
          error: error.message,
          details: error?.detail || error?.code || "Unknown error",
        });
      }
    }
  );
  app.put(
    "/api/appointments/:id",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const updates = insertAppointmentSchema.partial().parse(req.body);
        const appointment = await storage.updateAppointment(
          req.params.id,
          updates
        );
        res.json(appointment);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Invalid appointment data",
            errors: error.errors,
          });
        }
        res.status(500).json({ message: "Failed to update appointment" });
      }
    }
  );
  // Expenses
  app.get("/api/expenses", authenticateAndFilter, async (req: any, res) => {
    try {
      console.log(
        "💰 Expenses endpoint called with locationFilter:",
        req.locationFilter
      );
      const expenses = await storage.getExpenses(req.locationFilter);
      console.log(`✅ Returning ${expenses.length} expenses`);
      res.json(expenses);
    } catch (error: any) {
      console.error("❌ Error fetching expenses:", error);
      res.status(500).json({
        message: "Failed to fetch expenses",
        error: error.message,
        details: error?.detail || error?.code || "Unknown error",
      });
    }
  });
  app.get(
    "/api/expenses/stats",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const stats = await storage.getExpenseStats(req.locationFilter);
        res.json(stats);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch expense stats" });
      }
    }
  );
  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });
  app.post("/api/expenses", async (req, res) => {
    try {
      console.log("💰 Expense creation request received:", req.body);

      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;

      // Validate and transform expense data to match database schema
      const expenseData = {
        locationId: req.body.locationId || null,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount.toString(),
        expenseDate: req.body.expenseDate,
        vendor: req.body.vendor || null,
        receiptUrl: req.body.receiptUrl || null,
        notes: req.body.notes || null,
        isRecurring: req.body.isRecurring || false,
        recurringFrequency: req.body.recurringFrequency || null,
        expenseType: req.body.expenseType || null,
      };

      console.log("📋 Expense data to create:", expenseData);

      // Use schema validation
      const validatedData = insertExpenseSchema.parse(expenseData);
      const expense = await storage.createExpense(validatedData);

      console.log("✅ Expense created successfully:", expense.id);
      res.status(201).json(expense);
    } catch (error: any) {
      console.error("❌ Error creating expense:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
      });

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid expense data",
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: "Failed to create expense",
        error: error.message,
        details: error?.detail || error?.code || "Unknown error",
      });
    }
  });
  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const updates = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(req.params.id, updates);
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      await storage.deleteExpense(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  // Loan Invoices (basic implementation)
  app.get(
    "/api/loan-invoices",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const invoices = await storage.getLoanInvoices(req.locationFilter);
        res.json(invoices);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch loan invoices" });
      }
    }
  );
  app.get("/api/loan-invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getLoanInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Loan invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loan invoice" });
    }
  });
  app.post("/api/loan-invoices", async (req, res) => {
    try {
      console.log("📝 Loan invoice creation request:", req.body);

      // Basic validation
      if (!req.body.customerId || !req.body.totalAmount) {
        return res.status(400).json({
          message: "Missing required fields: customerId and totalAmount",
        });
      }

      const invoice = await storage.createLoanInvoice(req.body);
      console.log("✅ Loan invoice created successfully:", invoice.id);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("❌ Failed to create loan invoice:", error);
      res.status(500).json({
        message: "Failed to create loan invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  app.post("/api/loan-invoices/combined", async (req, res) => {
    try {
      const invoice = await storage.createCombinedLoanInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create combined loan invoice" });
    }
  });
  app.put("/api/loan-invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateLoanInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update loan invoice" });
    }
  });
  app.post("/api/loan-invoices/:id/send-email", async (req, res) => {
    try {
      // For now, just return success - email functionality can be implemented later
      res.json({ message: "Invoice email sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send invoice email" });
    }
  });
  app.post("/api/loan-invoices/:id/record-payment", async (req, res) => {
    try {
      const { amount, paymentMethod, notes } = req.body;
      const invoiceId = req.params.id;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
      }
      const result = await storage.recordLoanPayment(invoiceId, {
        amount,
        paymentMethod,
        notes,
      });
      res.json(result.updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to record payment" });
    }
  });
  app.put("/api/loan-invoices/:id", async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const updates = req.body;
      const updatedInvoice = await storage.updateLoanInvoice(
        invoiceId,
        updates
      );
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update loan invoice" });
    }
  });
  app.delete("/api/loan-invoices/:id", async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const success = await storage.deleteLoanInvoice(invoiceId);
      if (success) {
        res.json({ message: "Loan invoice deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete loan invoice" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete loan invoice" });
    }
  });
  app.get("/api/loan-invoices/:id/payment-history", async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const paymentHistory = await storage.getLoanPaymentHistory(invoiceId);
      res.json(paymentHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });
  // System Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const { category } = req.query;
      const settings = await storage.getSettings(category as string);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app.get("/api/settings/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings by category" });
    }
  });
  app.post("/api/settings", async (req, res) => {
    try {
      const { category, key, value, description } = req.body;
      const setting = await storage.setSetting(
        category,
        key,
        value,
        description
      );
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to save setting" });
    }
  });
  app.put("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      const { value, description } = req.body;

      console.log(`🔧 Updating setting: ${category}/${key} = ${value}`);

      const setting = await storage.setSetting(
        category,
        key,
        value,
        description
      );

      console.log(`✅ Setting updated successfully:`, setting);
      res.json(setting);
    } catch (error) {
      console.error(
        `❌ Failed to update setting ${req.params.category}/${req.params.key}:`,
        error
      );
      res.status(500).json({
        message: "Failed to update setting",
        error: error instanceof Error ? error.message : "Unknown error",
        category: req.params.category,
        key: req.params.key,
      });
    }
  });
  app.delete("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      await storage.deleteSetting(category, key);
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // 2FA Security endpoints (simplified implementation)
  app.post(
    "/api/security/2fa/setup",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        const userEmail = user?.email || "user@example.com";
        const serviceName = "SolNet Manage";

        // Generate a proper TOTP secret using speakeasy
        const secret = speakeasy.generateSecret({
          name: `${serviceName}:${userEmail}`,
          length: 32, // 32 characters for better security
          symbols: false, // Only alphanumeric for compatibility
        });

        // Create TOTP URL for authenticator apps
        const totpUrl =
          secret.otpauth_url ||
          `otpauth://totp/${encodeURIComponent(
            serviceName
          )}:${encodeURIComponent(userEmail)}?secret=${
            secret.base32
          }&issuer=${encodeURIComponent(serviceName)}`;

        // Generate QR code as base64 data URL
        const qrCodeDataUrl = await QRCode.toDataURL(totpUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Generate backup codes
        const backupCodes = Array.from({ length: 5 }, () =>
          Math.random().toString().substr(2, 6).padStart(6, "0")
        );

        console.log(`🔐 Setting up 2FA for user: ${userId} (${userEmail})`);
        console.log(`📱 TOTP URL: ${totpUrl}`);
        console.log(`🔑 Secret: ${secret}`);

        res.json({
          secret: secret,
          qrCode: qrCodeDataUrl,
          totpUrl: totpUrl,
          backupCodes: backupCodes,
        });
      } catch (error) {
        console.error("❌ Error setting up 2FA:", error);
        res.status(500).json({
          message: "Failed to setup 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.post(
    "/api/security/2fa/verify",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { token, secret } = req.body;
        const userId = req.user.id;

        if (!token || !/^\d{6}$/.test(token)) {
          return res.status(400).json({
            message: "Invalid token format. Please enter a 6-digit code.",
          });
        }

        if (!secret) {
          return res.status(400).json({
            message: "Secret is required for verification.",
          });
        }

        // Verify the TOTP token using speakeasy
        const verified = speakeasy.totp.verify({
          secret: secret,
          encoding: "base32",
          token: token,
          window: 2, // Allow 2 time steps (60 seconds) tolerance
        });

        if (verified) {
          console.log(`🔐 2FA token verified successfully for user: ${userId}`);
          res.json({
            message: "2FA token verified successfully",
            verified: true,
          });
        } else {
          console.log(`🔐 2FA token verification failed for user: ${userId}`);
          res.status(400).json({
            message: "Invalid verification code. Please try again.",
            verified: false,
          });
        }
      } catch (error) {
        console.error("❌ Error verifying 2FA token:", error);
        res.status(500).json({
          message: "Failed to verify 2FA token",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get 2FA status endpoint (simplified - just return if user has 2FA enabled in settings)
  app.get(
    "/api/security/2fa/status",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // For now, we'll use a simple approach - store 2FA status in settings
        const twoFASetting = await storage.getSetting(
          "security",
          "twoFactorAuth"
        );
        const isEnabled = twoFASetting ? Boolean(twoFASetting.value) : false;

        res.json({
          enabled: isEnabled,
          hasSecret: false, // We'll implement secret storage later
          hasBackupCodes: false, // We'll implement backup codes storage later
        });
      } catch (error) {
        console.error("❌ Error getting 2FA status:", error);
        res.status(500).json({
          message: "Failed to get 2FA status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Disable 2FA endpoint (simplified - just update settings)
  app.post(
    "/api/security/2fa/disable",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Update the 2FA setting to false
        await storage.setSetting(
          "security",
          "twoFactorAuth",
          "false",
          "Two-factor authentication status"
        );

        console.log(`🔐 2FA disabled for user: ${userId}`);
        res.json({
          message: "2FA has been disabled successfully",
        });
      } catch (error) {
        console.error("❌ Error disabling 2FA:", error);
        res.status(500).json({
          message: "Failed to disable 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Enable 2FA endpoint (simplified - just update settings after verification)
  app.post(
    "/api/security/2fa/enable",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Update the 2FA setting to true
        await storage.setSetting(
          "security",
          "twoFactorAuth",
          "true",
          "Two-factor authentication status"
        );

        console.log(`🔐 2FA enabled for user: ${userId}`);
        res.json({
          message: "2FA has been enabled successfully",
        });
      } catch (error) {
        console.error("❌ Error enabling 2FA:", error);
        res.status(500).json({
          message: "Failed to enable 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Data Management API
  app.post("/api/data/backup", authenticateAndFilter, async (req: any, res) => {
    try {
      console.log("🗃️ Creating data backup...");
      const backupResult = await storage.createBackup(req.user.id);
      res.json({
        message: "Backup created successfully",
        backupId: backupResult.id,
        filename: backupResult.filename,
        size: backupResult.size,
        downloadUrl: `/api/data/backup/${backupResult.id}/download`,
      });
    } catch (error) {
      console.error("❌ Backup creation failed:", error);
      res.status(500).json({
        message: "Failed to create backup",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get(
    "/api/data/backup/:backupId/download",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { backupId } = req.params;
        const backup = await storage.getBackup(backupId, req.user.id);

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${backup.filename}"`
        );
        res.send(backup.data);
      } catch (error) {
        console.error("❌ Backup download failed:", error);
        res.status(500).json({
          message: "Failed to download backup",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.get("/api/data/backup", authenticateAndFilter, async (req: any, res) => {
    try {
      const backups = await storage.getBackupHistory(req.user.id);
      res.json(backups);
    } catch (error) {
      console.error("❌ Failed to fetch backup history:", error);
      res.status(500).json({
        message: "Failed to fetch backup history",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post(
    "/api/data/restore",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log("🗃️ Restoring data from backup...");
        const { backupId } = req.body;
        await storage.restoreBackup(backupId, req.user.id);
        res.json({ message: "Data restored successfully" });
      } catch (error) {
        console.error("❌ Data restore failed:", error);
        res.status(500).json({
          message: "Failed to restore data",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.post("/api/data/export", authenticateAndFilter, async (req: any, res) => {
    try {
      const { type } = req.body; // 'customers', 'inventory', 'sales', 'all'
      console.log(`🗃️ Exporting ${type} data...`);
      const exportResult = await storage.exportData(type, req.user.id);

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${exportResult.filename}"`
      );
      res.json(exportResult.data);
    } catch (error) {
      console.error("❌ Data export failed:", error);
      res.status(500).json({
        message: "Failed to export data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/data/import", authenticateAndFilter, async (req: any, res) => {
    try {
      const { type, data } = req.body; // 'customers', 'inventory', etc.
      console.log(`🗃️ Importing ${type} data...`);
      const importResult = await storage.importData(type, data, req.user.id);

      res.json({
        message: "Data imported successfully",
        importedCount: importResult.importedCount,
        errors: importResult.errors,
      });
    } catch (error) {
      console.error("❌ Data import failed:", error);
      res.status(500).json({
        message: "Failed to import data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.put(
    "/api/data/settings",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const settings = req.body;
        await storage.updateDataSettings(settings, req.user.id);
        res.json({ message: "Data settings updated successfully" });
      } catch (error) {
        console.error("❌ Failed to update data settings:", error);
        res.status(500).json({
          message: "Failed to update data settings",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /*
  app.post(
    "/api/security/2fa/setup",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Get user info for QR code
        const user = await storage.getUser(userId);
        const userEmail = user?.email || "user@example.com";
        const serviceName = "SolNet Manage";

        // Generate a proper TOTP secret using speakeasy
        const secret = speakeasy.generateSecret({
          name: `${serviceName}:${userEmail}`,
          length: 32, // 32 characters for better security
          symbols: false, // Only alphanumeric for compatibility
        });

        // Create TOTP URL for authenticator apps
        const totpUrl =
          secret.otpauth_url ||
          `otpauth://totp/${encodeURIComponent(
            serviceName
          )}:${encodeURIComponent(userEmail)}?secret=${
            secret.base32
          }&issuer=${encodeURIComponent(serviceName)}`;

        // Generate QR code as base64 data URL
        const qrCodeDataUrl = await QRCode.toDataURL(totpUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Generate backup codes
        const backupCodes = Array.from({ length: 5 }, () =>
          Math.random().toString().substr(2, 6).padStart(6, "0")
        );

        console.log(`🔐 Setting up 2FA for user: ${userId} (${userEmail})`);
        console.log(`📱 TOTP URL: ${totpUrl}`);
        console.log(`🔑 Secret: ${secret.base32}`);

        res.json({
          secret: secret.base32, // Use the base32 encoded secret
          qrCode: qrCodeDataUrl,
          totpUrl: totpUrl,
          backupCodes: backupCodes,
        });
      } catch (error) {
        console.error("❌ Error setting up 2FA:", error);
        res.status(500).json({
          message: "Failed to setup 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.post(
    "/api/security/2fa/verify",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const { token, secret } = req.body;
        const userId = req.user.id;

        if (!token || !/^\d{6}$/.test(token)) {
          return res.status(400).json({
            message: "Invalid token format. Please enter a 6-digit code.",
          });
        }

        if (!secret) {
          return res.status(400).json({
            message: "Secret is required for verification.",
          });
        }

        // Verify the TOTP token using speakeasy
        const verified = speakeasy.totp.verify({
          secret: secret,
          encoding: "base32",
          token: token,
          window: 2, // Allow 2 time steps (60 seconds) tolerance
        });

        if (verified) {
          console.log(`🔐 2FA token verified successfully for user: ${userId}`);
          res.json({
            message: "2FA token verified successfully",
            verified: true,
          });
        } else {
          console.log(`🔐 2FA token verification failed for user: ${userId}`);
          res.status(400).json({
            message: "Invalid verification code. Please try again.",
            verified: false,
          });
        }
      } catch (error) {
        console.error("❌ Error verifying 2FA token:", error);
        res.status(500).json({
          message: "Failed to verify 2FA token",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get 2FA status endpoint (simplified - just return if user has 2FA enabled in settings)
  app.get(
    "/api/security/2fa/status",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // For now, we'll use a simple approach - store 2FA status in settings
        // In a production app, you'd have a dedicated 2FA table
        const twoFASetting = await storage.getSetting(
          "security",
          "twoFactorAuth"
        );
        const isEnabled = twoFASetting ? Boolean(twoFASetting.value) : false;

        res.json({
          enabled: isEnabled,
          hasSecret: false, // We'll implement secret storage later
          hasBackupCodes: false, // We'll implement backup codes storage later
        });
      } catch (error) {
        console.error("❌ Error getting 2FA status:", error);
        res.status(500).json({
          message: "Failed to get 2FA status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Disable 2FA endpoint (simplified - just update settings)
  app.post(
    "/api/security/2fa/disable",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Update the 2FA setting to false
        await storage.setSetting(
          "security",
          "twoFactorAuth",
          "false",
          "Two-factor authentication status"
        );

        console.log(`🔐 2FA disabled for user: ${userId}`);
        res.json({
          message: "2FA has been disabled successfully",
        });
      } catch (error) {
        console.error("❌ Error disabling 2FA:", error);
        res.status(500).json({
          message: "Failed to disable 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Enable 2FA endpoint (simplified - just update settings after verification)
  app.post(
    "/api/security/2fa/enable",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Update the 2FA setting to true
        await storage.setSetting(
          "security",
          "twoFactorAuth",
          "true",
          "Two-factor authentication status"
        );

        console.log(`🔐 2FA enabled for user: ${userId}`);
        res.json({
          message: "2FA has been enabled successfully",
        });
      } catch (error) {
        console.error("❌ Error enabling 2FA:", error);
        res.status(500).json({
          message: "Failed to enable 2FA",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  */

  // Security endpoints
  app.post(
    "/api/security/logout-all-sessions",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        // In a real implementation, you would invalidate all user sessions/tokens
        // For now, we'll just return success
        console.log(`🔐 Logging out all sessions for user: ${userId}`);
        res.json({
          message: "All sessions have been logged out successfully",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("❌ Error logging out all sessions:", error);
        res.status(500).json({
          message: "Failed to logout all sessions",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Session timeout check endpoint
  app.get(
    "/api/security/session-check",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Get user's session timeout setting
        const sessionTimeoutSetting = await storage.getSetting(
          "security",
          "sessionTimeout"
        );
        const sessionTimeoutMinutes = sessionTimeoutSetting
          ? Number(sessionTimeoutSetting.value)
          : 30;

        // Get auto logout setting
        const autoLogoutSetting = await storage.getSetting(
          "security",
          "autoLogout"
        );
        const autoLogoutEnabled = autoLogoutSetting
          ? Boolean(autoLogoutSetting.value)
          : true;

        // In a real implementation, you would check the actual session creation time
        // and compare it with the current time to determine if the session should expire

        res.json({
          sessionValid: true,
          sessionTimeoutMinutes,
          autoLogoutEnabled,
          lastActivity: new Date().toISOString(),
        });
      } catch (error) {
        console.error("❌ Error checking session:", error);
        res.status(500).json({
          message: "Failed to check session status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      console.log("🔍 Fetching categories...");
      const categories = await storage.getCategories();
      console.log(
        "✅ Categories fetched successfully:",
        categories.length,
        "items"
      );
      res.json(categories);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      res.status(500).json({
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  });
  app.post("/api/categories", async (req, res) => {
    try {
      console.log("📋 Category creation request received:", req.body);
      const data = req.body;
      const category = await storage.createCategory(data);
      console.log("✅ Category created successfully:", category);
      res.json(category);
    } catch (error: any) {
      console.error("❌ Error creating category:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack,
      });
      res.status(500).json({
        error: "Failed to create category",
        details: error.message,
        code: error.code,
      });
    }
  });
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const data = req.body;
      const category = await storage.updateCategory(req.params.id, data);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  // Logo Management API - Legacy (now redirects to business logo)
  app.post("/api/logo/upload", (req: any, res: any) => {
    upload.single("logo")(req, res, async (err: any) => {
      try {
        if (err) {
          return res.status(400).json({ message: "File upload error" });
        }
        if (!req.file) {
          return res.status(400).json({ message: "No logo file provided" });
        }
        // Convert buffer to base64 for storage
        const base64Logo = req.file.buffer.toString("base64");
        const logoData = {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          data: `data:${req.file.mimetype};base64,${base64Logo}`,
        };
        // Save logo info to system settings (legacy - now saves as legacy logo)
        await storage.setSetting(
          "business",
          "legacy-logo",
          logoData,
          "Legacy logo (deprecated - use website or business logo)"
        );
        res.json({
          message: "Legacy logo uploaded successfully",
          logo: logoData,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to upload logo" });
      }
    });
  });
  app.get("/api/logo", async (req, res) => {
    try {
      const logoSetting = await storage.getSetting("business", "legacy-logo");
      if (logoSetting) {
        res.json({ logo: logoSetting.value });
      } else {
        res.json({ logo: null });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get logo" });
    }
  });
  app.delete("/api/logo", async (req, res) => {
    try {
      await storage.deleteSetting("business", "legacy-logo");
      res.json({ message: "Logo removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove logo" });
    }
  });
  // Primary Logo Management API (for website, login, sidebar)
  app.post("/api/logo/primary/upload", authenticateAndFilter, (req: any, res: any) => {
    console.log("🔄 Logo upload request received");
    upload.single("logo")(req, res, async (err: any) => {
      try {
        console.log("🔄 Processing logo upload...");
        if (err) {
          console.error("❌ Multer error:", err);
          return res.status(400).json({ message: "File upload error" });
        }
        if (!req.file) {
          console.error("❌ No file provided");
          return res.status(400).json({ message: "No logo file provided" });
        }
        console.log("✅ File received:", req.file.originalname, "Size:", req.file.size);
        // Convert buffer to base64 for storage
        const base64Logo = req.file.buffer.toString("base64");
        const logoData = {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          data: `data:${req.file.mimetype};base64,${base64Logo}`,
        };
        // Save primary logo info to system settings
        console.log("🔄 Saving logo to database...");
        
        // First, try to delete any existing primary-logo records to avoid constraint issues
        try {
          await storage.deleteSetting("business", "primary-logo");
          console.log("✅ Cleared existing primary-logo records");
        } catch (error: any) {
          console.log("ℹ️ No existing primary-logo records to clear");
        }
        
        // Now create the new record
        await storage.setSetting(
          "business",
          "primary-logo",
          logoData,
          "Primary logo for website, login, and sidebar"
        );
        console.log("✅ Primary logo saved with key: primary-logo");
        res.json({
          message: "Primary logo uploaded successfully",
          logo: logoData,
        });
      } catch (error: any) {
        console.error("❌ Logo upload error:", error);
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ 
          message: "Failed to upload primary logo",
          error: error.message 
        });
      }
    });
  });
  app.get("/api/logo/primary", authenticateAndFilter, async (req, res) => {
    try {
      logger.debug("Fetching primary logo...");
      const logoSetting = await storage.getSetting("business", "primary-logo");
      if (logoSetting) {
        logger.debug("Primary logo found");
        // Parse the JSON string value
        const logoData = typeof logoSetting.value === 'string' 
          ? JSON.parse(logoSetting.value) 
          : logoSetting.value;
        res.json({ logo: logoData });
      } else {
        logger.debug("Primary logo not found");
        res.json({ logo: null });
      }
    } catch (error) {
      logger.warn("Primary logo fetch failed, returning null", {
        err: (error as any)?.message || error,
      });
      // Graceful fallback in development when DB is not configured
      res.json({ logo: null });
    }
  });
  app.delete("/api/logo/primary", authenticateAndFilter, async (req, res) => {
    try {
      await storage.deleteSetting("business", "primary-logo");
      res.json({ message: "Primary logo removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove primary logo" });
    }
  });
  // Icon Logo Management API (for receipts, reports, small spaces)
  app.post("/api/logo/icon/upload", authenticateAndFilter, (req: any, res: any) => {
    upload.single("logo")(req, res, async (err: any) => {
      try {
        if (err) {
          return res.status(400).json({ message: "File upload error" });
        }
        if (!req.file) {
          return res.status(400).json({ message: "No logo file provided" });
        }
        // Convert buffer to base64 for storage
        const base64Logo = req.file.buffer.toString("base64");
        const logoData = {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          data: `data:${req.file.mimetype};base64,${base64Logo}`,
        };
        // Save icon logo info to system settings
        await storage.setSetting(
          "business",
          "icon-logo",
          logoData,
          "Icon logo for receipts, reports, and small spaces"
        );
        console.log("✅ Icon logo saved with key: icon-logo");
        res.json({
          message: "Icon logo uploaded successfully",
          logo: logoData,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to upload icon logo" });
      }
    });
  });
  app.get("/api/logo/icon", authenticateAndFilter, async (req, res) => {
    try {
      console.log("🔍 Fetching icon logo...");
      const logoSetting = await storage.getSetting("business", "icon-logo");
      if (logoSetting) {
        console.log("✅ Icon logo found");
        res.json({ logo: logoSetting.value });
      } else {
        console.log("❌ Icon logo not found");
        res.json({ logo: null });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get icon logo" });
    }
  });
  app.delete("/api/logo/icon", authenticateAndFilter, async (req, res) => {
    try {
      await storage.deleteSetting("business", "icon-logo");
      res.json({ message: "Icon logo removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove icon logo" });
    }
  });

  // Public logo endpoints (no authentication required for display)
  app.get("/api/public/logo/primary", async (req, res) => {
    try {
      const logoSetting = await storage.getSetting("business", "primary-logo");
      if (logoSetting) {
        // Parse the JSON string value
        const logoData = typeof logoSetting.value === 'string' 
          ? JSON.parse(logoSetting.value) 
          : logoSetting.value;
        res.json({ logo: logoData });
      } else {
        res.json({ logo: null });
      }
    } catch (error) {
      res.json({ logo: null });
    }
  });

  app.get("/api/public/logo/icon", async (req, res) => {
    try {
      const logoSetting = await storage.getSetting("business", "icon-logo");
      if (logoSetting) {
        // Parse the JSON string value
        const logoData = typeof logoSetting.value === 'string' 
          ? JSON.parse(logoSetting.value) 
          : logoSetting.value;
        res.json({ logo: logoData });
      } else {
        res.json({ logo: null });
      }
    } catch (error) {
      res.json({ logo: null });
    }
  });
  // Product Image Upload API
  app.post("/api/upload/image", (req: any, res: any) => {
    upload.single("image")(req, res, async (err: any) => {
      try {
        if (err) {
          return res.status(400).json({ message: "File upload error" });
        }
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "Invalid file type. Only images are allowed." });
        }
        // Validate file size (5MB limit)
        if (req.file.size > 5 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "File too large. Maximum size is 5MB." });
        }
        // Convert buffer to base64 for storage
        const base64Image = req.file.buffer.toString("base64");
        const imageData = {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          data: `data:${req.file.mimetype};base64,${base64Image}`,
        };
        // Generate a unique filename
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFilename = `product_${uuidv4()}${fileExtension}`;
        // For now, we'll store as base64 in the response
        // In a production environment, you might want to save to a file system or cloud storage
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        res.json({
          message: "Image uploaded successfully",
          imageUrl: imageUrl,
          filename: uniqueFilename,
          originalName: req.file.originalname,
          size: req.file.size,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to upload image" });
      }
    });
  });
  // Reports API
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { reportType, startDate, endDate, includeDetails } = req.body;
      const report = await storage.generateReport(
        reportType,
        new Date(startDate),
        new Date(endDate),
        includeDetails
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  app.post("/api/reports/export", async (req, res) => {
    try {
      const { reportData, format } = req.body;
      const exportData = await storage.exportReport(reportData, format);
      (res as any).setHeader("Content-Type", exportData.type);
      (res as any).setHeader(
        "Content-Disposition",
        `attachment; filename="report.${format}"`
      );
      res.send(exportData.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to export report" });
    }
  });
  // Customer Portal API - Requires authentication
  app.get("/api/customer-portal/search", async (req, res) => {
    // TODO: Add authentication middleware here
    // For now, we'll keep it public but add rate limiting
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`Customer portal access from IP: ${clientIP}`);

    // Rate limiting: max 10 requests per minute per IP
    // This is a basic implementation - consider using a proper rate limiting library
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }

      // First, try to search by phone, email, or device ID
      let customer = await storage.searchCustomerByContact(query);

      // If no customer found, try searching by device ID or receipt number
      if (!customer) {
        // Try to find device by ID or receipt number
        const device =
          (await storage.getDevice(query)) ||
          (await storage.getDeviceByReceiptNumber(query));
        if (device && device.customerId) {
          customer = await storage.getCustomer(device.customerId);
        }
      }

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Get customer's devices
      const devices = await storage.getDevicesByCustomerId(customer.id);

      // Split customer name into firstName and lastName
      const nameParts = (customer.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Format response with device details
      const customerData = {
        id: customer.id,
        firstName: firstName,
        lastName: lastName,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: "", // Not available in current schema
        devices: devices.map((device) => ({
          id: device.id,
          deviceType: device.deviceType || "Unknown",
          brand: device.brand || "Unknown",
          model: device.model || "Unknown Model",
          problemDescription: device.problemDescription,
          status: device.status,
          priority: device.priority,
          estimatedCompletionDate: device.estimatedCompletionDate,
          totalCost: device.totalCost,
          paymentStatus: device.paymentStatus,
          createdAt: device.createdAt,
          technicianNotes: device.technicianNotes,
        })),
      };
      res.json(customerData);
    } catch (error) {
      console.error("Customer portal search error:", error);
      res.status(500).json({ message: "Failed to search customer data" });
    }
  });
  // Analytics APIs
  app.get("/api/analytics", authenticateAndFilter, async (req: any, res) => {
    try {
      const analytics = await storage.getAnalytics(
        req.query,
        req.locationFilter
      );
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  // Import/Export (Excel) for selected entities
  const exportEntities = new Set([
    "inventory",
    "customers",
    "expenses",
    "service-types",
    "device-types",
    "models",
    "brands",
    "devices",
    "accessories",
  ]);
  app.get("/api/export/:entity", async (req: any, res: any) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const entity = req.params.entity;
      if (!exportEntities.has(entity)) {
        return res
          .status(400)
          .json({ message: "Unsupported entity for export" });
      }
      let rows: any[] = [];
      switch (entity) {
        case "inventory":
          rows = await storage.getInventoryItems();
          break;
        case "customers":
          rows = await storage.getCustomers();
          break;
        case "expenses":
          rows = await storage.getExpenses();
          break;
        case "service-types":
          rows = await storage.getServiceTypes();
          break;
        case "device-types":
          rows = await storage.getDeviceTypes();
          break;
        case "models":
          rows = await storage.getModels();
          break;
        case "brands":
          rows = await storage.getBrands();
          break;
        case "devices":
          rows = await storage.getDevices();
          break;
        case "accessories":
          rows = await storage
            .getInventoryItems()
            .then((items) =>
              items.filter((item) => item.category === "Accessories")
            );
          break;
      }
      const worksheet = ExcelUtils.json_to_sheet(rows);
      const workbook = ExcelUtils.book_new();
      ExcelUtils.book_append_sheet(workbook, worksheet, entity);
      const buffer = await ExcelUtils.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${entity}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  app.post("/api/import/:entity", async (req: any, res: any) => {
    const entity = req.params.entity;
    upload.single("file")(req as any, res as any, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: "Invalid upload" });
      }
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        if (!exportEntities.has(entity)) {
          return res
            .status(400)
            .json({ message: "Unsupported entity for import" });
        }
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = await ExcelUtils.read(req.file.buffer, {
          type: "buffer",
        });
        const sheetName = workbook.SheetNames?.[0] || "Sheet1";
        const sheet = workbook.Sheets?.[sheetName];
        if (!sheet) {
          return res
            .status(400)
            .json({ message: "No worksheet found in the uploaded file" });
        }
        const rows: any[] = ExcelUtils.sheet_to_json(sheet);
        let inserted: any[] = [];
        // Basic mapping/validation per entity; relies on existing insert schemas
        switch (entity) {
          case "inventory":
            for (const r of rows) {
              const payload = {
                locationId: r.locationId || null,
                name: r.name,
                sku: r.sku,
                description: r.description || null,
                category: r.category || "General",
                purchasePrice: r.purchasePrice?.toString(),
                salePrice: r.salePrice?.toString(),
                quantity: Number(r.quantity ?? 0),
                minStockLevel: Number(r.minStockLevel ?? 10),
                reorderPoint: Number(r.reorderPoint ?? 15),
                reorderQuantity: Number(r.reorderQuantity ?? 50),
                leadTimeDays: Number(r.leadTimeDays ?? 7),
                supplier: r.supplier || null,
                barcode: r.barcode || null,
                isActive: r.isActive !== false,
                isPublic: r.isPublic !== false,
                sortOrder: Number(r.sortOrder ?? 0),
              };
              const item = await storage.createInventoryItem(payload as any);
              inserted.push(item);
            }
            break;
          case "customers":
            for (const r of rows) {
              const payload = {
                name: r.name,
                email: r.email || "",
                phone: r.phone,
                address: r.address || "",
                notes: r.notes || "",
              };
              const c = await storage.createCustomer(payload as any);
              inserted.push(c);
            }
            break;
          case "expenses":
            for (const r of rows) {
              const payload = {
                locationId: r.locationId || null,
                category: r.category,
                description: r.description,
                amount: (r.amount ?? "0").toString(),
                expenseDate: new Date(r.expenseDate || Date.now()),
                vendor: r.vendor || null,
                receiptUrl: r.receiptUrl || null,
                notes: r.notes || null,
                isRecurring: !!r.isRecurring,
                recurringFrequency: r.recurringFrequency || null,
                createdBy: r.createdBy || null,
              };
              const e = await storage.createExpense(payload as any);
              inserted.push(e);
            }
            break;
          case "service-types":
            for (const r of rows) {
              const payload = {
                name: r.name,
                description: r.description || "",
                basePrice: r.basePrice?.toString() ?? "0",
                estimatedDuration: Number(r.estimatedDuration ?? 60),
                isActive: r.isActive !== false,
              };
              const s = await storage.createServiceType(payload as any);
              inserted.push(s);
            }
            break;
          case "device-types":
            for (const r of rows) {
              const payload = {
                name: r.name,
                description: r.description || "",
                isActive: r.isActive !== false,
              };
              const d = await storage.createDeviceType(payload as any);
              inserted.push(d);
            }
            break;
          case "brands":
            for (const r of rows) {
              const payload = {
                name: r.name,
                description: r.description || "",
                website: r.website || "",
                isActive: r.isActive !== false,
              };
              const b = await storage.createBrand(payload as any);
              inserted.push(b);
            }
            break;
          case "models":
            for (const r of rows) {
              const payload = {
                name: r.name,
                brandId: r.brandId,
                deviceTypeId: r.deviceTypeId,
                description: r.description || "",
                specifications: r.specifications || "",
                releaseYear: r.releaseYear ? Number(r.releaseYear) : undefined,
                isActive: r.isActive !== false,
              };
              const m = await storage.createModel(payload as any);
              inserted.push(m);
            }
            break;
          case "devices":
            for (const r of rows) {
              const payload = {
                customerId: r.customerId,
                locationId: r.locationId || null,
                deviceTypeId: r.deviceTypeId || null,
                brandId: r.brandId || null,
                modelId: r.modelId || null,
                serialNumber: r.serialNumber || null,
                problemDescription: r.problemDescription,
                serviceTypeId: r.serviceTypeId || null,
                status: r.status || "registered",
                priority: r.priority || "normal",
                estimatedCompletionDate: r.estimatedCompletionDate
                  ? new Date(r.estimatedCompletionDate)
                  : null,
                technicianNotes: r.technicianNotes || null,
                customerNotes: r.customerNotes || null,
                totalCost: r.totalCost?.toString(),
                paymentStatus: r.paymentStatus || "pending",
                createdBy: r.createdBy || null,
                assignedTo: r.assignedTo || null,
              };
              const d = await storage.createDevice(payload as any);
              inserted.push(d);
            }
            break;
          case "accessories":
            for (const r of rows) {
              const payload = {
                name: r.name,
                sku: r.sku,
                description: r.description || null,
                category: r.category || "Accessories",
                brand: r.brand || null,
                model: r.model || null,
                purchasePrice: r.purchasePrice?.toString(),
                salePrice: r.salePrice?.toString(),
                quantity: Number(r.quantity ?? 0),
                minStockLevel: Number(r.minStockLevel ?? 5),
                reorderPoint: Number(r.reorderPoint ?? 10),
                reorderQuantity: Number(r.reorderQuantity ?? 20),
                isPublic: r.isPublic !== false,
                isActive: r.isActive !== false,
                sortOrder: Number(r.sortOrder ?? 0),
                imageUrl: r.imageUrl || null,
                specifications: r.specifications
                  ? JSON.parse(r.specifications)
                  : null,
                compatibility: r.compatibility
                  ? JSON.parse(r.compatibility)
                  : null,
                warranty: r.warranty || null,
              };
              const inventoryItem = await storage.createInventoryItem(
                payload as any
              );

              // Also create an entry in the accessories table for backward compatibility
              try {
                await db.insert(accessories).values({
                  name: payload.name,
                  price: payload.salePrice,
                  stock: payload.quantity,
                  category: payload.category,
                  inventoryItemId: inventoryItem.id,
                });
              } catch (accessoryError) {
                console.warn(
                  "Failed to create accessories table entry:",
                  accessoryError
                );
                // Continue anyway since the main data is in inventory_items
              }

              inserted.push(inventoryItem);
            }
            break;
        }
        res.json({
          inserted: inserted.length,
          message: `Successfully imported ${inserted.length} ${entity}`,
        });
      } catch (error) {
        console.error(`${entity} import error:`, error);
        res.status(500).json({
          message: `Failed to import ${entity}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  });
  app.get(
    "/api/analytics/sales",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const salesData = await storage.getSalesAnalytics(req.query);
        res.json(salesData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch sales analytics" });
      }
    }
  );
  app.get(
    "/api/analytics/repairs",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const repairData = await storage.getRepairAnalytics(
          req.query,
          req.locationFilter
        );
        res.json(repairData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch repair analytics" });
      }
    }
  );
  app.get("/api/analytics/top-items", async (req, res) => {
    try {
      const topItems = await storage.getTopSellingItems(req.query);
      res.json(topItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top items" });
    }
  });
  app.get(
    "/api/analytics/revenue",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const revenueData = await storage.getRevenueAnalytics(
          req.query,
          req.locationFilter
        );
        res.json(revenueData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch revenue analytics" });
      }
    }
  );
  // Combined revenue (sales + delivered repairs)
  app.get("/api/analytics/revenue/combined", async (req, res) => {
    try {
      const granularity = (req.query.granularity as string) || "daily";
      const range = req.query.range
        ? parseInt(req.query.range as string)
        : undefined;
      // @ts-ignore
      const data = await (storage as any).getCombinedRevenueSeries?.({
        granularity,
        range,
      });
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch combined revenue" });
    }
  });
  // Profit series (revenue - expenses)
  app.get("/api/analytics/profit", async (req, res) => {
    try {
      const granularity = (req.query.granularity as string) || "daily";
      const range = req.query.range
        ? parseInt(req.query.range as string)
        : undefined;
      // @ts-ignore
      const data = await (storage as any).getProfitSeries?.({
        granularity,
        range,
      });
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profit series" });
    }
  });
  // Repair cost analytics (completed repairs)
  app.get("/api/analytics/repair-costs", async (req, res) => {
    try {
      // @ts-ignore - add method if not part of interface yet
      const data = await (storage as any).getRepairCostAnalytics?.(req.query);
      if (!data) return res.json({ daily: [], byService: [], summary: {} });
      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch repair cost analytics" });
    }
  });
  app.get(
    "/api/analytics/performance",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const performanceData = await storage.getPerformanceAnalytics(
          timeRange,
          req.locationFilter
        );
        res.json(performanceData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch performance data" });
      }
    }
  );
  app.get(
    "/api/analytics/forecast",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const forecastData = await storage.getForecastAnalytics(
          timeRange,
          req.locationFilter
        );
        res.json(forecastData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch forecast data" });
      }
    }
  );
  app.get(
    "/api/analytics/technicians",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const technicianData = await storage.getTechnicianAnalytics(
          timeRange,
          req.locationFilter
        );
        res.json(technicianData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch technician data" });
      }
    }
  );
  app.get(
    "/api/analytics/customers",
    authenticateAndFilter,
    async (req: any, res: any) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const customerData = await storage.getCustomerAnalytics(
          timeRange,
          req.locationFilter
        );
        res.json(customerData);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch customer data" });
      }
    }
  );
  // Advanced Analytics Data Organization endpoints
  const analyticsOrganizer = new AnalyticsDataOrganizer();
  app.get(
    "/api/analytics/organized/satisfaction",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const satisfactionData =
          await analyticsOrganizer.organizeCustomerSatisfactionData(
            timeRange,
            req.locationFilter
          );
        res.json(satisfactionData);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to organize satisfaction data" });
      }
    }
  );
  app.get(
    "/api/analytics/organized/performance",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const performanceData =
          await analyticsOrganizer.organizeRepairPerformanceData(
            timeRange,
            req.locationFilter
          );
        res.json(performanceData);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to organize performance data" });
      }
    }
  );
  app.get(
    "/api/analytics/organized/behavior",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const behaviorData =
          await analyticsOrganizer.organizeCustomerBehaviorData(
            timeRange,
            req.locationFilter
          );
        res.json(behaviorData);
      } catch (error) {
        res.status(500).json({ message: "Failed to organize behavior data" });
      }
    }
  );
  app.get(
    "/api/analytics/organized/revenue",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const revenueData =
          await analyticsOrganizer.organizeRevenueAnalyticsData(
            timeRange,
            req.locationFilter
          );
        res.json(revenueData);
      } catch (error) {
        res.status(500).json({ message: "Failed to organize revenue data" });
      }
    }
  );
  app.get(
    "/api/analytics/comprehensive",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const timeRange = (req.query.timeRange as string) || "30d";
        const comprehensiveData =
          await analyticsOrganizer.getComprehensiveAnalyticsData(
            timeRange,
            req.locationFilter
          );
        res.json(comprehensiveData);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch comprehensive analytics" });
      }
    }
  );
  // Temporary migration endpoint for service types and accessories
  app.post("/api/migrate/service-accessories", async (req, res) => {
    try {
      // Update service_types table with new columns
      await db.execute(sql`
        ALTER TABLE service_types 
        ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General',
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS features JSONB,
        ADD COLUMN IF NOT EXISTS requirements JSONB,
        ADD COLUMN IF NOT EXISTS warranty TEXT,
        ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
      `);
      // Create accessories table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS accessories (
          num_id SERIAL UNIQUE,
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          sku TEXT NOT NULL UNIQUE,
          description TEXT,
          category TEXT NOT NULL DEFAULT 'General',
          brand TEXT,
          model TEXT,
          purchase_price DECIMAL(10,2),
          sale_price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          min_stock_level INTEGER NOT NULL DEFAULT 5,
          reorder_point INTEGER NOT NULL DEFAULT 10,
          reorder_quantity INTEGER NOT NULL DEFAULT 20,
          is_public BOOLEAN NOT NULL DEFAULT true,
          is_active BOOLEAN NOT NULL DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          image_url TEXT,
          specifications JSONB,
          compatibility JSONB,
          warranty TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      // Insert some sample accessories
      await db.execute(sql`
        INSERT INTO accessories (name, sku, description, category, brand, sale_price, quantity) VALUES
        ('USB-C to HDMI Adapter', 'ACC-001', 'High-quality USB-C to HDMI adapter for laptops and phones', 'Adapters', 'Generic', 15.99, 25),
        ('Wireless Mouse', 'ACC-002', 'Ergonomic wireless mouse with 2.4GHz connectivity', 'Peripherals', 'Logitech', 29.99, 15),
        ('Laptop Cooling Pad', 'ACC-003', 'USB-powered laptop cooling pad with adjustable fan speeds', 'Cooling', 'Cooler Master', 39.99, 10),
        ('USB Flash Drive 32GB', 'ACC-004', 'High-speed USB 3.0 flash drive with 32GB storage', 'Storage', 'SanDisk', 12.99, 50),
        ('Laptop Charger Universal', 'ACC-005', 'Universal laptop charger with multiple tips', 'Power', 'Generic', 45.99, 8)
        ON CONFLICT (sku) DO NOTHING
      `);
      // Update existing service types with categories
      await db.execute(sql`
        UPDATE service_types SET 
          category = CASE 
            WHEN name ILIKE '%repair%' THEN 'Hardware Repair'
            WHEN name ILIKE '%recovery%' THEN 'Data Recovery'
            WHEN name ILIKE '%virus%' OR name ILIKE '%malware%' THEN 'Software'
            WHEN name ILIKE '%upgrade%' THEN 'Hardware Upgrade'
            ELSE 'General'
          END,
          features = CASE 
            WHEN name ILIKE '%repair%' THEN '["Professional diagnosis", "Quality parts", "Testing"]'::jsonb
            WHEN name ILIKE '%recovery%' THEN '["Advanced recovery tools", "Secure handling", "Data verification"]'::jsonb
            WHEN name ILIKE '%virus%' OR name ILIKE '%malware%' THEN '["Virus removal", "System optimization", "Security software installation"]'::jsonb
            ELSE '["Professional service", "Quality guarantee"]'::jsonb
          END,
          warranty = CASE 
            WHEN name ILIKE '%repair%' THEN '90 days parts and labor warranty'
            WHEN name ILIKE '%recovery%' THEN '30 days service warranty'
            ELSE '30 days service warranty'
          END
        WHERE category = 'General'
      `);
      res.json({
        success: true,
        message: "Service types and accessories tables updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Migration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Submit device feedback
  app.post("/api/feedback/submit", async (req, res) => {
    try {
      const feedbackData = feedbackSchema.parse(req.body);
      const deviceId = req.body.deviceId;
      if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required" });
      }
      // Get device info to include customer and location
      const [device] = await db
        .select({
          customerId: devices.customerId,
          locationId: devices.locationId,
        })
        .from(devices)
        .where(eq(devices.id, deviceId));
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      const feedback = await storage.submitDeviceFeedback({
        ...feedbackData,
        customerId: device.customerId,
        locationId: device.locationId,
      });

      // Create notification for device feedback
      try {
        // Get all admin users to notify
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.role, "admin"));

        // Get customer details for notification
        const [customer] = device.customerId
          ? await db
              .select()
              .from(customers)
              .where(eq(customers.id, device.customerId))
          : [null];

        for (const adminUser of adminUsers) {
          await NotificationService.createCustomerFeedbackNotification(
            feedback.id,
            adminUser.id,
            {
              customerName: customer?.name || "Unknown Customer",
              customerEmail: customer?.email || "No email",
              serviceType: "Device Repair",
              rating: feedbackData.rating,
              comment: feedbackData.comment || "No comments",
            }
          );
        }
        console.log("✅ Device feedback notifications created successfully");
      } catch (notificationError) {
        console.error(
          "Error creating device feedback notification:",
          notificationError
        );
        // Don't fail the feedback creation if notification fails
      }

      res.json(feedback);
    } catch (error) {
      res.status(400).json({
        message: "Failed to submit feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Get device feedback
  app.get("/api/feedback/device/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const feedback = await storage.getDeviceFeedback(deviceId);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Request feedback for a device (mark as requested)
  app.post("/api/feedback/request/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      await db
        .update(devices)
        .set({ feedbackRequested: true })
        .where(eq(devices.id, deviceId));
      res.json({ message: "Feedback requested successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to request feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Temporary migration endpoint for feedback system
  app.post("/api/setup/create-feedback-system", async (req, res) => {
    try {
      // Add feedback columns to devices table
      await db.execute(sql`
        ALTER TABLE devices 
        ADD COLUMN IF NOT EXISTS feedback_requested BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS feedback_submitted BOOLEAN NOT NULL DEFAULT FALSE
      `);
      // Create device_feedback table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS device_feedback (
          num_id SERIAL UNIQUE,
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          device_id VARCHAR NOT NULL REFERENCES devices(id),
          customer_id VARCHAR NOT NULL REFERENCES customers(id),
          location_id VARCHAR REFERENCES locations(id),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          overall_satisfaction INTEGER NOT NULL CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
          service_quality INTEGER NOT NULL CHECK (service_quality >= 1 AND service_quality <= 5),
          communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
          timeliness INTEGER NOT NULL CHECK (timeliness >= 1 AND timeliness <= 5),
          value_for_money INTEGER NOT NULL CHECK (value_for_money >= 1 AND value_for_money <= 5),
          comments TEXT,
          would_recommend BOOLEAN NOT NULL DEFAULT TRUE,
          submitted_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      res.json({ message: "Feedback system created successfully!" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create feedback system",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Expense Categories API
  app.get("/api/expense-categories", async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });
  app.post("/api/expense-categories", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const categoryData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to create expense category" });
    }
  });
  app.put("/api/expense-categories/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const { id } = req.params;
      const updates = insertExpenseCategorySchema.partial().parse(req.body);
      const category = await storage.updateExpenseCategory(id, updates);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to update expense category" });
    }
  });
  app.delete("/api/expense-categories/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const { id } = req.params;
      await storage.deleteExpenseCategory(id);
      res.json({ message: "Expense category deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete expense category" });
    }
  });
  // Enhanced Expense Analytics API
  app.get("/api/analytics/expense-types", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      const analytics = await storage.getExpenseTypeAnalytics(locationFilter);
      res.json(analytics);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch expense type analytics" });
    }
  });
  app.get("/api/analytics/budget-analysis", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      const analysis = await storage.getBudgetAnalysis(locationFilter);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget analysis" });
    }
  });

  // Budgets CRUD API
  app.get("/api/budgets", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const year = req.query.year
        ? parseInt(String(req.query.year), 10)
        : undefined;
      const month = req.query.month
        ? parseInt(String(req.query.month), 10)
        : undefined;
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      const items = await storage.getBudgets(
        { year, month: Number.isNaN(month!) ? undefined : month },
        locationFilter
      );
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const data = req.body;
      const created = await storage.createBudget({
        ...data,
        createdBy: payload.id,
        locationId: data.locationId || payload.locationId || null,
      });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const { id } = req.params;
      const updated = await storage.updateBudget(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      const { id } = req.params;
      const ok = await storage.deleteBudget(id);
      res.json({ success: ok });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });
  app.get("/api/analytics/cash-flow-projections", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      const projections = await storage.getCashFlowProjections(locationFilter);
      res.json(projections);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch cash flow projections" });
    }
  });
  // Customer Insights API
  app.get("/api/analytics/customer-insights", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const timeRange = (req.query.timeRange as string) || "30d";
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      const insights = await storage.getCustomerInsights(
        timeRange,
        locationFilter
      );
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer insights" });
    }
  });
  // Global Search API
  app.get("/api/search", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const query = (req.query.q as string) || "";
      const locationFilter = req.query.locationFilter
        ? JSON.parse(req.query.locationFilter as string)
        : null;
      if (!query.trim()) {
        return res.json({ devices: [], customers: [], sales: [] });
      }
      const results = await storage.globalSearch(query, locationFilter);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to perform search" });
    }
  });
  // Purchase Orders API
  app.get(
    "/api/purchase-orders",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        console.log(
          "🔍 Purchase orders API called with locationFilter:",
          req.locationFilter
        );
        const purchaseOrders = await storage.getPurchaseOrders(
          req.locationFilter
        );
        console.log(`✅ Returning ${purchaseOrders.length} purchase orders`);
        res.json(purchaseOrders);
      } catch (error: any) {
        console.error("❌ Error fetching purchase orders:", error);
        res.status(500).json({ message: "Failed to fetch purchase orders" });
      }
    }
  );

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      // Extract items separately and remove from purchase order data
      const { items, ...purchaseOrderData } = req.body;
      const finalPurchaseOrderData = {
        ...purchaseOrderData,
        locationId: payload.locationId || req.body.locationId,
      };
      console.log(
        "Purchase order data to create:",
        JSON.stringify(finalPurchaseOrderData, null, 2)
      );
      console.log("Items to create:", JSON.stringify(items, null, 2));
      console.log("Payload info:", {
        userId: payload.id,
        locationId: payload.locationId,
        role: payload.role,
      });
      const purchaseOrder = await storage.createPurchaseOrder(
        finalPurchaseOrderData,
        payload.id,
        items
      );
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });
  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const purchaseOrder = await storage.getPurchaseOrderById(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });
  app.get("/api/purchase-orders/:id/items", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      console.log("🔍 API: Fetching items for purchase order ID:", id);
      const items = await storage.getPurchaseOrderItems(id);
      console.log("📊 API: Returning items:", items);
      res.json(items);
    } catch (error) {
      console.error("❌ API: Error fetching purchase order items:", error);
      res.status(500).json({ message: "Failed to fetch purchase order items" });
    }
  });
  app.put("/api/purchase-orders/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const updates = req.body;
      const purchaseOrder = await storage.updatePurchaseOrder(id, updates);
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });
  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      await storage.deletePurchaseOrder(id);
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  });
  // Purchase Order Workflow Management
  app.patch("/api/purchase-orders/:id/submit", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const purchaseOrder = await storage.updatePurchaseOrder(id, {
        status: "submitted",
      });
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit purchase order" });
    }
  });
  app.patch("/api/purchase-orders/:id/approve", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const purchaseOrder = await storage.updatePurchaseOrder(id, {
        status: "approved",
      });
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve purchase order" });
    }
  });
  app.patch("/api/purchase-orders/:id/receive", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const purchaseOrder = await storage.updatePurchaseOrder(id, {
        status: "received",
      });
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to receive purchase order" });
    }
  });
  app.patch("/api/purchase-orders/:id/cancel", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const { reason } = req.body;
      const purchaseOrder = await storage.updatePurchaseOrder(id, {
        status: "cancelled",
        notes: reason
          ? `Cancelled: ${reason}`
          : "Cancelled: No reason provided",
      });
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel purchase order" });
    }
  });
  app.patch("/api/purchase-orders/:id/reopen", async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      const { id } = req.params;
      const purchaseOrder = await storage.updatePurchaseOrder(id, {
        status: "draft",
      });
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to reopen purchase order" });
    }
  });
  // Excel Import/Export Routes
  // Export routes
  app.get(
    "/api/export/customers",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin", "sales"])) return;
        const customers = await storage.getCustomers(payload.locationId);
        // Create workbook and worksheet
        const workbook = ExcelUtils.book_new();
        const worksheet = ExcelUtils.json_to_sheet(
          customers.map((customer) => ({
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone,
            address: customer.address || "",
            notes: customer.notes || "",
            registrationDate: customer.registrationDate || customer.createdAt,
            locationId: customer.locationId || "",
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
          }))
        );
        // Set column widths
        setColumnWidths(worksheet, [
          { width: 20 }, // name
          { width: 25 }, // email
          { width: 15 }, // phone
          { width: 30 }, // address
          { width: 30 }, // notes
          { width: 15 }, // registrationDate
          { width: 20 }, // locationId
          { width: 20 }, // createdAt
          { width: 20 }, // updatedAt
        ]);
        ExcelUtils.book_append_sheet(workbook, worksheet, "Customers");
        const buffer = await ExcelUtils.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=customers.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/inventory",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin", "sales"])) return;
        const inventory = await storage.getInventoryItems(payload.locationId);
        const workbook = ExcelUtils.book_new();
        const worksheet = ExcelUtils.json_to_sheet(
          inventory.map((item) => ({
            name: item.name,
            sku: item.sku,
            description: item.description || "",
            category: item.category || "",
            purchasePrice: item.purchasePrice || "",
            salePrice: item.salePrice,
            quantity: item.quantity,
            minStockLevel: item.minStockLevel,
            reorderPoint: item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            leadTimeDays: item.leadTimeDays || "",
            supplier: item.supplier || "",
            barcode: item.barcode || "",
            isActive: item.isActive,
            lastRestocked: item.lastRestocked || "",
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        );
        setColumnWidths(worksheet, [
          { width: 25 }, // name
          { width: 15 }, // sku
          { width: 30 }, // description
          { width: 15 }, // category
          { width: 12 }, // purchasePrice
          { width: 12 }, // salePrice
          { width: 10 }, // quantity
          { width: 12 }, // minStockLevel
          { width: 12 }, // reorderPoint
          { width: 12 }, // reorderQuantity
          { width: 12 }, // leadTimeDays
          { width: 20 }, // supplier
          { width: 15 }, // barcode
          { width: 10 }, // isActive
          { width: 20 }, // lastRestocked
          { width: 20 }, // createdAt
          { width: 20 }, // updatedAt
        ]);
        ExcelUtils.book_append_sheet(workbook, worksheet, "Inventory");
        const buffer = await ExcelUtils.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=inventory.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/devices",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin", "technician", "sales"]))
          return;
        const devices = await storage.getDevices(payload.locationId);
        const workbook = ExcelUtils.book_new();
        const worksheet = ExcelUtils.json_to_sheet(
          devices.map((device) => ({
            customerId: device.customerId,
            deviceTypeId: device.deviceTypeId || "",
            brandId: device.brandId || "",
            modelId: device.modelId || "",
            serialNumber: device.serialNumber || "",
            problemDescription: device.problemDescription,
            serviceTypeId: device.serviceTypeId || "",
            status: device.status,
            priority: device.priority,
            estimatedCompletionDate: device.estimatedCompletionDate || "",
            technicianNotes: device.technicianNotes || "",
            customerNotes: device.customerNotes || "",
            totalCost: device.totalCost || "",
            paymentStatus: device.paymentStatus,
            createdBy: device.createdBy || "",
            assignedTo: device.assignedTo || "",
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
          }))
        );
        setColumnWidths(worksheet, [
          { width: 20 }, // customerId
          { width: 15 }, // deviceTypeId
          { width: 15 }, // brandId
          { width: 15 }, // modelId
          { width: 20 }, // serialNumber
          { width: 40 }, // problemDescription
          { width: 15 }, // serviceTypeId
          { width: 15 }, // status
          { width: 10 }, // priority
          { width: 20 }, // estimatedCompletionDate
          { width: 30 }, // technicianNotes
          { width: 30 }, // customerNotes
          { width: 12 }, // totalCost
          { width: 15 }, // paymentStatus
          { width: 20 }, // createdBy
          { width: 20 }, // assignedTo
          { width: 20 }, // createdAt
          { width: 20 }, // updatedAt
        ]);
        ExcelUtils.book_append_sheet(workbook, worksheet, "Devices");
        const buffer = await ExcelUtils.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=devices.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  app.get(
    "/api/export/service-management",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        const [serviceTypes, brands, models, accessories, deviceTypes] =
          await Promise.all([
            storage.getServiceTypes(),
            storage.getBrands(),
            storage.getModels(),
            storage.getAccessories(),
            storage.getDeviceTypes(),
          ]);
        const workbook = ExcelUtils.book_new();
        // Service Types sheet
        const serviceTypesSheet = ExcelUtils.json_to_sheet(
          serviceTypes.map((st) => ({
            name: st.name,
            description: st.description || "",
            category: st.category,
            estimatedDuration: st.estimatedDuration || "",
            basePrice: st.basePrice || "",
            isPublic: st.isPublic,
            features: st.features ? JSON.stringify(st.features) : "",
            requirements: st.requirements || "",
            warranty: st.warranty || "",
            imageUrl: st.imageUrl || "",
            isActive: st.isActive,
            sortOrder: st.sortOrder,
            createdAt: st.createdAt,
            updatedAt: st.updatedAt,
          }))
        );
        ExcelUtils.book_append_sheet(
          workbook,
          serviceTypesSheet,
          "Service Types"
        );
        // Brands sheet
        const brandsSheet = ExcelUtils.json_to_sheet(
          brands.map((brand) => ({
            name: brand.name,
            description: brand.description || "",
            website: brand.website || "",
            isActive: brand.isActive,
            createdAt: brand.createdAt,
          }))
        );
        ExcelUtils.book_append_sheet(workbook, brandsSheet, "Brands");
        // Models sheet
        const modelsSheet = ExcelUtils.json_to_sheet(
          models.map((model) => ({
            name: model.name,
            brandId: model.brandId,
            deviceTypeId: model.deviceTypeId,
            description: model.description || "",
            specifications: model.specifications || "",
            releaseYear: model.releaseYear || "",
            isActive: model.isActive,
            createdAt: model.createdAt,
          }))
        );
        ExcelUtils.book_append_sheet(workbook, modelsSheet, "Models");
        // Accessories sheet
        const accessoriesSheet = ExcelUtils.json_to_sheet(
          accessories.map((acc) => ({
            name: acc.name,
            sku: acc.sku,
            description: acc.description || "",
            category: acc.category,
            brand: acc.brand || "",
            model: acc.model || "",
            purchasePrice: acc.purchasePrice || "",
            salePrice: acc.salePrice,
            quantity: acc.quantity,
            minStockLevel: acc.minStockLevel,
            reorderPoint: acc.reorderPoint,
            reorderQuantity: acc.reorderQuantity,
            isPublic: acc.isPublic,
            isActive: acc.isActive,
            sortOrder: acc.sortOrder,
            imageUrl: acc.imageUrl || "",
            specifications: acc.specifications
              ? JSON.stringify(acc.specifications)
              : "",
            compatibility: acc.compatibility
              ? JSON.stringify(acc.compatibility)
              : "",
            warranty: acc.warranty || "",
            createdAt: acc.createdAt,
            updatedAt: acc.updatedAt,
          }))
        );
        ExcelUtils.book_append_sheet(workbook, accessoriesSheet, "Accessories");
        // Device Types sheet
        const deviceTypesSheet = ExcelUtils.json_to_sheet(
          deviceTypes.map((dt) => ({
            name: dt.name,
            description: dt.description || "",
            isActive: dt.isActive,
            createdAt: dt.createdAt,
          }))
        );
        ExcelUtils.book_append_sheet(
          workbook,
          deviceTypesSheet,
          "Device Types"
        );
        const buffer = await ExcelUtils.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=service-management.xlsx"
        );
        res.send(buffer);
      } catch (error) {
        res.status(500).json({ message: "Export failed" });
      }
    }
  );
  // Import routes with enhanced validation and dry-run support
  app.post(
    "/api/import/customers",
    authenticateAndFilter,
    upload.single("file"),
    validateFileUpload,
    asyncHandler(async (req: any, res: any) => {
      if (req.user.role !== 'admin' && req.user.role !== 'sales') {
        throw new AuthorizationError();
      }

      const dryRun = req.body.dryRun === 'true' || req.query.dryRun === 'true';
      const file = req.file;
      const workbook = await ExcelUtils.read(req.file.buffer, {
        type: "buffer",
      });
      const sheetName = workbook.SheetNames?.[0] || "Sheet1";
      const worksheet = workbook.Sheets?.[sheetName];
      if (!worksheet) {
        return res
          .status(400)
          .json({ message: "No worksheet found in the uploaded file" });
      }
      const data = ExcelUtils.sheet_to_json(worksheet);

      // Validate all data first
      const validationResult = await importValidator.validateCustomers(data);

      // If dry run, return validation results only
      if (dryRun) {
        return res.json({
          success: true,
          dryRun: true,
          validation: validationResult,
        });
      }

      // If validation failed, return errors without importing
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Import validation failed. Fix errors and try again.',
          validation: validationResult,
        });
      }

      // Import valid records in transaction
      const imported: any[] = [];
      const failed: any[] = [];

      try {
        // Use transaction for atomic import
        await db.transaction(async (tx) => {
          for (const record of validationResult.validRecords) {
            try {
              const customerData = {
                ...record,
                locationId: req.locationFilter.locationId || req.user.locationId,
                registrationDate: new Date().toISOString().split("T")[0],
              };
              
              const customer = await storage.createCustomer(customerData);
              imported.push(customer);
            } catch (error) {
              failed.push({
                record,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              // Rollback transaction on any failure
              throw error;
            }
          }
        });

        logger.info('Customer import completed successfully', {
          imported: imported.length,
          userId: req.user.userId,
        });

        res.json({
          success: true,
          imported: imported.length,
          failed: failed.length,
          warnings: validationResult.warnings.length,
          message: `Successfully imported ${imported.length} customers`,
          details: {
            warnings: validationResult.warnings,
          },
        });
      } catch (error) {
        logger.error('Customer import failed, transaction rolled back', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: req.user.userId,
        });

        res.status(500).json({
          success: false,
          message: 'Import failed and was rolled back',
          imported: 0,
          failed: validationResult.validRecords.length,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })
  );
  app.post("/api/import/inventory", upload.single("file"), async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin", "sales"])) return;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const workbook = await ExcelUtils.read(req.file.buffer, {
        type: "buffer",
      });
      const sheetName = workbook.SheetNames?.[0] || "Sheet1";
      const worksheet = workbook.Sheets?.[sheetName];
      if (!worksheet) {
        return res
          .status(400)
          .json({ message: "No worksheet found in the uploaded file" });
      }
      const data = ExcelUtils.sheet_to_json(worksheet);
      let inserted = 0;
      let errors: string[] = [];
      for (const row of data) {
        try {
          // Check for required fields before processing
          if (!row.name || !row.sku) {
            errors.push(`Row ${inserted + 1}: Name and SKU are required`);
            continue;
          }
          const inventoryData = {
            name: String(row.name).trim(),
            sku: String(row.sku).trim(),
            description: row.description
              ? String(row.description).trim()
              : undefined,
            category: row.category ? String(row.category).trim() : "General",
            purchasePrice: row.purchasePrice
              ? String(parseFloat(String(row.purchasePrice)))
              : undefined,
            salePrice: String(parseFloat(String(row.salePrice || "0"))),
            quantity: parseInt(String(row.quantity || "0")),
            minStockLevel: parseInt(String(row.minStockLevel || "10")),
            reorderPoint: parseInt(String(row.reorderPoint || "15")),
            reorderQuantity: parseInt(String(row.reorderQuantity || "50")),
            leadTimeDays: row.leadTimeDays
              ? parseInt(String(row.leadTimeDays))
              : undefined,
            supplier: row.supplier ? String(row.supplier).trim() : undefined,
            barcode: row.barcode ? String(row.barcode).trim() : undefined,
            isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
            isPublic: row.isPublic !== undefined ? Boolean(row.isPublic) : true,
            sortOrder:
              row.sortOrder !== undefined ? parseInt(String(row.sortOrder)) : 0,
            locationId: payload.locationId,
          };
          // Validate against schema
          try {
            insertInventoryItemSchema.parse(inventoryData);
          } catch (validationError: unknown) {
            const errorMessage =
              validationError instanceof Error
                ? validationError.message
                : "Validation failed";
            errors.push(`Row ${inserted + 1}: ${errorMessage}`);
            continue;
          }
          await storage.createInventoryItem(inventoryData);
          inserted++;
        } catch (error) {
          errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
        }
      }
      res.json({
        inserted,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${inserted} inventory items${
          errors.length > 0 ? ` with ${errors.length} errors` : ""
        }`,
      });
    } catch (error) {
      res.status(500).json({ message: "Import failed" });
    }
  });
  app.post("/api/import/devices", upload.single("file"), async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin", "technician", "sales"])) return;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const workbook = await ExcelUtils.read(req.file.buffer, {
        type: "buffer",
      });
      const sheetName = workbook.SheetNames?.[0] || "Sheet1";
      const worksheet = workbook.Sheets?.[sheetName];
      if (!worksheet) {
        return res
          .status(400)
          .json({ message: "No worksheet found in the uploaded file" });
      }
      const data = ExcelUtils.sheet_to_json(worksheet);
      let inserted = 0;
      let errors: string[] = [];
      for (const row of data) {
        try {
          // Check for required fields before processing
          if (!row.customerId || !row.problemDescription) {
            errors.push(
              `Row ${
                inserted + 1
              }: Customer ID and problem description are required`
            );
            continue;
          }
          const deviceData = {
            customerId: String(row.customerId).trim(),
            deviceType: String(row.deviceType || "Unknown"),
            deviceTypeId: row.deviceTypeId
              ? String(row.deviceTypeId).trim()
              : undefined,
            brand: row.brand ? String(row.brand).trim() : undefined,
            brandId: row.brandId ? String(row.brandId).trim() : undefined,
            model: row.model ? String(row.model).trim() : undefined,
            modelId: row.modelId ? String(row.modelId).trim() : undefined,
            serialNumber: row.serialNumber
              ? String(row.serialNumber).trim()
              : undefined,
            problemDescription: String(row.problemDescription).trim(),
            receiptNumber: String(row.receiptNumber || `RCP-${Date.now()}`),
            serviceTypeId: row.serviceTypeId
              ? String(row.serviceTypeId).trim()
              : undefined,
            status: (row.status as any) || "registered",
            priority: (row.priority as any) || "normal",
            estimatedCompletionDate: row.estimatedCompletionDate
              ? String(row.estimatedCompletionDate)
              : undefined,
            technicianNotes: row.technicianNotes
              ? String(row.technicianNotes).trim()
              : undefined,
            customerNotes: row.customerNotes
              ? String(row.customerNotes).trim()
              : undefined,
            totalCost: row.totalCost
              ? String(parseFloat(String(row.totalCost)))
              : undefined,
            paymentStatus: (row.paymentStatus as any) || "pending",
            createdBy: payload.id,
            locationId: payload.locationId,
          };
          // Validate against schema
          try {
            insertDeviceSchema.parse(deviceData);
          } catch (validationError: unknown) {
            const errorMessage =
              validationError instanceof Error
                ? validationError.message
                : "Validation failed";
            errors.push(`Row ${inserted + 1}: ${errorMessage}`);
            continue;
          }
          await storage.createDevice(deviceData);
          inserted++;
        } catch (error) {
          errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
        }
      }
      res.json({
        inserted,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${inserted} devices${
          errors.length > 0 ? ` with ${errors.length} errors` : ""
        }`,
      });
    } catch (error) {
      res.status(500).json({ message: "Import failed" });
    }
  });
  app.post(
    "/api/import/service-management",
    upload.single("file"),
    async (req, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = await ExcelUtils.read(req.file.buffer, {
          type: "buffer",
        });
        let totalInserted = 0;
        let errors: string[] = [];
        // Import Service Types
        const serviceTypesSheet = workbook.Sheets?.["Service Types"];
        if (serviceTypesSheet) {
          const serviceTypesData = ExcelUtils.sheet_to_json(serviceTypesSheet);
          for (const row of serviceTypesData) {
            try {
              const serviceTypeData = {
                name: row.name ? String(row.name).trim() : "",
                description: row.description
                  ? String(row.description).trim()
                  : undefined,
                category: String(row.category || "General"),
                estimatedDuration: row.estimatedDuration
                  ? parseInt(String(row.estimatedDuration))
                  : undefined,
                basePrice: row.basePrice ? String(row.basePrice) : undefined,
                isPublic:
                  row.isPublic !== undefined ? Boolean(row.isPublic) : true,
                features: row.features
                  ? JSON.parse(String(row.features))
                  : undefined,
                requirements: row.requirements
                  ? [String(row.requirements).trim()]
                  : undefined,
                warranty: row.warranty
                  ? String(row.warranty).trim()
                  : undefined,
                imageUrl: row.imageUrl
                  ? String(row.imageUrl).trim()
                  : undefined,
                isActive:
                  row.isActive !== undefined ? Boolean(row.isActive) : true,
                sortOrder: row.sortOrder ? parseInt(String(row.sortOrder)) : 0,
              };
              if (!serviceTypeData.name) {
                errors.push(
                  `Service Types Row ${totalInserted + 1}: Name is required`
                );
                continue;
              }
              await storage.createServiceType(serviceTypeData);
              totalInserted++;
            } catch (error) {
              errors.push(
                `Service Types Row ${totalInserted + 1}: ${
                  (error as Error).message
                }`
              );
            }
          }
        }
        // Import Brands
        const brandsSheet = workbook.Sheets?.["Brands"];
        if (brandsSheet) {
          const brandsData = ExcelUtils.sheet_to_json(brandsSheet);
          for (const row of brandsData) {
            try {
              const brandData = {
                name: row.name ? String(row.name).trim() : "",
                description: row.description
                  ? String(row.description).trim()
                  : undefined,
                website: row.website ? String(row.website).trim() : undefined,
                isActive:
                  row.isActive !== undefined ? Boolean(row.isActive) : true,
              };
              if (!brandData.name) {
                errors.push(
                  `Brands Row ${totalInserted + 1}: Name is required`
                );
                continue;
              }
              await storage.createBrand(brandData);
              totalInserted++;
            } catch (error) {
              errors.push(
                `Brands Row ${totalInserted + 1}: ${(error as Error).message}`
              );
            }
          }
        }
        // Import Device Types
        const deviceTypesSheet = workbook.Sheets?.["Device Types"];
        if (deviceTypesSheet) {
          const deviceTypesData = ExcelUtils.sheet_to_json(deviceTypesSheet);
          for (const row of deviceTypesData) {
            try {
              const deviceTypeData = {
                name: row.name ? String(row.name).trim() : "",
                description: row.description
                  ? String(row.description).trim()
                  : undefined,
                category: String(row.category || "General"),
                isActive:
                  row.isActive !== undefined ? Boolean(row.isActive) : true,
              };
              if (!deviceTypeData.name) {
                errors.push(
                  `Device Types Row ${totalInserted + 1}: Name is required`
                );
                continue;
              }
              await storage.createDeviceType(deviceTypeData);
              totalInserted++;
            } catch (error) {
              errors.push(
                `Device Types Row ${totalInserted + 1}: ${
                  (error as Error).message
                }`
              );
            }
          }
        }
        // Import Accessories
        const accessoriesSheet = workbook.Sheets?.["Accessories"];
        if (accessoriesSheet) {
          const accessoriesData = ExcelUtils.sheet_to_json(accessoriesSheet);
          for (const row of accessoriesData) {
            try {
              const accessoryData = {
                name: row.name ? String(row.name).trim() : "",
                sku: row.sku ? String(row.sku).trim() : "",
                description: row.description
                  ? String(row.description).trim()
                  : undefined,
                category: String(row.category || "General"),
                brand: row.brand ? String(row.brand).trim() : undefined,
                model: row.model ? String(row.model).trim() : undefined,
                purchasePrice: row.purchasePrice
                  ? String(row.purchasePrice)
                  : undefined,
                salePrice: String(row.salePrice || "0"),
                quantity: parseInt(String(row.quantity || "0")),
                minStockLevel: parseInt(String(row.minStockLevel || "5")),
                reorderPoint: parseInt(String(row.reorderPoint || "10")),
                reorderQuantity: parseInt(String(row.reorderQuantity || "20")),
                isPublic:
                  row.isPublic !== undefined ? Boolean(row.isPublic) : true,
                isActive:
                  row.isActive !== undefined ? Boolean(row.isActive) : true,
                sortOrder: row.sortOrder ? parseInt(String(row.sortOrder)) : 0,
                imageUrl: row.imageUrl
                  ? String(row.imageUrl).trim()
                  : undefined,
                specifications: row.specifications
                  ? JSON.parse(String(row.specifications))
                  : undefined,
                compatibility: row.compatibility
                  ? JSON.parse(String(row.compatibility))
                  : undefined,
                warranty: row.warranty
                  ? String(row.warranty).trim()
                  : undefined,
              };
              if (!accessoryData.name || !accessoryData.sku) {
                errors.push(
                  `Accessories Row ${
                    totalInserted + 1
                  }: Name and SKU are required`
                );
                continue;
              }
              await storage.createInventoryItem(accessoryData);
              totalInserted++;
            } catch (error) {
              errors.push(
                `Accessories Row ${totalInserted + 1}: ${
                  (error as Error).message
                }`
              );
            }
          }
        }
        // Import Models (after brands and device types are imported)
        const modelsSheet = workbook.Sheets?.["Models"];
        if (modelsSheet) {
          const modelsData = ExcelUtils.sheet_to_json(modelsSheet);
          for (const row of modelsData) {
            try {
              const modelData = {
                name: row.name ? String(row.name).trim() : "",
                brandId: row.brandId ? String(row.brandId).trim() : "",
                deviceTypeId: row.deviceTypeId
                  ? String(row.deviceTypeId).trim()
                  : "",
                description: row.description
                  ? String(row.description).trim()
                  : undefined,
                specifications: row.specifications
                  ? String(row.specifications).trim()
                  : undefined,
                releaseYear: row.releaseYear
                  ? parseInt(String(row.releaseYear))
                  : undefined,
                isActive:
                  row.isActive !== undefined ? Boolean(row.isActive) : true,
              };
              if (
                !modelData.name ||
                !modelData.brandId ||
                !modelData.deviceTypeId
              ) {
                errors.push(
                  `Models Row ${
                    totalInserted + 1
                  }: Name, Brand ID, and Device Type ID are required`
                );
                continue;
              }
              await storage.createModel(modelData);
              totalInserted++;
            } catch (error) {
              errors.push(
                `Models Row ${totalInserted + 1}: ${(error as Error).message}`
              );
            }
          }
        }
        res.json({
          inserted: totalInserted,
          errors: errors.length > 0 ? errors : undefined,
          message: `Successfully imported ${totalInserted} service management items${
            errors.length > 0 ? ` with ${errors.length} errors` : ""
          }`,
        });
      } catch (error) {
        res.status(500).json({ message: "Import failed" });
      }
    }
  );
  // Individual service management import routes
  app.post(
    "/api/import/service-types",
    upload.single("file"),
    async (req, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = await ExcelUtils.read(req.file.buffer, {
          type: "buffer",
        });
        const sheetName = workbook.SheetNames?.[0] || "Sheet1";
        const worksheet = workbook.Sheets?.[sheetName];
        if (!worksheet) {
          return res
            .status(400)
            .json({ message: "No worksheet found in the uploaded file" });
        }
        const data = ExcelUtils.sheet_to_json(worksheet);
        let inserted = 0;
        let errors: string[] = [];
        for (const row of data) {
          try {
            // Check for required fields before processing
            if (!row.name) {
              errors.push(`Row ${inserted + 1}: Name is required`);
              continue;
            }
            const serviceTypeData = {
              name: String(row.name).trim(),
              description: row.description
                ? String(row.description).trim()
                : undefined,
              category: String(row.category || "General"),
              estimatedDuration: row.estimatedDuration
                ? parseInt(String(row.estimatedDuration))
                : undefined,
              basePrice: row.basePrice ? String(row.basePrice) : undefined,
              isPublic:
                row.isPublic !== undefined ? Boolean(row.isPublic) : true,
              features: row.features
                ? JSON.parse(String(row.features))
                : undefined,
              requirements: row.requirements
                ? JSON.parse(String(row.requirements))
                : undefined,
              warranty: row.warranty ? String(row.warranty).trim() : undefined,
              imageUrl: row.imageUrl ? String(row.imageUrl).trim() : undefined,
              isActive:
                row.isActive !== undefined ? Boolean(row.isActive) : true,
              sortOrder: row.sortOrder ? parseInt(String(row.sortOrder)) : 0,
            };
            // Validate against schema
            try {
              insertServiceTypeSchema.parse(serviceTypeData);
            } catch (validationError: unknown) {
              const errorMessage =
                validationError instanceof Error
                  ? validationError.message
                  : "Validation failed";
              errors.push(`Row ${inserted + 1}: ${errorMessage}`);
              continue;
            }
            await storage.createServiceType(serviceTypeData);
            inserted++;
          } catch (error) {
            errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
          }
        }
        res.json({
          inserted,
          errors: errors.length > 0 ? errors : undefined,
          message: `Successfully imported ${inserted} service types${
            errors.length > 0 ? ` with ${errors.length} errors` : ""
          }`,
        });
      } catch (error) {
        res.status(500).json({ message: "Import failed" });
      }
    }
  );
  app.post("/api/import/brands", upload.single("file"), async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = await ExcelUtils.read(req.file.buffer, {
        type: "buffer",
      });
      // Get the first worksheet from the workbook
      const sheetName = workbook.SheetNames?.[0] || "Sheet1";
      const worksheet = workbook.Sheets?.[sheetName];
      if (!worksheet) {
        return res
          .status(400)
          .json({ message: "No worksheet found in the uploaded file" });
      }
      const data = ExcelUtils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ message: "No data found in the uploaded file" });
      }
      let inserted = 0;
      let errors: string[] = [];
      for (const row of data) {
        try {
          // Check for required fields before processing
          if (!row.name) {
            errors.push(`Row ${inserted + 1}: Name is required`);
            continue;
          }
          const brandData = {
            name: String(row.name).trim(),
            description: row.description
              ? String(row.description).trim()
              : undefined,
            website: row.website ? String(row.website).trim() : undefined,
            isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
          };
          // Validate against schema
          try {
            insertBrandSchema.parse(brandData);
          } catch (validationError: unknown) {
            const errorMessage =
              validationError instanceof Error
                ? validationError.message
                : "Validation failed";
            errors.push(`Row ${inserted + 1}: ${errorMessage}`);
            continue;
          }
          await storage.createBrand(brandData);
          inserted++;
        } catch (error) {
          errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
        }
      }
      res.json({
        inserted,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${inserted} brands${
          errors.length > 0 ? ` with ${errors.length} errors` : ""
        }`,
      });
    } catch (error) {
      console.error("Brands import error:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      res.status(500).json({
        message: "Import failed",
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  });
  app.post(
    "/api/import/device-types",
    upload.single("file"),
    async (req, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = await ExcelUtils.read(req.file.buffer, {
          type: "buffer",
        });
        const sheetName = workbook.SheetNames?.[0] || "Sheet1";
        const worksheet = workbook.Sheets?.[sheetName];
        if (!worksheet) {
          return res
            .status(400)
            .json({ message: "No worksheet found in the uploaded file" });
        }
        const data = ExcelUtils.sheet_to_json(worksheet);
        let inserted = 0;
        let errors: string[] = [];
        for (const row of data) {
          try {
            // Check for required fields before processing
            if (!row.name) {
              errors.push(`Row ${inserted + 1}: Name is required`);
              continue;
            }
            const deviceTypeData = {
              name: String(row.name).trim(),
              description: row.description
                ? String(row.description).trim()
                : undefined,
              category: String(row.category || "General"),
              isActive:
                row.isActive !== undefined ? Boolean(row.isActive) : true,
            };
            // Validate against schema
            try {
              insertDeviceTypeSchema.parse(deviceTypeData);
            } catch (validationError: unknown) {
              const errorMessage =
                validationError instanceof Error
                  ? validationError.message
                  : "Validation failed";
              errors.push(`Row ${inserted + 1}: ${errorMessage}`);
              continue;
            }
            await storage.createDeviceType(deviceTypeData);
            inserted++;
          } catch (error) {
            errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
          }
        }
        res.json({
          inserted,
          errors: errors.length > 0 ? errors : undefined,
          message: `Successfully imported ${inserted} device types${
            errors.length > 0 ? ` with ${errors.length} errors` : ""
          }`,
        });
      } catch (error) {
        res.status(500).json({ message: "Import failed" });
      }
    }
  );
  app.post("/api/import/models", upload.single("file"), async (req, res) => {
    try {
      const payload = getAuthPayload(req, res);
      if (!payload) return;
      if (!enforceRole(payload, res, ["admin"])) return;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const workbook = await ExcelUtils.read(req.file.buffer, {
        type: "buffer",
      });
      const sheetName = workbook.SheetNames?.[0] || "Sheet1";
      const worksheet = workbook.Sheets?.[sheetName];
      if (!worksheet) {
        return res
          .status(400)
          .json({ message: "No worksheet found in the uploaded file" });
      }
      const data = ExcelUtils.sheet_to_json(worksheet);
      let inserted = 0;
      let errors: string[] = [];
      for (const row of data) {
        try {
          // Check for required fields before processing
          if (!row.name || !row.brandId || !row.deviceTypeId) {
            errors.push(
              `Row ${
                inserted + 1
              }: Name, Brand ID, and Device Type ID are required`
            );
            continue;
          }
          const modelData = {
            name: String(row.name).trim(),
            brandId: String(row.brandId).trim(),
            deviceTypeId: String(row.deviceTypeId).trim(),
            description: row.description
              ? String(row.description).trim()
              : undefined,
            specifications: row.specifications
              ? String(row.specifications).trim()
              : undefined,
            releaseYear: row.releaseYear
              ? parseInt(String(row.releaseYear))
              : undefined,
            isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
          };
          // Validate against schema
          try {
            insertModelSchema.parse(modelData);
          } catch (validationError: unknown) {
            const errorMessage =
              validationError instanceof Error
                ? validationError.message
                : "Validation failed";
            errors.push(`Row ${inserted + 1}: ${errorMessage}`);
            continue;
          }
          await storage.createModel(modelData);
          inserted++;
        } catch (error) {
          errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
        }
      }
      res.json({
        inserted,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${inserted} models${
          errors.length > 0 ? ` with ${errors.length} errors` : ""
        }`,
      });
    } catch (error) {
      res.status(500).json({ message: "Import failed" });
    }
  });
  app.post(
    "/api/import/accessories",
    upload.single("file"),
    async (req, res) => {
      try {
        const payload = getAuthPayload(req, res);
        if (!payload) return;
        if (!enforceRole(payload, res, ["admin"])) return;
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = await ExcelUtils.read(req.file.buffer, {
          type: "buffer",
        });
        const worksheet = workbook.Sheets![workbook.SheetNames![0]];
        const data = ExcelUtils.sheet_to_json(worksheet);
        let inserted = 0;
        let errors: string[] = [];
        for (const row of data) {
          try {
            // Check for required fields before processing
            if (!row.name || !row.sku) {
              errors.push(`Row ${inserted + 1}: Name and SKU are required`);
              continue;
            }
            const accessoryData = {
              name: String(row.name).trim(),
              sku: String(row.sku).trim(),
              description: row.description
                ? String(row.description).trim()
                : undefined,
              category: String(row.category || "Accessories"),
              brand: row.brand ? String(row.brand).trim() : undefined,
              model: row.model ? String(row.model).trim() : undefined,
              purchasePrice: row.purchasePrice
                ? String(row.purchasePrice)
                : undefined,
              salePrice: String(row.salePrice || "0"),
              quantity: parseInt(String(row.quantity || "0")),
              minStockLevel: parseInt(String(row.minStockLevel || "5")),
              reorderPoint: parseInt(String(row.reorderPoint || "10")),
              reorderQuantity: parseInt(String(row.reorderQuantity || "20")),
              isPublic:
                row.isPublic !== undefined ? Boolean(row.isPublic) : true,
              isActive:
                row.isActive !== undefined ? Boolean(row.isActive) : true,
              sortOrder: row.sortOrder ? parseInt(String(row.sortOrder)) : 0,
              imageUrl: row.imageUrl ? String(row.imageUrl).trim() : undefined,
              specifications: row.specifications
                ? JSON.parse(String(row.specifications))
                : undefined,
              compatibility: row.compatibility
                ? JSON.parse(String(row.compatibility))
                : undefined,
              warranty: row.warranty ? String(row.warranty).trim() : undefined,
            };
            // Validate against schema
            try {
              insertInventoryItemSchema.parse(accessoryData);
            } catch (validationError: unknown) {
              const errorMessage =
                validationError instanceof Error
                  ? validationError.message
                  : "Validation failed";
              errors.push(`Row ${inserted + 1}: ${errorMessage}`);
              continue;
            }
            // Create inventory item (which is now the main table for accessories)
            const inventoryItem = await storage.createInventoryItem(
              accessoryData
            );

            // Also create an entry in the accessories table for backward compatibility
            try {
              await db.insert(accessories).values({
                name: accessoryData.name,
                price: accessoryData.salePrice,
                stock: accessoryData.quantity,
                category: accessoryData.category,
                inventoryItemId: inventoryItem.id,
              });
            } catch (accessoryError) {
              console.warn(
                "Failed to create accessories table entry:",
                accessoryError
              );
              // Continue anyway since the main data is in inventory_items
            }

            inserted++;
          } catch (error) {
            errors.push(`Row ${inserted + 1}: ${(error as Error).message}`);
          }
        }
        res.json({
          inserted,
          errors: errors.length > 0 ? errors : undefined,
          message: `Successfully imported ${inserted} accessories${
            errors.length > 0 ? ` with ${errors.length} errors` : ""
          }`,
        });
      } catch (error) {
        console.error("Accessories import error:", error);
        res.status(500).json({
          message: "Import failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
  // Template download routes
  app.get("/api/templates/customers", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "John Doe",
            email: "john@example.com",
            phone: "1234567890",
            address: "123 Main St, City, State 12345",
            notes: "Preferred contact method: email",
            registrationDate: "2024-01-15",
          },
        ],
        "Customers Template"
      );
      setColumnWidths(worksheet, [
        { width: 20 }, // name
        { width: 25 }, // email
        { width: 15 }, // phone
        { width: 30 }, // address
        { width: 30 }, // notes
        { width: 15 }, // registrationDate
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=customers-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/inventory", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "Laptop Charger",
            sku: "CHARGER-001",
            description: "Universal laptop charger adapter",
            category: "Accessories",
            purchasePrice: "15.00",
            salePrice: "25.00",
            quantity: "50",
            minStockLevel: "10",
            reorderPoint: "15",
            reorderQuantity: "50",
            leadTimeDays: "7",
            supplier: "Tech Supplies Inc",
            barcode: "1234567890123",
          },
        ],
        "Inventory Template"
      );
      setColumnWidths(worksheet, [
        { width: 25 }, // name
        { width: 15 }, // sku
        { width: 30 }, // description
        { width: 15 }, // category
        { width: 12 }, // purchasePrice
        { width: 12 }, // salePrice
        { width: 10 }, // quantity
        { width: 12 }, // minStockLevel
        { width: 12 }, // reorderPoint
        { width: 12 }, // reorderQuantity
        { width: 12 }, // leadTimeDays
        { width: 20 }, // supplier
        { width: 15 }, // barcode
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventory-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/devices", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            customerId: "customer-uuid-here",
            deviceTypeId: "device-type-uuid-here",
            brandId: "brand-uuid-here",
            modelId: "model-uuid-here",
            serialNumber: "SN123456789",
            problemDescription: "Laptop won't turn on, shows blue screen",
            serviceTypeId: "service-type-uuid-here",
            status: "registered",
            priority: "normal",
            estimatedCompletionDate: "2024-01-15",
            technicianNotes: "Check power supply and motherboard",
            customerNotes: "Customer mentioned water spill last week",
            totalCost: "150.00",
            paymentStatus: "pending",
          },
        ],
        "Devices Template"
      );
      setColumnWidths(worksheet, [
        { width: 20 }, // customerId
        { width: 15 }, // deviceTypeId
        { width: 15 }, // brandId
        { width: 15 }, // modelId
        { width: 20 }, // serialNumber
        { width: 40 }, // problemDescription
        { width: 15 }, // serviceTypeId
        { width: 15 }, // status
        { width: 10 }, // priority
        { width: 20 }, // estimatedCompletionDate
        { width: 30 }, // technicianNotes
        { width: 30 }, // customerNotes
        { width: 12 }, // totalCost
        { width: 15 }, // paymentStatus
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=devices-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/service-types", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "Screen Replacement",
            description: "Replace cracked or broken laptop screen",
            category: "Hardware Repair",
            estimatedDuration: "120",
            basePrice: "150.00",
            isPublic: true,
            features: '["New screen", "Warranty", "Testing"]',
            requirements: '["Bring laptop", "Backup data"]',
            warranty: "90 days parts and labor",
            imageUrl: "",
            isActive: true,
            sortOrder: "1",
          },
        ],
        "Service Types Template"
      );
      setColumnWidths(worksheet, [
        { width: 25 }, // name
        { width: 30 }, // description
        { width: 20 }, // category
        { width: 15 }, // estimatedDuration
        { width: 12 }, // basePrice
        { width: 10 }, // isPublic
        { width: 30 }, // features
        { width: 30 }, // requirements
        { width: 25 }, // warranty
        { width: 20 }, // imageUrl
        { width: 10 }, // isActive
        { width: 10 }, // sortOrder
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=service-types-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/brands", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "Apple",
            description: "Apple Inc. products",
            website: "https://www.apple.com",
            isActive: true,
          },
        ],
        "Brands Template"
      );
      setColumnWidths(worksheet, [
        { width: 20 }, // name
        { width: 30 }, // description
        { width: 25 }, // website
        { width: 10 }, // isActive
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=brands-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/device-types", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "Laptop",
            description: "Portable computers",
            isActive: true,
          },
        ],
        "Device Types Template"
      );
      setColumnWidths(worksheet, [
        { width: 20 }, // name
        { width: 30 }, // description
        { width: 10 }, // isActive
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=device-types-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/models", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: 'MacBook Pro 13"',
            brandId: "brand-uuid-here",
            deviceTypeId: "device-type-uuid-here",
            description: "13-inch MacBook Pro",
            specifications: "M2 chip, 8GB RAM, 256GB SSD",
            releaseYear: "2022",
            isActive: true,
          },
        ],
        "Models Template"
      );
      setColumnWidths(worksheet, [
        { width: 25 }, // name
        { width: 20 }, // brandId
        { width: 20 }, // deviceTypeId
        { width: 30 }, // description
        { width: 30 }, // specifications
        { width: 12 }, // releaseYear
        { width: 10 }, // isActive
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=models-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/accessories", async (req, res) => {
    try {
      const { workbook, worksheet } = createWorksheetFromJson(
        [
          {
            name: "USB-C Cable",
            sku: "USB-C-001",
            description: "High-speed USB-C charging cable",
            category: "Cables",
            brand: "Generic",
            model: "USB-C-3A",
            purchasePrice: "5.00",
            salePrice: "12.00",
            quantity: "100",
            minStockLevel: "20",
            reorderPoint: "30",
            reorderQuantity: "100",
            isPublic: true,
            isActive: true,
            sortOrder: "1",
            imageUrl: "",
            specifications: '{"length": "1m", "power": "3A"}',
            compatibility: '["iPhone", "Android", "Laptop"]',
            warranty: "1 year",
          },
        ],
        "Accessories Template"
      );
      setColumnWidths(worksheet, [
        { width: 25 }, // name
        { width: 15 }, // sku
        { width: 30 }, // description
        { width: 15 }, // category
        { width: 15 }, // brand
        { width: 15 }, // model
        { width: 12 }, // purchasePrice
        { width: 12 }, // salePrice
        { width: 10 }, // quantity
        { width: 12 }, // minStockLevel
        { width: 12 }, // reorderPoint
        { width: 12 }, // reorderQuantity
        { width: 10 }, // isPublic
        { width: 10 }, // isActive
        { width: 10 }, // sortOrder
        { width: 20 }, // imageUrl
        { width: 30 }, // specifications
        { width: 30 }, // compatibility
        { width: 15 }, // warranty
      ]);
      const buffer = await writeWorkbookToBuffer(workbook);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=accessories-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  app.get("/api/templates/service-management", async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();

      // Service Types template
      const serviceTypesSheet = workbook.addWorksheet("Service Types Template");
      const serviceTypesData = [
        {
          name: "Screen Replacement",
          description: "Replace cracked or broken laptop screen",
          category: "Hardware Repair",
          estimatedDuration: "120",
          basePrice: "150.00",
          isPublic: true,
          features: '["New screen", "Warranty", "Testing"]',
          requirements: "Bring laptop and charger",
          warranty: "90 days parts and labor",
          imageUrl: "",
          isActive: true,
          sortOrder: "1",
        },
      ];
      if (serviceTypesData.length > 0) {
        const headers = Object.keys(serviceTypesData[0]);
        serviceTypesSheet.addRow(headers);
        serviceTypesData.forEach((row: any) => {
          const rowData = headers.map((header) => row[header] || "");
          serviceTypesSheet.addRow(rowData);
        });
      }

      // Brands template
      const brandsSheet = workbook.addWorksheet("Brands Template");
      const brandsData = [
        {
          name: "Apple",
          description: "Apple Inc. products",
          website: "https://www.apple.com",
          isActive: true,
        },
      ];
      if (brandsData.length > 0) {
        const headers = Object.keys(brandsData[0]);
        brandsSheet.addRow(headers);
        brandsData.forEach((row: any) => {
          const rowData = headers.map((header) => row[header] || "");
          brandsSheet.addRow(rowData);
        });
      }

      // Device Types template
      const deviceTypesSheet = workbook.addWorksheet("Device Types Template");
      const deviceTypesData = [
        {
          name: "Laptop",
          description: "Portable computers",
          isActive: true,
        },
      ];
      if (deviceTypesData.length > 0) {
        const headers = Object.keys(deviceTypesData[0]);
        deviceTypesSheet.addRow(headers);
        deviceTypesData.forEach((row: any) => {
          const rowData = headers.map((header) => row[header] || "");
          deviceTypesSheet.addRow(rowData);
        });
      }

      // Accessories template
      const accessoriesSheet = workbook.addWorksheet("Accessories Template");
      const accessoriesData = [
        {
          name: "USB-C Cable",
          sku: "USB-C-001",
          description: "High-speed USB-C charging cable",
          category: "Cables",
          brand: "Generic",
          model: "USB-C-3A",
          purchasePrice: "5.00",
          salePrice: "12.00",
          quantity: "100",
          minStockLevel: "20",
          reorderPoint: "30",
          reorderQuantity: "100",
          isPublic: true,
          isActive: true,
          sortOrder: "1",
          imageUrl: "",
          specifications: '{"length": "1m", "power": "3A"}',
          compatibility: '["iPhone", "Android", "Laptop"]',
          warranty: "1 year",
        },
      ];
      if (accessoriesData.length > 0) {
        const headers = Object.keys(accessoriesData[0]);
        accessoriesSheet.addRow(headers);
        accessoriesData.forEach((row: any) => {
          const rowData = headers.map((header) => row[header] || "");
          accessoriesSheet.addRow(rowData);
        });
      }

      // Models template
      const modelsSheet = workbook.addWorksheet("Models Template");
      const modelsData = [
        {
          name: 'MacBook Pro 13"',
          brandId: "brand-uuid-here",
          deviceTypeId: "device-type-uuid-here",
          description: "13-inch MacBook Pro",
          specifications: "M2 chip, 8GB RAM, 256GB SSD",
          releaseYear: "2022",
          isActive: true,
        },
      ];
      if (modelsData.length > 0) {
        const headers = Object.keys(modelsData[0]);
        modelsSheet.addRow(headers);
        modelsData.forEach((row: any) => {
          const rowData = headers.map((header) => row[header] || "");
          modelsSheet.addRow(rowData);
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=service-management-template.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Template download failed" });
    }
  });
  // Telegram integration endpoint
  app.post(
    "/api/telegram/send-purchase-order",
    upload.single("pdf"),
    async (req, res) => {
      try {
        const authPayload = getAuthPayload(req, res);
        if (!authPayload) return;
        if (!enforceRole(authPayload, res, ["admin", "technician", "sales"])) {
          return;
        }
        const { orderData } = req.body;
        const pdfFile = req.file;
        if (!orderData) {
          return res.status(400).json({ message: "Order data is required" });
        }
        const parsedOrderData = JSON.parse(orderData);
        // Telegram Bot API configuration
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          console.warn(
            "Telegram configuration not found. Skipping Telegram notification."
          );
          return res.status(200).json({
            message: "Telegram not configured",
            success: true,
          });
        }
        // Create message content
        const message = `
🛒 *NEW PURCHASE ORDER*
📋 *Order Details:*
• Order Number: \`${parsedOrderData.orderNumber}\`
• Priority: ${parsedOrderData.priority.toUpperCase()}
• Total Items: ${parsedOrderData.itemCount}
• Total Cost: ${parsedOrderData.totalCost}
• Expected Delivery: ${parsedOrderData.expectedDelivery || "Not specified"}
📅 Created: ${new Date().toLocaleString()}
👤 Created by: ${authPayload.username}
${pdfFile ? "📎 PDF attachment included" : ""}
      `;
        // Send message to Telegram
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: "Markdown",
            }),
          }
        );
        if (!telegramResponse.ok) {
          throw new Error("Failed to send message to Telegram");
        }
        // If PDF file is provided, send it as document
        if (pdfFile) {
          const formData = new FormData();
          formData.append("chat_id", TELEGRAM_CHAT_ID);
          formData.append(
            "document",
            new Blob([pdfFile.buffer]),
            `${parsedOrderData.orderNumber}.pdf`
          );
          formData.append(
            "caption",
            `Purchase Order: ${parsedOrderData.orderNumber}`
          );
          const documentResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
            {
              method: "POST",
              body: formData,
            }
          );
          if (!documentResponse.ok) {
            console.warn(
              "Failed to send PDF to Telegram, but message was sent successfully"
            );
          }
        }
        res.json({
          message: "Purchase order sent to Telegram successfully",
          success: true,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to send to Telegram",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // System Health API endpoint
  app.get("/api/system/health", async (req, res) => {
    try {
      const authPayload = getAuthPayload(req, res);
      if (!authPayload) return;
      const systemMonitor = SystemMonitor.getInstance();
      // Get real system metrics
      const metrics = await systemMonitor.getSystemMetrics();
      const dbHealth = await systemMonitor.getDatabaseHealth();
      const services = await systemMonitor.getServiceStatus();
      const systemLogs = await systemMonitor.getSystemLogs();
      const errorStats = await systemMonitor.getErrorStats();
      // Check database connectivity with real metrics
      let dbStatus = "healthy";
      let dbResponseTime = 0;
      let dbConnections = 0;
      try {
        const startTime = Date.now();
        await db.execute(sql`SELECT 1`);
        dbResponseTime = Date.now() - startTime;
        // Get database connection info
        const result = await db.execute(
          sql`SHOW STATUS LIKE 'Threads_connected'`
        );
        dbConnections = (result as any)[0]?.Value || 0;
      } catch (error) {
        dbStatus = "error";
      }
      const systemHealth = {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          connections: dbConnections,
        },
        storage: {
          used: metrics.disk.usage,
          total: metrics.disk.total,
          status: metrics.disk.usage > 90 ? "warning" : "healthy",
        },
        performance: {
          cpu: metrics.cpu.usage,
          memory: metrics.memory.usage,
          uptime: metrics.uptime,
        },
        services,
        systemLogs,
        errorStats,
        systemInfo: {
          platform: metrics.platform,
          nodeVersion: metrics.nodeVersion,
          cores: metrics.cpu.cores,
          loadAverage: metrics.cpu.loadAverage,
          processId: metrics.processInfo.pid,
        },
        lastUpdated: new Date().toISOString(),
      };
      res.json(systemHealth);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get system health",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  // Notification routes
  app.get(
    "/api/notifications",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { status = "all", limit = 50, offset = 0 } = req.query;
        const notifications = await NotificationService.getUserNotifications(
          userId,
          {
            status: status as "unread" | "read" | "archived" | "all",
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          }
        );
        res.json(notifications);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch notifications",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Create test notifications endpoint (for development)
  app.post(
    "/api/notifications/create-test",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Create some test notifications with specific content
        const testNotifications = [
          {
            typeName: "device_registered",
            recipientId: userId,
            title: "New Device Registered",
            message:
              "iPhone 14 Pro has been registered for screen repair by John Doe",
            priority: "normal" as const,
            data: {
              deviceId: "test-device-1",
              deviceType: "Smartphone",
              brand: "Apple",
              model: "iPhone 14 Pro",
              customerName: "John Doe",
              serviceType: "Screen Repair",
            },
            relatedEntityType: "device",
            relatedEntityId: "test-device-1",
          },
          {
            typeName: "customer_feedback",
            recipientId: userId,
            title: "New Customer Feedback",
            message:
              "Sarah Johnson left 5-star feedback for laptop repair service",
            priority: "normal" as const,
            data: {
              feedbackId: "test-feedback-1",
              customerName: "Sarah Johnson",
              rating: 5,
              serviceType: "Laptop Repair",
              deviceType: "Laptop",
            },
            relatedEntityType: "customer_feedback",
            relatedEntityId: "test-feedback-1",
          },
          {
            typeName: "customer_message",
            recipientId: userId,
            title: "New Customer Message",
            message:
              "Mike Wilson sent a message about his tablet repair status",
            priority: "high" as const,
            data: {
              messageId: "test-message-1",
              customerName: "Mike Wilson",
              subject: "Tablet Repair Status",
              deviceType: "Tablet",
            },
            relatedEntityType: "customer_message",
            relatedEntityId: "test-message-1",
          },
          {
            typeName: "device_status_change",
            recipientId: userId,
            title: "Device Status Updated",
            message: "Samsung Galaxy S23 status changed to 'In Progress'",
            priority: "normal" as const,
            data: {
              deviceId: "test-device-2",
              oldStatus: "Received",
              newStatus: "In Progress",
              deviceType: "Smartphone",
              brand: "Samsung",
              model: "Galaxy S23",
            },
            relatedEntityType: "device",
            relatedEntityId: "test-device-2",
          },
          {
            typeName: "low_stock_alert",
            recipientId: userId,
            title: "Low Stock Alert",
            message: "iPhone 14 Pro screens are running low (3 remaining)",
            priority: "high" as const,
            data: {
              itemId: "test-item-1",
              itemName: "iPhone 14 Pro Screen",
              currentStock: 3,
              minThreshold: 5,
            },
            relatedEntityType: "inventory",
            relatedEntityId: "test-item-1",
          },
        ];

        const createdNotifications = [];
        for (const notification of testNotifications) {
          try {
            const created = await NotificationService.createNotification(
              notification
            );
            createdNotifications.push(created);
          } catch (error) {
            console.error(
              `Failed to create notification: ${notification.title}`,
              error
            );
          }
        }

        res.json({
          message: "Test notifications created successfully",
          count: createdNotifications.length,
          notifications: createdNotifications,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create test notifications",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Test customer feedback notification endpoint
  app.post(
    "/api/notifications/test-customer-feedback",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Create a test customer feedback notification
        const testFeedbackData = {
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          serviceType: "Device Repair",
          rating: 5,
          comment:
            "This is a test feedback notification to verify the system is working.",
        };

        const notification =
          await NotificationService.createCustomerFeedbackNotification(
            "test-feedback-id",
            userId,
            testFeedbackData
          );

        res.json({
          message: "Test customer feedback notification created successfully",
          notification: notification,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create test customer feedback notification",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Test customer message notification endpoint
  app.post(
    "/api/notifications/test-customer-message",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        // Create a test customer message notification
        const testMessageData = {
          messageId: "test-message-id",
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          customerPhone: "+1234567890",
          message:
            "This is a test customer message to verify the notification system is working.",
          subject: "Test Message",
        };

        const notification = await NotificationService.createNotification({
          typeName: "customer_message",
          recipientId: userId,
          title: "New Customer Message",
          message: `New message received from ${
            testMessageData.customerName
          }: ${testMessageData.message.substring(0, 100)}...`,
          priority: "normal",
          data: testMessageData,
          relatedEntityType: "customer_message",
          relatedEntityId: testMessageData.messageId,
        });

        res.json({
          message: "Test customer message notification created successfully",
          notification: notification,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create test customer message notification",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.get(
    "/api/notifications/unread-count",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const count = await NotificationService.getUnreadCount(userId);
        res.json({ count });
      } catch (error) {
        res.status(500).json({
          message: "Failed to get unread count",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/notifications/:id/read",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const updated = await NotificationService.markAsRead(
          notificationId,
          userId
        );
        res.json(updated);
      } catch (error) {
        res.status(500).json({
          message: "Failed to mark notification as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/notifications/mark-all-read",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        await NotificationService.markAllAsRead(userId);
        res.json({ message: "All notifications marked as read" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to mark all notifications as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.post(
    "/api/notifications/:id/archive",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const updated = await NotificationService.archiveNotification(
          notificationId,
          userId
        );
        res.json(updated);
      } catch (error) {
        res.status(500).json({
          message: "Failed to archive notification",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.get(
    "/api/notifications/preferences",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const preferences = await NotificationService.getUserPreferences(
          userId
        );
        res.json(preferences);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch notification preferences",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.put(
    "/api/notifications/preferences/:typeId",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const typeId = req.params.typeId;
        const preferences = req.body;

        console.log("🔔 Notification preferences update request:", {
          userId,
          typeId,
          preferences,
        });

        const updated = await NotificationService.updatePreferences(
          userId,
          typeId,
          preferences
        );

        console.log("🔔 Notification preferences update successful:", updated);
        res.json(updated);
      } catch (error) {
        console.error("🔔 Notification preferences update error:", error);
        console.error("🔔 Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        res.status(500).json({
          message: "Failed to update notification preferences",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  app.get(
    "/api/notifications/types",
    authenticateAndFilter,
    async (req: any, res) => {
      try {
        const types = await db
          .select()
          .from(notificationTypes)
          .where(eq(notificationTypes.isActive, true))
          .orderBy(notificationTypes.name);
        res.json(types);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch notification types",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Test device registration notification
  app.post(
    "/api/notifications/test-device-registration",
    authenticateUser,
    async (req, res) => {
      try {
        const userId = req.user.id;

        // Create a test device registration notification
        const testDeviceData = {
          deviceId: "test-device-id",
          customerName: "Test Customer",
          deviceType: "Smartphone",
          brand: "Apple",
          model: "iPhone 14",
          serviceType: "Screen Repair",
          problemDescription: "Cracked screen",
          totalCost: "$150.00",
          registeredBy: userId,
          priority: "normal",
        };

        await NotificationService.createDeviceNotification(
          "device_registered",
          testDeviceData.deviceId,
          userId,
          testDeviceData
        );

        res.json({
          message: "Test device registration notification created successfully",
        });
      } catch (error: any) {
        console.error(
          "Error creating test device registration notification:",
          error
        );
        res.status(500).json({
          message: "Failed to create test notification",
          error: error.message,
        });
      }
    }
  );

  // SMS Queue Management Endpoints (Admin only)
  app.get("/api/sms/queue", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError();
    }

    const status = req.query.status || 'failed';
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    
    const queue = await db
      .select()
      .from(smsQueue)
      .where(eq(smsQueue.status, status))
      .orderBy(desc(smsQueue.createdAt))
      .limit(limit);

    res.json(queue);
  }));

  app.get("/api/sms/queue/stats", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError();
    }

    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM sms_queue
    `);

    res.json(stats.rows[0] || { pending: 0, sent: 0, failed: 0, cancelled: 0, total: 0 });
  }));

  app.post("/api/sms/retry/:id", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError();
    }

    const { smsProcessor } = await import('./sms-processor');
    await smsProcessor.retrySMS(req.params.id);
    
    res.json({ success: true, message: 'SMS retry initiated' });
  }));

  app.delete("/api/sms/queue/:id", authenticateAndFilter, asyncHandler(async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError();
    }

    await db
      .update(smsQueue)
      .set({ status: 'cancelled' })
      .where(eq(smsQueue.id, req.params.id));

    res.json({ success: true, message: 'SMS cancelled' });
  }));

  // Debug notification types
  app.get(
    "/api/notifications/debug/types",
    authenticateUser,
    async (req, res) => {
      try {
        const types = await db.select().from(notificationTypes);
        const templates = await db.select().from(notificationTemplates);

        res.json({
          types: types,
          templates: templates,
          count: types.length,
        });
      } catch (error: any) {
        console.error("Error fetching notification types:", error);
        res.status(500).json({
          message: "Failed to fetch notification types",
          error: error.message,
        });
      }
    }
  );

  const httpServer = createServer(app as any);
  // WebSocket for real-time system monitoring (optional)
  let wss: any;
  try {
    const { WebSocketServer } = await import("ws");
    wss = new WebSocketServer({ server: httpServer });
    console.log("✅ WebSocket server initialized successfully");
  } catch (error) {
    console.log(
      "ℹ️ System health monitoring will work without real-time updates"
    );
    // Continue without WebSocket functionality
  }
  if (wss) {
    wss.on("connection", (ws: any) => {
      // Send initial system status
      const sendSystemStatus = async () => {
        try {
          const systemMonitor = SystemMonitor.getInstance();
          const metrics = await systemMonitor.getSystemMetrics();
          const dbHealth = await systemMonitor.getDatabaseHealth();
          const services = await systemMonitor.getServiceStatus();
          const errorStats = await systemMonitor.getErrorStats();
          const realTimeData = {
            type: "system-update",
            data: {
              performance: {
                cpu: metrics.cpu.usage,
                memory: metrics.memory.usage,
                uptime: metrics.uptime,
              },
              database: {
                status: dbHealth.status,
                responseTime: dbHealth.responseTime,
                connections: dbHealth.connections,
              },
              services: services.map((service) => ({
                name: service.name,
                status: service.status,
              })),
              errorStats,
              timestamp: new Date().toISOString(),
            },
          };
          ws.send(JSON.stringify(realTimeData));
        } catch (error) {}
      };
      // Send initial status
      sendSystemStatus();
      // Set up interval for real-time updates (every 10 seconds)
      const interval = setInterval(sendSystemStatus, 10000);
      ws.on("close", () => {
        clearInterval(interval);
      });
      ws.on("error", (error: any) => {
        clearInterval(interval);
      });
    });
  }
  return httpServer;
}
