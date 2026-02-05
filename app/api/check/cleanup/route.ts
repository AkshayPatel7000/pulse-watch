import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

/**
 * Service to clean up old data.
 * Deletes records older than 5 days for both probe_results and status_events.
 * This can be triggered by a scheduled cron job (once a day is recommended).
 */
export async function POST(request: Request) {
  // Use CRON_SECRET for authentication (same as check runner)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();

    // Calculate the cutoff timestamp (5 days ago)
    const FIVE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1000;
    const cutoffTimestamp = Date.now() - FIVE_DAYS_IN_MS;
    console.log("🚀 ~ POST ~ cutoffTimestamp:", cutoffTimestamp);

    console.log(
      `[Cleanup Service] Started. Removing records older than: ${new Date(cutoffTimestamp).toUTCString()}`,
    );

    // 1. Delete old probe results
    const resultsResponse = await db.collection("probe_results").deleteMany({
      startedAt: { $lt: cutoffTimestamp },
    });

    // 2. Delete old status events
    const eventsResponse = await db.collection("status_events").deleteMany({
      timestamp: { $lt: cutoffTimestamp },
    });

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      summary: {
        probeResultsDeleted: resultsResponse.deletedCount,
        statusEventsDeleted: eventsResponse.deletedCount,
        cutoffDate: new Date(cutoffTimestamp).toISOString(),
      },
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[Cleanup Service] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

// Fallback GET handler for easier manual triggering if needed
export async function GET(request: Request) {
  return POST(request);
}
