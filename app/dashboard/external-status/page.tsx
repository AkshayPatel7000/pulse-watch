"use client";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { ExternalStatusGrid } from "../../components/dashboard/ExternalStatusGrid";

export default function ExternalStatusPage() {
  return (
    <DashboardLayout currentPage="external">
      <ExternalStatusGrid />
    </DashboardLayout>
  );
}
