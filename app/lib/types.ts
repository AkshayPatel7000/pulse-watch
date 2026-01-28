export type ServiceType = "frontend" | "backend";
export type ServiceStatus = "up" | "degraded" | "down";
export type Region =
  | "us-east-1"
  | "eu-central-1"
  | "ap-south-1"
  | "ap-northeast-1"
  | "ap-southeast-1";

export interface Service {
  id: string;
  _id?: any;
  name: string;
  url: string;
  type: ServiceType;
  currentStatus: ServiceStatus;
  lastCheckedAt: number;
  description?: string;
  notificationSettings?: {
    emails?: string[];
    slackWebhook?: string;
    notifyOnDown?: boolean;
    notifyOnDegraded?: boolean;
    notifyOnRecovered?: boolean;
  };
}

export interface ProbeResult {
  id: string;
  serviceId: string;
  region: Region;
  statusCode: number;
  responseTime: number;
  startedAt: number;
  success: boolean;
}

export interface StatusEvent {
  id: string;
  serviceId: string;
  previousStatus: ServiceStatus;
  newStatus: ServiceStatus;
  timestamp: number;
  affectedRegions?: string[];
}

export interface UptimeStats {
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  avgResponseTime: number;
}

export interface RegionalHealth {
  region: Region;
  status: ServiceStatus;
  responseTime: number;
  lastChecked: number;
}
