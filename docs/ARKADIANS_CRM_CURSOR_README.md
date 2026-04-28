# The Arkadians AI Sales & Experience CRM

## Cursor Development Guide — Phase 1 (7-Day Demo Build)

> **"Modern Living for Urban Royalty"**
>
> This is NOT a generic CRM. This is a luxury sales command centre for Pakistan's most prestigious residential development. Every component must feel like a five-star hotel concierge desk — dark navy, gold accents, premium spacing, and language that befits a 43-acre, 13-tower landmark overlooking the Arabian Sea.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Quick Start](#3-quick-start)
4. [Brand Identity & Design System](#4-brand-identity--design-system)
5. [Project Structure](#5-project-structure)
6. [Database Schema (Prisma)](#6-database-schema-prisma)
7. [API Routes](#7-api-routes)
8. [Page & Component Specifications](#8-page--component-specifications)
9. [Vapi Voice Agent Integration](#9-vapi-voice-agent-integration)
10. [AI Engine (Claude Integration)](#10-ai-engine-claude-integration)
11. [OpenClaw Orchestration](#11-openclaw-orchestration)
12. [Interactive Buyer Game](#12-interactive-buyer-game)
13. [Authentication & Security](#13-authentication--security)
14. [Docker & Deployment](#14-docker--deployment)
15. [Demo Data Seeding](#15-demo-data-seeding)
16. [7-Day Build Schedule](#16-7-day-build-schedule)
17. [Acceptance Criteria](#17-acceptance-criteria)
18. [Reference Links](#18-reference-links)

---

## 1. Project Overview

### What We're Building

A private, AI-powered CRM for **The Arkadians** — a landmark luxury real estate development in DHA Phase 8, Karachi, Pakistan. The system handles:

- **Voice lead capture** via Vapi AI concierge on the website
- **AI-powered lead scoring** and summaries via Claude
- **Sales pipeline management** (Kanban drag-and-drop)
- **Automated follow-up generation** (WhatsApp + email drafts)
- **Interactive buyer qualification game** ("Build Your Arkadians Residence")
- **Construction progress tracker**
- **Team notifications** via OpenClaw → Telegram
- **Management dashboard** with real-time stats

### The Arkadians Project Facts

| Detail | Value |
|--------|-------|
| Location | DHA Phase 8, Karachi, Pakistan |
| Developer | Creek Developers (Pvt.) Ltd / AKD Group |
| Chairman | Aqeel Karim Dhedhi |
| Total Area | 43 acres |
| Towers | 13 residential (up to 34 storeys) + 6 office enclaves |
| Master Plan | ATKINS (world-renowned architecture firm) |
| Unit Types | 2-bed, 3-bed, 3-bed large, 4-bed duplex, penthouse (up to 16,445 sq ft) |
| Views | Arabian Sea creek + DHA Golf and Country Club |
| Amenities | Pool deck, spa, health club, tennis/padel, library, mosque, community halls, rooftop gardens, conference rooms |
| Security | 24/7 CCTV, gated community, multi-layered security protocol |
| Tagline | "Modern Living for Urban Royalty" |
| Website | https://thearkadians.com |

### What This Is NOT

- Not "a CRM we built in seven days" — present it as a **bespoke AI sales command centre**
- Not a generic SaaS dashboard — it must look and feel **luxury real estate**
- Not a full enterprise CRM — Phase 1 is a polished, working demo with real data flows

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3.4+ |
| UI Components | shadcn/ui | Latest |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5+ |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Voice | Vapi.ai | Web SDK + Webhooks |
| Automation | OpenClaw | Latest Docker image |
| Auth | NextAuth.js | 4+ |
| Drag & Drop | @hello-pangea/dnd | Latest |
| Charts | Recharts | 2+ |
| Icons | Lucide React | Latest |
| Deployment | Docker Compose | On VPS |
| Reverse Proxy | Caddy | 2 |
| Fonts | Playfair Display + Inter | Google Fonts |

### Install Command

```bash
npx create-next-app@latest arkadians-crm --typescript --tailwind --eslint --app --src-dir
cd arkadians-crm
npm install prisma @prisma/client @anthropic-ai/sdk next-auth @hello-pangea/dnd recharts lucide-react
npm install -D prisma
npx shadcn@latest init
```

---

## 3. Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd arkadians-crm
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your keys (see Section 14)

# 3. Start Postgres (Docker)
docker compose up postgres -d

# 4. Run migrations
npx prisma migrate dev

# 5. Seed demo data
npx prisma db seed

# 6. Start dev server
npm run dev
# → http://localhost:3000
```

---

## 4. Brand Identity & Design System

### 4.1 Colour Palette

```
Primary Navy:      #0A1628  — Backgrounds, headers, primary text, sidebar
Navy Light:        #0F2035  — Hover states on navy, table headers
Navy Dark:         #060E1A  — Deepest backgrounds

Accent Gold:       #C9A84C  — Primary CTAs, active states, highlights, accents
Dark Gold:         #A6862E  — Hover on gold, secondary gold elements
Light Gold:        #D4B76A  — Subtle gold highlights, shimmer

Cream:             #F5F3EE  — Page backgrounds, card surfaces
White:             #FFFFFF  — Card backgrounds, text on dark surfaces

Medium Grey:       #4A5568  — Body text, secondary labels
Light Grey:        #E2E8F0  — Borders, dividers, disabled states
Lightest Grey:     #F7FAFC  — Alternating table rows

Success Green:     #48BB78  — Closed deals, positive indicators
Warning Amber:     #ED8936  — Urgent actions, hot leads
Error Red:         #F56565  — Errors, lost deals, overdue tasks
Purple:            #805AD5  — Negotiating stage
```

### 4.2 Tailwind Config

```js
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1628",
          light: "#0F2035",
          dark: "#060E1A",
        },
        gold: {
          DEFAULT: "#C9A84C",
          dark: "#A6862E",
          light: "#D4B76A",
        },
        cream: "#F5F3EE",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(10, 22, 40, 0.08)",
        "card-hover": "0 4px 12px rgba(10, 22, 40, 0.12)",
        gold: "0 0 20px rgba(201, 168, 76, 0.15)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C, #A6862E)",
        "navy-gradient": "linear-gradient(180deg, #0A1628, #0F2035)",
      },
      animation: {
        "shimmer": "shimmer 2s ease-in-out infinite",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 168, 76, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201, 168, 76, 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

### 4.3 Typography

| Element | Font | Weight | Size | Colour |
|---------|------|--------|------|--------|
| Page Title | Playfair Display | 700 | 32-40px | navy |
| Section Heading | Inter | 600 | 24-28px | navy |
| Subheading | Inter | 500 | 18-20px | navy |
| Body Text | Inter | 400 | 14-16px | #4A5568 |
| Labels / Captions | Inter | 500 | 12-13px | #4A5568 |
| Data / Mono | JetBrains Mono | 400 | 13-14px | navy |
| Button Text | Inter | 600 | 14px | white on gold |

### 4.4 Google Fonts Import

```html
<!-- In app/layout.tsx or globals.css -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

### 4.5 Design Rules (MANDATORY)

1. **Sidebar**: Fixed left, 280px wide, navy background, gold left-border on active item
2. **Cards**: Cream or white background, 1px light-grey border, 8-12px border-radius, `shadow-card` on rest, `shadow-card-hover` on hover
3. **Primary Buttons**: `bg-gold-gradient` with white text, 8px radius, subtle gold shadow on hover
4. **Tables**: Alternating cream/white rows, navy header with white text, gold left-border on hover row
5. **Status Badges**: Pill-shaped (`rounded-full px-3 py-1`), colour-coded per stage
6. **Loading States**: Gold shimmer animation on skeleton screens (not grey pulsing)
7. **Spacing**: Minimum 24px padding inside cards, 16-24px gaps between elements
8. **Icons**: Lucide React, 20px default size, medium-grey colour unless in active/accent context
9. **Border Radius**: 8px for cards, 6px for inputs, `rounded-full` for avatars and badges
10. **NO generic SaaS aesthetics** — think five-star hotel reception, not Salesforce

### 4.6 Concierge Language Guide

Use luxury real estate language throughout the UI:

| ❌ Generic | ✅ Arkadians |
|-----------|-------------|
| Leads List | Your Pipeline |
| Appointments | Private Viewings |
| Contacts | Prospects & Clients |
| Deals | Opportunities |
| Site Visit | Private Viewing |
| Apartment | Residence |
| Unit | Suite / Residence |
| Cheap | Accessible |
| Expensive | Premium / Exclusive |
| Sales Rep | Relationship Manager |
| Dashboard | Command Centre |
| Notifications | Briefings |
| Create Lead | Register Prospect |
| Delete | Archive |

---

## 5. Project Structure

```
arkadians-crm/
├── docker-compose.yml
├── Caddyfile
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout: sidebar + topbar shell
│   │   ├── page.tsx                      # Dashboard / Command Centre
│   │   ├── globals.css                   # Tailwind base + custom styles
│   │   ├── pipeline/
│   │   │   └── page.tsx                  # Kanban pipeline view
│   │   ├── leads/
│   │   │   ├── page.tsx                  # Lead list (table view)
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Lead detail (3-column layout)
│   │   ├── calls/
│   │   │   └── page.tsx                  # Call log view
│   │   ├── activities/
│   │   │   └── page.tsx                  # Tasks & activities view
│   │   ├── game/
│   │   │   └── page.tsx                  # Buyer game (internal view/results)
│   │   ├── construction/
│   │   │   └── page.tsx                  # Construction progress tracker
│   │   ├── settings/
│   │   │   └── page.tsx                  # Settings placeholder
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts          # NextAuth handler
│   │       ├── leads/
│   │       │   ├── route.ts              # GET (list) + POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts          # GET + PATCH + DELETE
│   │       │       └── timeline/
│   │       │           └── route.ts      # GET full timeline
│   │       ├── calls/
│   │       │   ├── route.ts              # GET list
│   │       │   └── [id]/
│   │       │       └── route.ts          # GET detail
│   │       ├── activities/
│   │       │   ├── route.ts              # GET + POST
│   │       │   └── [id]/
│   │       │       └── route.ts          # PATCH
│   │       ├── opportunities/
│   │       │   └── route.ts              # GET + POST
│   │       ├── game-sessions/
│   │       │   └── route.ts              # POST (from website game)
│   │       ├── dashboard/
│   │       │   ├── stats/route.ts        # Aggregated stats
│   │       │   ├── hot-leads/route.ts    # Top leads by score
│   │       │   └── recent-calls/route.ts # Latest calls
│   │       ├── ai/
│   │       │   ├── summarise/route.ts    # Generate lead summary
│   │       │   ├── score/route.ts        # Calculate lead score
│   │       │   ├── follow-up/route.ts    # Generate follow-up draft
│   │       │   ├── call-analysis/route.ts# Analyse call transcript
│   │       │   └── game-recommend/route.ts# Game recommendation
│   │       └── webhooks/
│   │           ├── vapi/route.ts         # Vapi end-of-call webhook
│   │           ├── game/route.ts         # Website game completion
│   │           └── enquiry/route.ts      # Website form submission
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx               # Nav sidebar
│   │   │   ├── TopBar.tsx                # Top header bar
│   │   │   └── MobileNav.tsx             # Mobile hamburger nav
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx              # Single stat metric card
│   │   │   ├── StatsGrid.tsx             # 4-column stat layout
│   │   │   ├── HotLeadsList.tsx          # Top 5 leads by score
│   │   │   ├── RecentCalls.tsx           # Latest 5 calls
│   │   │   ├── AIRecommendations.tsx     # AI action items
│   │   │   └── PipelineMini.tsx          # Horizontal stage indicators
│   │   ├── pipeline/
│   │   │   ├── KanbanBoard.tsx           # Full drag-and-drop board
│   │   │   ├── KanbanColumn.tsx          # Single pipeline column
│   │   │   └── LeadCard.tsx              # Draggable lead card
│   │   ├── leads/
│   │   │   ├── LeadTable.tsx             # Filterable lead table
│   │   │   ├── LeadDetailPanel.tsx       # Left column: lead info
│   │   │   ├── ActivityTimeline.tsx      # Centre column: timeline
│   │   │   ├── AISummaryPanel.tsx        # Right column: AI outputs
│   │   │   ├── FollowUpGenerator.tsx     # AI follow-up with tabs
│   │   │   ├── LeadForm.tsx              # Create/edit lead form
│   │   │   └── LeadScoreGauge.tsx        # Circular score display
│   │   ├── calls/
│   │   │   ├── CallTable.tsx             # Call log table
│   │   │   ├── CallRow.tsx               # Expandable call row
│   │   │   └── TranscriptViewer.tsx      # Full transcript view
│   │   ├── activities/
│   │   │   ├── ActivityTable.tsx         # Task/activity table
│   │   │   ├── ActivityForm.tsx          # Create task form
│   │   │   └── ActivityCard.tsx          # Single activity card
│   │   ├── game/
│   │   │   ├── ResidenceSelector.tsx     # Multi-step game component
│   │   │   ├── GameStep.tsx              # Single step wrapper
│   │   │   ├── OptionCard.tsx            # Clickable option card
│   │   │   ├── AmenityRanker.tsx         # Drag-to-rank amenities
│   │   │   └── GameResults.tsx           # AI recommendation display
│   │   ├── construction/
│   │   │   ├── ProgressTimeline.tsx      # Vertical timeline
│   │   │   └── MilestoneCard.tsx         # Single milestone
│   │   └── shared/
│   │       ├── Badge.tsx                 # Status/score badge
│   │       ├── ScoreGauge.tsx            # Circular SVG gauge (0-100)
│   │       ├── LoadingSkeleton.tsx        # Gold shimmer skeleton
│   │       ├── EmptyState.tsx            # Empty state illustration
│   │       ├── ConfirmDialog.tsx         # Confirmation modal
│   │       ├── SearchInput.tsx           # Global search input
│   │       └── ArkLogo.tsx              # Arkadians logo component
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma client singleton
│   │   ├── claude.ts                     # Anthropic SDK wrapper + prompts
│   │   ├── vapi.ts                       # Vapi webhook parser
│   │   ├── openclaw.ts                   # OpenClaw notification sender
│   │   ├── scoring.ts                    # Lead scoring algorithm
│   │   ├── auth.ts                       # NextAuth config
│   │   ├── utils.ts                      # Shared utilities
│   │   └── constants.ts                  # Enums, stage configs, etc.
│   ├── hooks/
│   │   ├── useLeads.ts                   # Lead data fetching hook
│   │   ├── useDashboard.ts              # Dashboard stats hook
│   │   └── useAI.ts                      # AI generation hook
│   └── types/
│       ├── lead.ts                       # Lead-related types
│       ├── call.ts                       # Call types
│       ├── activity.ts                   # Activity types
│       ├── game.ts                       # Game session types
│       └── api.ts                        # API response types
├── public/
│   ├── logo.svg                          # Arkadians logo (gold on transparent)
│   ├── logo-white.svg                    # Arkadians logo (white variant)
│   └── favicon.ico
└── README.md
```

---

## 6. Database Schema (Prisma)

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum LeadSource {
  website_voice
  website_form
  website_game
  phone
  referral
  broker
  walk_in
  social_media
}

enum LeadStatus {
  new
  contacted
  viewing_booked
  negotiating
  closed_won
  closed_lost
}

enum UnitType {
  two_bed
  three_bed
  three_bed_large
  four_bed_duplex
  penthouse
}

enum ViewPreference {
  sea
  golf
  city
  dual
}

enum Urgency {
  low
  medium
  high
  immediate
}

enum ContactType {
  buyer
  broker
  investor
  partner
  other
}

enum CallDirection {
  inbound
  outbound
}

enum Sentiment {
  positive
  neutral
  negative
}

enum ActivityType {
  task
  call
  email
  whatsapp
  viewing
  meeting
  note
  follow_up
}

enum ActivityStatus {
  pending
  in_progress
  completed
  cancelled
}

enum Priority {
  low
  medium
  high
  urgent
}

enum OpportunityStage {
  qualification
  proposal
  negotiation
  commitment
  closed_won
  closed_lost
}

enum UserRole {
  admin
  manager
  sales_rep
  viewer
}

enum UserStatus {
  active
  inactive
  suspended
}

enum AIOutputType {
  summary
  score
  follow_up_whatsapp
  follow_up_email
  recommendation
  call_analysis
}

enum Lifestyle {
  family
  professional
  investor
  retiree
  luxury_seeker
}

// ─── MODELS ──────────────────────────────────────────────

model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String     @map("password_hash")
  role         UserRole
  avatarUrl    String?    @map("avatar_url")
  status       UserStatus @default(active)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  leads      Lead[]
  activities Activity[]

  @@map("users")
}

model Lead {
  id             String         @id @default(uuid())
  name           String
  phone          String?
  email          String?
  source         LeadSource
  status         LeadStatus     @default(new)
  budgetMin      BigInt?        @map("budget_min")
  budgetMax      BigInt?        @map("budget_max")
  preferredUnit  UnitType?      @map("preferred_unit")
  preferredView  ViewPreference? @map("preferred_view")
  preferredTower String?        @map("preferred_tower") @db.VarChar(10)
  urgency        Urgency        @default(medium)
  language       String         @default("en") @db.VarChar(10)
  score          Int            @default(0)
  notes          String?
  lostReason     String?        @map("lost_reason")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  deletedAt      DateTime?      @map("deleted_at")

  ownerId String? @map("owner_id")
  owner   User?   @relation(fields: [ownerId], references: [id], onDelete: SetNull)

  calls        Call[]
  activities   Activity[]
  opportunities Opportunity[]
  gameSessions GameSession[]
  aiOutputs    AIOutput[]

  @@index([status])
  @@index([score(sort: Desc)])
  @@index([ownerId])
  @@index([createdAt(sort: Desc)])
  @@map("leads")
}

model Contact {
  id        String      @id @default(uuid())
  name      String
  phone     String?
  email     String?
  type      ContactType
  company   String?
  notes     String?
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  @@map("contacts")
}

model Call {
  id              String     @id @default(uuid())
  vapiCallId      String?    @unique @map("vapi_call_id")
  direction       CallDirection @default(inbound)
  transcript      String?
  summary         String?
  sentiment       Sentiment?
  durationSeconds Int?       @map("duration_seconds")
  recordingUrl    String?    @map("recording_url")
  callerPhone     String?    @map("caller_phone")
  metadata        Json       @default("{}")
  createdAt       DateTime   @default(now()) @map("created_at")

  leadId String @map("lead_id")
  lead   Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId, createdAt(sort: Desc)])
  @@map("calls")
}

model Activity {
  id          String         @id @default(uuid())
  type        ActivityType
  title       String
  notes       String?
  dueAt       DateTime?      @map("due_at")
  completedAt DateTime?      @map("completed_at")
  status      ActivityStatus @default(pending)
  priority    Priority       @default(medium)
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  leadId String @map("lead_id")
  lead   Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)

  userId String? @map("user_id")
  user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([leadId, dueAt])
  @@index([userId, dueAt])
  @@map("activities")
}

model Opportunity {
  id            String           @id @default(uuid())
  unitType      String?          @map("unit_type") @db.VarChar(50)
  tower         String?          @db.VarChar(10)
  valueEstimate BigInt?          @map("value_estimate")
  probability   Int              @default(50)
  stage         OpportunityStage @default(qualification)
  expectedClose DateTime?        @map("expected_close") @db.Date
  notes         String?
  createdAt     DateTime         @default(now()) @map("created_at")
  updatedAt     DateTime         @updatedAt @map("updated_at")

  leadId String @map("lead_id")
  lead   Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@map("opportunities")
}

model GameSession {
  id               String     @id @default(uuid())
  visitorName      String?    @map("visitor_name")
  visitorPhone     String?    @map("visitor_phone")
  visitorEmail     String?    @map("visitor_email")
  lifestyle        Lifestyle?
  unitType         UnitType?  @map("unit_type")
  viewPreference   ViewPreference? @map("view_preference")
  budgetRange      String?    @map("budget_range") @db.VarChar(100)
  amenityPriorities Json      @default("[]") @map("amenity_priorities")
  aiRecommendation String?    @map("ai_recommendation")
  score            Int        @default(0)
  completed        Boolean    @default(false)
  createdAt        DateTime   @default(now()) @map("created_at")

  leadId String? @map("lead_id")
  lead   Lead?   @relation(fields: [leadId], references: [id], onDelete: SetNull)

  @@index([leadId])
  @@map("game_sessions")
}

model AIOutput {
  id            String       @id @default(uuid())
  type          AIOutputType
  promptVersion String?      @map("prompt_version") @db.VarChar(50)
  inputContext  Json?        @map("input_context")
  output        String
  model         String       @default("claude-sonnet-4-20250514") @db.VarChar(100)
  tokensUsed    Int?         @map("tokens_used")
  createdAt     DateTime     @default(now()) @map("created_at")

  leadId String @map("lead_id")
  lead   Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId, type, createdAt(sort: Desc)])
  @@map("ai_outputs")
}
```

---

## 7. API Routes

### 7.1 Core CRUD

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/leads` | List leads. Query params: `status`, `owner`, `scoreMin`, `scoreMax`, `search`, `page`, `limit` |
| `POST` | `/api/leads` | Create lead. Body: `{ name, phone?, email?, source, budgetMin?, budgetMax?, preferredUnit?, preferredView?, urgency? }` |
| `GET` | `/api/leads/[id]` | Get lead with relations (calls, activities, aiOutputs, gameSessions, owner) |
| `PATCH` | `/api/leads/[id]` | Update lead fields. Auto-recalculates score if relevant fields change |
| `DELETE` | `/api/leads/[id]` | Soft delete (sets `deletedAt`) |
| `GET` | `/api/leads/[id]/timeline` | Get merged timeline of calls + activities + aiOutputs sorted by date |
| `GET` | `/api/calls` | List calls. Query: `leadId`, `sentiment`, `page`, `limit` |
| `GET` | `/api/calls/[id]` | Get call with full transcript and lead info |
| `GET` | `/api/activities` | List activities. Query: `leadId`, `userId`, `status`, `type`, `overdue` |
| `POST` | `/api/activities` | Create activity/task |
| `PATCH` | `/api/activities/[id]` | Update status, mark complete |

### 7.2 Dashboard

| Method | Route | Returns |
|--------|-------|---------|
| `GET` | `/api/dashboard/stats` | `{ totalLeads, hotLeads, viewingsBooked, conversionRate, monthOverMonth }` |
| `GET` | `/api/dashboard/hot-leads` | Top 5 leads by score with owner info |
| `GET` | `/api/dashboard/recent-calls` | Latest 5 calls with lead name and AI summary |
| `GET` | `/api/dashboard/pipeline-counts` | Count of leads per pipeline stage |
| `GET` | `/api/dashboard/ai-recommendations` | 3 AI-generated priority actions |

### 7.3 AI

| Method | Route | Input | Output |
|--------|-------|-------|--------|
| `POST` | `/api/ai/summarise` | `{ leadId }` | `{ summary, interestLevel, keyRequirements, concerns, nextAction }` |
| `POST` | `/api/ai/score` | `{ leadId }` | `{ score, breakdown: { budget, urgency, engagement, specificity, recency, sentiment } }` |
| `POST` | `/api/ai/follow-up` | `{ leadId, channel: 'whatsapp' \| 'email' }` | `{ message, subject? }` |
| `POST` | `/api/ai/call-analysis` | `{ callId }` | `{ intentLevel, interests, budgetIndicators, objections, commitmentSignals, missedOpportunities, followUpStrategy }` |
| `POST` | `/api/ai/game-recommend` | `{ gameSessionId }` | `{ recommendation, unitType, tower, view, reasoning }` |

### 7.4 Webhooks (No Auth — Validate Origin)

| Method | Route | Source | Action |
|--------|-------|--------|--------|
| `POST` | `/api/webhooks/vapi` | Vapi.ai | Parse end-of-call-report → create/update lead + call record → trigger AI + OpenClaw |
| `POST` | `/api/webhooks/game` | Website game widget | Store game session → create/link lead → generate recommendation |
| `POST` | `/api/webhooks/enquiry` | Website contact form | Create lead from form submission |

### 7.5 API Response Format

```typescript
// Success
{
  data: T,
  meta?: { total: number, page: number, limit: number }
}

// Error
{
  error: {
    code: string,        // e.g. "LEAD_NOT_FOUND"
    message: string,     // Human-readable
    details?: unknown    // Validation errors, etc.
  }
}
```

---

## 8. Page & Component Specifications

### 8.1 Root Layout (`app/layout.tsx`)

- Full viewport height, flex row
- Left: `<Sidebar />` (280px, fixed, navy, desktop only)
- Right: flex column → `<TopBar />` + scrollable main content area
- Main content: `bg-cream`, `min-h-screen`
- On mobile (< 1024px): sidebar collapses to hamburger menu

### 8.2 Sidebar (`components/layout/Sidebar.tsx`)

```
┌──────────────────────────┐
│  [Arkadians Logo - Gold] │  ← Playfair Display, gold on navy
│                          │
│  ▎ Command Centre        │  ← Gold left border = active
│    Pipeline              │
│    Prospects              │
│    Calls                 │
│    Activities            │
│    Buyer Game            │
│    Construction          │
│    ─────────────         │
│    Settings              │
│                          │
│                          │
│  ┌──────────────────┐   │
│  │ 👤 Ahmad Raza    │   │  ← User avatar + name + role
│  │    Sales Manager  │   │
│  │    [Logout]       │   │
│  └──────────────────┘   │
└──────────────────────────┘
```

- Width: 280px, `bg-navy`, `text-white`
- Active item: 3px gold left border, `bg-navy-light`, `text-gold`
- Inactive items: `text-gray-400`, hover → `text-white bg-navy-light`
- Each item: Lucide icon (20px) + label, 48px row height, 16px left padding
- Logo area: 80px height with bottom border `border-b border-navy-light`
- User section: absolute bottom, 80px height, top border

### 8.3 Dashboard Page (`app/page.tsx`)

```
┌──────────────────────────────────────────────────────────────┐
│  Good morning, Ahmad                         🔍  🔔  👤     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Total   │ │ Hot     │ │ Viewings│ │ Convert │          │
│  │ Leads   │ │ Leads   │ │ Booked  │ │ Rate    │          │
│  │  147    │ │  12 🔥  │ │  8      │ │  23.4%  │          │
│  │ +12% ↑  │ │ +3 ↑    │ │ +2 ↑    │ │ -1.2% ↓ │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                              │
│  ┌────── Hot Prospects ──────┐ ┌──── Recent Calls ────────┐ │
│  │                           │ │                           │ │
│  │ 🟡 92  Ahmed Khan        │ │ 📞 Fatima Ali  3:42      │ │
│  │    PKR 8-15Cr • Penthse  │ │    Positive • 3-bed sea  │ │
│  │    Last: 2 days ago       │ │                           │ │
│  │                           │ │ 📞 Hassan Malik  5:18    │ │
│  │ 🟡 87  Fatima Syed       │ │    Neutral • Pricing Q   │ │
│  │    PKR 5-8Cr • 4-Bed     │ │                           │ │
│  │    Last: Today            │ │ 📞 Sara Khan  2:55       │ │
│  │                           │ │    Positive • Viewing     │ │
│  │ 🟠 78  Omar Raza         │ │                           │ │
│  │    PKR 3-5Cr • 3-Bed     │ │                           │ │
│  └───────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│  ┌────────────── AI Recommendations ────────────────────────┐│
│  │ 💡 Call Ahmed Khan — high intent, no contact in 3 days   ││
│  │ 💡 Send payment plan to Fatima Syed — she asked twice    ││
│  │ 💡 Follow up Omar Raza — game shows penthouse interest   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌────────────── Pipeline Overview ─────────────────────────┐│
│  │ New(34)  Contacted(28)  Viewing(8)  Negotiating(5)  ✅12 ││
│  │ ████████ ██████         ███         ██              ████ ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**StatCard.tsx Props:**
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change: number;          // percentage change
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
  accentColor?: string;    // override for hot leads (amber), etc.
}
```

### 8.4 Pipeline / Kanban (`app/pipeline/page.tsx`)

- Uses `@hello-pangea/dnd` for drag-and-drop
- 6 columns: New → Contacted → Viewing Booked → Negotiating → Closed Won → Closed Lost
- Each column has: stage name, count badge, colour-coded header bar (3px top border)
- Each card (`LeadCard.tsx`):

```
┌─────────────────────────┐
│ Ahmed Khan          92 🟡│  ← Name + score badge
│ PKR 8-15 Cr             │  ← Budget range
│ 🏠 Penthouse • 🌊 Sea  │  ← Unit + view icons
│ 📅 3 days in stage      │  ← Days counter
│ 👤 Ahmad R.             │  ← Assigned rep avatar + name
└─────────────────────────┘
```

- On drag end → `PATCH /api/leads/[id]` with new `status`
- Score badge colours: 0-39 `bg-gray-300`, 40-69 `bg-amber-400`, 70-89 `bg-gold`, 90-100 `bg-green-400 ring-2 ring-gold`
- Column stage colours: New `border-navy`, Contacted `border-gold`, Viewing `border-amber-500`, Negotiating `border-purple-500`, Won `border-green-500`, Lost `border-gray-400`

### 8.5 Lead Detail (`app/leads/[id]/page.tsx`)

Three-column layout on desktop (grid `grid-cols-[2fr_1.5fr_1fr]`):

**Left Column — Lead Profile:**
- Name (Playfair Display, 28px), phone, email
- Source badge, status badge
- Budget range display (formatted PKR)
- Unit preference + view preference with icons
- `<ScoreGauge />` — circular SVG, 120px diameter
- Assigned rep with avatar
- Tags row: language, urgency, broker/direct
- Edit button → inline edit mode

**Centre Column — Activity Timeline:**
- Vertical timeline with left-border line (gold)
- Each entry: timestamp, type icon, title, summary, actor
- Types differentiated by icon + colour (call=blue, email=purple, whatsapp=green, viewing=amber, note=grey)
- Quick-action bar at top: "Log Call" | "Add Note" | "Schedule Viewing" | "Send Follow-up"
- Each action opens a modal/drawer

**Right Column — AI Panel:**
- **AI Summary**: Card with Claude-generated lead summary, "Regenerate" button
- **Next Best Action**: Single recommended action with "Execute" button
- **Follow-up Draft**: Tabbed (WhatsApp | Email), editable textarea, "Copy" + "Regenerate" buttons
- **Game Results**: If buyer played the game, show their choices and AI recommendation

### 8.6 ScoreGauge.tsx

```typescript
interface ScoreGaugeProps {
  score: number;      // 0-100
  size?: number;      // default 120
  showLabel?: boolean; // default true
}
```

- Circular SVG: navy track (stroke `#E2E8F0`), gold fill arc
- Score number centred in large font (Inter 700)
- Colour shifts: 0-39 `#A0AEC0`, 40-69 `#ED8936`, 70-89 `#C9A84C`, 90-100 `#48BB78`
- Animate on mount: fill sweeps from 0 to value over 800ms ease-out

### 8.7 FollowUpGenerator.tsx

```typescript
interface FollowUpGeneratorProps {
  leadId: string;
  leadName: string;
}
```

- "Generate Follow-up" gold button
- On click: POST to `/api/ai/follow-up` with `channel: 'whatsapp'`, then `channel: 'email'`
- Loading state: gold shimmer skeleton
- Result: two tabs (WhatsApp | Email)
- Each tab: editable `<textarea>` with the draft, plus "Copy to Clipboard" and "Regenerate" buttons
- Copy button → brief "Copied!" toast notification

### 8.8 Call Table & Transcript Viewer

**CallTable columns:** Date/Time, Lead Name, Duration (formatted mm:ss), Sentiment icon (😊/😐/😟), Summary (truncated 100 chars), Actions (expand, analyse)

**TranscriptViewer:** Full transcript with speaker labels (Agent / Caller), alternating alignment (agent left, caller right, chat-bubble style). "Analyse" button triggers POST `/api/ai/call-analysis` and shows structured analysis below.

### 8.9 Construction Progress (`app/construction/page.tsx`)

Vertical timeline with 5 milestones:

| Phase | Label | Status Options |
|-------|-------|---------------|
| 1 | Foundation & Piling | completed / in_progress / upcoming |
| 2 | Structural Framework | completed / in_progress / upcoming |
| 3 | Interiors & MEP | completed / in_progress / upcoming |
| 4 | Amenities & Landscaping | completed / in_progress / upcoming |
| 5 | Handover & Possession | completed / in_progress / upcoming |

Each milestone card: phase name, estimated dates, progress percentage bar (gold fill), description, optional photo placeholder. Completed phases: green check, gold connector line. Current phase: pulsing gold dot. Future phases: grey, dashed connector.

---

## 9. Vapi Voice Agent Integration

### 9.1 Assistant System Prompt

```
You are the AI Concierge for The Arkadians — Pakistan's most prestigious luxury residential development located in DHA Phase 8, Karachi.

YOUR ROLE: Warmly engage potential buyers and capture their requirements through natural conversation.

CAPTURE THESE DETAILS (naturally, not as an interrogation):
1. Full name
2. Phone number (if not already known from caller ID)
3. Preferred unit type: 2-bedroom suite, 3-bedroom suite, 3-bedroom large, 4-bedroom duplex, or penthouse
4. Budget range in PKR (guide: 2-bed starts ~1Cr, penthouses 15Cr+)
5. Preferred view: Arabian Sea panorama, Golf Course greens, City skyline, or dual
6. Urgency: just exploring, planning within 6 months, or ready to proceed
7. Preferred language for follow-up
8. Whether they would like to book a private viewing

TONE RULES:
- Luxury concierge, never salesy or pushy
- Say "residences" not "apartments" or "flats"
- Say "private viewing" not "site visit"
- Say "investment" not "purchase" when discussing budget
- Speak as if welcoming royalty to their future home
- Be warm, not stiff — this is hospitality, not banking

KEY PROJECT FACTS TO REFERENCE NATURALLY:
- 13 towers, up to 34 storeys, spanning 43 acres
- Overlooking the Arabian Sea creek and DHA Golf and Country Club
- Masterplanned by ATKINS, world-renowned architects
- Units: 2-bed to 5-bed penthouse (up to 16,445 sq ft)
- 6-foot wide continuous terraces on every unit
- Amenities: pool deck (temperature-controlled), spa, health club, tennis, padel, badminton, library, mosque, community halls, rooftop gardens, conference rooms, children's play areas
- 24/7 security, gated community, multi-layered protocol
- Tagline: "Modern Living for Urban Royalty"

END THE CALL GRACEFULLY:
Always thank them warmly and confirm next steps. If they want a viewing, confirm the preferred date/time. Sign off: "Thank you for your interest in The Arkadians. We look forward to welcoming you."
```

### 9.2 Vapi Webhook Handler (`/api/webhooks/vapi/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLeadSummary, calculateScore } from "@/lib/claude";
import { notifyOpenClaw } from "@/lib/openclaw";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Vapi sends different message types — we want end-of-call-report
    if (payload.message?.type !== "end-of-call-report") {
      return NextResponse.json({ received: true });
    }

    const report = payload.message;
    const transcript = report.transcript || "";
    const summary = report.summary || "";
    const duration = report.endedReason === "hangup"
      ? Math.round((new Date(report.endedAt).getTime() - new Date(report.startedAt).getTime()) / 1000)
      : report.durationSeconds || 0;

    // Extract structured data from analysis (if configured in Vapi)
    const analysis = report.analysis || {};

    // Find or create lead by phone
    const callerPhone = report.customer?.number || report.phoneNumber?.number || null;

    let lead = callerPhone
      ? await prisma.lead.findFirst({ where: { phone: callerPhone, deletedAt: null } })
      : null;

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: analysis.name || "Voice Lead (Pending)",
          phone: callerPhone,
          source: "website_voice",
          status: "new",
          urgency: "medium",
        },
      });
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        leadId: lead.id,
        vapiCallId: report.callId || report.id,
        direction: "inbound",
        transcript,
        summary,
        durationSeconds: duration,
        recordingUrl: report.recordingUrl || null,
        callerPhone,
        metadata: payload,
      },
    });

    // Generate AI summary and score (async, don't block response)
    generateLeadSummary(lead.id).catch(console.error);
    calculateScore(lead.id).catch(console.error);

    // Notify OpenClaw
    notifyOpenClaw({
      type: "new_voice_lead",
      leadId: lead.id,
      leadName: lead.name,
      phone: lead.phone,
      summary: summary || "New voice call — summary pending",
    }).catch(console.error);

    return NextResponse.json({ success: true, leadId: lead.id, callId: call.id });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### 9.3 Website Widget Embed

Add to `thearkadians.com` (in the `<head>` or before `</body>`):

```html
<!-- Vapi Voice Widget -->
<script>
  var vapiInstance = null;
  const assistant = "YOUR_ASSISTANT_ID"; // from Vapi dashboard
  const apiKey = "YOUR_PUBLIC_API_KEY";  // public key only

  (function (d, t) {
    var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
    g.src = "https://cdn.vapi.ai/widget.js";
    g.defer = true;
    g.onload = function () {
      vapiInstance = window.vapiSDK.run({
        apiKey: apiKey,
        assistant: assistant,
        config: {
          position: "bottom-right",
          offset: "40px",
          width: "50px",
          height: "50px",
          idle: {
            color: "#C9A84C",          // Gold
            type: "pill",
            title: "Speak to Arkadians AI",
            subtitle: "Your luxury concierge",
            icon: "https://thearkadians.com/mic-icon.svg",
          },
          active: {
            color: "#0A1628",          // Navy
            title: "Listening...",
            subtitle: "Speak naturally",
          },
        },
      });
    };
    s.parentNode.insertBefore(g, s);
  })(document, "script");
</script>
```

---

## 10. AI Engine (Claude Integration)

### 10.1 Claude Client Setup (`lib/claude.ts`)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-20250514";

// ─── LEAD SUMMARY ─────────────────────────────────────────

export async function generateLeadSummary(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { calls: { orderBy: { createdAt: "desc" }, take: 3 }, gameSessions: true },
  });
  if (!lead) throw new Error("Lead not found");

  const transcripts = lead.calls.map(c => c.transcript).filter(Boolean).join("\n---\n");
  const gameData = lead.gameSessions.length > 0
    ? JSON.stringify(lead.gameSessions[0])
    : "No game data";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `You are a luxury real estate sales analyst for The Arkadians, Pakistan's premier residential development. Analyse this lead and provide a concise, actionable summary. Format your response as:
PROFILE: [one-line buyer profile]
INTEREST: [Hot/Warm/Cool]
REQUIREMENTS: [key requirements in bullet points]
CONCERNS: [any objections or concerns noted]
NEXT ACTION: [single recommended next step]`,
    messages: [{
      role: "user",
      content: `Lead: ${lead.name}
Phone: ${lead.phone || "N/A"}
Source: ${lead.source}
Budget: ${lead.budgetMin || "?"}-${lead.budgetMax || "?"} PKR
Unit: ${lead.preferredUnit || "Not specified"}
View: ${lead.preferredView || "Not specified"}
Urgency: ${lead.urgency}
Status: ${lead.status}
Days since creation: ${Math.floor((Date.now() - lead.createdAt.getTime()) / 86400000)}

Call transcripts:
${transcripts || "No calls yet"}

Game results:
${gameData}`,
    }],
  });

  const output = response.content[0].type === "text" ? response.content[0].text : "";

  await prisma.aIOutput.create({
    data: {
      leadId,
      type: "summary",
      promptVersion: "v1.0",
      inputContext: { leadName: lead.name, source: lead.source },
      output,
      model: MODEL,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    },
  });

  return output;
}

// ─── FOLLOW-UP GENERATOR ──────────────────────────────────

export async function generateFollowUp(
  leadId: string,
  channel: "whatsapp" | "email"
) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      calls: { orderBy: { createdAt: "desc" }, take: 1 },
      aiOutputs: { where: { type: "summary" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!lead) throw new Error("Lead not found");

  const lastSummary = lead.aiOutputs[0]?.output || "No previous summary";
  const lastCall = lead.calls[0]?.summary || "No recent call";

  const channelGuide = channel === "whatsapp"
    ? "Write a warm WhatsApp message. Keep it under 200 words. Use a friendly but professional tone. No formal salutations — start with their name. Include one specific detail from their requirements. End with a clear next step (e.g., suggest a private viewing date)."
    : "Write a professional email. Include a subject line on the first line prefixed with 'Subject: '. Keep body under 300 words. Formal but warm tone. Reference specific interests. Include clear CTA.";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: `You are a luxury real estate relationship manager for The Arkadians, Pakistan's most prestigious residential development in DHA Phase 8, Karachi. ${channelGuide}

RULES:
- Never be pushy or salesy
- Use "residence" not "apartment", "private viewing" not "site visit"
- Mention The Arkadians by name
- Reference specific details the buyer mentioned
- Tone: five-star hotel concierge, warm and personal`,
    messages: [{
      role: "user",
      content: `Lead: ${lead.name}
Budget: ${lead.budgetMin}-${lead.budgetMax} PKR
Preferred: ${lead.preferredUnit || "TBD"}, ${lead.preferredView || "TBD"} view
Status: ${lead.status}
Days since contact: ${Math.floor((Date.now() - lead.updatedAt.getTime()) / 86400000)}
Last call summary: ${lastCall}
AI summary: ${lastSummary}
Channel: ${channel}`,
    }],
  });

  const output = response.content[0].type === "text" ? response.content[0].text : "";

  await prisma.aIOutput.create({
    data: {
      leadId,
      type: channel === "whatsapp" ? "follow_up_whatsapp" : "follow_up_email",
      promptVersion: "v1.0",
      output,
      model: MODEL,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    },
  });

  return output;
}
```

### 10.2 Lead Scoring (`lib/scoring.ts`)

```typescript
import { prisma } from "./prisma";

interface ScoreBreakdown {
  budget: number;
  urgency: number;
  engagement: number;
  specificity: number;
  recency: number;
  sentiment: number;
  total: number;
}

export async function calculateScore(leadId: string): Promise<ScoreBreakdown> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      calls: true,
      gameSessions: true,
      activities: { where: { type: "viewing", status: { not: "cancelled" } } },
    },
  });
  if (!lead) throw new Error("Lead not found");

  // Budget score (25% weight)
  const budgetMax = Number(lead.budgetMax || 0);
  let budgetScore = 0;
  if (budgetMax >= 150_000_000) budgetScore = 100;      // 15Cr+
  else if (budgetMax >= 80_000_000) budgetScore = 85;    // 8-15Cr
  else if (budgetMax >= 50_000_000) budgetScore = 70;    // 5-8Cr
  else if (budgetMax >= 30_000_000) budgetScore = 55;    // 3-5Cr
  else if (budgetMax >= 10_000_000) budgetScore = 40;    // 1-3Cr
  else budgetScore = 20;

  // Urgency score (20% weight)
  const urgencyMap: Record<string, number> = {
    immediate: 100, high: 85, medium: 50, low: 20,
  };
  const urgencyScore = urgencyMap[lead.urgency] || 50;

  // Engagement score (20% weight)
  let engagementScore = 0;
  if (lead.calls.length > 0) engagementScore += 30;
  if (lead.calls.length > 2) engagementScore += 15;
  if (lead.gameSessions.some(g => g.completed)) engagementScore += 25;
  if (lead.activities.length > 0) engagementScore += 30; // viewing booked
  engagementScore = Math.min(engagementScore, 100);

  // Specificity score (15% weight)
  let specificityScore = 0;
  if (lead.preferredUnit) specificityScore += 40;
  if (lead.preferredView) specificityScore += 30;
  if (lead.preferredTower) specificityScore += 30;
  specificityScore = Math.min(specificityScore, 100);

  // Recency score (10% weight)
  const daysSinceUpdate = (Date.now() - lead.updatedAt.getTime()) / 86_400_000;
  let recencyScore = 100;
  if (daysSinceUpdate > 30) recencyScore = 10;
  else if (daysSinceUpdate > 14) recencyScore = 30;
  else if (daysSinceUpdate > 7) recencyScore = 50;
  else if (daysSinceUpdate > 1) recencyScore = 80;

  // Sentiment score (10% weight)
  const latestCall = lead.calls.find(c => c.sentiment);
  const sentimentMap: Record<string, number> = {
    positive: 100, neutral: 50, negative: 20,
  };
  const sentimentScore = latestCall?.sentiment
    ? sentimentMap[latestCall.sentiment] || 50
    : 50;

  // Weighted total
  const total = Math.round(
    budgetScore * 0.25 +
    urgencyScore * 0.20 +
    engagementScore * 0.20 +
    specificityScore * 0.15 +
    recencyScore * 0.10 +
    sentimentScore * 0.10
  );

  const clampedTotal = Math.max(0, Math.min(100, total));

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: { score: clampedTotal },
  });

  return {
    budget: budgetScore,
    urgency: urgencyScore,
    engagement: engagementScore,
    specificity: specificityScore,
    recency: recencyScore,
    sentiment: sentimentScore,
    total: clampedTotal,
  };
}
```

---

## 11. OpenClaw Orchestration

### 11.1 What OpenClaw Does Here

OpenClaw is the **notification and automation layer**. It does NOT store data or serve UI. The CRM backend fires events to OpenClaw, which then:

- Sends Telegram/Slack messages to sales team
- Creates scheduled reminders
- Generates end-of-day summaries
- Monitors for missed follow-ups

### 11.2 Notification Sender (`lib/openclaw.ts`)

```typescript
const OPENCLAW_WEBHOOK_URL = process.env.OPENCLAW_WEBHOOK_URL || "http://openclaw:3001/webhook";

