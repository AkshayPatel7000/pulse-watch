import { ServiceStatus, Region } from "./types";

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "text-green-600";
    case "degraded":
      return "text-yellow-600";
    case "down":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getStatusBgColor(status: ServiceStatus): string {
  switch (status) {
    case "up":
      return "bg-green-100 border-green-300";
    case "degraded":
      return "bg-yellow-100 border-yellow-300";
    case "down":
      return "bg-red-100 border-red-300";
    default:
      return "bg-gray-100 border-gray-300";
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
