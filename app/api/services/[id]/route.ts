import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { Service } from "@/app/lib/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

import { getAuthorizedTenantId } from "@/app/lib/tenant-auth";

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

    const service = await db
      .collection<Service>("services")
      .findOne({ id, tenantId });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await request.json();
    const db = await getDb();

    const result = await db
      .collection("services")
      .findOneAndUpdate(
        { id, tenantId },
        { $set: body },
        { returnDocument: "after" },
      );

    if (!result) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const db = await getDb();

    const service = await db.collection("services").findOne({ id, tenantId });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.collection("services").deleteOne({ id, tenantId });
    await db.collection("probe_results").deleteMany({ serviceId: id });
    await db.collection("status_events").deleteMany({ serviceId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