interface OpenClawEvent {
  type: "new_voice_lead" | "hot_lead" | "game_complete" | "missed_followup" | "daily_summary";
  leadId?: string;
  leadName?: string;
  phone?: string;
  summary?: string;
  score?: number;
  data?: Record<string, unknown>;
}

export async function notifyOpenClaw(event: OpenClawEvent): Promise<void> {
  try {
    const response = await fetch(OPENCLAW_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        source: "arkadians-crm",
      }),
    });
    if (!response.ok) {
      console.error(`OpenClaw notification failed: ${response.status}`);
    }
  } catch (error) {
    console.error("OpenClaw notification error:", error);
    // Don't throw — notifications should never block CRM operations
  }
}
```

### 11.3 OpenClaw Trigger Map

| CRM Event | Trigger | Telegram Message |
|-----------|---------|-----------------|
| New lead from voice (any score) | `new_voice_lead` | 📞 **New Call Lead**: {name} \| {phone} \| Summary: {summary} \| Action: {next_action} |
| Lead score ≥ 80 | `hot_lead` | 🔥 **Hot Lead Alert**: {name} \| Score: {score} \| Budget: {budget} \| Unit: {unit} \| Assigned: {rep} |
| Game completed with budget ≥ 5Cr | `game_complete` | 🎮 **High-Value Game**: {name} \| Budget: {budget} \| Preferred: {unit} {view} \| Auto-generating premium follow-up |
| Activity overdue > 24h | `missed_followup` | ⚠️ **Overdue**: {lead_name} \| Task: {task} \| Assigned: {rep} \| {days} days overdue |
| Daily 6 PM PKT | `daily_summary` | 📊 **Daily Brief**: {hot_count} hot leads \| {new_count} new today \| {overdue_count} overdue \| {viewings_tomorrow} viewings tomorrow |

### 11.4 OpenClaw Telegram Setup

1. Message `@BotFather` on Telegram → `/newbot` → name it "Arkadians CRM Bot"
2. Save the bot token → add to `.env` as `TELEGRAM_BOT_TOKEN`
3. Create Telegram groups: "Arkadians Sales Alerts", "Arkadians Management"
4. Add the bot to both groups
5. Get group chat IDs: send a message in each group, then call `https://api.telegram.org/bot{TOKEN}/getUpdates` — find the `chat.id` (negative number)
6. Add chat IDs to `.env` as `TELEGRAM_SALES_CHAT_ID` and `TELEGRAM_MGMT_CHAT_ID`
7. Configure OpenClaw to route events → appropriate chat

