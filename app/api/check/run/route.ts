import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { performMultiRegionCheck, evaluateStatus } from "@/app/lib/checker";
import { Service } from "@/app/lib/types";
import { sendStatusAlert } from "@/app/lib/notifications";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const org = searchParams.get("org");

    const db = await getDb();
    const query = org
      ? { tenantId: org, isActive: { $ne: false } }
      : { isActive: { $ne: false } };

    const services = await db
      .collection<Service>("services")
      .find(query)
      .toArray();

    const checkPromises = services.map(async (service: Service) => {
      // Get all region results at once using the external API logic
      const regionResults = await performMultiRegionCheck(service);

      const newStatus = evaluateStatus(regionResults);
      const timestamp = Date.now();

      // Store probe results
      if (regionResults.length > 0) {
        await db
          .collection("probe_results")
          .insertMany(
            regionResults.map((r) => ({ ...r, serviceId: service.id })),
          );
      }

      // Check if status changed
      if (newStatus !== service.currentStatus) {
        // Send alert
        await sendStatusAlert(service, service.currentStatus, newStatus);

        // Log status event
        await db.collection("status_events").insertOne({
          serviceId: service.id,
          tenantId: service.tenantId,
          previousStatus: service.currentStatus,
          newStatus: newStatus,
          timestamp,
        });

        // Update service
        await db.collection("services").updateOne(
          { id: service.id, tenantId: service.tenantId },
          {
            $set: {
              currentStatus: newStatus,
              lastCheckedAt: timestamp,
            },
          },
        );
      } else {
        // Just update lastCheckedAt
        await db.collection("services").updateOne(
          { id: service.id },
          {
            $set: {
              lastCheckedAt: timestamp,
            },
          },
        );
      }

      return { serviceId: service.id, status: newStatus };
    });

    const summary = await Promise.all(checkPromises);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Check Run Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
