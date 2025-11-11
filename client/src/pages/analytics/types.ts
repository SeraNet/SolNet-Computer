/**
 * TypeScript interfaces for Analytics Hub
 */

// Expense Analytics Interfaces
export interface ExpenseTypeAnalytics {
  typeBreakdown: {
    [key: string]: {
      monthly: { count: number; total: number; percentage: string };
      yearly: { count: number; total: number; percentage: string };
      averagePerMonth: string;
    };
  };
  recurringAnalysis: { monthly: number; percentage: string };
  oneTimeAnalysis: { monthly: number; percentage: string };
  cashFlowImpact: { predictable: number; unpredictable: number; total: number };
}

export interface BudgetAnalysis {
  monthlyAverages: { [key: string]: number };
  currentMonthActuals: { [key: string]: number };
  variance: {
    [key: string]: {
      budget: string;
      actual: string;
      difference: string;
      percentage: string;
      status: string;
    };
  };
  totalAnalysis: {
    budget: string;
    actual: string;
    variance: string;
    percentage: string;
    status: string;
  };
}

export interface CashFlowProjections {
  projections: Array<{
    month: string;
    predictable: string;
    yearly: string;
    unpredictable: string;
    total: string;
  }>;
  insights: {
    averageMonthly: string;
    highestMonth: { month: string; amount: string };
    lowestMonth: { month: string; amount: string };
    predictablePercentage: string;
  };
}

// General Analytics Interfaces
export interface AnalyticsData {
  totalRevenue?: number;
  revenueChange?: number;
  activeRepairs?: number;
  repairsChange?: number;
  totalSales?: number;
  salesChange?: number;
  newCustomers?: number;
  customersChange?: number;
  completionRate?: number;
  avgRepairTime?: number;
  appointmentsToday?: number;
  avgTransaction?: number;
  revenuePerRepair?: number;
  customerRetentionRate?: number;
  pendingRepairs?: number;
  dataQuality?: {
    hasHistoricalData: boolean;
    hasCompletionData: boolean;
    hasRepairTimeData: boolean;
    lastUpdated: string;
  };
  profitMargin?: number;
  customerSatisfaction?: number;
  inventoryTurnover?: number;
  employeeProductivity?: number;
  peakHours?: string[];
  seasonalTrends?: {
    highSeason: string;
    lowSeason: string;
    growthRate: number;
  };
}

// Enhanced Analytics State
export interface AnalyticsState {
  isRealTime: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showInsights: boolean;
  compactView: boolean;
  lastUpdate: Date;
  notifications: Array<{
    id: string;
    type: "info" | "warning" | "success" | "error";
    message: string;
    timestamp: Date;
  }>;
}

// Color constants
export const COLORS = {
  daily: "#3B82F6",
  monthly: "#10B981",
  yearly: "#F59E0B",
  "one-time": "#EF4444",
  equipment: "#8B5CF6",
  over: "#EF4444",
  under: "#10B981",
  "on-track": "#3B82F6",
};
