---

## 12. Interactive Buyer Game

### 12.1 Game Flow: "Build Your Arkadians Residence"

6 steps, each a full-screen panel with smooth slide transitions:

**Step 1 — Lifestyle**
> "What best describes your lifestyle?"
- 🏡 Family Living
- 💼 Professional
- 📈 Investor
- 🌴 Retiree
- ✨ Luxury Seeker

**Step 2 — Space**
> "How much space does your ideal residence need?"
- 🛏️ Cosy 2-Bedroom Suite
- 🛏️🛏️ Spacious 3-Bedroom Suite
- 🛏️🛏️🛏️ Grand 3-Bedroom Large
- 🏠 Executive 4-Bedroom Duplex
- 👑 The Penthouse (up to 16,445 sq ft)

**Step 3 — View**
> "Which view inspires you most?"
- 🌊 Arabian Sea Panorama
- ⛳ Golf Course Greens
- 🏙️ City Skyline
- 🌊⛳ Dual Sea & Golf (Premium)

**Step 4 — Budget**
> "What is your investment range?"
- PKR 1 – 3 Crore
- PKR 3 – 5 Crore
- PKR 5 – 8 Crore
- PKR 8 – 15 Crore
- PKR 15 Crore+

**Step 5 — Amenities (Drag to Rank)**
> "Rank the amenities most important to you"
Draggable list: Pool & Spa, Fitness Centre, Tennis & Padel, Library, Rooftop Events, Children's Play Area, Mosque, Business Centre

