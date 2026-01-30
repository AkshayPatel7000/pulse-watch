/**
 * Example: How to integrate Google Analytics tracking into PulseWatch components
 *
 * This file demonstrates best practices for adding analytics tracking
 * to various parts of the application.
 */

// ============================================================================
// Example 1: Tracking Service Status Changes
// ============================================================================

import { trackServiceStatusChange } from "@/lib/analytics";

// In your service monitoring logic (e.g., API route or server action)
async function updateServiceStatus(serviceId: string, newStatus: string) {
  // ... your existing logic to update the service status ...

  // Track the status change
  trackServiceStatusChange(serviceId, newStatus);

  return { success: true };
}

// ============================================================================
// Example 2: Tracking API Key Setup
// ============================================================================

import { trackApiKeySetup } from "@/lib/analytics";

// In your API key setup form submission
async function handleApiKeySubmit(apiKey: string) {
  try {
    // ... your existing logic to save the API key ...

    // Track successful setup
    trackApiKeySetup(true);

    return { success: true };
  } catch (error) {
    // Track failed setup
    trackApiKeySetup(false);

    throw error;
  }
}

// ============================================================================
// Example 3: Tracking Alert Notifications
// ============================================================================

import { trackAlertSent } from "@/lib/analytics";

// In your notification sending logic
async function sendEmailAlert(serviceName: string, status: string) {
  try {
    // ... your existing logic to send email ...

    // Track the alert
    trackAlertSent("email", serviceName);

    return { success: true };
  } catch (error) {
    console.error("Failed to send email alert:", error);
    throw error;
  }
}

async function sendSlackAlert(serviceName: string, status: string) {
  try {
    // ... your existing logic to send Slack message ...

    // Track the alert
    trackAlertSent("slack", serviceName);

    return { success: true };
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
    throw error;
  }
}

// ============================================================================
// Example 4: Tracking Dashboard Interactions
// ============================================================================

("use client");

import { trackDashboardInteraction } from "@/lib/analytics";
import { useState } from "react";

function DashboardFilters() {
  const [timeRange, setTimeRange] = useState("24h");

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);

    // Track the filter change
    trackDashboardInteraction("time_range_changed", newRange);
  };

  return (
    <select
      value={timeRange}
      onChange={(e) => handleTimeRangeChange(e.target.value)}
    >
      <option value="1h">Last Hour</option>
      <option value="24h">Last 24 Hours</option>
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
    </select>
  );
}

// ============================================================================
// Example 5: Tracking Authentication Events
// ============================================================================

import { trackAuth } from "@/lib/analytics";
import { signIn, signOut } from "next-auth/react";

// In your login component
async function handleGoogleLogin() {
  try {
    await signIn("google");

    // Track successful login
    trackAuth("login", "google");
  } catch (error) {
    console.error("Login failed:", error);
  }
}

// In your logout handler
async function handleLogout() {
  try {
    await signOut();

    // Track logout
    trackAuth("logout");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

// ============================================================================
// Example 6: Tracking Custom Events
// ============================================================================

import { trackEvent } from "@/lib/analytics";

// Track when a user adds a new service
function handleAddService(serviceName: string, serviceType: string) {
  // ... your existing logic to add the service ...

  // Track the event
  trackEvent({
    action: "service_added",
    category: "Service Management",
    label: serviceType,
    service_name: serviceName,
    service_type: serviceType,
  });
}

// Track when a user views service details
function handleViewServiceDetails(serviceId: string, serviceName: string) {
  trackEvent({
    action: "service_details_viewed",
    category: "Service Management",
    label: serviceName,
    service_id: serviceId,
  });
}

// Track when a user exports data
function handleExportData(format: "csv" | "json") {
  trackEvent({
    action: "data_exported",
    category: "Data Management",
    label: format,
    export_format: format,
  });
}

// ============================================================================
// Example 7: Tracking Button Clicks
// ============================================================================

("use client");

import { trackDashboardInteraction } from "@/lib/analytics";

function ActionButton() {
  const handleClick = () => {
    // Track the button click
    trackDashboardInteraction("refresh_button_clicked");

    // ... your existing logic ...
  };

  return <button onClick={handleClick}>Refresh Data</button>;
}

// ============================================================================
// Example 8: Tracking Form Submissions
// ============================================================================

("use client");

import { trackEvent } from "@/lib/analytics";

function ServiceConfigForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ... your existing form submission logic ...

      // Track successful submission
      trackEvent({
        action: "form_submitted",
        category: "Configuration",
        label: "service_config_form",
        value: 1, // 1 for success
      });
    } catch (error) {
      // Track failed submission
      trackEvent({
        action: "form_submitted",
        category: "Configuration",
        label: "service_config_form",
        value: 0, // 0 for failure
      });
    }
  };

  return <form onSubmit={handleSubmit}>{/* Your form fields */}</form>;
}

// ============================================================================
// Example 9: Tracking Search Queries
// ============================================================================

("use client");

import { trackEvent } from "@/lib/analytics";
import { useState, useCallback } from "react";
import { debounce } from "lodash"; // or implement your own debounce

function ServiceSearch() {
  const [query, setQuery] = useState("");

  // Debounce the tracking to avoid too many events
  const trackSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 3) {
        trackEvent({
          action: "search_performed",
          category: "Search",
          label: searchQuery,
          query_length: searchQuery.length,
        });
      }
    }, 1000),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    trackSearch(newQuery);
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleSearchChange}
      placeholder="Search services..."
    />
  );
}

// ============================================================================
// Example 10: Tracking Errors
// ============================================================================

import { trackEvent } from "@/lib/analytics";

async function fetchServiceData(serviceId: string) {
  try {
    const response = await fetch(`/api/services/${serviceId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Track the error
    trackEvent({
      action: "api_error",
      category: "Errors",
      label: "fetch_service_data",
      error_message: error instanceof Error ? error.message : "Unknown error",
      service_id: serviceId,
    });

    throw error;
  }
}

// ============================================================================
// Best Practices
// ============================================================================

/**
 * 1. Track User Intent, Not Just Actions
 *    - Track what the user is trying to accomplish, not just button clicks
 *
 * 2. Use Consistent Naming
 *    - Use snake_case for event names: 'service_added', 'alert_sent'
 *    - Use descriptive categories: 'Service Management', 'Notifications'
 *
 * 3. Don't Over-Track
 *    - Avoid tracking every single interaction
 *    - Focus on meaningful user actions and business metrics
 *
 * 4. Debounce High-Frequency Events
 *    - Use debouncing for events like search, scroll, or resize
 *
 * 5. Never Track Sensitive Data
 *    - Don't send passwords, API keys, or personal information
 *    - Sanitize error messages before tracking
 *
 * 6. Test Your Tracking
 *    - Use browser dev tools to verify events are being sent
 *    - Check Google Analytics Real-time reports
 *
 * 7. Document Your Events
 *    - Keep a list of all tracked events and their purposes
 *    - Make it easy for team members to understand what's being tracked
 */

export {};
