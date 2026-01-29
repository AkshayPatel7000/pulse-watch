import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { ProbeResult } from "@/app/lib/types";

import { getAuthorizedTenantId } from "@/app/lib/tenant-auth";
import { Service } from "@/app/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const org = searchParams.get("org");
    const tenantId = await getAuthorizedTenantId(org);

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();

    // Verify ownership of the service
    const service = await db
      .collection<Service>("services")
      .findOne({ id, tenantId });
    if (!service) {
      return NextResponse.json(
        { error: "Service not found or unauthorized" },
        { status: 404 },
      );
    }

    const limit = parseInt(searchParams.get("limit") || "100");

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
