"use client";
import { useState, useEffect } from "react";
import { Service } from "./lib/types";
import { mockDB } from "./lib/mockData";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { ServicesManagement } from "./components/dashboard/ServicesManagement";
import { ServiceDetail } from "./components/dashboard/ServiceDetail";
import { PublicStatusPage } from "./components/status/PublicStatusPage";

type View = "overview" | "services" | "service-detail" | "public-status";
type DashboardPage = "overview" | "services" | "settings";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("overview");
  const [currentPage, setCurrentPage] = useState<DashboardPage>("overview");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [services, setServices] = useState<Service[]>([]);

  // Load initial services
  useEffect(() => {
    setServices(mockDB.getServices());
  }, []);

  // Auto-refresh services every 30 seconds to simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(mockDB.getServices());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAddService = (
    newService: Omit<Service, "id" | "currentStatus" | "lastCheckedAt">,
  ) => {
    const added = mockDB.addService(newService);
    setServices(mockDB.getServices());
  };

  const handleDeleteService = (serviceId: string) => {
    mockDB.deleteService(serviceId);
    setServices(mockDB.getServices());
  };

  const handleViewService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentView("service-detail");
  };

  const handleNavigate = (page: DashboardPage) => {
    setCurrentPage(page);
    if (page === "overview") {
      setCurrentView("overview");
    } else if (page === "services") {
      setCurrentView("services");
    }
  };

  const handleBackFromDetail = () => {
    setCurrentView(currentPage === "services" ? "services" : "overview");
    setSelectedServiceId(null);
  };

  // Check if we're viewing the public status page
  if (currentView === "public-status") {
    return (
      <div>
        <PublicStatusPage services={services} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setCurrentView("overview")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render dashboard views
  return (
    <DashboardLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentView === "overview" && (
        <DashboardOverview
          services={services}
          onServiceClick={handleViewService}
        />
      )}

      {currentView === "services" && (
        <ServicesManagement
          services={services}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          onViewService={handleViewService}
        />
      )}

      {currentView === "service-detail" && selectedServiceId && (
        <ServiceDetail
          service={services.find((s) => s.id === selectedServiceId)!}
          onBack={handleBackFromDetail}
        />
      )}

      {/* Floating action button to view public status page */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setCurrentView("public-status")}
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
        </button>
      </div>
    </DashboardLayout>
  );
}
