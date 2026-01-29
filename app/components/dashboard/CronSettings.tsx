"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Loader2,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function CronSettings() {
  const [apiKey, setApiKey] = useState("");
  const [interval, setIntervalValue] = useState("5");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/cron");
      const data = await response.json();
      if (response.ok && data.hasKey) {
        setHasExistingKey(true);
        setApiKey(data.apiKey);
        setIntervalValue(data.interval.toString());
      } else if (data.wasAutoHealed) {
        toast.warning(
          "The previously configured cron job was not found on cron-job.org and has been disconnected.",
        );
      }
    } catch (error) {
      console.error("Failed to fetch cron settings:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey || apiKey.includes("*")) {
      toast.error("Please enter a valid API Key");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/settings/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, interval }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Cron Job synchronized successfully!");
      setIsSuccess(true);
      setHasExistingKey(true);
      setIsEditing(false);
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Failed to synchronize Cron Job");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect this integration? This will stop background monitoring.",
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/settings/cron", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success("Integration disconnected successfully");
      setHasExistingKey(false);
      setApiKey("");
      setIntervalValue("5");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect integration");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <CardTitle>Scalability Integration</CardTitle>
        </div>
        <CardDescription>
          Offload your service monitoring to cron-job.org for better performance
          and scalability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              <AlertCircle className="w-4 h-4" />
              Why this?
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
              By providing a cron-job.org API Key, our platform will
              automatically create and manage a dedicated background job for
              your organization. This ensures your services are monitored with
              high precision without relying on our shared central runner.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  cron-job.org API Key
                </label>
                {hasExistingKey && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setIsEditing(true);
                      setApiKey("");
                    }}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit Key
                  </Button>
                )}
              </div>
              <Input
                type="password"
                placeholder={
                  hasExistingKey && !isEditing
                    ? apiKey
                    : "Paste your new API key here..."
                }
                value={!hasExistingKey || isEditing ? apiKey : ""}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={hasExistingKey && !isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Check Interval
              </label>
              <select
                className="w-full p-2 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={interval}
                onChange={(e) => setIntervalValue(e.target.value)}
                disabled={hasExistingKey && !isEditing}
              >
                <option value="1">Every 1 minute</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
              </select>
              <p className="text-[10px] text-muted-foreground">
                Higher frequency may be subject to your cron-job.org plan
                limits.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {!hasExistingKey || isEditing ? (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {hasExistingKey ? "Update Integration" : "Connect & Sync"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Disconnect Integration
                </Button>
              )}

              {isEditing && (
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="w-full text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              You can get your free API key from the{" "}
              <a
                href="https://console.cron-job.org/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                cron-job.org Console
              </a>
              .
            </p>
          </div>
        </div>

        {(isSuccess || (hasExistingKey && !isEditing)) && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Your dedicated Cron Job is active (Interval: {interval}m).
          </div>
        )}
      </CardContent>
    </Card>
  );
}