**Step 6 — Contact**
> "Almost there! Let us prepare your personalised residence recommendation."
- Name (required)
- Phone (required)
- Email (optional)
- Preferred contact time (optional)

### 12.2 Game Visual Design

- Full-viewport dark navy background
- Subtle gold particle effect or gradient mesh background
- Progress bar at top: gold fill, 6 segments
- Options as large visual cards (200px+ height), not radio buttons
- Cards: cream background, navy text, gold border on hover, scale(1.02) transform
- Selected card: gold background with white text, gold glow shadow
- Transition between steps: `translateX` slide, 300ms ease-in-out
- Step 5 uses `@hello-pangea/dnd` vertical list with numbered positions
- Final results: premium card with gold border, unit recommendation, tower suggestion, and "Book Private Viewing" CTA

### 12.3 Results Screen

After submitting, POST to `/api/game-sessions` → Claude generates recommendation:

```
┌──────────────────────────────────────────┐
│         🏆 Your Ideal Residence          │
│                                          │
│    3-Bedroom Large Suite                 │
│    Tower A • Arabian Sea View            │
│    Floor 20-28 (recommended)             │
│                                          │
│    "Based on your preference for         │
│    family living with a premium          │
│    sea-facing view and your budget       │
│    range, we recommend..."              │
│                                          │
│    ┌──────────────────────────────┐      │
│    │  📞 Book Your Private Viewing │      │  ← Gold gradient button
│    └──────────────────────────────┘      │
│                                          │
│    Or call: +92(21) 3525-0361            │
└──────────────────────────────────────────┘
```

