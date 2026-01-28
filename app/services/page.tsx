"use client";
import { useState, useEffect } from "react";
import { Service } from "../lib/types";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { ServicesManagement } from "../components/dashboard/ServicesManagement";
import { Loader2 } from "lucide-react";

export default function ServicesPage() {
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

  const handleAddService = async (
    newService: Omit<Service, "id" | "currentStatus" | "lastCheckedAt">,
  ) => {
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
      fetchServices();
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
      <ServicesManagement
        services={services}
        onAddService={handleAddService}
        onDeleteService={handleDeleteService}
      />
    </DashboardLayout>
  );
}
