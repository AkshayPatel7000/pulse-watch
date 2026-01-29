"use client";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { ExternalStatusGrid } from "@/app/components/dashboard/ExternalStatusGrid";

export default function ExternalStatusPage() {
  return (
    <DashboardLayout currentPage="external">
      <ExternalStatusGrid />
    </DashboardLayout>
  );
}
