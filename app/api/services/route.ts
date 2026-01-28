import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { Service } from "@/app/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const db = await getDb();
    const services = await db
      .collection<Service>("services")
      .find({})
      .toArray();
    return NextResponse.json(services);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
