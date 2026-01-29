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

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch cron job");
  }

  return data.job;
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create cron job");
  }

  return data;
}

export async function deleteCronJob(apiKey: string, jobId: number) {
  const response = await fetch(`${CRON_JOB_API_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete cron job");
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to list cron jobs");
  }

  return data.jobs || [];
}