---

## 13. Authentication & Security

### 13.1 NextAuth Setup (`lib/auth.ts`)

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || user.status !== "active") return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.userId = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
```

### 13.2 Security Checklist (Phase 1)

- [x] All API routes check for valid session (except webhooks)
- [x] Webhook endpoints validate origin (Vapi IPs or signature)
- [x] HTTPS enforced via Caddy auto-SSL
- [x] Environment variables in `.env`, never in client code
- [x] Passwords hashed with bcrypt (cost 12)
- [x] Rate limiting on webhook routes (60/min)
- [x] Soft deletes — no hard data removal
- [x] Input validation with Zod on all POST/PATCH routes
- [x] SQL injection prevented by Prisma parameterised queries
- [x] CORS configured for production domain only

---

## 14. Docker & Deployment

### 14.1 Environment Variables (`.env.example`)

```env
# ─── Database ───
DATABASE_URL=postgresql://arkadians:CHANGE_ME_STRONG_PASSWORD@postgres:5432/arkadians_crm

# ─── AI ───
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# ─── Vapi ───
VAPI_API_KEY=your-vapi-api-key
VAPI_ASSISTANT_ID=your-assistant-id

# ─── Auth ───
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://crm.thearkadians.com

# ─── OpenClaw ───
OPENCLAW_WEBHOOK_URL=http://openclaw:3001/webhook

