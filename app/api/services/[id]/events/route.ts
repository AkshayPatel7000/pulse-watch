import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { StatusEvent } from "@/app/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const events = await db
      .collection<StatusEvent>("status_events")
      .find({ serviceId: id })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(events);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
