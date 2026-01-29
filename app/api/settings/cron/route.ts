import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { getDb } from "@/app/lib/mongodb";
import {
  createCronJob,
  deleteCronJob,
  listCronJobs,
  getCronJob,
} from "@/app/lib/cronjob";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantSlug = (session.user as any).tenantId;
    const db = await getDb();
    const tenant = await db.collection("tenants").findOne({ slug: tenantSlug });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    let isConfigured = !!(tenant.cronApiKey && tenant.cronJobId);
    let wasAutoHealed = false;

    // Verify job existence if configured
    if (isConfigured) {
      try {
        const job = await getCronJob(tenant.cronApiKey!, tenant.cronJobId!);
        if (!job) {
          // Job was deleted externally, clean up DB
          await db.collection("tenants").updateOne(
            { slug: tenantSlug },
            {
              $unset: {
                cronApiKey: "",
                cronJobId: "",
                cronInterval: "",
              },
            },
          );
          isConfigured = false;
          wasAutoHealed = true;
        }
      } catch (e) {
        console.error("Failed to verify cron job existence:", e);
      }
    }

    return NextResponse.json({
      apiKey:
        isConfigured && tenant.cronApiKey
          ? "****" + tenant.cronApiKey.slice(-4)
          : null,
      interval: tenant.cronInterval || 5,
      hasKey: isConfigured,
      wasAutoHealed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantSlug = (session.user as any).tenantId;
    const { apiKey, interval } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 400 },
      );
    }

    const cronInterval = parseInt(interval) || 5;

    const db = await getDb();
    const tenant = await db.collection("tenants").findOne({ slug: tenantSlug });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // 1. If there's an existing job, delete it (or we could update it)
    if (tenant.cronJobId && tenant.cronApiKey) {
      try {
        await deleteCronJob(tenant.cronApiKey, tenant.cronJobId);
      } catch (e) {
        console.error("Failed to delete old cron job:", e);
      }
    }

    // 2. Create new cron job
    // The callback URL points back to our check run API with the org slug
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/check/run?org=${tenantSlug}`;
    const jobTitle = `Pulse Watch - ${tenant.name}`;

    const jobResult = await createCronJob(
      apiKey,
      jobTitle,
      callbackUrl,
      cronInterval,
    );

    // 3. Update tenant with API key and Job ID
    await db.collection("tenants").updateOne(
      { slug: tenantSlug },
      {
        $set: {
          cronApiKey: apiKey,
          cronJobId: jobResult.jobId,
          cronInterval: cronInterval,
        },
      },
    );

    return NextResponse.json({ success: true, jobId: jobResult.jobId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantSlug = (session.user as any).tenantId;
    const db = await getDb();
    const tenant = await db.collection("tenants").findOne({ slug: tenantSlug });

    if (!tenant || !tenant.cronJobId || !tenant.cronApiKey) {
      return NextResponse.json(
        { error: "No active cron job found" },
        { status: 400 },
      );
    }

    await deleteCronJob(tenant.cronApiKey, tenant.cronJobId);

    await db.collection("tenants").updateOne(
      { slug: tenantSlug },
      {
        $unset: {
          cronApiKey: "",
          cronJobId: "",
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
