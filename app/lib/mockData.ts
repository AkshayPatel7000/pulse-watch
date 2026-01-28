import {
  Service,
  ProbeResult,
  StatusEvent,
  UptimeStats,
  RegionalHealth,
  ServiceStatus,
  Region,
} from "./types";

// Mock Services
export const mockServices: Service[] = [
  {
    id: "1",
    name: "Main Website",
    url: "https://example.com",
    type: "frontend",
    currentStatus: "up",
    lastCheckedAt: Date.now() - 300000, // 5 minutes ago
    description: "Primary customer-facing website",
  },
  {
    id: "2",
    name: "API Gateway",
    url: "https://api.example.com",
    type: "backend",
    currentStatus: "up",
    lastCheckedAt: Date.now() - 300000,
    description: "Main API gateway for all services",
  },
  {
    id: "3",
    name: "Payment Service",
    url: "https://payments.example.com/health",
    type: "backend",
    currentStatus: "degraded",
    lastCheckedAt: Date.now() - 600000, // 10 minutes ago
    description: "Payment processing endpoint",
  },
  {
    id: "4",
    name: "Auth Service",
    url: "https://auth.example.com/health",
    type: "backend",
    currentStatus: "up",
    lastCheckedAt: Date.now() - 300000,
    description: "Authentication and authorization service",
  },
  {
    id: "5",
    name: "Admin Dashboard",
    url: "https://admin.example.com",
    type: "frontend",
    currentStatus: "down",
    lastCheckedAt: Date.now() - 900000, // 15 minutes ago
    description: "Internal admin dashboard",
  },
];

// Generate mock probe results
const regions: Region[] = [
  "us-east-1",
  "eu-central-1",
  "ap-south-1",
  "ap-northeast-1",
  "ap-southeast-1",
];

export function generateProbeResults(
  serviceId: string,
  count: number = 50,
): ProbeResult[] {
  const results: ProbeResult[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = now - i * 10 * 60 * 1000; // Every 10 minutes

    regions.forEach((region) => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      results.push({
        id: `${serviceId}-${region}-${i}`,
        serviceId,
        region,
        statusCode: isSuccess ? 200 : Math.random() > 0.5 ? 500 : 503,
        responseTime: isSuccess
          ? Math.random() * 500 + 50
          : Math.random() * 2000 + 500,
        startedAt: timestamp,
        success: isSuccess,
      });
    });
  }

  return results;
}

// Generate status events
export function generateStatusEvents(serviceId: string): StatusEvent[] {
  const events: StatusEvent[] = [];
  const now = Date.now();

  // Generate some incidents over the last 30 days
  const incidentCount = Math.floor(Math.random() * 5);

  for (let i = 0; i < incidentCount; i++) {
    const timestamp = now - Math.random() * 30 * 24 * 60 * 60 * 1000;
    const statuses: ServiceStatus[] = ["up", "degraded", "down"];
    const previousStatus = statuses[Math.floor(Math.random() * 3)];
    let newStatus = statuses[Math.floor(Math.random() * 3)];

    // Ensure status actually changed
    while (newStatus === previousStatus) {
      newStatus = statuses[Math.floor(Math.random() * 3)];
    }

    events.push({
      id: `event-${serviceId}-${i}`,
      serviceId,
      previousStatus,
      newStatus,
      timestamp,
      affectedRegions: regions.slice(0, Math.floor(Math.random() * 3) + 1),
    });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

// Calculate uptime stats
export function calculateUptimeStats(
  probeResults: ProbeResult[],
  now: number = Date.now(),
): UptimeStats {
  const last24h = probeResults.filter(
    (r) => r.startedAt > now - 24 * 60 * 60 * 1000,
  );
  const last7d = probeResults.filter(
    (r) => r.startedAt > now - 7 * 24 * 60 * 60 * 1000,
  );
  const last30d = probeResults.filter(
    (r) => r.startedAt > now - 30 * 24 * 60 * 60 * 1000,
  );

  const calcUptime = (results: ProbeResult[]) => {
    if (results.length === 0) return 100;
    const successful = results.filter((r) => r.success).length;
    return (successful / results.length) * 100;
  };

  const avgResponseTime =
    last24h.length > 0
      ? last24h.reduce((sum, r) => sum + r.responseTime, 0) / last24h.length
      : 0;

  return {
    uptime24h: calcUptime(last24h),
    uptime7d: calcUptime(last7d),
    uptime30d: calcUptime(last30d),
    avgResponseTime,
  };
}

// Get regional health
export function getRegionalHealth(serviceId: string): RegionalHealth[] {
  const now = Date.now();

  return regions.map((region) => {
    const isHealthy = Math.random() > 0.2; // 80% healthy
    const responseTime = isHealthy
      ? Math.random() * 300 + 50
      : Math.random() * 2000 + 500;

    let status: ServiceStatus = "up";
    if (!isHealthy) {
      status = Math.random() > 0.5 ? "degraded" : "down";
    }

    return {
      region,
      status,
      responseTime,
      lastChecked: now - Math.random() * 600000,
    };
  });
}

// Get overall system status
export function getOverallStatus(services: Service[]): ServiceStatus {
  const downCount = services.filter((s) => s.currentStatus === "down").length;
  const degradedCount = services.filter(
    (s) => s.currentStatus === "degraded",
  ).length;

  if (downCount > 0) return "down";
  if (degradedCount > 0) return "degraded";
  return "up";
}

// In-memory state management
class MockDatabase {
  private services: Service[] = [...mockServices];
  private probeResults: Map<string, ProbeResult[]> = new Map();
  private statusEvents: Map<string, StatusEvent[]> = new Map();

  constructor() {
    // Initialize probe results and events for each service
    this.services.forEach((service) => {
      this.probeResults.set(service.id, generateProbeResults(service.id));
      this.statusEvents.set(service.id, generateStatusEvents(service.id));
    });
  }

  // Services
  getServices(): Service[] {
    return [...this.services];
  }

  getService(id: string): Service | undefined {
    return this.services.find((s) => s.id === id);
  }

  addService(
    service: Omit<Service, "id" | "currentStatus" | "lastCheckedAt">,
  ): Service {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      currentStatus: "up",
      lastCheckedAt: Date.now(),
    };
    this.services.push(newService);
    this.probeResults.set(newService.id, generateProbeResults(newService.id));
    this.statusEvents.set(newService.id, generateStatusEvents(newService.id));
    return newService;
  }

  updateService(id: string, updates: Partial<Service>): Service | undefined {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    this.services[index] = { ...this.services[index], ...updates };
    return this.services[index];
  }

  deleteService(id: string): boolean {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.services.splice(index, 1);
    this.probeResults.delete(id);
    this.statusEvents.delete(id);
    return true;
  }

  // Probe Results
  getProbeResults(serviceId: string): ProbeResult[] {
    return this.probeResults.get(serviceId) || [];
  }

  // Status Events
  getStatusEvents(serviceId: string): StatusEvent[] {
    return this.statusEvents.get(serviceId) || [];
  }

  getAllRecentEvents(limit: number = 20): StatusEvent[] {
    const allEvents: StatusEvent[] = [];
    this.statusEvents.forEach((events) => allEvents.push(...events));
    return allEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
}

export const mockDB = new MockDatabase();
