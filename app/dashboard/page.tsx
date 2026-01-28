"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Service, StatusEvent } from "../lib/types";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { DashboardOverview } from "../components/dashboard/DashboardOverview";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [recentEvents, setRecentEvents] = useState<StatusEvent[]>([]);
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

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/status/summary");
      const data = await response.json();
      setRecentEvents(data.recentEvents || []);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchSummary()]);
      setLoading(false);
    };
    init();
  }, []);

  // Refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServices();
      fetchSummary();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
      <DashboardOverview services={services} recentEvents={recentEvents} />

      <div className="fixed bottom-4 right-4">
        <Link
          href="/status"
          target="_blank"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Public Status
        </Link>
      </div>
    </DashboardLayout>
  );
}
