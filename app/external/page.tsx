"use client";

import { ExternalStatusGrid } from "@/app/components/dashboard/ExternalStatusGrid";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function ExternalPlatformsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">Pinglyfy</span>
        </Link>
        <Link href="/" className="ml-auto">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            External Status Pages
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitoring the services you depend on. Quick access to status pages
            of popular platforms.
          </p>
        </div>

        <ExternalStatusGrid />
      </main>

      <footer className="w-full py-6 px-4 border-t border-border mt-20">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Pinglyfy Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
