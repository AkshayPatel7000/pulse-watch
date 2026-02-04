const CRON_JOB_API_URL = "https://api.cron-job.org";

// Helper function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateMinutesArray(interval: number): number[] {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i += interval) {
    minutes.push(i);
  }
  return minutes;
}

export async function getCronJob(
  apiKey: string,
  jobId: number,
  retries: number = 3,
  skipRetryOn429: boolean = false,
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${CRON_JOB_API_URL}/jobs/${jobId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const text = await response.text();

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (skipRetryOn429 || attempt === retries) {
          // If we're skipping retries or on last attempt, return null instead of throwing
          console.warn(
            `Rate limited by cron-job.org API (429). ${skipRetryOn429 ? "Skipping retry." : "Max retries reached."}`,
          );
          return null;
        }

        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.warn(
          `Rate limited (429). Retrying in ${backoffDelay}ms... (Attempt ${attempt + 1}/${retries})`,
        );
        await delay(backoffDelay);
        continue;
      }

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          if (text) {
            const data = JSON.parse(text);
            errorMessage = data.error || errorMessage;
          }
        } catch {
          // Keep status text error
        }
        throw new Error(errorMessage);
      }

      if (!text) return null;

      try {
        const data = JSON.parse(text);
        return data.jobDetails;
      } catch {
        throw new Error("Invalid JSON response from cron-job.org");
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's not a network error and we're not retrying, throw immediately
      if (attempt === retries) {
        throw lastError;
      }

      // For other errors, wait before retrying
      const backoffDelay = Math.pow(2, attempt) * 1000;
      console.warn(
        `Error fetching cron job: ${lastError.message}. Retrying in ${backoffDelay}ms...`,
      );
      await delay(backoffDelay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error("Failed to fetch cron job after retries");
}

export async function createCronJob(
  apiKey: string,
  title: string,
  url: string,
  interval: number = 5,
) {
  const response = await fetch(`${CRON_JOB_API_URL}/jobs`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      job: {
        title,
        url,
        enabled: true,
        saveResponses: true,
        requestMethod: 1,
        extendedData: {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        },
        schedule: {
          timezone: "UTC",
          hours: [-1],
          mdays: [-1],
          minutes: generateMinutesArray(interval),
          months: [-1],
          wdays: [-1],
        },
      },
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Failed to create cron job: ${response.status} ${response.statusText}`;
    try {
      if (text) {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      }
    } catch {
      // Keep status text error
    }
    throw new Error(errorMessage);
  }

  if (!text) {
    throw new Error(
      "Cron job created but received no confirmation ID from server.",
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response when creating cron job");
  }
}

export async function deleteCronJob(apiKey: string, jobId: number) {
  const response = await fetch(`${CRON_JOB_API_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Failed to delete cron job: ${response.status} ${response.statusText}`;
    try {
      if (text) {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      }
    } catch {
      // Keep status text error
    }
    throw new Error(errorMessage);
  }

  return true;
}

export async function listCronJobs(apiKey: string) {
  const response = await fetch(`${CRON_JOB_API_URL}/jobs`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Failed to list cron jobs: ${response.status} ${response.statusText}`;
    try {
      if (text) {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      }
    } catch {
      // Keep status text error
    }
    throw new Error(errorMessage);
  }

  if (!text) return [];

  try {
    const data = JSON.parse(text);
    return data.jobs || [];
  } catch {
    throw new Error("Invalid JSON response when listing cron jobs");
  }
}
