import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { Service } from "@/app/lib/types";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

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
    const services = await db
      .collection<Service>("services")
      .find({ tenantId })
      .toArray();
    return NextResponse.json(services);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, type, description } = body;

    if (!name || !url || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const newService: Service = {
      id: uuidv4(),
      name,
      url,
      type,
      description,
      currentStatus: "up",
      lastCheckedAt: Date.now(),
      tenantId: (session.user as any).tenantId,
    };

    await db.collection("services").insertOne(newService);
    return NextResponse.json(newService, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Check Run Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
