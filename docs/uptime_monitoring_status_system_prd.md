# Product Requirements Document (PRD)

## Product Name
**PulseWatch** (working name)

## Purpose
Build an internal uptime monitoring system similar to **onlineornot.com** and **Atlassian Statuspage**, to monitor **all frontend and backend services** every 10 minutes from multiple regions, store logs, calculate uptime, and expose status via a dashboard and public status page.

This system is intended for **engineering & ops teams** to:
- Detect outages early
- Understand regional failures
- Track historical uptime
- Share service status publicly or internally

---

## Goals & Non‑Goals

### Goals
- Monitor FE & BE URLs every 10 minutes
- Multi‑region checks (AWS‑like regions)
- Store response time, status code, timeout
- Determine UP / DEGRADED / DOWN
- Provide admin dashboard
- Provide public status page (Bitbucket‑like)

### Non‑Goals (Phase‑1)
- Synthetic user journeys (login flows)
- Real user monitoring (RUM)
- BGP / ISP telemetry
- Mobile SDK monitoring

---

## Target Users

### Primary Users
- Developers
- DevOps / SRE
- Product owners

### Secondary Users
- Customers (via public status page)

---

## High‑Level Architecture

```
[Next.js Frontend]
       |
       v
[Next.js API Routes]
       |
       v
[Firebase]
  |        |
Firestore  Cloud Functions
  |
Cloud Scheduler
  |
Multi‑Region Probe Workers
```

---

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- Recharts (graphs)

### Backend
- Next.js API Routes (Node.js runtime)
- Fetch / Axios for probes

### Database
- **MongoDB (Atlas Free Tier – M0)**
  - Collections with TTL indexes
  - Aggregation pipelines for uptime

### Scheduling
- **GitHub Actions Cron (free)**
- OR **Vercel Cron (free tier)**

### Hosting
- Vercel (recommended for Next.js)
- Any Node-compatible hosting

---

## Core Features

### 1. Service Monitoring

#### Monitored Targets
- Frontend URLs (web apps)
- Backend APIs
- Health endpoints

#### Check Configuration
| Field | Value |
|-----|------|
| Interval | 10 minutes |
| Timeout | 10 seconds |
| Method | HEAD / GET |
| Redirects | Follow |

---

### 2. Multi‑Region Probes

Regions (Phase‑1):
- us-east-1
- eu-central-1
- ap-south-1
- ap-northeast-1
- ap-southeast-1

Each region executes the same HTTP check.

---

### 3. Probe Result Data Model

#### Firestore: `probe_results`
```ts
{
  serviceId: string,
  region: string,
  statusCode: number,
  responseTime: number,
  body: string,
  startedAt: number,
  success: boolean
}
```

---

### 4. Service State Evaluation

#### Rules
- Timeout or DNS failure → FAIL
- HTTP 500+ → FAIL
- HTTP 200–399 → PASS

#### Aggregation Logic
```
If failures >= 50% regions → DOWN
If failures > 0 → DEGRADED
Else → OPERATIONAL
```

---

### 5. Service Data Model

#### Firestore: `services`
```ts
{
  id: string,
  name: string,
  url: string,
  type: 'frontend' | 'backend',
  currentStatus: 'up' | 'degraded' | 'down',
  lastCheckedAt: number
}
```

---

### 6. Status History

#### Firestore: `status_events`
```ts
{
  serviceId: string,
  previousStatus: string,
  newStatus: string,
  timestamp: number
}
```

Used to build:
- Uptime %
- Incident timelines

---

## Dashboard (Admin)

### Features
- Add / edit / delete services
- View live status
- Regional breakdown
- Response time charts
- Incident history

### Pages
- `/dashboard`
- `/dashboard/services`
- `/dashboard/service/[id]`

---

## Public Status Page

### Pages
- `/status`
- `/status/[service]`

### Features
- Overall system status
- Component list
- Incident history (30 days)
- Auto refresh every 60s

---

## Scheduler & Execution Flow (MongoDB Based)

### Scheduler
- GitHub Actions Cron (every 10 minutes)
- OR Vercel Cron

### Execution Flow
1. Cron triggers `POST /api/check/run`
2. API reads services from MongoDB
3. Runs HTTP checks per region (limited parallel)
4. Writes probe results to MongoDB
5. Aggregates results per service
6. Updates service status if changed
7. Inserts status event only on change

---

## API Endpoints (Next.js)

### Internal
- `POST /api/check/run`
- `POST /api/check/result`

### Public
- `GET /api/status/summary`
- `GET /api/status/services`
- `GET /api/status/incidents`

---

## Security

- Firebase Auth for admin
- Read‑only public APIs
- Rate limit public endpoints

---

## Scalability Considerations (MongoDB Free Tier)

- TTL index on `probe_results` (7–14 days)
- Limit regions per service (max 5–6)
- Write status events only on changes
- Use MongoDB aggregation instead of per-read calculations
- Batch inserts for probe results

---

## Phase Roadmap

### Phase‑1 (MVP)
- HTTP uptime checks
- Multi‑region
- Dashboard
- Public status page

### Phase‑2
- Notifications (Email / Slack)
- Maintenance windows
- SLA reporting

### Phase‑3
- Synthetic flows
- Webhooks
- Custom probe scripts

---

## Success Metrics

- 99% check reliability
- <5s dashboard load
- Accurate outage detection (<2 cycles)

---

## Inspiration / Reference

- onlineornot.com
- Atlassian Statuspage
- Uptime Kuma
- BetterStack

---

## Open Questions
- Do we need SMS alerts?
- Public vs private status pages?
- Data retention duration?

---

**End of PRD**

