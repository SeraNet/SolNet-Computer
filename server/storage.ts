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
  locations,
  businessProfile,
  expenses,
  loanInvoices,
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
  type Location,
  type InsertLocation,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Expense,
  type InsertExpense,
  type LoanInvoice,
  type InsertLoanInvoice,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Locations
  getLocation(id: string): Promise<Location | undefined>;
  getLocations(): Promise<Location[]>;
  getActiveLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByLocation(locationId: string): Promise<User[]>;

  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;

  // Devices
  getDevice(id: string): Promise<any>;
  getDevices(): Promise<any[]>;
  getDevicesByLocation(locationId: string): Promise<any[]>;
  getActiveRepairs(): Promise<any[]>;
  getActiveRepairsByLocation(locationId: string): Promise<any[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device>;
  updateDeviceStatus(id: string, status: string, notes?: string, userId?: string): Promise<Device>;

  // Inventory
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemsByLocation(locationId: string): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  getLowStockItemsByLocation(locationId: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem>;

  // Sales
  getSale(id: string): Promise<any>;
  getSales(): Promise<any[]>;
  getSalesByLocation(locationId: string): Promise<any[]>;
  getTodaysSales(): Promise<any[]>;
  getTodaysSalesByLocation(locationId: string): Promise<any[]>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;

  // Appointments
  getAppointment(id: string): Promise<any>;
  getAppointments(): Promise<any[]>;
  getAppointmentsByLocation(locationId: string): Promise<any[]>;
  getUpcomingAppointments(): Promise<any[]>;
  getUpcomingAppointmentsByLocation(locationId: string): Promise<any[]>;
  getTodaysAppointments(): Promise<any[]>;
  getTodaysAppointmentsByLocation(locationId: string): Promise<any[]>;
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

  // Business profile
  getBusinessProfile(): Promise<BusinessProfile | null>;
  upsertBusinessProfile(data: InsertBusinessProfile): Promise<BusinessProfile>;

  // Inventory predictions for smart reordering
  getInventoryPredictions(): Promise<any[]>;
  getStockAlerts(): Promise<any[]>;
  updateInventoryPredictions(): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense>;
  getExpenseStats(): Promise<any>;

  // Loan Invoices
  getLoanInvoices(): Promise<any[]>;
  getLoanInvoice(id: string): Promise<any>;
  createLoanInvoice(invoice: any): Promise<any>;
  updateLoanInvoice(id: string, updates: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Locations
  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(asc(locations.name));
  }

  async getActiveLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.isActive, true)).orderBy(asc(locations.name));
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location> {
    const [location] = await db
      .update(locations)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

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

  async getUsersByLocation(locationId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.locationId, locationId)).orderBy(asc(users.firstName));
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

  async getDevicesByLocation(locationId: string): Promise<any[]> {
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
      .where(eq(devices.locationId, locationId))
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

  async getActiveRepairsByLocation(locationId: string): Promise<any[]> {
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
        and(
          eq(devices.locationId, locationId),
          sql`${devices.status} NOT IN ('delivered', 'cancelled')`
        )
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

  // Smart inventory prediction methods
  async updateInventoryPredictions(): Promise<void> {
    const items = await this.getInventoryItems();
    
    for (const item of items) {
      const salesData = await this.getItemSalesHistory(item.id, 30); // Last 30 days
      const avgDailySales = this.calculateAverageDailySales(salesData);
      
      const predictions = this.calculateStockPredictions(item, avgDailySales);
      
      await db
        .update(inventoryItems)
        .set({
          avgDailySales: avgDailySales.toString(),
          predictedStockout: predictions.predictedStockout,
          updatedAt: sql`NOW()`,
        })
        .where(eq(inventoryItems.id, item.id));
    }
  }

  async getInventoryPredictions(): Promise<any[]> {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true));

    return items.map(item => {
      const avgDailySales = parseFloat(item.avgDailySales || "0");
      const daysUntilStockout = avgDailySales > 0 ? Math.floor(item.quantity / avgDailySales) : -1;
      
      return {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        currentStock: item.quantity,
        minStockLevel: item.minStockLevel,
        reorderPoint: item.reorderPoint,
        predictedStockout: item.predictedStockout,
        daysUntilStockout,
        suggestedReorderQuantity: item.reorderQuantity,
        avgDailySales,
        riskLevel: this.calculateRiskLevel(item.quantity, item.minStockLevel, daysUntilStockout),
        category: item.category,
        supplier: item.supplier,
        leadTimeDays: item.leadTimeDays,
      };
    });
  }

  async getStockAlerts(): Promise<any[]> {
    const predictions = await this.getInventoryPredictions();
    const alerts: any[] = [];

    predictions.forEach(prediction => {
      // Low stock alert
      if (prediction.currentStock <= prediction.minStockLevel) {
        alerts.push({
          id: `low_stock_${prediction.itemId}`,
          itemId: prediction.itemId,
          itemName: prediction.itemName,
          alertType: 'low_stock',
          message: `${prediction.itemName} is below minimum stock level (${prediction.currentStock}/${prediction.minStockLevel})`,
          priority: prediction.currentStock === 0 ? 'critical' : 'high',
          createdAt: new Date(),
          acknowledged: false,
        });
      }

      // Predicted stockout alert
      if (prediction.daysUntilStockout > 0 && prediction.daysUntilStockout <= 7) {
        alerts.push({
          id: `stockout_${prediction.itemId}`,
          itemId: prediction.itemId,
          itemName: prediction.itemName,
          alertType: 'predicted_stockout',
          message: `${prediction.itemName} predicted to run out in ${prediction.daysUntilStockout} days`,
          priority: prediction.daysUntilStockout <= 3 ? 'critical' : 'high',
          createdAt: new Date(),
          acknowledged: false,
        });
      }

      // Reorder required alert
      if (prediction.currentStock <= prediction.reorderPoint) {
        alerts.push({
          id: `reorder_${prediction.itemId}`,
          itemId: prediction.itemId,
          itemName: prediction.itemName,
          alertType: 'reorder_required',
          message: `${prediction.itemName} has reached reorder point. Suggested quantity: ${prediction.suggestedReorderQuantity}`,
          priority: 'medium',
          createdAt: new Date(),
          acknowledged: false,
        });
      }
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });
  }

  private async getItemSalesHistory(itemId: string, days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
      .select({
        quantity: saleItems.quantity,
        date: sales.createdAt,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(and(
        eq(saleItems.inventoryItemId, itemId),
        sql`${sales.createdAt} >= ${cutoffDate.toISOString()}`
      ))
      .orderBy(sales.createdAt);
  }

  private calculateAverageDailySales(salesData: any[]): number {
    if (salesData.length === 0) return 0;

    const totalQuantity = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const days = 30; // Fixed 30-day period for consistency
    return totalQuantity / days;
  }

  private calculateStockPredictions(item: InventoryItem, avgDailySales: number): any {
    if (avgDailySales <= 0) {
      return { predictedStockout: null };
    }

    const daysUntilStockout = item.quantity / avgDailySales;
    const predictedStockout = new Date();
    predictedStockout.setDate(predictedStockout.getDate() + Math.floor(daysUntilStockout));

    return {
      predictedStockout: predictedStockout.toISOString(),
    };
  }

  private calculateRiskLevel(currentStock: number, minStock: number, daysUntilStockout: number): string {
    if (currentStock === 0) return 'critical';
    if (currentStock <= minStock || (daysUntilStockout > 0 && daysUntilStockout <= 3)) return 'high';
    if (daysUntilStockout > 0 && daysUntilStockout <= 7) return 'medium';
    return 'low';
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

  async deleteInventoryItem(id: string): Promise<void> {
    await db.update(inventoryItems).set({ isActive: false }).where(eq(inventoryItems.id, id));
  }

  async updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set({ quantity, updatedAt: sql`NOW()` })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async getInventoryItemsByLocation(locationId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.locationId, locationId))
      .orderBy(asc(inventoryItems.name));
  }

  async getLowStockItemsByLocation(locationId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.locationId, locationId),
          sql`${inventoryItems.quantity} <= ${inventoryItems.minStockLevel}`
        )
      )
      .orderBy(asc(inventoryItems.name));
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

  async getSalesByLocation(locationId: string): Promise<any[]> {
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
      .where(eq(sales.locationId, locationId))
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

  async getTodaysSalesByLocation(locationId: string): Promise<any[]> {
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
      .where(
        and(
          eq(sales.locationId, locationId),
          gte(sales.createdAt, today)
        )
      )
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

  async getAppointmentsByLocation(locationId: string): Promise<any[]> {
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
      .where(eq(appointments.locationId, locationId))
      .orderBy(asc(appointments.appointmentDate));
  }

  async getUpcomingAppointments(): Promise<any[]> {
    const now = new Date();
    
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
      .where(gte(appointments.appointmentDate, now))
      .orderBy(asc(appointments.appointmentDate));
  }

  async getUpcomingAppointmentsByLocation(locationId: string): Promise<any[]> {
    const now = new Date();
    
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
          eq(appointments.locationId, locationId),
          gte(appointments.appointmentDate, now)
        )
      )
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

  async getTodaysAppointmentsByLocation(locationId: string): Promise<any[]> {
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
          eq(appointments.locationId, locationId),
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

  // Users/Workers
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(data)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Service Types
  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name);
  }

  async createServiceType(data: InsertServiceType): Promise<ServiceType> {
    const [serviceType] = await db
      .insert(serviceTypes)
      .values(data)
      .returning();
    return serviceType;
  }

  async updateServiceType(id: string, updates: Partial<InsertServiceType>): Promise<ServiceType> {
    const [serviceType] = await db
      .update(serviceTypes)
      .set(updates)
      .where(eq(serviceTypes.id, id))
      .returning();
    return serviceType;
  }

  async deleteServiceType(id: string): Promise<void> {
    await db.delete(serviceTypes).where(eq(serviceTypes.id, id));
  }

  // Device Types  
  async createDeviceType(data: InsertDeviceType): Promise<DeviceType> {
    const [deviceType] = await db
      .insert(deviceTypes)
      .values(data)
      .returning();
    return deviceType;
  }

  async updateDeviceType(id: string, updates: Partial<InsertDeviceType>): Promise<DeviceType> {
    const [deviceType] = await db
      .update(deviceTypes)
      .set(updates)
      .where(eq(deviceTypes.id, id))
      .returning();
    return deviceType;
  }

  async deleteDeviceType(id: string): Promise<void> {
    await db.delete(deviceTypes).where(eq(deviceTypes.id, id));
  }

  // Brands
  async createBrand(data: InsertBrand): Promise<Brand> {
    const [brand] = await db
      .insert(brands)
      .values(data)
      .returning();
    return brand;
  }

  async updateBrand(id: string, updates: Partial<InsertBrand>): Promise<Brand> {
    const [brand] = await db
      .update(brands)
      .set(updates)
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  async deleteBrand(id: string): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  // Models - Fixed query
  async getModels(): Promise<any[]> {
    return await db
      .select()
      .from(models)
      .leftJoin(brands, eq(models.brandId, brands.id))
      .leftJoin(deviceTypes, eq(models.deviceTypeId, deviceTypes.id))
      .orderBy(models.name);
  }

  async createModel(data: InsertModel): Promise<Model> {
    const [model] = await db
      .insert(models)
      .values(data)
      .returning();
    return model;
  }

  async updateModel(id: string, updates: Partial<InsertModel>): Promise<Model> {
    const [model] = await db
      .update(models)
      .set(updates)
      .where(eq(models.id, id))
      .returning();
    return model;
  }

  async deleteModel(id: string): Promise<void> {
    await db.delete(models).where(eq(models.id, id));
  }

  // Business Profile
  async getBusinessProfile(): Promise<BusinessProfile | null> {
    const [profile] = await db.select().from(businessProfile).limit(1);
    return profile || null;
  }

  async upsertBusinessProfile(data: InsertBusinessProfile): Promise<BusinessProfile> {
    const existingProfile = await this.getBusinessProfile();
    
    if (existingProfile) {
      const [updatedProfile] = await db
        .update(businessProfile)
        .set({ ...data, updatedAt: sql`NOW()` })
        .where(eq(businessProfile.id, existingProfile.id))
        .returning();
      return updatedProfile;
    } else {
      const [newProfile] = await db
        .insert(businessProfile)
        .values(data)
        .returning();
      return newProfile;
    }
  }

  // Inventory predictions for smart reordering - placeholder implementations
  async getInventoryPredictions(): Promise<any[]> {
    // Return enhanced inventory data with predictions
    const items = await db.select().from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))
      .orderBy(asc(inventoryItems.name));
    
    return items.map(item => ({
      ...item,
      predictedStockoutDays: item.quantity && item.avgDailySales && parseFloat(item.avgDailySales) > 0 
        ? Math.floor(item.quantity / parseFloat(item.avgDailySales))
        : null,
      reorderRecommended: item.quantity <= item.reorderPoint,
      lowStockAlert: item.quantity <= item.minStockLevel,
    }));
  }

  async getStockAlerts(): Promise<any[]> {
    const lowStockItems = await db.select().from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        lte(inventoryItems.quantity, sql`${inventoryItems.minStockLevel}`)
      ))
      .orderBy(asc(inventoryItems.quantity));

    return lowStockItems.map(item => ({
      id: item.id,
      name: item.name,
      currentStock: item.quantity,
      minStockLevel: item.minStockLevel,
      alertLevel: item.quantity <= item.minStockLevel ? 'critical' : 'warning',
      message: `${item.name} is running low (${item.quantity} remaining)`,
    }));
  }

  async updateInventoryPredictions(): Promise<void> {
    // Update prediction calculations based on recent sales data
    const items = await db.select().from(inventoryItems).where(eq(inventoryItems.isActive, true));
    
    for (const item of items) {
      // Calculate average daily sales over last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [salesData] = await db
        .select({ 
          totalSold: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)`,
          dayCount: sql<number>`30`
        })
        .from(saleItems)
        .leftJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(
          eq(saleItems.inventoryItemId, item.id),
          gte(sales.createdAt, thirtyDaysAgo)
        ));
      
      const avgDailySales = salesData.totalSold / 30;
      
      // Update the item with new predictions
      await db
        .update(inventoryItems)
        .set({ 
          avgDailySales: avgDailySales.toFixed(2),
          predictedStockout: avgDailySales > 0 
            ? new Date(Date.now() + (item.quantity / avgDailySales) * 24 * 60 * 60 * 1000)
            : null
        })
        .where(eq(inventoryItems.id, item.id));
    }
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }

  async updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async getExpenseStats(): Promise<any> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);
    
    // Current month total
    const [monthlyTotal] = await db
      .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(gte(expenses.expenseDate, thisMonth));

    // Last month total for comparison
    const [lastMonthTotal] = await db
      .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(
        gte(expenses.expenseDate, lastMonth),
        lte(expenses.expenseDate, thisMonth)
      ));

    // Year total
    const [yearlyTotal] = await db
      .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(gte(expenses.expenseDate, thisYear));

    // Total expenses count
    const [totalExpenses] = await db
      .select({ count: count() })
      .from(expenses);

    // Top category
    const topCategory = await db
      .select({
        category: expenses.category,
        total: sql<number>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(gte(expenses.expenseDate, thisYear))
      .groupBy(expenses.category)
      .orderBy(sql`SUM(${expenses.amount}) DESC`)
      .limit(1);

    const monthlyChange = lastMonthTotal.total > 0 
      ? ((monthlyTotal.total - lastMonthTotal.total) / lastMonthTotal.total * 100).toFixed(1)
      : "0";

    return {
      monthlyTotal: monthlyTotal.total.toFixed(2),
      monthlyChange,
      yearlyTotal: yearlyTotal.total.toFixed(2),
      totalExpenses: totalExpenses.count,
      topCategory: topCategory[0]?.category || "N/A",
      topCategoryAmount: topCategory[0]?.total?.toFixed(2) || "0.00",
      averageMonthly: (yearlyTotal.total / 12).toFixed(2),
    };
  }

  // Loan Invoices
  async getLoanInvoices(): Promise<any[]> {
    return await db
      .select({
        id: loanInvoices.id,
        customerId: loanInvoices.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        deviceDescription: loanInvoices.deviceDescription,
        serviceDescription: loanInvoices.serviceDescription,
        totalAmount: loanInvoices.totalAmount,
        paidAmount: loanInvoices.paidAmount,
        remainingAmount: loanInvoices.remainingAmount,
        dueDate: loanInvoices.dueDate,
        status: loanInvoices.status,
        notes: loanInvoices.notes,
        createdAt: loanInvoices.createdAt,
      })
      .from(loanInvoices)
      .leftJoin(customers, eq(loanInvoices.customerId, customers.id))
      .orderBy(desc(loanInvoices.createdAt));
  }

  async getLoanInvoice(id: string): Promise<any> {
    const [invoice] = await db
      .select({
        id: loanInvoices.id,
        customerId: loanInvoices.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        deviceDescription: loanInvoices.deviceDescription,
        serviceDescription: loanInvoices.serviceDescription,
        totalAmount: loanInvoices.totalAmount,
        paidAmount: loanInvoices.paidAmount,
        remainingAmount: loanInvoices.remainingAmount,
        dueDate: loanInvoices.dueDate,
        status: loanInvoices.status,
        notes: loanInvoices.notes,
        createdAt: loanInvoices.createdAt,
      })
      .from(loanInvoices)
      .leftJoin(customers, eq(loanInvoices.customerId, customers.id))
      .where(eq(loanInvoices.id, id));
    
    return invoice;
  }

  async createLoanInvoice(invoice: InsertLoanInvoice): Promise<LoanInvoice> {
    // Calculate remaining amount
    const totalAmount = parseFloat(invoice.totalAmount.toString());
    const paidAmount = parseFloat(invoice.paidAmount?.toString() || "0");
    const remainingAmount = totalAmount - paidAmount;

    const invoiceData = {
      ...invoice,
      remainingAmount: remainingAmount.toString(),
    };

    const [newInvoice] = await db.insert(loanInvoices).values(invoiceData).returning();
    return newInvoice;
  }

  async updateLoanInvoice(id: string, updates: Partial<InsertLoanInvoice>): Promise<LoanInvoice> {
    // Recalculate remaining amount if total or paid amount changed
    if (updates.totalAmount || updates.paidAmount) {
      const [currentInvoice] = await db.select().from(loanInvoices).where(eq(loanInvoices.id, id));
      if (currentInvoice) {
        const totalAmount = parseFloat(updates.totalAmount?.toString() || currentInvoice.totalAmount);
        const paidAmount = parseFloat(updates.paidAmount?.toString() || currentInvoice.paidAmount);
        updates.remainingAmount = (totalAmount - paidAmount).toString();
      }
    }

    const [invoice] = await db
      .update(loanInvoices)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(loanInvoices.id, id))
      .returning();
    return invoice;
  }
}

export const storage = new DatabaseStorage();
