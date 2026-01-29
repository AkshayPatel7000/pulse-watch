import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { getDb } from "@/app/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, orgName } = await request.json();

    if (!role || !orgName) {
      return NextResponse.json(
        { error: "Role and Organization Name are required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Create tenant slug
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug is already taken (very basic check)
    const existingTenant = await db.collection("tenants").findOne({ slug });
    if (existingTenant) {
      // If it exists, we might want to append something or fail
      // For now, let's just use it or fail
    }

    const tenantId = uuidv4();
    const tenant = {
      id: tenantId,
      name: orgName,
      slug,
      createdAt: Date.now(),
    };

    await db.collection("tenants").insertOne(tenant);

    const updatedUser = {
      id: (session.user as any).id || uuidv4(),
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role,
      orgName,
      tenantId: slug, // Using slug as tenantId for routing convenience as requested http:/localhost/{{org_name}}/status
    };

    await db
      .collection("users")
      .updateOne(
        { email: session.user.email },
        { $set: updatedUser },
        { upsert: true },
      );

    return NextResponse.json({ success: true, orgName: slug });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