# ─── Telegram ───
TELEGRAM_BOT_TOKEN=7123456789:AAF-your-bot-token
TELEGRAM_SALES_CHAT_ID=-1001234567890
TELEGRAM_MGMT_CHAT_ID=-1009876543210
```

### 14.2 Docker Compose (`docker-compose.yml`)

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: arkadians_crm
      POSTGRES_USER: arkadians
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arkadians"]
      interval: 10s
      timeout: 5s
      retries: 5

  crm:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://arkadians:${DB_PASSWORD:-changeme}@postgres:5432/arkadians_crm
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      VAPI_API_KEY: ${VAPI_API_KEY}
      VAPI_ASSISTANT_ID: ${VAPI_ASSISTANT_ID}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
      OPENCLAW_WEBHOOK_URL: http://openclaw:3001/webhook
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  openclaw:
    image: openclaw/openclaw:latest
    volumes:
      - ./openclaw-config:/app/config
    ports:
      - "3001:3001"
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - crm
    restart: unless-stopped

volumes:
  pgdata:
  caddy_data:
  caddy_config:
```

### 14.3 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

### 14.4 Caddyfile

```
crm.thearkadians.com {
    reverse_proxy crm:3000
}
```

### 14.5 Backup Cron

```bash
# Add to crontab (crontab -e)
# Nightly backup at 2 AM
0 2 * * * docker exec arkadians-crm-postgres-1 pg_dump -U arkadians arkadians_crm | gzip > /backups/arkadians_$(date +\%Y\%m\%d).sql.gz

# Retain 14 days
0 3 * * * find /backups -name "*.sql.gz" -mtime +14 -delete
```

