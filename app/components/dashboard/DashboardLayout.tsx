"use client";
import {
  Activity,
  BarChart3,
  Globe,
  Home,
  LogOut,
  Settings,
  Share2,
  Check,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: "overview" | "services" | "settings" | "external";
}

export function DashboardLayout({
  children,
  currentPage,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orgName = params?.org_name as string;
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/${orgName}/status`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && orgName) {
      const userTenantId = (session?.user as any)?.tenantId;
      if (userTenantId && orgName !== userTenantId) {
        // User is trying to access another tenant's dashboard
        router.push(`/${userTenantId}/dashboard`);
      }
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, orgName, router]);

  if (status === "loading") {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/`} className="flex items-center gap-2 sm:gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold">Pinglyfy</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href={`/${orgName}/dashboard`}>
                <Button
                  variant={currentPage === "overview" ? "default" : "ghost"}
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </Link>
              <Link href={`/${orgName}/services`}>
                <Button
                  variant={currentPage === "services" ? "default" : "ghost"}
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Services
                </Button>
              </Link>
              <Link href={`/${orgName}/dashboard/external-status`}>
                <Button
                  variant={currentPage === "external" ? "default" : "ghost"}
                  size="sm"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  External
                </Button>
              </Link>
              <Link href={`/${orgName}/dashboard/settings`}>
                <Button
                  variant={currentPage === "settings" ? "default" : "ghost"}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href={`/${orgName}/status`} target="_blank">
                <Button variant="ghost" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Public Status
                </Button>
              </Link>
              <Button
                variant={copied ? "default" : "ghost"}
                size="sm"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile/Tablet Navigation */}
            <div className=" lg:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border py-4 space-y-2">
              <Link
                href={`/${orgName}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={currentPage === "overview" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </Link>
              <Link
                href={`/${orgName}/services`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={currentPage === "services" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Services
                </Button>
              </Link>
              <Link
                href={`/${orgName}/dashboard/external-status`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={currentPage === "external" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  External
                </Button>
              </Link>
              <Link
                href={`/${orgName}/dashboard/settings`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={currentPage === "settings" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link
                href={`/${orgName}/status`}
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Public Status
                </Button>
              </Link>
              <Button
                variant={copied ? "default" : "ghost"}
                size="sm"
                onClick={handleShare}
                className="w-full justify-start"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {children}
      </main>
    </div>
  );
}
