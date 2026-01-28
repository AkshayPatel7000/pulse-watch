import { Activity, BarChart3, Globe, Home, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: "overview" | "services" | "settings" | "alerts";
}

export function DashboardLayout({
  children,
  currentPage,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold">Pulse Watch</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button
                  variant={currentPage === "overview" ? "default" : "ghost"}
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  variant={currentPage === "services" ? "default" : "ghost"}
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Services
                </Button>
              </Link>
              <Link href="/dashboard/alerts">
                <Button
                  variant={currentPage === "alerts" ? "default" : "ghost"}
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                </Button>
              </Link>
              <Link href="/status" target="_blank">
                <Button variant="ghost" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Public Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {children}
      </main>
    </div>
  );
}
