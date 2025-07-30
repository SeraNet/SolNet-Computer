import {
  users,
  customers,
  devices,
  inventoryItems,
  sales,
  saleItems,
  appointments,
  deviceTypes,
  brands,
  models,
  serviceTypes,
  deviceStatusHistory,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Device,
  type InsertDevice,
  type InventoryItem,
  type InsertInventoryItem,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type Appointment,
  type InsertAppointment,
  type DeviceType,
  type InsertDeviceType,
  type Brand,
  type InsertBrand,
  type Model,
  type InsertModel,
  type ServiceType,
  type InsertServiceType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;

  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;

  // Devices
  getDevice(id: string): Promise<any>;
  getDevices(): Promise<any[]>;
  getActiveRepairs(): Promise<any[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device>;
  updateDeviceStatus(id: string, status: string, notes?: string, userId?: string): Promise<Device>;

  // Inventory
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getInventoryItems(): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem>;

  // Sales
  getSale(id: string): Promise<any>;
  getSales(): Promise<any[]>;
  getTodaysSales(): Promise<any[]>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;

  // Appointments
  getAppointment(id: string): Promise<any>;
  getAppointments(): Promise<any[]>;
  getTodaysAppointments(): Promise<any[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment>;

  // Reference data
  getDeviceTypes(): Promise<DeviceType[]>;
  getBrands(): Promise<Brand[]>;
  getModels(): Promise<Model[]>;
  getServiceTypes(): Promise<ServiceType[]>;
  createDeviceType(deviceType: InsertDeviceType): Promise<DeviceType>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  createModel(model: InsertModel): Promise<Model>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;

  // Analytics
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(asc(customers.name));
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(
        sql`${customers.name} ILIKE ${`%${query}%`} OR ${customers.phone} ILIKE ${`%${query}%`} OR ${customers.email} ILIKE ${`%${query}%`}`
      )
      .orderBy(asc(customers.name));
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  // Devices
  async getDevice(id: string): Promise<any> {
    const [device] = await db
      .select({
        id: devices.id,
        customerId: devices.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        deviceType: deviceTypes.name,
        brand: brands.name,
        model: models.name,
        serialNumber: devices.serialNumber,
        problemDescription: devices.problemDescription,
        serviceType: serviceTypes.name,
        status: devices.status,
        priority: devices.priority,
        estimatedCompletionDate: devices.estimatedCompletionDate,
        actualCompletionDate: devices.actualCompletionDate,
        technicianNotes: devices.technicianNotes,
        customerNotes: devices.customerNotes,
        totalCost: devices.totalCost,
        paymentStatus: devices.paymentStatus,
        createdAt: devices.createdAt,
        updatedAt: devices.updatedAt,
      })
      .from(devices)
      .leftJoin(customers, eq(devices.customerId, customers.id))
      .leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .leftJoin(brands, eq(devices.brandId, brands.id))
      .leftJoin(models, eq(devices.modelId, models.id))
      .leftJoin(serviceTypes, eq(devices.serviceTypeId, serviceTypes.id))
      .where(eq(devices.id, id));
    return device;
  }

  async getDevices(): Promise<any[]> {
    return await db
      .select({
        id: devices.id,
        customerId: devices.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        deviceType: deviceTypes.name,
        brand: brands.name,
        model: models.name,
        serialNumber: devices.serialNumber,
        problemDescription: devices.problemDescription,
        serviceType: serviceTypes.name,
        status: devices.status,
        priority: devices.priority,
        estimatedCompletionDate: devices.estimatedCompletionDate,
        actualCompletionDate: devices.actualCompletionDate,
        totalCost: devices.totalCost,
        paymentStatus: devices.paymentStatus,
        createdAt: devices.createdAt,
        updatedAt: devices.updatedAt,
      })
      .from(devices)
      .leftJoin(customers, eq(devices.customerId, customers.id))
      .leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .leftJoin(brands, eq(devices.brandId, brands.id))
      .leftJoin(models, eq(devices.modelId, models.id))
      .leftJoin(serviceTypes, eq(devices.serviceTypeId, serviceTypes.id))
      .orderBy(desc(devices.createdAt));
  }

  async getActiveRepairs(): Promise<any[]> {
    return await db
      .select({
        id: devices.id,
        customerId: devices.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        deviceType: deviceTypes.name,
        brand: brands.name,
        model: models.name,
        status: devices.status,
        priority: devices.priority,
        createdAt: devices.createdAt,
      })
      .from(devices)
      .leftJoin(customers, eq(devices.customerId, customers.id))
      .leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .leftJoin(brands, eq(devices.brandId, brands.id))
      .leftJoin(models, eq(devices.modelId, models.id))
      .where(
        sql`${devices.status} NOT IN ('delivered', 'cancelled')`
      )
      .orderBy(desc(devices.createdAt));
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db.insert(devices).values(insertDevice).returning();
    return device;
  }

  async updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  async updateDeviceStatus(id: string, status: string, notes?: string, userId?: string): Promise<Device> {
    // Get current device status
    const [currentDevice] = await db.select().from(devices).where(eq(devices.id, id));
    
    // Insert status history record
    if (currentDevice) {
      await db.insert(deviceStatusHistory).values({
        deviceId: id,
        oldStatus: currentDevice.status as any,
        newStatus: status as any,
        notes,
        changedBy: userId,
      });
    }

    const [device] = await db
      .update(devices)
      .set({ 
        status: status as any, 
        updatedAt: sql`NOW()`,
        ...(notes && { technicianNotes: notes })
      })
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  // Inventory
  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))
      .orderBy(asc(inventoryItems.name));
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.isActive, true),
          sql`${inventoryItems.quantity} <= ${inventoryItems.minStockLevel}`
        )
      )
      .orderBy(asc(inventoryItems.name));
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set({ quantity, updatedAt: sql`NOW()` })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  // Sales
  async getSale(id: string): Promise<any> {
    const [sale] = await db
      .select({
        id: sales.id,
        customerId: sales.customerId,
        customerName: customers.name,
        totalAmount: sales.totalAmount,
        taxAmount: sales.taxAmount,
        discountAmount: sales.discountAmount,
        paymentMethod: sales.paymentMethod,
        paymentStatus: sales.paymentStatus,
        notes: sales.notes,
        salesPersonName: users.firstName,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.salesPersonId, users.id))
      .where(eq(sales.id, id));
    return sale;
  }

  async getSales(): Promise<any[]> {
    return await db
      .select({
        id: sales.id,
        customerId: sales.customerId,
        customerName: customers.name,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        paymentStatus: sales.paymentStatus,
        salesPersonName: users.firstName,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.salesPersonId, users.id))
      .orderBy(desc(sales.createdAt));
  }

  async getTodaysSales(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select({
        id: sales.id,
        customerName: customers.name,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(gte(sales.createdAt, today))
      .orderBy(desc(sales.createdAt));
  }

  async createSale(insertSale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    return await db.transaction(async (tx) => {
      // Create sale
      const [sale] = await tx.insert(sales).values(insertSale).returning();

      // Create sale items and update inventory
      for (const item of items) {
        await tx.insert(saleItems).values({
          ...item,
          saleId: sale.id,
        });

        // Update inventory quantity
        await tx
          .update(inventoryItems)
          .set({
            quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
            updatedAt: sql`NOW()`,
          })
          .where(eq(inventoryItems.id, item.inventoryItemId));
      }

      return sale;
    });
  }

  // Appointments
  async getAppointment(id: string): Promise<any> {
    const [appointment] = await db
      .select({
        id: appointments.id,
        customerId: appointments.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        title: appointments.title,
        description: appointments.description,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        assignedToName: users.firstName,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointments(): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        customerId: appointments.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        title: appointments.title,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        assignedToName: users.firstName,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .orderBy(asc(appointments.appointmentDate));
  }

  async getTodaysAppointments(): Promise<any[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db
      .select({
        id: appointments.id,
        customerName: customers.name,
        title: appointments.title,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .where(
        and(
          gte(appointments.appointmentDate, today),
          lte(appointments.appointmentDate, tomorrow)
        )
      )
      .orderBy(asc(appointments.appointmentDate));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async getCustomerDevices(customerId: string): Promise<any[]> {
    return await db
      .select({
        id: devices.id,
        deviceType: deviceTypes.name,
        brand: brands.name,
        model: models.name,
        serialNumber: devices.serialNumber,
        status: devices.status,
        createdAt: devices.createdAt,
      })
      .from(devices)
      .leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .leftJoin(brands, eq(devices.brandId, brands.id))
      .leftJoin(models, eq(devices.modelId, models.id))
      .where(eq(devices.customerId, customerId))
      .orderBy(desc(devices.createdAt));
  }

  // Analytics methods
  async getAnalytics(query: any): Promise<any> {
    const dateRange = parseInt(query.dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get total revenue
    const revenueResult = await db
      .select({ total: sql`COALESCE(SUM(${sales.totalAmount}), 0)` })
      .from(sales)
      .where(sql`${sales.createdAt} >= ${startDate}`);

    // Get active repairs count
    const activeRepairsResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(devices)
      .where(sql`${devices.status} NOT IN ('delivered', 'cancelled')`);

    // Get total sales count
    const salesCountResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(sales)
      .where(sql`${sales.createdAt} >= ${startDate}`);

    // Get new customers count
    const newCustomersResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(customers)
      .where(sql`${customers.createdAt} >= ${startDate}`);

    // Get completion rate
    const completionRateResult = await db
      .select({ 
        total: sql`COUNT(*)`,
        completed: sql`COUNT(CASE WHEN ${devices.status} IN ('completed', 'delivered') THEN 1 END)`
      })
      .from(devices)
      .where(sql`${devices.createdAt} >= ${startDate}`);

    // Get average repair time
    const avgRepairTimeResult = await db
      .select({ 
        avgTime: sql`AVG(EXTRACT(EPOCH FROM (${devices.actualCompletionDate} - ${devices.createdAt})) / 86400)`
      })
      .from(devices)
      .where(sql`${devices.actualCompletionDate} IS NOT NULL AND ${devices.createdAt} >= ${startDate}`);

    // Get today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsTodayResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(appointments)
      .where(sql`${appointments.appointmentDate} = ${todayStart.toISOString().split('T')[0]}`);

    // Get average transaction
    const avgTransactionResult = await db
      .select({ avg: sql`COALESCE(AVG(${sales.totalAmount}), 0)` })
      .from(sales)
      .where(sql`${sales.createdAt} >= ${startDate}`);

    const completionRate = completionRateResult[0]?.total > 0 
      ? ((completionRateResult[0]?.completed || 0) / completionRateResult[0]?.total * 100).toFixed(1)
      : 0;

    return {
      totalRevenue: parseFloat(revenueResult[0]?.total || 0),
      activeRepairs: parseInt(activeRepairsResult[0]?.count || 0),
      totalSales: parseInt(salesCountResult[0]?.count || 0),
      newCustomers: parseInt(newCustomersResult[0]?.count || 0),
      completionRate: parseFloat(completionRate),
      avgRepairTime: parseFloat(avgRepairTimeResult[0]?.avgTime || 0),
      appointmentsToday: parseInt(appointmentsTodayResult[0]?.count || 0),
      avgTransaction: parseFloat(avgTransactionResult[0]?.avg || 0),
    };
  }

  async getSalesAnalytics(query: any): Promise<any[]> {
    const dateRange = parseInt(query.dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    return await db
      .select({
        date: sql`DATE(${sales.createdAt})`,
        total: sql`SUM(${sales.totalAmount})`,
        count: sql`COUNT(*)`
      })
      .from(sales)
      .where(sql`${sales.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(sql`DATE(${sales.createdAt})`);
  }

  async getRepairAnalytics(query: any): Promise<any[]> {
    return await db
      .select({
        status: devices.status,
        count: sql`COUNT(*)`
      })
      .from(devices)
      .groupBy(devices.status)
      .orderBy(sql`COUNT(*) DESC`);
  }

  async getTopSellingItems(query: any): Promise<any[]> {
    const dateRange = parseInt(query.dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    return await db
      .select({
        name: inventoryItems.name,
        quantity: sql`SUM(${saleItems.quantity})`,
        revenue: sql`SUM(${saleItems.quantity} * ${saleItems.unitPrice})`
      })
      .from(saleItems)
      .leftJoin(sales, eq(saleItems.saleId, sales.id))
      .leftJoin(inventoryItems, eq(saleItems.inventoryItemId, inventoryItems.id))
      .where(sql`${sales.createdAt} >= ${startDate}`)
      .groupBy(inventoryItems.name)
      .orderBy(sql`SUM(${saleItems.quantity} * ${saleItems.unitPrice}) DESC`)
      .limit(5);
  }

  async getRevenueAnalytics(query: any): Promise<any[]> {
    const dateRange = parseInt(query.dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    return await db
      .select({
        date: sql`TO_CHAR(${sales.createdAt}, 'MM/DD')`,
        revenue: sql`SUM(${sales.totalAmount})`
      })
      .from(sales)
      .where(sql`${sales.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(sql`DATE(${sales.createdAt})`)
      .limit(10);
  }

  // Reference data
  async getDeviceTypes(): Promise<DeviceType[]> {
    return await db.select().from(deviceTypes).orderBy(asc(deviceTypes.name));
  }

  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(asc(brands.name));
  }

  async getModels(): Promise<Model[]> {
    return await db
      .select({
        id: models.id,
        name: models.name,
        brandId: models.brandId,
        brandName: brands.name,
        deviceTypeId: models.deviceTypeId,
        deviceTypeName: deviceTypes.name,
        specifications: models.specifications,
        createdAt: models.createdAt,
      })
      .from(models)
      .leftJoin(brands, eq(models.brandId, brands.id))
      .leftJoin(deviceTypes, eq(models.deviceTypeId, deviceTypes.id))
      .orderBy(asc(models.name));
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(asc(serviceTypes.name));
  }

  async createDeviceType(insertDeviceType: InsertDeviceType): Promise<DeviceType> {
    const [deviceType] = await db.insert(deviceTypes).values(insertDeviceType).returning();
    return deviceType;
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const [model] = await db.insert(models).values(insertModel).returning();
    return model;
  }

  async createServiceType(insertServiceType: InsertServiceType): Promise<ServiceType> {
    const [serviceType] = await db.insert(serviceTypes).values(insertServiceType).returning();
    return serviceType;
  }

  // Analytics
  async getDashboardStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeRepairsCount] = await db
      .select({ count: count() })
      .from(devices)
      .where(sql`${devices.status} NOT IN ('delivered', 'cancelled')`);

    const [completedTodayCount] = await db
      .select({ count: count() })
      .from(devices)
      .where(
        and(
          eq(devices.status, "completed"),
          gte(devices.updatedAt, today)
        )
      );

    const lowStockCount = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.isActive, true),
          sql`${inventoryItems.quantity} <= ${inventoryItems.minStockLevel}`
        )
      );

    const [todaysRevenue] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)` 
      })
      .from(sales)
      .where(gte(sales.createdAt, today));

    return {
      activeRepairs: activeRepairsCount.count,
      completedToday: completedTodayCount.count,
      lowStockItems: lowStockCount[0].count,
      todayRevenue: todaysRevenue.total,
    };
  }
}

export const storage = new DatabaseStorage();
