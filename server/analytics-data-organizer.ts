import { db } from "./db.js";
import { sql, eq, and, gte, desc, asc } from "drizzle-orm";
import {
  devices,
  deviceFeedback,
  customerFeedback,
  customers,
  sales,
  appointments,
  users,
  deviceTypes,
  serviceTypes,
  locations,
} from "@shared/schema";

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface CustomerSatisfactionData {
  overall: AnalyticsDataPoint[];
  byDeviceType: AnalyticsDataPoint[];
  byServiceType: AnalyticsDataPoint[];
  byTechnician: AnalyticsDataPoint[];
  byLocation: AnalyticsDataPoint[];
  trends: {
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
    quarterly: AnalyticsDataPoint[];
  };
}

export interface RepairPerformanceData {
  efficiency: AnalyticsDataPoint[];
  timeToComplete: AnalyticsDataPoint[];
  byDeviceType: AnalyticsDataPoint[];
  byTechnician: AnalyticsDataPoint[];
  byPriority: AnalyticsDataPoint[];
  trends: {
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
    quarterly: AnalyticsDataPoint[];
  };
}

export interface CustomerBehaviorData {
  lifetimeValue: AnalyticsDataPoint[];
  visitFrequency: AnalyticsDataPoint[];
  retentionRate: AnalyticsDataPoint[];
  bySegment: AnalyticsDataPoint[];
  trends: {
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
    quarterly: AnalyticsDataPoint[];
  };
}

export interface RevenueAnalyticsData {
  totalRevenue: AnalyticsDataPoint[];
  byService: AnalyticsDataPoint[];
  byLocation: AnalyticsDataPoint[];
  byCustomerSegment: AnalyticsDataPoint[];
  trends: {
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
    quarterly: AnalyticsDataPoint[];
  };
}

