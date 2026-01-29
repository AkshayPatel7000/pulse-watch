"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CronAlertProps {
  servicesCount: number;
  cronConfigured: boolean;
}

export function CronAlert({ servicesCount, cronConfigured }: CronAlertProps) {
  const params = useParams();
  const orgName = params?.org_name as string;

  if (servicesCount === 0 || cronConfigured) {
    return null;
  }

  return (
    <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 flex flex-col md:flex-row justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">
            Monitoring is not active
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
            You have {servicesCount} services added, but background monitoring
            is disabled. Set up your dedicated cron job to start receiving
            health updates.
          </p>
        </div>
      </div>
      <Link href={`/${orgName}/dashboard/settings`} className="shrink-0">
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white border-none ml-12"
        >
          Configure Now
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
