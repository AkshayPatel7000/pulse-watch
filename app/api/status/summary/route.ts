import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { getCronJob } from "@/app/lib/cronjob";
import { Service, StatusEvent, ServiceStatus } from "@/app/lib/types";

import { getTenantId } from "@/app/lib/tenant-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const org = searchParams.get("org");
    const tenantId = await getTenantId(org);

    if (!tenantId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const db = await getDb();

    // Get services for this tenant
    const services = await db
      .collection<Service>("services")
      .find({ tenantId })
      .toArray();

    const downCount = services.filter((s) => s.currentStatus === "down").length;
    const degradedCount = services.filter(
      (s) => s.currentStatus === "degraded",
    ).length;

    let systemStatus: ServiceStatus = "up";
    if (downCount > 0) systemStatus = "down";
    else if (degradedCount > 0) systemStatus = "degraded";

    // Get recent events for these services
    const serviceIds = services.map((s) => s.id);
    const recentEvents = await db
      .collection<StatusEvent>("status_events")
      .find({ serviceId: { $in: serviceIds } })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Check if cron is configured for this tenant
    const tenant = await db.collection("tenants").findOne({ slug: tenantId });
    const cronConfigured = !!(tenant?.cronJobId && tenant?.cronApiKey);

    if (cronConfigured) {
      try {
        // Skip retries on 429 to avoid blocking the summary endpoint
        // If rate limited, we'll just assume cron is still configured
        const job = await getCronJob(
          tenant!.cronApiKey!,
          tenant!.cronJobId!,
          0, // No retries for summary endpoint
          true, // Skip retry on 429
        );

        // Only clean up if we got a definitive response that job doesn't exist
        // If we got null due to rate limiting, keep the configuration
        if (job === null && tenant?.cronApiKey && tenant?.cronJobId) {
          // Double-check: try to verify if this was a real deletion or just rate limiting
          // by checking if we can still access the API at all
          // For now, we'll be conservative and not delete on null response
          console.warn(
            "Cron job verification returned null - could be rate limiting or deleted job",
          );
        }
      } catch (e) {
        // Only log as warning since this is non-critical for summary
        console.warn("Failed to verify cron job in summary:", e);
        // Keep cronConfigured as true since we can't verify
      }
    }

    return NextResponse.json({
      status: systemStatus,
      servicesCount: services.length,
      cronConfigured,
      recentEvents,
      updatedAt: Date.now(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
