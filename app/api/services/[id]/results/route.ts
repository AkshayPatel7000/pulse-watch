import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { ProbeResult } from "@/app/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const db = await getDb();
    const results = await db
      .collection<ProbeResult>("probe_results")
      .find({ serviceId: id })
      .sort({ startedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(results);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
