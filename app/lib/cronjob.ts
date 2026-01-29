const CRON_JOB_API_URL = "https://api.cron-job.org";

export function generateMinutesArray(interval: number): number[] {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i += interval) {
    minutes.push(i);
  }
  return minutes;
}

export async function getCronJob(apiKey: string, jobId: number) {
  const response = await fetch(`${CRON_JOB_API_URL}/jobs/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();

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
