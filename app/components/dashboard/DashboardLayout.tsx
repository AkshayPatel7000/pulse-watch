import {
  Activity,
  BarChart3,
  Globe,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
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
            <Link
              href={`/${orgName}/dashboard`}
              className="flex items-center gap-3"
            >
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold">Pinglyfy</h1>
            </Link>
            <div className="flex items-center gap-2">
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
