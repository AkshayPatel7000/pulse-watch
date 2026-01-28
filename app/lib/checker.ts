import { Region, Service, ProbeResult, ServiceStatus } from "./types";

// Helper to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function performMultiRegionCheck(
  service: Service,
): Promise<Omit<ProbeResult, "id">[]> {
  try {
    // 1. Trigger the check via OnlineOrNot (as suggested by the user)
    const triggerRes = await fetch("https://uptime.onlineornot.com/check-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: service.url }),
    });

    if (!triggerRes.ok) throw new Error("Failed to trigger external check");
    const { requestId } = await triggerRes.json();
    console.log(
      `[Checker] Triggered check for ${service.name}. Request ID: ${requestId}`,
    );

    // 2. Poll for results (up to 10 times with 3s delay = 30s max)
    let resultsData = null;
    for (let i = 0; i < 10; i++) {
      console.log(
        `[Checker] Polling results for ${service.name} (Attempt ${i + 1}/10)...`,
      );
      await sleep(3000);
      const resultRes = await fetch(
        `https://uptime.onlineornot.com/results/${requestId}`,
      );
      if (resultRes.ok) {
        const data = await resultRes.json();
        if (data.result && data.result.length > 0) {
          resultsData = data;
          console.log(
            `[Checker] Successfully received ${data.result.length} regional results.`,
          );
          break;
        }
      }
    }

    if (!resultsData || !resultsData.result) {
      console.warn(
        `[Checker] External check timed out for ${service.name}. Falling back.`,
      );
      throw new Error("Timeout waiting for external results");
    }

    // 3. Map to our format
    return resultsData.result.map(
      (r: {
        region: string;
        statusCode: number;
        responseTime: number;
        startedAt?: number;
      }) => ({
        serviceId: service.id,
        region: r.region as Region,
        statusCode: r.statusCode,
        responseTime: r.responseTime,
        startedAt: r.startedAt || Date.now(),
        success: r.statusCode >= 200 && r.statusCode < 400,
      }),
    );
  } catch (error) {
    console.error(`External check failed for ${service.name}:`, error);
    // Fallback to a single local check
    const localResult = await performLocalCheck(service, "us-east-1");
    return [localResult];
  }
}

async function performLocalCheck(
  service: Service,
  region: Region,
): Promise<Omit<ProbeResult, "id">> {
  const startedAt = Date.now();
  try {
    const response = await fetch(service.url, {
      method: "GET",
      cache: "no-store",
    });
    const responseTime = Date.now() - startedAt;
    return {
      serviceId: service.id,
      region,
      statusCode: response.status,
      responseTime,
      startedAt,
      success: response.status >= 200 && response.status < 400,
    };
  } catch (error) {
    return {
      serviceId: service.id,
      region,
      statusCode: 0,
      responseTime: Date.now() - startedAt,
      startedAt,
      success: false,
    };
  }
}

export function evaluateStatus(
  results: Omit<ProbeResult, "id">[],
): ServiceStatus {
  const total = results.length;
  if (total === 0) return "up";

  const failures = results.filter((r) => !r.success).length;
  const failureRate = failures / total;

  if (failureRate >= 0.5) return "down";
  if (failureRate > 0) return "degraded";
  return "up";
}
