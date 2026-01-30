/**
 * Google Analytics utility functions for tracking custom events
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a custom event in Google Analytics
 * @param params - Event parameters
 */
export const trackEvent = ({
  action,
  category,
  label,
  value,
  ...rest
}: EventParams) => {
  if (typeof window !== "undefined" && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });
  }
};

/**
 * Track service status changes
 */
export const trackServiceStatusChange = (
  serviceName: string,
  newStatus: string,
) => {
  trackEvent({
    action: "status_change",
    category: "Service Monitoring",
    label: serviceName,
    value: newStatus === "up" ? 1 : 0,
    service_name: serviceName,
    new_status: newStatus,
  });
};

/**
 * Track API key setup
 */
export const trackApiKeySetup = (success: boolean) => {
  trackEvent({
    action: "api_key_setup",
    category: "Configuration",
    label: success ? "success" : "failure",
    value: success ? 1 : 0,
  });
};

/**
 * Track alert notifications
 */
export const trackAlertSent = (
  alertType: "email" | "slack",
  serviceName: string,
) => {
  trackEvent({
    action: "alert_sent",
    category: "Notifications",
    label: alertType,
    service_name: serviceName,
    alert_type: alertType,
  });
};

/**
 * Track dashboard interactions
 */
export const trackDashboardInteraction = (action: string, label?: string) => {
  trackEvent({
    action,
    category: "Dashboard",
    label,
  });
};

/**
 * Track user authentication
 */
export const trackAuth = (
  action: "login" | "logout" | "signup",
  method?: string,
) => {
  trackEvent({
    action,
    category: "Authentication",
    label: method,
    auth_method: method,
  });
};