---

## 15. Demo Data Seeding

Create `prisma/seed.ts` with 25+ realistic leads across all pipeline stages, 10+ call records with mock transcripts, game sessions, and AI outputs. Use Pakistani names and PKR budgets.

### Sample Seed Data Shape

```typescript
const leads = [
  {
    name: "Ahmed Khan",
    phone: "+923001234567",
    email: "ahmed.khan@email.com",
    source: "website_voice",
    status: "negotiating",
    budgetMin: 80_000_000n,
    budgetMax: 150_000_000n,
    preferredUnit: "penthouse",
    preferredView: "sea",
    urgency: "high",
    score: 92,
  },
  {
    name: "Fatima Syed",
    phone: "+923009876543",
    email: "fatima.s@corp.pk",
    source: "website_game",
    status: "viewing_booked",
    budgetMin: 50_000_000n,
    budgetMax: 80_000_000n,
    preferredUnit: "four_bed_duplex",
    preferredView: "dual",
    urgency: "high",
    score: 87,
  },
  // ... 23+ more leads across all stages
];

const users = [
  { name: "Ahmad Raza", email: "ahmad@arkadians.com", role: "manager", password: "demo123" },
  { name: "Sara Malik", email: "sara@arkadians.com", role: "sales_rep", password: "demo123" },
  { name: "Hassan Ali", email: "hassan@arkadians.com", role: "sales_rep", password: "demo123" },
  { name: "Admin User", email: "admin@arkadians.com", role: "admin", password: "admin123" },
];
```

