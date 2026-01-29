"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Service } from "@/app/lib/types";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { ServicesManagement } from "@/app/components/dashboard/ServicesManagement";
import { CronAlert } from "@/app/components/dashboard/CronAlert";
import { Loader2 } from "lucide-react";

export default function ServicesPage() {
  const params = useParams();
  const orgName = params?.org_name as string;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cronConfigured, setCronConfigured] = useState(true);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?org=${orgName}`);
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchCronStatus = async () => {
    try {
      const response = await fetch(`/api/status/summary?org=${orgName}`);
      const data = await response.json();
      setCronConfigured(data.cronConfigured);
    } catch (error) {
      console.error("Error fetching cron status:", error);
    }
  };

  useEffect(() => {
    if (!orgName) return;
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchCronStatus()]);
      setLoading(false);
    };
    init();
  }, [orgName]);

  const handleAddService = async (
    newService: Omit<
      Service,
      "id" | "currentStatus" | "lastCheckedAt" | "tenantId"
    >,
  ) => {
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      fetchServices();
      fetchCronStatus(); // Re-check if alert should show
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
      fetchServices();
      fetchCronStatus(); // Re-check if alert should show
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="services">
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading Services...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="services">
      <CronAlert
        servicesCount={services.length}
        cronConfigured={cronConfigured}
      />
      <ServicesManagement
        services={services}
        onAddService={handleAddService}
        onDeleteService={handleDeleteService}
      />
    </DashboardLayout>
  );
}
