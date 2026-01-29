"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { CronSettings } from "@/app/components/dashboard/CronSettings";
import { AlertsManagement } from "@/app/components/dashboard/AlertsManagement";
import { Service } from "@/app/lib/types";
import { Loader2, Bell, RefreshCw } from "lucide-react";

type SettingsTab = "scalability" | "alerts";

export default function SettingsPage() {
  const params = useParams();
  const orgName = params?.org_name as string;

  const [activeTab, setActiveTab] = useState<SettingsTab>("scalability");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`/api/services?org=${orgName}`);
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, [orgName]);

  useEffect(() => {
    if (!orgName) return;
    const init = async () => {
      setLoading(true);
      await fetchServices();
      setLoading(false);
    };
    init();
  }, [orgName, fetchServices]);

  const handleUpdateService = async (
    serviceId: string,
    updates: Partial<Service>,
  ) => {
    try {
      await fetch(`/api/services/${serviceId}?org=${orgName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      // Refresh local state
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, ...updates } : s)),
      );
    } catch (error) {
      console.error("Error updating service alerts:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="settings">
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading Settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your organization configurations and integrations.
          </p>
        </div>

        <div className="flex flex-row md:flex-row gap-8 items-start">
          {/* Sidebar Tabs - Sticky */}
          <div className="sticky top-24 md:w-64 shrink-0 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("scalability")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "scalability"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Scalability & Cron
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "alerts"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Bell className="w-4 h-4" />
              Alert Notifications
            </button>
          </div>

          {/* Tab Content - Scrollable if needed */}
          <div className="flex-1 min-w-0 pb-10">
            {activeTab === "scalability" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <CronSettings />
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <AlertsManagement
                  services={services}
                  onUpdateService={handleUpdateService}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
