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
    let slug = orgName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = "org-" + uuidv4().slice(0, 8);

    // Check if slug is already taken
    const existingTenant = await db.collection("tenants").findOne({ slug });
    if (existingTenant) {
      // Append a short random string to make it unique
      slug = `${slug}-${uuidv4().slice(0, 4)}`;
    }

    const tenantId = uuidv4();
    const tenant = {
      id: tenantId,
      name: orgName,
      slug,
      createdAt: Date.now(),
    };

    await db.collection("tenants").insertOne(tenant);

    const user = session.user as {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
    };
    const updatedUser = {
      id: user.id || uuidv4(),
      email: user.email,
      name: user.name,
      image: user.image,
      role,
      orgName,
      tenantId: slug,
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