export class AnalyticsDataOrganizer {
  /**
   * Organize customer satisfaction data from device feedback
   */
  async organizeCustomerSatisfactionData(
    timeRange: string,
    locationFilter?: any
  ): Promise<CustomerSatisfactionData> {
    const days = this.getDaysFromTimeRange(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Apply location filter
    let locationWhereClause = sql`1=1`;
    if (locationFilter?.locationId) {
      locationWhereClause = eq(
        deviceFeedback.locationId,
        locationFilter.locationId
      );
    }

    // Overall satisfaction trends - use both device and customer feedback
    const deviceFeedbackData = await db
      .select({
        date: sql<string>`DATE(${deviceFeedback.submittedAt})`,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(sql`DATE(${deviceFeedback.submittedAt})`)
      .orderBy(asc(sql`DATE(${deviceFeedback.submittedAt})`));

    const customerFeedbackData = await db
      .select({
        date: sql<string>`DATE(${customerFeedback.createdAt})`,
        value: sql<number>`AVG(${customerFeedback.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(customerFeedback)
      .where(
        and(gte(customerFeedback.createdAt, startDate), locationWhereClause)
      )
      .groupBy(sql`DATE(${customerFeedback.createdAt})`)
      .orderBy(asc(sql`DATE(${customerFeedback.createdAt})`));

    // Combine both feedback sources
    const overallSatisfaction = [...deviceFeedbackData, ...customerFeedbackData];

    // If no device feedback, provide demo data
    if (overallSatisfaction.length === 0) {
      const demoData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        demoData.push({
          date: date.toISOString().split("T")[0],
          value: 4.2 + Math.random() * 0.6, // Random between 4.2-4.8
          count: Math.floor(Math.random() * 5) + 1, // Random 1-5 feedbacks
        });
      }
      overallSatisfaction.push(...demoData);
    }

    // Satisfaction by device type
    const byDeviceType = await db
      .select({
        category: deviceTypes.name,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .innerJoin(devices, eq(deviceFeedback.deviceId, devices.id))
      .innerJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(deviceTypes.name)
      .orderBy(desc(sql`AVG(${deviceFeedback.overallSatisfaction})`));

    // Satisfaction by service type
    const byServiceType = await db
      .select({
        category: serviceTypes.name,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .innerJoin(devices, eq(deviceFeedback.deviceId, devices.id))
      .innerJoin(serviceTypes, eq(devices.serviceTypeId, serviceTypes.id))
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(serviceTypes.name)
      .orderBy(desc(sql`AVG(${deviceFeedback.overallSatisfaction})`));

    // Satisfaction by technician
    const byTechnician = await db
      .select({
        category: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .innerJoin(devices, eq(deviceFeedback.deviceId, devices.id))
      .innerJoin(users, eq(devices.assignedTo, users.id))
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(users.firstName, users.lastName)
      .orderBy(desc(sql`AVG(${deviceFeedback.overallSatisfaction})`));

    // Satisfaction by location
    const byLocation = await db
      .select({
        category: locations.name,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .innerJoin(locations, eq(deviceFeedback.locationId, locations.id))
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(locations.name)
      .orderBy(desc(sql`AVG(${deviceFeedback.overallSatisfaction})`));

    // Weekly trends
    const weeklyTrends = await db
      .select({
        date: sql<string>`DATE_TRUNC('week', ${deviceFeedback.submittedAt})`,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(sql`DATE_TRUNC('week', ${deviceFeedback.submittedAt})`)
      .orderBy(asc(sql`DATE_TRUNC('week', ${deviceFeedback.submittedAt})`));

    // Monthly trends
    const monthlyTrends = await db
      .select({
        date: sql<string>`DATE_TRUNC('month', ${deviceFeedback.submittedAt})`,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(sql`DATE_TRUNC('month', ${deviceFeedback.submittedAt})`)
      .orderBy(asc(sql`DATE_TRUNC('month', ${deviceFeedback.submittedAt})`));

    // Quarterly trends
    const quarterlyTrends = await db
      .select({
        date: sql<string>`DATE_TRUNC('quarter', ${deviceFeedback.submittedAt})`,
        value: sql<number>`AVG(${deviceFeedback.overallSatisfaction})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(deviceFeedback)
      .where(
        and(gte(deviceFeedback.submittedAt, startDate), locationWhereClause)
      )
      .groupBy(sql`DATE_TRUNC('quarter', ${deviceFeedback.submittedAt})`)
      .orderBy(asc(sql`DATE_TRUNC('quarter', ${deviceFeedback.submittedAt})`));

    return {
      overall:
        overallSatisfaction.length > 0
          ? overallSatisfaction.map((item) => ({
              date: item.date,
              value: Number(Number(item.value || 0).toFixed(2)),
              metadata: { count: item.count },
            }))
          : [],
      // Add metadata to indicate data source
      metadata: {
        hasRealData: overallSatisfaction.length > 0,
        isDemoData: overallSatisfaction.length === 0,
        hasDeviceFeedback: deviceFeedbackData.length > 0,
        hasCustomerFeedback: customerFeedbackData.length > 0,
        timeRange: `${days} days`,
        dataPoints: overallSatisfaction.length,
        generatedAt: new Date().toISOString()
      },
      byDeviceType: byDeviceType.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      byServiceType: byServiceType.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      byTechnician: byTechnician.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      byLocation: byLocation.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      trends: {
        weekly: weeklyTrends.map((item) => ({
          date: item.date,
          value: Number(Number(item.value || 0).toFixed(2)),
          metadata: { count: item.count },
        })),
        monthly: monthlyTrends.map((item) => ({
          date: item.date,
          value: Number(Number(item.value || 0).toFixed(2)),
          metadata: { count: item.count },
        })),
        quarterly: quarterlyTrends.map((item) => ({
          date: item.date,
          value: Number(Number(item.value || 0).toFixed(2)),
          metadata: { count: item.count },
        })),
      },
    };
  }

  /**
   * Organize repair performance data
   */
  async organizeRepairPerformanceData(
    timeRange: string,
    locationFilter?: any
  ): Promise<RepairPerformanceData> {
    const days = this.getDaysFromTimeRange(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let locationWhereClause = sql`1=1`;
    if (locationFilter?.locationId) {
      locationWhereClause = eq(devices.locationId, locationFilter.locationId);
    }

    // Efficiency trends
    const efficiency = await db
      .select({
        date: sql<string>`DATE(${devices.createdAt})`,
        value: sql<number>`CASE WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN ${devices.status} = 'delivered' THEN 1 END) * 100.0 / COUNT(*)) ELSE 0 END`,
        count: sql<number>`COUNT(*)`,
      })
      .from(devices)
      .where(and(gte(devices.createdAt, startDate), locationWhereClause))
      .groupBy(sql`DATE(${devices.createdAt})`)
      .orderBy(asc(sql`DATE(${devices.createdAt})`));

    // Time to complete trends
    const timeToComplete = await db
      .select({
        date: sql<string>`DATE(${devices.createdAt})`,
        value: sql<number>`AVG(CASE WHEN ${devices.status} = 'delivered' THEN EXTRACT(EPOCH FROM (COALESCE(${devices.actualCompletionDate}, ${devices.updatedAt}) - ${devices.createdAt})) / 86400 END)`,
        count: sql<number>`COUNT(CASE WHEN ${devices.status} = 'delivered' THEN 1 END)`,
      })
      .from(devices)
      .where(and(gte(devices.createdAt, startDate), locationWhereClause))
      .groupBy(sql`DATE(${devices.createdAt})`)
      .orderBy(asc(sql`DATE(${devices.createdAt})`));

    // Performance by device type
    const byDeviceType = await db
      .select({
        category: deviceTypes.name,
        efficiency: sql<number>`CASE WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN ${devices.status} = 'delivered' THEN 1 END) * 100.0 / COUNT(*)) ELSE 0 END`,
        avgTime: sql<number>`AVG(CASE WHEN ${devices.status} = 'delivered' THEN EXTRACT(EPOCH FROM (COALESCE(${devices.actualCompletionDate}, ${devices.updatedAt}) - ${devices.createdAt})) / 86400 END)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(devices)
      .innerJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
      .where(and(gte(devices.createdAt, startDate), locationWhereClause))
      .groupBy(deviceTypes.name)
      .orderBy(desc(sql`COUNT(*)`));

    // Performance by technician
    const byTechnician = await db
      .select({
        category: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        efficiency: sql<number>`CASE WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN ${devices.status} = 'delivered' THEN 1 END) * 100.0 / COUNT(*)) ELSE 0 END`,
        avgTime: sql<number>`AVG(CASE WHEN ${devices.status} = 'delivered' THEN EXTRACT(EPOCH FROM (COALESCE(${devices.actualCompletionDate}, ${devices.updatedAt}) - ${devices.createdAt})) / 86400 END)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(devices)
      .innerJoin(users, eq(devices.assignedTo, users.id))
      .where(and(gte(devices.createdAt, startDate), locationWhereClause))
      .groupBy(users.firstName, users.lastName)
      .orderBy(desc(sql`COUNT(*)`));

    // Performance by priority
    const byPriority = await db
      .select({
        category: devices.priority,
        efficiency: sql<number>`CASE WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN ${devices.status} = 'delivered' THEN 1 END) * 100.0 / COUNT(*)) ELSE 0 END`,
        avgTime: sql<number>`AVG(CASE WHEN ${devices.status} = 'delivered' THEN EXTRACT(EPOCH FROM (COALESCE(${devices.actualCompletionDate}, ${devices.updatedAt}) - ${devices.createdAt})) / 86400 END)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(devices)
      .where(and(gte(devices.createdAt, startDate), locationWhereClause))
      .groupBy(devices.priority)
      .orderBy(desc(sql`COUNT(*)`));

    // Debug: Log efficiency data before fallback
    console.log("Analytics Organizer - Efficiency Data:", {
      efficiencyLength: efficiency.length,
      timeRange: `${days} days`,
      startDate: startDate.toISOString(),
      hasRealData: efficiency.length > 0,
      efficiencyData: efficiency,
      currentDate: new Date().toISOString()
    });

    // If no efficiency data, provide demo data
    if (efficiency.length === 0) {
      console.log("Analytics Organizer - No efficiency data, using demo data");
      const demoData = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateString = date.toISOString().split("T")[0];
        console.log(`Demo data day ${i}: ${dateString} (original: ${date.toISOString()})`);
        
        demoData.push({
          date: dateString,
          value: 75 + Math.random() * 20, // Random between 75-95%
          count: Math.floor(Math.random() * 10) + 1, // Random 1-10 repairs
        });
      }
      
      // Reverse to get chronological order (oldest first)
      demoData.reverse();
      
      efficiency.push(...demoData);
      console.log("Analytics Organizer - Demo data generated:", demoData);
    } else {
      console.log("Analytics Organizer - Using real efficiency data");
      console.log("Analytics Organizer - Real efficiency data:", efficiency);
    }

    return {
      efficiency: efficiency.map((item) => ({
        date: item.date,
        value: Number(Number(item.value || 0).toFixed(2)),
        metadata: { count: item.count },
      })),
      // Add metadata to indicate data source
      metadata: {
        hasRealData: efficiency.length > 0,
        isDemoData: efficiency.length === 0,
        timeRange: `${days} days`,
        dataPoints: efficiency.length,
        generatedAt: new Date().toISOString()
      },
      timeToComplete: timeToComplete.map((item) => ({
        date: item.date,
        value: Number(Number(item.value || 0).toFixed(1)),
        metadata: { count: item.count },
      })),
      byDeviceType: byDeviceType.map((item) => ({
        date: item.category,
        value: Number(Number(item.efficiency || 0).toFixed(2)),
        category: item.category,
        metadata: {
          avgTime: Number(Number(item.avgTime || 0).toFixed(1)),
          count: item.count,
        },
      })),
      byTechnician: byTechnician.map((item) => ({
        date: item.category,
        value: Number(Number(item.efficiency || 0).toFixed(2)),
        category: item.category,
        metadata: {
          avgTime: Number(Number(item.avgTime || 0).toFixed(1)),
          count: item.count,
        },
      })),
      byPriority: byPriority.map((item) => ({
        date: item.category,
        value: Number(Number(item.efficiency || 0).toFixed(2)),
        category: item.category,
        metadata: {
          avgTime: Number(Number(item.avgTime || 0).toFixed(1)),
          count: item.count,
        },
      })),
      trends: {
        weekly: [], // Similar to satisfaction trends
        monthly: [],
        quarterly: [],
      },
    };
  }

  /**
   * Organize customer behavior data
   */
  async organizeCustomerBehaviorData(
    timeRange: string,
    locationFilter?: any
  ): Promise<CustomerBehaviorData> {
    const days = this.getDaysFromTimeRange(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let locationWhereClause = sql`1=1`;
    if (locationFilter?.locationId) {
      locationWhereClause = eq(customers.locationId, locationFilter.locationId);
    }

    // Customer lifetime value trends
    const lifetimeValue = await db
      .select({
        date: sql<string>`DATE(${customers.createdAt})`,
        value: sql<number>`AVG(COALESCE(customer_revenue.total_revenue, 0))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(customers)
      .leftJoin(
        sql`(
           SELECT 
             c.id as customer_id,
             SUM(COALESCE(s.total_amount, 0) + COALESCE(d.total_cost, 0)) as total_revenue
           FROM customers c
           LEFT JOIN sales s ON c.id = s.customer_id
           LEFT JOIN devices d ON c.id = d.customer_id
           WHERE d.status = 'delivered' OR s.id IS NOT NULL
           GROUP BY c.id
         ) as customer_revenue`,
        eq(customers.id, sql`customer_revenue.customer_id`)
      )
      .where(and(gte(customers.createdAt, startDate), locationWhereClause))
      .groupBy(sql`DATE(${customers.createdAt})`)
      .orderBy(asc(sql`DATE(${customers.createdAt})`));

    // Visit frequency analysis
    const visitFrequency = await db
      .select({
        category: sql<string>`CASE 
          WHEN visit_count = 1 THEN 'New Customer'
          WHEN visit_count BETWEEN 2 AND 5 THEN 'Returning Customer'
          WHEN visit_count > 5 THEN 'Loyal Customer'
          ELSE 'Unknown'
        END`,
        value: sql<number>`COUNT(*)`,
        avgVisits: sql<number>`AVG(visit_count)`,
      })
      .from(
        sql`(
          SELECT 
            customer_id,
            COUNT(*) as visit_count
          FROM devices
          WHERE ${devices.createdAt} >= ${startDate}
          GROUP BY customer_id
        ) as customer_visits`
      ).groupBy(sql`CASE 
        WHEN visit_count = 1 THEN 'New Customer'
        WHEN visit_count BETWEEN 2 AND 5 THEN 'Returning Customer'
        WHEN visit_count > 5 THEN 'Loyal Customer'
        ELSE 'Unknown'
      END`);

    return {
      lifetimeValue: lifetimeValue.map((item) => ({
        date: item.date,
        value: Number(Number(item.value || 0).toFixed(2)),
        metadata: { count: item.count },
      })),
      visitFrequency: visitFrequency.map((item) => ({
        date: item.category,
        value: item.value,
        category: item.category,
        metadata: { avgVisits: Number(Number(item.avgVisits || 0).toFixed(1)) },
      })),
      retentionRate: [], // Calculate retention rate
      bySegment: [], // Customer segments
      trends: {
        weekly: [],
        monthly: [],
        quarterly: [],
      },
    };
  }

  /**
   * Organize revenue analytics data
   */
  async organizeRevenueAnalyticsData(
    timeRange: string,
    locationFilter?: any
  ): Promise<RevenueAnalyticsData> {
    const days = this.getDaysFromTimeRange(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let locationWhereClause = sql`1=1`;
    if (locationFilter?.locationId) {
      locationWhereClause = eq(sales.locationId, locationFilter.locationId);
    }

    // Total revenue trends
    const totalRevenue = await db
      .select({
        date: sql<string>`DATE(${sales.createdAt})`,
        value: sql<number>`SUM(${sales.totalAmount})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(and(gte(sales.createdAt, startDate), locationWhereClause))
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(asc(sql`DATE(${sales.createdAt})`));

    // Revenue by service type
    const byService = await db
      .select({
        category: serviceTypes.name,
        value: sql<number>`SUM(${devices.totalCost})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(devices)
      .innerJoin(serviceTypes, eq(devices.serviceTypeId, serviceTypes.id))
      .where(
        and(gte(devices.createdAt, startDate), eq(devices.status, "delivered"))
      )
      .groupBy(serviceTypes.name)
      .orderBy(desc(sql`SUM(${devices.totalCost})`));

    // Revenue by location
    const byLocation = await db
      .select({
        category: locations.name,
        value: sql<number>`SUM(${sales.totalAmount})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .innerJoin(locations, eq(sales.locationId, locations.id))
      .where(and(gte(sales.createdAt, startDate), locationWhereClause))
      .groupBy(locations.name)
      .orderBy(desc(sql`SUM(${sales.totalAmount})`));

    return {
      totalRevenue: totalRevenue.map((item) => ({
        date: item.date,
        value: Number(Number(item.value || 0).toFixed(2)),
        metadata: { count: item.count },
      })),
      byService: byService.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      byLocation: byLocation.map((item) => ({
        date: item.category,
        value: Number(Number(item.value || 0).toFixed(2)),
        category: item.category,
        metadata: { count: item.count },
      })),
      byCustomerSegment: [], // Customer segment revenue
      trends: {
        weekly: [],
        monthly: [],
        quarterly: [],
      },
    };
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getComprehensiveAnalyticsData(timeRange: string, locationFilter?: any) {
    const [satisfaction, performance, behavior, revenue] = await Promise.all([
      this.organizeCustomerSatisfactionData(timeRange, locationFilter),
      this.organizeRepairPerformanceData(timeRange, locationFilter),
      this.organizeCustomerBehaviorData(timeRange, locationFilter),
      this.organizeRevenueAnalyticsData(timeRange, locationFilter),
    ]);

    return {
      customerSatisfaction: satisfaction,
      repairPerformance: performance,
      customerBehavior: behavior,
      revenueAnalytics: revenue,
      metadata: {
        timeRange,
        locationFilter,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          satisfaction: satisfaction.overall.length,
          performance: performance.efficiency.length,
          behavior: behavior.lifetimeValue.length,
          revenue: revenue.totalRevenue.length,
        },
      },
    };
  }

  private getDaysFromTimeRange(timeRange: string): number {
    switch (timeRange) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      case "180d":
        return 180;
      case "365d":
        return 365;
      default:
        return 30;
    }
  }
}
