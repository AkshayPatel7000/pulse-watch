"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Service, StatusEvent } from "@/app/lib/types";
import { PublicStatusPage } from "@/app/components/status/PublicStatusPage";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
  const params = useParams();
  const { data: session } = useSession();
  const orgName = params?.org_name as string;
  const [services, setServices] = useState<Service[]>([]);
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!orgName) return;
    try {
      const [servicesRes, summaryRes] = await Promise.all([
        fetch(`/api/services?org=${orgName}`),
        fetch(`/api/status/summary?org=${orgName}`),
      ]);

      const servicesData = await servicesRes.json();
      const summaryData = await summaryRes.json();

      setServices(Array.isArray(servicesData) ? servicesData : []);
      setStatusEvents(summaryData.recentEvents || []);
    } catch (error) {
      console.error("Error fetching status data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgName]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading Status Page...</p>
      </div>
    );
  }

  return (
    <div>
      <PublicStatusPage services={services} recentEvents={statusEvents} />
      {session && (
        <div className="fixed bottom-4 right-4">
          <Link
            href={`/${orgName}/dashboard`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
