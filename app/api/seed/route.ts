import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import {
  mockServices,
  generateProbeResults,
  generateStatusEvents,
} from "@/app/lib/mockData";

export async function POST() {
  try {
    const db = await getDb();

    // Clear existing data
    await db.collection("services").deleteMany({});
    await db.collection("probe_results").deleteMany({});
    await db.collection("status_events").deleteMany({});

    // Seed services
    await db.collection("services").insertMany(mockServices);

    // Seed results and events for each service
    for (const service of mockServices) {
      const results = generateProbeResults(service.id, 20);
      const events = generateStatusEvents(service.id);

      if (results.length > 0) {
        await db.collection("probe_results").insertMany(results);
      }
      if (events.length > 0) {
        await db.collection("status_events").insertMany(events);
      }
    }

    // Create Indexes for efficient retrieval and cleanup
    await db
      .collection("probe_results")
      .createIndex({ serviceId: 1, startedAt: -1 });

    // Index for cleanup queries (startedAt < fiveDaysAgo)
    await db.collection("probe_results").createIndex({ startedAt: 1 });

    await db
      .collection("status_events")
      .createIndex({ serviceId: 1, timestamp: -1 });

    // Index for cleanup queries (timestamp < fiveDaysAgo)
    await db.collection("status_events").createIndex({ timestamp: 1 });

    return NextResponse.json({
      success: true,
      message: "Database seeded with mock data and indexes created",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
