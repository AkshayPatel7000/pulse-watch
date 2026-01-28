"use client";
import { useState, useEffect } from "react";
import { Service } from "../../lib/types";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { AlertsManagement } from "../../components/dashboard/AlertsManagement";
import { Loader2 } from "lucide-react";

export default function AlertsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchServices();
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateService = async (
    serviceId: string,
    updates: Partial<Service>,
  ) => {
    try {
      await fetch(`/api/services/${serviceId}`, {
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
      <DashboardLayout currentPage="alerts">
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">
            Loading Alerts Configuration...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="alerts">
      <AlertsManagement
        services={services}
        onUpdateService={handleUpdateService}
      />
    </DashboardLayout>
  );
}
