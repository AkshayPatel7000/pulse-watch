"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Service, ServiceStatus, StatusEvent } from "../../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import {
  getStatusColor,
  getStatusLabel,
  formatRelativeTime,
} from "../../lib/utils";

interface DashboardOverviewProps {
  services: Service[];
  recentEvents: StatusEvent[];
}

export function DashboardOverview({
  services,
  recentEvents,
}: DashboardOverviewProps) {
  const router = useRouter();
  const params = useParams();
  const orgName = params?.org_name as string;
  const [now, setNow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "backend" | "frontend">(
    "all",
  );

  useEffect(() => {
    // Update time asynchronously to avoid cascading render warning
    const timeout = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Filter services based on search term and type
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" ||
      service.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const getOverallStatus = (services: Service[]): ServiceStatus => {
    const downCount = services.filter((s) => s.currentStatus === "down").length;
    const degradedCount = services.filter(
      (s) => s.currentStatus === "degraded",
    ).length;
    if (downCount > 0) return "down";
    if (degradedCount > 0) return "degraded";
    return "up";
  };

  const overallStatus = getOverallStatus(services);
  const upCount = services.filter((s) => s.currentStatus === "up").length;
  const degradedCount = services.filter(
    (s) => s.currentStatus === "degraded",
  ).length;
  const downCount = services.filter((s) => s.currentStatus === "down").length;

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
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
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <CardTitle className="text-lg">
                {overallStatus === "up"
                  ? "All Systems Operational"
                  : overallStatus === "degraded"
                    ? "Partial System Outage"
                    : "Major System Outage"}
              </CardTitle>
              <CardDescription>
                Monitoring {services.length} services across 5 regions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{services.length}</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-green-600">
                {upCount}
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Degraded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-yellow-600">
                {degradedCount}
              </span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-red-600">
                {downCount}
              </span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Current status of all monitored services
          </CardDescription>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterType === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1" />
                All
              </button>
              <button
                onClick={() => setFilterType("backend")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterType === "backend"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Backend
              </button>
              <button
                onClick={() => setFilterType("frontend")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterType === "frontend"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Frontend
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No services found matching your criteria
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors gap-3"
                  onClick={() =>
                    router.push(`/${orgName}/services/${service.id}`)
                  }
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(service.currentStatus)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{service.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {service.type}
                        </Badge>
                      </div>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline mt-1 inline-block break-all"
                        title={service.url}
                      >
                        {service.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-sm font-medium ${getStatusColor(service.currentStatus)}`}
                      >
                        {getStatusLabel(service.currentStatus)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Checked{" "}
                        {now > 0
                          ? formatRelativeTime(service.lastCheckedAt, now)
                          : "..."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      {recentEvents?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Latest status changes across all services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const service = services.find(
                  (s: Service) =>
                    s.id === event.serviceId || s._id === event.serviceId,
                );
                if (!service) return null;

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <TrendingUp
                      className={`w-4 h-4 mt-0.5 ${event.newStatus === "up" ? "text-green-600" : event.newStatus === "degraded" ? "text-yellow-600" : "text-red-600"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Status changed from{" "}
                        <span className={getStatusColor(event.previousStatus)}>
                          {getStatusLabel(event.previousStatus)}
                        </span>{" "}
                        to{" "}
                        <span className={getStatusColor(event.newStatus)}>
                          {getStatusLabel(event.newStatus)}
                        </span>
                      </p>
                      {event.affectedRegions &&
                        event.affectedRegions.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Affected regions: {event.affectedRegions.join(", ")}
                          </p>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {now > 0
                        ? formatRelativeTime(event.timestamp, now)
                        : "..."}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
