"use client";
import { useState, useEffect } from "react";
import { Service, StatusEvent } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
} from "lucide-react";
import {
  getStatusColor,
  getStatusLabel,
  formatRelativeTime,
  formatUptime,
} from "../../lib/utils";
import {
  getOverallStatus,
  mockDB,
  calculateUptimeStats,
} from "../../lib/mockData";

interface PublicStatusPageProps {
  services: Service[];
  recentEvents: StatusEvent[];
}

export function PublicStatusPage({
  services,
  recentEvents,
}: PublicStatusPageProps) {
  const [now, setNow] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
  const overallStatus = getOverallStatus(services);
  console.log("🚀 ~ PublicStatusPage ~ services:", services);
  console.log("🚀 ~ PublicStatusPage ~ recentEvents:", recentEvents);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    // Update time asynchronously to avoid cascading render warning
    const timeout = setTimeout(() => {
      const initialTime = Date.now();
      setNow(initialTime);
      setLastUpdate(initialTime);
    }, 0);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      setLastUpdate(currentTime);
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = (status: Service["currentStatus"]) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getOverallMessage = () => {
    switch (overallStatus) {
      case "up":
        return "All Systems Operational";
      case "degraded":
        return "Partial System Outage";
      case "down":
        return "Major System Outage";
    }
  };

  const getOverallDescription = () => {
    switch (overallStatus) {
      case "up":
        return "All services are running smoothly with no reported issues.";
      case "degraded":
        return "Some services are experiencing degraded performance. We are actively working on a resolution.";
      case "down":
        return "Multiple services are currently experiencing outages. Our team is investigating and working to restore service.";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                System Status
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Last updated{" "}
                {lastUpdate > 0
                  ? formatRelativeTime(lastUpdate, now)
                  : "Just now"}{" "}
                <span className="hidden sm:inline">• Auto-refresh enabled</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Overall Status Banner */}
          <Card
            className={
              overallStatus === "up"
                ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
                : overallStatus === "degraded"
                  ? "border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                  : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
            }
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                  {getStatusIcon(overallStatus)}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl mb-2">
                    {getOverallMessage()}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {getOverallDescription()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 text-xs text-muted-foreground/80">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>5 regions</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>10 min checks</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Status */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Current Status
            </h2>
            <div className="space-y-3">
              {services.map((service) => {
                const probeResults = mockDB.getProbeResults(service.id);
                const uptimeStats = calculateUptimeStats(
                  probeResults,
                  now > 0 ? now : service.lastCheckedAt,
                );

                return (
                  <Card key={service.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(service.currentStatus)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-medium text-sm sm:text-base">
                                {service.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {service.type}
                              </Badge>
                            </div>
                            {service.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end sm:text-right flex-shrink-0">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              30d Uptime
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatUptime(uptimeStats.uptime30d)}
                            </p>
                          </div>
                          <div>
                            <p
                              className={`font-medium text-sm sm:text-base ${getStatusColor(service.currentStatus)}`}
                            >
                              {getStatusLabel(service.currentStatus)}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {now > 0
                                ? formatRelativeTime(service.lastCheckedAt, now)
                                : "..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Incident History */}
          {recentEvents.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Recent Incidents (Last 30 Days)
              </h2>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {recentEvents.map((event) => {
                      const service = services.find(
                        (s: Service) =>
                          s.id === event.serviceId || s._id === event.serviceId,
                      );

                      if (!service) {
                        console.log(
                          "❌ Service not found for event:",
                          event.id,
                          "serviceId:",
                          event.serviceId,
                        );
                        return null;
                      }

                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-2 sm:gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                              event.newStatus === "up"
                                ? "bg-green-600"
                                : event.newStatus === "degraded"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium mb-1 text-sm sm:text-base">
                                  {service.name}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Status changed from{" "}
                                  <span
                                    className={getStatusColor(
                                      event.previousStatus,
                                    )}
                                  >
                                    {getStatusLabel(event.previousStatus)}
                                  </span>{" "}
                                  to{" "}
                                  <span
                                    className={getStatusColor(event.newStatus)}
                                  >
                                    {getStatusLabel(event.newStatus)}
                                  </span>
                                </p>
                                {event.affectedRegions &&
                                  event.affectedRegions.length > 0 && (
                                    <p className="text-xs text-muted-foreground/60 mt-2">
                                      Affected regions:{" "}
                                      {event.affectedRegions.join(", ")}
                                    </p>
                                  )}
                              </div>
                              <span className="text-xs sm:text-sm text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                                {now > 0
                                  ? formatRelativeTime(event.timestamp, now)
                                  : "..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">
                    About This Status Page
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This page displays real-time status information for all our
                    services. Our monitoring system checks each endpoint every
                    10 minutes from 5 global regions to ensure accurate
                    availability data. The page automatically refreshes every
                    minute to provide you with the latest information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
