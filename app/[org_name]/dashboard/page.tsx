"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Service, StatusEvent } from "@/app/lib/types";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/app/components/dashboard/DashboardOverview";
import { CronAlert } from "@/app/components/dashboard/CronAlert";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const orgName = params?.org_name as string;
  const [services, setServices] = useState<Service[]>([]);
  const [recentEvents, setRecentEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cronConfigured, setCronConfigured] = useState(true);
  const [servicesCount, setServicesCount] = useState(0);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?org=${orgName}`);
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/status/summary?org=${orgName}`);
      const data = await response.json();
      setRecentEvents(data.recentEvents || []);
      setCronConfigured(data.cronConfigured);
      setServicesCount(data.servicesCount || 0);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    if (!orgName) return;
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchSummary()]);
      setLoading(false);
    };
    init();
  }, [orgName]);

  // Refresh every 60 seconds
  useEffect(() => {
    if (!orgName) return;
    const interval = setInterval(() => {
      fetchServices();
      fetchSummary();
    }, 60000);
    return () => clearInterval(interval);
  }, [orgName]);

  if (loading) {
    return (
      <DashboardLayout currentPage="overview">
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="overview">
      <CronAlert
        servicesCount={servicesCount}
        cronConfigured={cronConfigured}
      />
      <DashboardOverview services={services} recentEvents={recentEvents} />
    </DashboardLayout>
  );
}
