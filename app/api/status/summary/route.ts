import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { Service, StatusEvent, ServiceStatus } from "@/app/lib/types";

export async function GET() {
  try {
    const db = await getDb();

    // Get all services to determine overall status
    const services = await db
      .collection<Service>("services")
      .find({})
      .toArray();

    const downCount = services.filter((s) => s.currentStatus === "down").length;
    const degradedCount = services.filter(
      (s) => s.currentStatus === "degraded",
    ).length;

    let systemStatus: ServiceStatus = "up";
    if (downCount > 0) systemStatus = "down";
    else if (degradedCount > 0) systemStatus = "degraded";

    // Get recent events (last 10)
    const recentEvents = await db
      .collection<StatusEvent>("status_events")
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      status: systemStatus,
      servicesCount: services.length,
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
