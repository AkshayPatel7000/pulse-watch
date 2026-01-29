"use client";
import { useRouter } from "next/navigation";
import {
  Service,
  ServiceStatus,
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
  Bell,
  Mail,
  MessageSquare,
  Save,
} from "lucide-react";
import {
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface ServiceDetailProps {
  service: Service;
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const router = useRouter();
  const [probeResults, setProbeResults] = useState<ProbeResult[]>([]);
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [activeTab, setActiveTab] = useState<"metrics" | "alerts">("metrics");

  // Alert settings state
  const [emails, setEmails] = useState<string>(
    service.notificationSettings?.emails?.join(", ") || "",
  );
  const [slackWebhook, setSlackWebhook] = useState<string>(
    service.notificationSettings?.slackWebhook || "",
  );
  const [notifyOnDown, setNotifyOnDown] = useState<boolean>(
    service.notificationSettings?.notifyOnDown ?? true,
  );
  const [notifyOnDegraded, setNotifyOnDegraded] = useState<boolean>(
    service.notificationSettings?.notifyOnDegraded ?? true,
  );
  const [notifyOnRecovered, setNotifyOnRecovered] = useState<boolean>(
    service.notificationSettings?.notifyOnRecovered ?? true,
  );
  const [notifyOnCriticalOnly, setNotifyOnCriticalOnly] = useState<boolean>(
    service.notificationSettings?.notifyOnCriticalOnly ?? false,
  );
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, eventsRes] = await Promise.all([
          fetch(`/api/services/${service.id}/results?limit=500`),
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
    const calculationNow = now > 0 ? now : service.lastCheckedAt;
    const last24h = probeResults.filter(
      (r) => r.startedAt > calculationNow - 24 * 60 * 60 * 1000,
    );
    const last7d = probeResults.filter(
      (r) => r.startedAt > calculationNow - 7 * 24 * 60 * 60 * 1000,
    );
    const last30d = probeResults.filter(
      (r) => r.startedAt > calculationNow - 30 * 24 * 60 * 60 * 1000,
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
  }, [probeResults, now, service.lastCheckedAt]);

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
        status: latest
          ? latest.success
            ? "up"
            : "down"
          : ("up" as const as ServiceStatus),
        responseTime: latest ? latest.responseTime : 0,
        lastChecked: latest
          ? latest.startedAt
          : now > 0
            ? now
            : service.lastCheckedAt,
      };
    });
  }, [probeResults, now, service.lastCheckedAt]);

  const last24hResults = useMemo(() => {
    const calculationNow = now > 0 ? now : service.lastCheckedAt;
    return probeResults
      .filter((r) => r.startedAt > calculationNow - 24 * 60 * 60 * 1000)
      .sort((a, b) => a.startedAt - b.startedAt);
  }, [probeResults, now, service.lastCheckedAt]);

  const chartData = useMemo(() => {
    return last24hResults.reduce(
      (
        acc: {
          timestamp: number;
          responseTime: number;
          totalResponseTime: number;
          count: number;
          time: string;
        }[],
        result: ProbeResult,
      ) => {
        const timestamp =
          Math.floor(result.startedAt / (10 * 60 * 1000)) * 10 * 60 * 1000;
        const existing = acc.find((item) => item.timestamp === timestamp);

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
      },
      [],
    );
  }, [last24hResults]);

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

  const handleSaveAlerts = async () => {
    setIsSaving(true);
    try {
      const emailList = emails
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationSettings: {
            emails: emailList,
            slackWebhook,
            notifyOnDown,
            notifyOnDegraded,
            notifyOnRecovered,
            notifyOnCriticalOnly,
          },
        }),
      });

      if (response.ok) {
        toast.success("Alert settings updated successfully");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving alert settings:", error);
      toast.error("Failed to save alert settings");
    } finally {
      setIsSaving(false);
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
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
            Last checked{" "}
            {now > 0 ? formatRelativeTime(service.lastCheckedAt, now) : "..."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "metrics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("metrics")}
        >
          Metrics & History
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "alerts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("alerts")}
        >
          Alert Integrations
        </button>
      </div>

      {activeTab === "metrics" ? (
        <div className="space-y-6">
          {/* Uptime Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3 text-sm font-medium text-gray-600">
                24h Uptime
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-600">
                  {formatUptime(uptimeStats.uptime24h)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3 text-sm font-medium text-gray-600">
                7d Uptime
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-600">
                  {formatUptime(uptimeStats.uptime7d)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3 text-sm font-medium text-gray-600">
                30d Uptime
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-600">
                  {formatUptime(uptimeStats.uptime30d)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3 text-sm font-medium text-gray-600">
                Avg Response
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatResponseTime(uptimeStats.avgResponseTime)}
                </p>
              </CardContent>
            </Card>
          </div>

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
                      label={{
                        value: "ms",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatResponseTime(value),
                        "Response Time",
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#fff" }}
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
                          {now > 0
                            ? formatRelativeTime(region.lastChecked, now)
                            : "..."}
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

          {statusEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Incident History</CardTitle>
                <CardDescription>
                  Recent status changes and outages
                </CardDescription>
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
                          <span
                            className={getStatusColor(event.previousStatus)}
                          >
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
                              Affected regions:{" "}
                              {event.affectedRegions.join(", ")}
                            </p>
                          )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {now > 0
                          ? formatRelativeTime(event.timestamp, now)
                          : "..."}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Get instant alerts in your inbox
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Input
                    id="emails"
                    placeholder="dev@example.com, ops@example.com"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Separate multiple emails with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Slack Integration</CardTitle>
                    <CardDescription>
                      Send status updates to your Slack channels
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack">Incoming Webhook URL</Label>
                  <Input
                    id="slack"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    How to create a{" "}
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Slack Webhook
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <CardTitle className="text-lg">Alert Rules</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-base">Service Goes Down</Label>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnDown}
                    onChange={(e) => setNotifyOnDown(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-base">Performance Degraded</Label>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnDegraded}
                    onChange={(e) => setNotifyOnDegraded(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex-1">
                    <Label className="text-base">Service Recovered</Label>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnRecovered}
                    onChange={(e) => setNotifyOnRecovered(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex-1">
                    <Label className="text-base">Critical Only Mode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert only on Up ↔ Down transitions (ignores Degraded)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnCriticalOnly}
                    onChange={(e) => setNotifyOnCriticalOnly(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleSaveAlerts}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
