import {
  Service,
  RegionalHealth,
  ProbeResult,
  StatusEvent,
} from "../../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  getStatusColor,
  getStatusLabel,
  formatRelativeTime,
  getRegionName,
  formatUptime,
  formatResponseTime,
} from "../../lib/utils";
import { useState, useEffect, useMemo } from "react";

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
}

export function ServiceDetail({ service, onBack }: ServiceDetailProps) {
  const [probeResults, setProbeResults] = useState<ProbeResult[]>([]);
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, eventsRes] = await Promise.all([
          fetch(`/api/services/${service.id}/results?limit=500`),
          // We need an events API for this service too
          fetch(`/api/services/${service.id}/events`),
        ]);

        const results = await resultsRes.json();
        const events = await eventsRes.json();

        setProbeResults(results);
        setStatusEvents(events);
      } catch (error) {
        console.error("Error fetching service data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service.id]);

  const uptimeStats = useMemo(() => {
    const now = Date.now();
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
  }, [probeResults]);

  const regionalHealth = useMemo(() => {
    const regions: (
      | "us-east-1"
      | "eu-central-1"
      | "ap-south-1"
      | "ap-northeast-1"
      | "ap-southeast-1"
    )[] = [
      "us-east-1",
      "eu-central-1",
      "ap-south-1",
      "ap-northeast-1",
      "ap-southeast-1",
    ];
    return regions.map((region) => {
      const regionResults = probeResults
        .filter((r) => r.region === region)
        .sort((a, b) => b.startedAt - a.startedAt);
      const latest = regionResults[0];
      return {
        region,
        status: latest ? (latest.success ? "up" : "down") : ("up" as any),
        responseTime: latest ? latest.responseTime : 0,
        lastChecked: latest ? latest.startedAt : Date.now(),
      };
    });
  }, [probeResults]);

  const last24h = useMemo(() => {
    const now = Date.now();
    return probeResults
      .filter((r) => r.startedAt > now - 24 * 60 * 60 * 1000)
      .sort((a, b) => a.startedAt - b.startedAt);
  }, [probeResults]);

  // Group by timestamp and calculate average response time
  const chartData = useMemo(() => {
    return last24h.reduce((acc: any[], result: ProbeResult) => {
      const timestamp =
        Math.floor(result.startedAt / (10 * 60 * 1000)) * 10 * 60 * 1000;
      const existing = acc.find((item: any) => item.timestamp === timestamp);

      if (existing) {
        existing.totalResponseTime += result.responseTime;
        existing.count += 1;
        existing.responseTime = existing.totalResponseTime / existing.count;
      } else {
        acc.push({
          timestamp,
          responseTime: result.responseTime,
          totalResponseTime: result.responseTime,
          count: 1,
          time: new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      return acc;
    }, []);
  }, [last24h]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {getStatusIcon(service.currentStatus)}
              <h2 className="text-2xl font-semibold">{service.name}</h2>
              <Badge variant="outline">{service.type}</Badge>
            </div>
            <p className="text-gray-600 mt-1">{service.url}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium ${getStatusColor(service.currentStatus)}`}>
            {getStatusLabel(service.currentStatus)}
          </p>
          <p className="text-sm text-gray-500">
            Last checked {formatRelativeTime(service.lastCheckedAt)}
          </p>
        </div>
      </div>

      {/* Uptime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              24h Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime24h)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              7d Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime7d)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              30d Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime30d)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatResponseTime(uptimeStats.avgResponseTime)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time (Last 24 Hours)</CardTitle>
          <CardDescription>
            Average response time across all regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: "ms", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatResponseTime(value),
                    "Response Time",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regional Health */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Health</CardTitle>
          <CardDescription>
            Current status across all monitoring regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regionalHealth.map((region) => (
              <div
                key={region.region}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {getRegionName(region.region)}
                    </p>
                    <p className="text-sm text-gray-500">{region.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatResponseTime(region.responseTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(region.lastChecked)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      region.status === "up"
                        ? "secondary"
                        : region.status === "degraded"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {getStatusLabel(region.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident History */}
      {statusEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incident History</CardTitle>
            <CardDescription>Recent status changes and outages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-4 rounded-lg border"
                >
                  <Clock className="w-4 h-4 mt-0.5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
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
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
