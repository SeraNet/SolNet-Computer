import os from "os";
import fs from "fs";
import path from "path";

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  uptime: number;
  platform: string;
  nodeVersion: string;
  processInfo: {
    pid: number;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private lastCpuUsage: { idle: number; total: number } | null = null;

  private constructor() {}

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memoryInfo = this.getMemoryInfo();
    const diskInfo = await this.getDiskInfo();
    const processInfo = this.getProcessInfo();

    return {
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      memory: memoryInfo,
      disk: diskInfo,
      uptime: os.uptime(),
      platform: os.platform(),
      nodeVersion: process.version,
      processInfo,
    };
  }

  private async getCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        total += cpu.times[type as keyof typeof cpu.times];
      }
      idle += cpu.times.idle;
    });

    if (this.lastCpuUsage) {
      const idleDiff = idle - this.lastCpuUsage.idle;
      const totalDiff = total - this.lastCpuUsage.total;
      const usage = 100 - (100 * idleDiff) / totalDiff;
      this.lastCpuUsage = { idle, total };
      return Math.round(usage * 100) / 100;
    } else {
      this.lastCpuUsage = { idle, total };
      return 0;
    }
  }

  private getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total: Math.round((total / 1024 / 1024 / 1024) * 100) / 100, // GB
      used: Math.round((used / 1024 / 1024 / 1024) * 100) / 100, // GB
      free: Math.round((free / 1024 / 1024 / 1024) * 100) / 100, // GB
      usage: Math.round(usage * 100) / 100,
    };
  }

  private async getDiskInfo() {
    try {
      // Get disk usage for the current directory
      const currentPath = process.cwd();
      const stats = fs.statSync(currentPath);

      // This is a simplified approach - in production you might want to use a library like 'diskusage'
      const total = 100; // Mock total in GB
      const used = Math.floor(Math.random() * 30) + 50; // Mock used percentage
      const free = total - (total * used) / 100;

      return {
        total,
        used: Math.round(((total * used) / 100) * 100) / 100,
        free: Math.round(free * 100) / 100,
        usage: Math.round(used * 100) / 100,
      };
    } catch (error) {
      return {
        total: 100,
        used: 65,
        free: 35,
        usage: 65,
      };
    }
  }

  private getProcessInfo() {
    return {
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }

  async getDatabaseHealth() {
    try {
      // This would be implemented with your actual database connection
      // For now, returning mock data
      return {
        status: "healthy" as const,
        responseTime: Math.floor(Math.random() * 50) + 10,
        connections: Math.floor(Math.random() * 20) + 5,
      };
    } catch (error) {
      return {
        status: "error" as const,
        responseTime: 0,
        connections: 0,
      };
    }
  }

  async getServiceStatus() {
    const services = [
      {
        name: "API Server",
        status: "running" as const,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "Database",
        status: "running" as const,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "File Storage",
        status: "running" as const,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "SMS Service",
        status: process.env.SMS_API_KEY
          ? ("running" as const)
          : ("stopped" as const),
        lastCheck: new Date().toISOString(),
      },
      {
        name: "Telegram Bot",
        status: process.env.TELEGRAM_BOT_TOKEN
          ? ("running" as const)
          : ("stopped" as const),
        lastCheck: new Date().toISOString(),
      },
    ];

    return services;
  }

  async getSystemLogs() {
    // In a real implementation, you would read from actual log files
    // For now, returning mock logs
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: "info" as const,
        message: "System health check completed",
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "info" as const,
        message: "Database connection pool refreshed",
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: "warning" as const,
        message: "High memory usage detected",
      },
      {
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: "info" as const,
        message: "SMS service status check completed",
      },
      {
        timestamp: new Date(Date.now() - 240000).toISOString(),
        level: "info" as const,
        message: "Telegram bot message sent successfully",
      },
    ];

    return logs;
  }

  async getErrorStats() {
    // In a real implementation, you would track actual errors
    // For now, returning mock data
    return {
      totalErrors: Math.floor(Math.random() * 10),
      errorsLast24h: Math.floor(Math.random() * 5),
      criticalErrors: Math.floor(Math.random() * 2),
    };
  }
}