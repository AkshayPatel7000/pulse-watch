import { Service, ServiceStatus } from "./types";
import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendStatusAlert(
  service: Service,
  previousStatus: ServiceStatus,
  newStatus: ServiceStatus,
) {
  const settings = service.notificationSettings;
  if (!settings) return;

  // Determine if we should notify
  let shouldNotify = false;
  if (newStatus === "down" && settings.notifyOnDown) shouldNotify = true;
  if (newStatus === "degraded" && settings.notifyOnDegraded)
    shouldNotify = true;
  if (
    newStatus === "up" &&
    (previousStatus === "down" || previousStatus === "degraded") &&
    settings.notifyOnRecovered
  ) {
    shouldNotify = true;
  }

  if (!shouldNotify) return;

  const timestamp = new Date().toLocaleString();
  const title = `[PulseWatch] status changed for ${service.name}`;
  const message = `Service ${service.name} (${service.url}) status changed from ${previousStatus} to ${newStatus} at ${timestamp}.`;

  // 1. Send Slack Alert
  if (settings.slackWebhook) {
    try {
      await sendSlackNotification(settings.slackWebhook, {
        title,
        message,
        service,
        previousStatus,
        newStatus,
      });
    } catch (error) {
      console.error("Slack notification failed:", error);
    }
  }

  // 2. Send Email Alert
  if (settings.emails && settings.emails.length > 0) {
    try {
      await sendEmailNotification(settings.emails, {
        title,
        message,
        service,
        previousStatus,
        newStatus,
      });
    } catch (error) {
      console.error("Email notification failed:", error);
    }
  }
}

async function sendSlackNotification(
  webhookUrl: string,
  data: {
    title: string;
    message: string;
    service: Service;
    previousStatus: ServiceStatus;
    newStatus: ServiceStatus;
  },
) {
  const color =
    data.newStatus === "up"
      ? "#22c55e"
      : data.newStatus === "degraded"
        ? "#eab308"
        : "#ef4444";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          fallback: data.title,
          color: color,
          title: data.title,
          text: data.message,
          fields: [
            { title: "Service", value: data.service.name, short: true },
            { title: "URL", value: data.service.url, short: true },
            {
              title: "New Status",
              value: data.newStatus.toUpperCase(),
              short: true,
            },
            {
              title: "Previous Status",
              value: data.previousStatus.toUpperCase(),
              short: true,
            },
          ],
          footer: "PulseWatch Monitoring",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  });
}

async function sendEmailNotification(
  emails: string[],
  data: {
    title: string;
    message: string;
    service: Service;
    previousStatus: ServiceStatus;
    newStatus: ServiceStatus;
  },
) {
  const statusColor =
    data.newStatus === "up"
      ? "#22c55e"
      : data.newStatus === "degraded"
        ? "#eab308"
        : "#ef4444";
  const textColor =
    data.newStatus === "up"
      ? "#166534"
      : data.newStatus === "degraded"
        ? "#854d0e"
        : "#991b1b";

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">Status Alert: ${data.service.name}</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello,</p>
        <p>A monitored service has changed status.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 40%;">Service</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${data.service.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">URL</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><a href="${data.service.url}">${data.service.url}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Status Change</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
              <span style="color: ${textColor}; font-weight: bold;">
                ${data.previousStatus.toUpperCase()} &rarr; ${data.newStatus.toUpperCase()}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Timestamp</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This is an automated message from PulseWatch.
        </p>
      </div>
    </div>
  `;

  // Only attempt to send if SMTP configuration exists
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"PulseWatch Alerts" <alerts@pulsewatch.app>',
        to: emails.join(", "),
        subject: data.title,
        text: data.message,
        html: htmlContent,
      });
      console.log(`[SMTP] Email alert sent to: ${emails.join(", ")}`);
    } catch (error) {
      console.error("[SMTP] Error sending email:", error);
      throw error;
    }
  } else {
    console.warn("[SMTP] Configuration missing. Logging alert instead:");
    console.log(`[Email Alert Simulation] To: ${emails.join(", ")}`);
    console.log(`[Email Alert Simulation] Subject: ${data.title}`);
    console.log(`[Email Alert Simulation] Body: ${data.message}`);
  }
}
