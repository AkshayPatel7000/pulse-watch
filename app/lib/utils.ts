import { ServiceStatus, Region } from "./types";

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "text-green-600 dark:text-green-400";
    case "degraded":
      return "text-yellow-600 dark:text-yellow-400";
    case "down":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

export function getStatusBgColor(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "bg-green-100 border-green-300 dark:bg-green-950/30 dark:border-green-800";
    case "degraded":
      return "bg-yellow-100 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800";
    case "down":
      return "bg-red-100 border-red-300 dark:bg-red-950/30 dark:border-red-800";
    default:
      return "bg-gray-100 border-gray-300 dark:bg-gray-950/30 dark:border-gray-800";
  }
}

export function getStatusBadgeStyle(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800";
    case "degraded":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800";
    case "down":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-800";
  }
}

export function getStatusBadgeColor(
  status: ServiceStatus,
): "default" | "destructive" | "secondary" {
  switch (status) {
    case "up":
      return "secondary";
    case "degraded":
      return "default";
    case "down":
      return "destructive";
    default:
      return "default";
  }
}

export function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "Operational";
    case "degraded":
      return "Degraded Performance";
    case "down":
      return "Major Outage";
    default:
      return "Unknown";
  }
}

export function getRegionName(region: Region): string {
  const names: Record<Region, string> = {
    "us-east-1": "US East (N. Virginia)",
    "eu-central-1": "EU Central (Frankfurt)",
    "ap-south-1": "Asia Pacific (Mumbai)",
    "ap-northeast-1": "Asia Pacific (Tokyo)",
    "ap-southeast-1": "Asia Pacific (Singapore)",
  };
  return names[region];
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(timestamp: number, now: number): string {
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function formatUptime(uptime: number): string {
  return `${uptime.toFixed(2)}%`;
}

export function formatResponseTime(ms: number): string {
  return `${Math.round(ms)}ms`;
}
