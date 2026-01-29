"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Service } from "@/app/lib/types";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { ServiceDetail } from "@/app/components/dashboard/ServiceDetail";
import { Loader2 } from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const orgName = params?.org_name as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${id}?org=${orgName}`);
        const data = await response.json();
        setService(data);
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && orgName) {
      fetchService();
    }
  }, [id, orgName]);

  if (loading) {
    return (
      <DashboardLayout currentPage="services">
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">
            Loading Service Details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout currentPage="services">
        <div className="text-center py-20">
          <p className="text-gray-500">Service not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="services">
      <ServiceDetail service={service} />
    </DashboardLayout>
  );
}
