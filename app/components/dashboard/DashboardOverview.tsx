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
  getStatusBadgeStyle,
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

  const renderServiceCard = (service: Service) => {
    return (
      <div
        key={service.id}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors gap-3 group"
        onClick={() => router.push(`/${orgName}/services/${service.id}`)}
      >
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon(service.currentStatus)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium group-hover:text-blue-600 transition-colors">
                {service.name}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] h-4 px-1.5 uppercase font-bold tracking-wider opacity-70"
              >
                {service.type}
              </Badge>
              {service.isActive === false && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 bg-muted/50 text-muted-foreground border-muted uppercase font-bold tracking-wider"
                >
                  Paused
                </Badge>
              )}
            </div>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-muted-foreground hover:text-blue-600 hover:underline mt-1 inline-block break-all"
              title={service.url}
            >
              {service.url}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end flex-shrink-0">
          <div className="text-left sm:text-right">
            <p
              className={`text-sm font-bold uppercase tracking-tight ${getStatusColor(service.currentStatus)}`}
            >
              {getStatusLabel(service.currentStatus)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Checked{" "}
              {now > 0 ? formatRelativeTime(service.lastCheckedAt, now) : "..."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <Card
        className={
          overallStatus === "up"
            ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20 shadow-sm"
            : overallStatus === "degraded"
              ? "border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 shadow-sm"
              : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 shadow-sm"
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{services.length}</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                {upCount}
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Degraded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-yellow-600">
                {degradedCount}
              </span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">
                {downCount}
              </span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search through all services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "backend", "frontend"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                filterType === type
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {type === "all" && <Filter className="w-3 h-3 inline mr-1.5" />}
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Services List Categorized */}
      <div className="space-y-10">
        {filteredServices.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <Search className="w-8 h-8 mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground font-medium">
                  No services found matching your criteria
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Try adjusting your search or filters
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Down Services */}
            {filteredServices.some(
              (s) => s.isActive !== false && s.currentStatus === "down",
            ) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-6 bg-red-600 rounded-full" />
                  <h3 className="font-bold text-red-900 dark:text-red-400 uppercase tracking-tight">
                    Major Outage
                  </h3>
                  <Badge
                    variant="destructive"
                    className="ml-1 px-1.5 py-0 min-w-[20px] justify-center font-bold"
                  >
                    {
                      filteredServices.filter(
                        (s) =>
                          s.isActive !== false && s.currentStatus === "down",
                      ).length
                    }
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredServices
                    .filter(
                      (s) => s.isActive !== false && s.currentStatus === "down",
                    )
                    .map((service) => renderServiceCard(service))}
                </div>
              </div>
            )}

            {/* Degraded Services */}
            {filteredServices.some(
              (s) => s.isActive !== false && s.currentStatus === "degraded",
            ) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-6 bg-yellow-500 rounded-full" />
                  <h3 className="font-bold text-yellow-900 dark:text-yellow-400 uppercase tracking-tight">
                    Partial Outage
                  </h3>
                  <Badge
                    variant="outline"
                    className={
                      getStatusBadgeStyle("degraded") +
                      " ml-1 font-bold px-1.5 py-0 min-w-[20px] justify-center"
                    }
                  >
                    {
                      filteredServices.filter(
                        (s) =>
                          s.isActive !== false &&
                          s.currentStatus === "degraded",
                      ).length
                    }
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredServices
                    .filter(
                      (s) =>
                        s.isActive !== false && s.currentStatus === "degraded",
                    )
                    .map((service) => renderServiceCard(service))}
                </div>
              </div>
            )}

            {/* Operational Services */}
            {filteredServices.some(
              (s) => s.isActive !== false && s.currentStatus === "up",
            ) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-6 bg-green-500 rounded-full" />
                  <h3 className="font-bold text-green-900 dark:text-green-400 uppercase tracking-tight">
                    Operational
                  </h3>
                  <Badge
                    variant="outline"
                    className={
                      getStatusBadgeStyle("up") +
                      " ml-1 font-bold px-1.5 py-0 min-w-[20px] justify-center"
                    }
                  >
                    {
                      filteredServices.filter(
                        (s) => s.isActive !== false && s.currentStatus === "up",
                      ).length
                    }
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredServices
                    .filter(
                      (s) => s.isActive !== false && s.currentStatus === "up",
                    )
                    .map((service) => renderServiceCard(service))}
                </div>
              </div>
            )}

            {/* Paused Services */}
            {filteredServices.some((s) => s.isActive === false) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-6 bg-gray-400 rounded-full" />
                  <h3 className="font-bold text-gray-700 dark:text-gray-400 uppercase tracking-tight">
                    Paused Monitoring
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-1 font-bold px-1.5 py-0"
                  >
                    {
                      filteredServices.filter((s) => s.isActive === false)
                        .length
                    }
                  </Badge>
                </div>
                <div className="grid gap-3 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                  {filteredServices
                    .filter((s) => s.isActive === false)
                    .map((service) => renderServiceCard(service))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Events */}
      {recentEvents?.length > 0 && (
        <Card className="mt-8 border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">
              Recent Incident History
            </CardTitle>
            <CardDescription>
              Chronological log of system health transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => {
                const service = services.find(
                  (s: Service) =>
                    s.id === event.serviceId || s._id === event.serviceId,
                );
                if (!service) return null;

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg bg-card border shadow-sm ${event.newStatus === "up" ? "text-green-600" : event.newStatus === "degraded" ? "text-yellow-600" : "text-red-600"}`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm tracking-tight">
                        {service.name}
                      </p>
                      <div className="text-xs mt-1.5 flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            getStatusColor(event.previousStatus) +
                            " border-current opacity-60 text-[10px] px-1.5 py-0"
                          }
                        >
                          {getStatusLabel(event.previousStatus)}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge
                          variant="outline"
                          className={
                            getStatusBadgeStyle(event.newStatus) +
                            " font-bold text-[10px] px-1.5 py-0"
                          }
                        >
                          {getStatusLabel(event.newStatus)}
                        </Badge>

                        {event.affectedRegions &&
                          event.affectedRegions.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-auto">
                              {event.affectedRegions.map((reg) => (
                                <span
                                  key={reg}
                                  className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border uppercase font-bold tracking-tighter"
                                >
                                  {reg}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-1 rounded self-start">
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