---

## 16. 7-Day Build Schedule

| Day | Focus | Deliverables |
|-----|-------|-------------|
| **Day 1** | Foundation | Finalise this spec in Cursor. Init Next.js project. Set up Prisma schema + migrations. Docker Compose with Postgres. Tailwind config with brand tokens. Seed script with demo data. Basic layout shell (sidebar + topbar). |
| **Day 2** | Dashboard & Pipeline | Build all dashboard components (stat cards, hot leads, recent calls, AI recommendations, pipeline mini). Build Kanban board with drag-and-drop. Connect to API routes. |
| **Day 3** | Leads & Backend | Lead list page with filters. Lead detail 3-column view. All CRUD API routes. Activity timeline component. Lead form (create/edit). |
| **Day 4** | Voice & Calls | Set up Vapi assistant (dashboard + system prompt). Build webhook handler. Call log page + transcript viewer. Test voice → CRM flow end-to-end. Website widget code. |
| **Day 5** | AI Layer | Claude integration: summary generator, scoring algorithm, follow-up generator, call analysis. Connect AI panels to lead detail view. Build FollowUpGenerator component with WhatsApp/email tabs. |
| **Day 6** | Game & Extras | Build buyer game (6 steps + results). Construction progress page. OpenClaw notification setup. Telegram bot connection. Test full notification flow. |
| **Day 7** | Polish & Demo | Bug fixes, responsive design pass, loading states, error states. Final demo data seeding (realistic scenarios). Prepare demo script. Rehearse the 7-step demo flow. Deploy to VPS. |

---

## 17. Acceptance Criteria

Every item must pass before demo day:

| # | Test | Pass Condition |
|---|------|---------------|
| 1 | Dashboard loads | All 4 stat cards show data. Hot leads list has 5+ entries. Recent calls visible. |
| 2 | Pipeline works | Can see leads across all stages. Can drag a lead between columns. Status updates in DB. |
| 3 | Lead detail loads | 3-column layout renders. All lead info visible. Timeline shows activities. |
| 4 | Voice agent works | Can speak to Vapi assistant. Captures buyer details. Ends call gracefully. |
| 5 | Webhook creates lead | Vapi end-of-call webhook creates a new lead record in Postgres. |
| 6 | AI summary generates | Claude summary appears on lead detail within 10 seconds. |
| 7 | Score calculates | Score badge visible on lead cards. Updates when data changes. |
| 8 | Follow-up generates | WhatsApp + email drafts generated. Copy to clipboard works. |
| 9 | Buyer game works | All 6 steps complete. AI recommendation displayed. Lead created. |
| 10 | Telegram notifies | New hot lead triggers message in Telegram sales group. |
| 11 | Responsive | Dashboard and pipeline usable on tablet (768px) and phone (375px). |
| 12 | Demo data loaded | 25+ leads, 10+ calls, mixed stages, realistic Pakistani names and budgets. |
| 13 | Brand consistent | Navy/gold throughout. Playfair + Inter fonts. Concierge language. No generic SaaS feel. |
| 14 | Auth works | Can log in with demo credentials. Unauthenticated requests rejected. |
| 15 | No errors | No console errors, no unhandled promise rejections, no broken layouts. |

---

## 18. Reference Links

| Resource | URL |
|----------|-----|
| The Arkadians Website | https://thearkadians.com |
| Vapi Quickstart | https://docs.vapi.ai/quickstart/introduction |
| Vapi Web Widget | https://docs.vapi.ai/chat/web-widget |
| Vapi Voice Widget Examples | https://docs.vapi.ai/assistants/examples/voice-widget |
| Vapi CLI (Cursor MCP) | https://vapi.ai/blog/introducing-vapi-cli |
| Anthropic Claude API | https://docs.anthropic.com |
| OpenClaw Guide | https://contabo.com/blog/what-is-openclaw-self-hosted-ai-agent-guide/ |
| Contabo OpenClaw Hosting | https://contabo.com/en/openclaw-hosting/ |
| Hostinger OpenClaw | https://www.hostinger.com/vps/docker/openclaw |
| Prisma ORM | https://www.prisma.io/docs |
| Next.js Docs | https://nextjs.org/docs |
| shadcn/ui | https://ui.shadcn.com |
| Tailwind CSS | https://tailwindcss.com/docs |
| @hello-pangea/dnd | https://github.com/hello-pangea/dnd |
| Recharts | https://recharts.org |
| Lucide Icons | https://lucide.dev |

---

## Demo Presentation Script

| Step | Show | Say |
|------|------|-----|
| 1 | Arkadians website with voice button | "We've added an AI concierge layer to your website without replacing the brand site." |
| 2 | Speak to the Vapi voice agent | "The agent captures buyer intent, budget, residence type, and visit preference — all through natural conversation." |
| 3 | CRM dashboard updates live | "The CRM receives the call and creates a lead automatically. No manual data entry." |
| 4 | AI summary and score on lead detail | "The sales team instantly sees who is hot and what to do next." |
| 5 | Generate follow-up message | "One click generates a personalised WhatsApp or email follow-up — ready to send." |
| 6 | Interactive buyer game | "This turns casual website browsing into structured buyer qualification data." |
| 7 | Management dashboard view | "Leadership sees the full pipeline, viewing requests, call activity, and sales priorities — all in real time." |

---

> **Built for The Arkadians — Modern Living for Urban Royalty**
>
> *The Arkadians AI Sales & Experience CRM — PRD v1.0 — 27 April 2026*
