import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { getCronJob } from "@/app/lib/cronjob";
import { Service, StatusEvent, ServiceStatus } from "@/app/lib/types";

import { getAuthorizedTenantId } from "@/app/lib/tenant-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const org = searchParams.get("org");
    const tenantId = await getAuthorizedTenantId(org);

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    let cronConfigured = !!(tenant?.cronJobId && tenant?.cronApiKey);

    if (cronConfigured) {
      try {
        const job = await getCronJob(tenant!.cronApiKey!, tenant!.cronJobId!);
        if (!job) {
          // Job was deleted externally, clean up DB
          await db.collection("tenants").updateOne(
            { slug: tenantId },
            {
              $unset: {
                cronApiKey: "",
                cronJobId: "",
                cronInterval: "",
              },
            },
          );
          cronConfigured = false;
        }
      } catch (e) {
        console.error("Failed to verify cron job in summary:", e);
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
