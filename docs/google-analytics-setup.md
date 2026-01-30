# Google Analytics Setup Guide

This document explains how to set up and use Google Analytics 4 (GA4) in the PulseWatch application.

## Overview

Google Analytics has been integrated into PulseWatch to track:

- **Page views** (automatic)
- **Service status changes**
- **API key configurations**
- **Alert notifications**
- **User authentication events**
- **Dashboard interactions**

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in the bottom left)
3. In the **Property** column, click **Create Property**
4. Enter your property details:
   - **Property name**: PulseWatch (or your preferred name)
   - **Reporting time zone**: Select your timezone
   - **Currency**: Select your currency
5. Click **Next** and complete the business information
6. Click **Create** and accept the Terms of Service

### 2. Get Your Measurement ID

1. In your new property, go to **Admin** > **Data Streams**
2. Click **Add stream** > **Web**
3. Enter your website details:
   - **Website URL**: Your production URL (e.g., `https://pulsewatch.example.com`)
   - **Stream name**: PulseWatch Web
4. Click **Create stream**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Configure Environment Variables

Add your Measurement ID to the `.env` file:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Replace with your actual GA4 Measurement ID
```

**Important**: The `NEXT_PUBLIC_` prefix is required for the variable to be accessible in the browser.

### 4. Restart Your Development Server

After updating the `.env` file, restart your Next.js development server:

```bash
npm run dev
```

## Usage

### Automatic Tracking

The following events are tracked automatically:

- **Page views**: Every route change is tracked automatically
- **Page path**: The current URL path is sent with each page view

### Custom Event Tracking

Use the utility functions from `lib/analytics.ts` to track custom events:

#### Track Service Status Changes

```typescript
import { trackServiceStatusChange } from "@/lib/analytics";

// When a service status changes
trackServiceStatusChange("API Service", "down");
```

#### Track API Key Setup

```typescript
import { trackApiKeySetup } from "@/lib/analytics";

// When user sets up an API key
trackApiKeySetup(true); // true for success, false for failure
```

#### Track Alert Notifications

```typescript
import { trackAlertSent } from "@/lib/analytics";

// When an alert is sent
trackAlertSent("email", "API Service");
trackAlertSent("slack", "Frontend Service");
```

#### Track Dashboard Interactions

```typescript
import { trackDashboardInteraction } from "@/lib/analytics";

// Track button clicks, filter changes, etc.
trackDashboardInteraction("filter_applied", "last_24_hours");
trackDashboardInteraction("service_added", "New API Service");
```

#### Track Authentication Events

```typescript
import { trackAuth } from "@/lib/analytics";

// Track login/logout/signup
trackAuth("login", "google");
trackAuth("logout");
trackAuth("signup", "email");
```

#### Track Custom Events

```typescript
import { trackEvent } from "@/lib/analytics";

// Track any custom event
trackEvent({
  action: "custom_action",
  category: "Custom Category",
  label: "Optional Label",
  value: 100, // Optional numeric value
  custom_param: "custom_value", // Add any custom parameters
});
```

## Implementation Details

### Files Created

1. **`app/components/GoogleAnalytics.tsx`**
   - Client component that loads the gtag.js script
   - Automatically tracks page views on route changes
   - Uses Next.js `Script` component for optimal loading

2. **`lib/analytics.ts`**
   - Utility functions for tracking custom events
   - Pre-configured event tracking for common PulseWatch actions
   - Type-safe event tracking with TypeScript

3. **`app/layout.tsx`** (modified)
   - Integrated GoogleAnalytics component
   - Conditionally renders only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set

### How It Works

1. **Script Loading**: The Google Analytics script is loaded using Next.js's `Script` component with `strategy="afterInteractive"` to ensure it doesn't block page rendering.

2. **Page View Tracking**: The component uses Next.js's `usePathname()` and `useSearchParams()` hooks to detect route changes and automatically send page view events.

3. **Custom Events**: All custom event functions check if the `gtag` function exists before calling it, ensuring the code works even if GA is not configured.

4. **Type Safety**: TypeScript types ensure you're sending the correct data to Google Analytics.

## Viewing Analytics Data

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your PulseWatch property
3. Navigate to **Reports** to view:
   - **Real-time**: See current active users and their activity
   - **Engagement**: View page views, events, and user engagement
   - **User acquisition**: See how users find your site
   - **Events**: View all custom events being tracked

### Custom Event Reports

To view custom events:

1. Go to **Reports** > **Engagement** > **Events**
2. You'll see all tracked events including:
   - `page_view` (automatic)
   - `status_change`
   - `api_key_setup`
   - `alert_sent`
   - `login`, `logout`, `signup`
   - Any custom events you've added

## Best Practices

1. **Don't Track Sensitive Data**: Never send personally identifiable information (PII) or sensitive data to Google Analytics.

2. **Use Descriptive Labels**: Make your event labels descriptive so they're easy to understand in reports.

3. **Consistent Naming**: Use consistent naming conventions for events, categories, and labels.

4. **Test in Development**: Test your analytics implementation in development mode, but use a separate GA4 property for production.

5. **Privacy Compliance**: Ensure your analytics implementation complies with GDPR, CCPA, and other privacy regulations.

## Troubleshooting

### Events Not Showing Up

1. **Check Measurement ID**: Ensure your `NEXT_PUBLIC_GA_MEASUREMENT_ID` is correct in `.env`
2. **Restart Server**: Make sure you restarted the dev server after adding the environment variable
3. **Check Browser Console**: Look for any errors related to gtag or analytics
4. **Wait for Processing**: GA4 can take 24-48 hours to process some events

### Testing in Development

1. Open your browser's Developer Tools
2. Go to the **Network** tab
3. Filter for `google-analytics.com` or `collect`
4. You should see requests being sent when events are tracked

### Ad Blockers

Ad blockers may prevent Google Analytics from loading. This is expected behavior and doesn't affect your application's functionality.

## Production Deployment

When deploying to production:

1. **Add Environment Variable**: Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your hosting platform's environment variables (Vercel, Netlify, etc.)

2. **Use Production Measurement ID**: Use your production GA4 Measurement ID, not the development one

3. **Verify Setup**: After deployment, check Google Analytics Real-time reports to ensure events are being tracked

## Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Tracking Guide](https://support.google.com/analytics/answer/9267735)
- [Next.js Analytics Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
