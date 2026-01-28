export interface ExternalStatusPage {
  name: string;
  url: string;
  category: string;
}

export const EXTERNAL_STATUS_PAGES: ExternalStatusPage[] = [
  {
    category: "Developer",
    name: "GitHub",
    url: "https://www.githubstatus.com/",
  },
  {
    category: "Developer",
    name: "GitHub Enterprise",
    url: "https://us.githubstatus.com/",
  },
  {
    category: "Developer",
    name: "Bitbucket",
    url: "https://bitbucket.status.atlassian.com/",
  },
  {
    category: "Productivity",
    name: "Notion",
    url: "https://www.notion-status.com/",
  },
  {
    category: "Productivity",
    name: "Trello",
    url: "https://trello.status.atlassian.com/",
  },
  {
    category: "Productivity",
    name: "Dropbox",
    url: "https://status.dropbox.com/",
  },
  {
    category: "Productivity",
    name: "Google Workspace",
    url: "https://www.google.com/appsstatus",
  },
  { category: "Communication", name: "Zoom", url: "https://status.zoom.us/" },
  {
    category: "Communication",
    name: "Slack",
    url: "https://status.slack.com/",
  },
  {
    category: "Communication",
    name: "Microsoft Teams",
    url: "https://status.office365.com/",
  },
  {
    category: "Communication",
    name: "Skype",
    url: "https://portal.office365.com/servicestatus",
  },
  {
    category: "Cloud & Infrastructure",
    name: "AWS",
    url: "https://status.aws.amazon.com/",
  },
  {
    category: "Cloud & Infrastructure",
    name: "Microsoft Azure",
    url: "https://status.azure.com/",
  },
  {
    category: "Cloud & Infrastructure",
    name: "Google Cloud",
    url: "https://status.cloud.google.com/",
  },
  {
    category: "Cloud & Infrastructure",
    name: "Cloudflare",
    url: "https://www.cloudflarestatus.com/",
  },
  {
    category: "Payment Gateway",
    name: "Stripe",
    url: "https://status.stripe.com/",
  },
  {
    category: "Payment Gateway",
    name: "PayPal",
    url: "https://www.paypal-status.com/product/production",
  },
  {
    category: "Payment Gateway",
    name: "Coinbase",
    url: "https://coinbase.statuspage.io/",
  },
  {
    category: "Payment Gateway",
    name: "Square",
    url: "https://www.issquareup.com/",
  },
  {
    category: "Australia",
    name: "eWAY",
    url: "https://www.eway.com.au/support/eway-status/",
  },
  {
    category: "Australia",
    name: "BPAY",
    url: "https://bpaygroup-portal.apigee.io/service-levels",
  },
  {
    category: "AI Services",
    name: "ChatGPT (OpenAI)",
    url: "https://status.openai.com/",
  },
  {
    category: "AI Services",
    name: "GitHub Copilot",
    url: "https://statusgator.com/services/github/copilot",
  },
  {
    category: "Other Platforms",
    name: "Shopify",
    url: "https://www.shopifystatus.com/",
  },
  {
    category: "Other Platforms",
    name: "Atlassian",
    url: "https://status.atlassian.com/",
  },
  {
    category: "Other Platforms",
    name: "Zoho",
    url: "https://status.zoho.com/",
  },
  {
    category: "Other Platforms",
    name: "Reddit",
    url: "https://www.redditstatus.com",
  },
];
