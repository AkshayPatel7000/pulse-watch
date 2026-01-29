import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { User } from "@/app/lib/types";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const existingUser = await db.collection<User>("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser: User = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      role: "admin",
      orgName: "",
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      { message: "User created successfully", userId },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
