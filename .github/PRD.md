# AdVize — Product Requirements Document (PRD)

> **Version**: 1.0  
> **Last Updated**: 2026-02-19  
> **Author**: Oussama  
> **Status**: Approved for Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [User Persona](#4-user-persona)
5. [Technical Stack](#5-technical-stack)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 Landing Page
   - 6.2 Authentication
   - 6.3 Onboarding
   - 6.4 Dashboard
   - 6.5 Campaign Builder
   - 6.6 Campaign Analyzer
   - 6.7 Media Gallery
   - 6.8 Website Scraping
   - 6.9 PDF Export
   - 6.10 Settings
7. [AI Pipeline Architecture](#7-ai-pipeline-architecture)
8. [Database Schema](#8-database-schema)
9. [Security Plan](#9-security-plan)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Psychology Integration](#11-psychology-integration)
12. [Project Structure](#12-project-structure)
13. [Edge Functions](#13-edge-functions)
14. [Phased Delivery Plan](#14-phased-delivery-plan)
15. [Verification Plan](#15-verification-plan)
16. [Out of Scope](#16-out-of-scope)

---

## 1. Executive Summary

**AdVize** is an AI-powered Meta Ads advisor built as a Next.js web app with an InsForge backend. It helps plan, build, and optimize Meta advertising campaigns by generating complete campaign architectures (strategy, structure, audiences, ad copy, media recommendations) and analyzing active campaign performance with AI-driven diagnosis.

The user reviews, refines, and manually implements every recommendation — maintaining full control while gaining expert-level guidance. The app is designed for a single power-user initially, with the architecture to scale to multiple users in the future.

**Core Loop**: Input basics → AI generates complete plan → Review & refine → Export PDF guide → Manually implement in Meta Ads Manager.

---

## 2. Problem Statement

### The Pain

Creating effective Meta ad campaigns requires expertise in:
- Campaign architecture (objectives, adset structure, audience layering)
- Ad copywriting (hooks, frameworks, persuasion psychology)
- Audience targeting (retargeting windows, lookalike strategy, exclusions)
- Performance diagnosis (identifying what's wrong and what to change)

This knowledge takes years to build. Without it, campaigns underperform, budgets are wasted, and the feedback loop (change → wait → measure → change) is painfully slow.

### The Gap

- **Existing automation tools** (Madgicx, Revealbot) automate decisions — the user doesn't learn and becomes dependent.
- **Generic AI** (ChatGPT) can write ad copy but doesn't understand campaign architecture, can't pull real data, and lacks structured output.
- **Meta's own tools** provide basic suggestions but lack strategic depth.

### What AdVize Does Differently

AdVize generates **complete, structured campaign plans** — not just ad copy — with expert-level strategy baked in. It then analyzes real campaign data and provides **specific, actionable recommendations**. The user stays in control, learns by doing, and builds expertise over time.

---

## 3. Goals & Objectives

### Primary Goals

| Goal | Success Metric |
|------|---------------|
| Reduce campaign planning time | Plan creation in < 5 minutes (vs 1-2 hours manual) |
| Improve campaign structure quality | AI plans follow all best practices (naming, budget splits, exclusions) |
| Accelerate performance diagnosis | Identify issues and get recommendations in < 2 minutes |
| Build marketing expertise | User learns frameworks and psychology through exposure |

### North Star Metric

**Campaigns planned per week** — if the tool is useful, it gets used repeatedly.

### Secondary Metrics

- Time from "New Plan" to "Export PDF"
- Number of AI regenerations per plan (fewer = better first output)
- Number of analyzer recommendations marked as "Applied"
- AI cost per session (efficiency)

---

## 4. User Persona

### Primary Persona: The Hands-On Marketer

| Attribute | Detail |
|-----------|--------|
| **Context** | Managing 3-10 active Meta campaigns at any given time |
| **Pain Points** | Structuring campaigns from scratch takes hours; diagnosing underperformance is guesswork; writing 5+ ad copy variations is tedious |
| **Goal** | Get a complete campaign plan in minutes, then implement it confidently |
| **Technical Level** | Comfortable with Ads Manager, knows campaign/adset/ad hierarchy, understands CTR, CPC, ROAS |
| **When Using AdVize** | Planning next week's campaigns, or mid-week diagnosing underperformance |
| **Jobs to Be Done** | 1) Plan a new campaign from scratch. 2) Get copy variations quickly. 3) Diagnose why a campaign is underperforming. 4) Learn what best practices suggest. |

---

## 5. Technical Stack

### 5.1 Frontend

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 15+ (App Router) | React Server Components, async params |
| **Styling** | Vanilla CSS with design tokens | No Tailwind — full control over design system |
| **State** | React Context + Server Components | No Redux/Zustand needed |
| **Fonts** | Google Fonts via `next/font` | See Design System section |
| **Icons** | Lucide React | Consistent, clean icon set |
| **Validation** | Zod | All user input validated |

### 5.2 Backend — InsForge

| Service | Purpose |
|---------|---------|
| **Postgres Database** | Business profiles, campaign plans, analysis history, conversation logs |
| **Authentication** | OAuth login via Facebook/Meta (required for Meta API access) |
| **Cloud Storage** | Media gallery (images/videos for ad creative recommendations) |
| **Edge Functions** | Meta API data fetching, website scraping, PDF generation |
| **AI Integration (Model Gateway)** | LLM calls via OpenRouter — GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro, etc. |
| **Realtime** | Streaming AI responses via WebSocket |
| **pgvector** | Embeddings for website content and campaign data (RAG) |

### 5.3 External APIs

| API | Access | Purpose |
|-----|--------|---------|
| **Meta Marketing API** | Read-only | Pull campaign/adset/ad data and metrics |
| **Website Scraping** | User's own URL, with consent | Extract product/service data for personalized AI |

---

## 6. Feature Specifications

### 6.1 Landing Page

The landing page is the public-facing entry point. It showcases AdVize's value proposition and provides Sign Up / Login access.

#### 6.1.1 Page Structure

```
┌─────────────────────────────────────────────┐
│  NAVBAR                                     │
│  Logo "AdVize"  |  Features  Pricing  Login │
├─────────────────────────────────────────────┤
│  HERO SECTION                               │
│  Headline + Subheadline + CTA               │
│  Hero visual (app screenshot/mockup)        │
├─────────────────────────────────────────────┤
│  PROBLEM SECTION                            │
│  "The Problem with Meta Ads"                │
│  3 pain-point cards                         │
├─────────────────────────────────────────────┤
│  FEATURES SECTION                           │
│  3 feature blocks with visuals:             │
│  - Campaign Builder                         │
│  - Campaign Analyzer                        │
│  - PDF Export                               │
├─────────────────────────────────────────────┤
│  HOW IT WORKS                               │
│  4-step visual flow                         │
│  Brief → AI Plans → Review → Implement      │
├─────────────────────────────────────────────┤
│  DIFFERENTIATORS                            │
│  "Why AdVize?" — 3-4 unique selling points  │
├─────────────────────────────────────────────┤
│  SOCIAL PROOF / METRICS (future)            │
│  Stats, testimonials when available         │
├─────────────────────────────────────────────┤
│  CTA SECTION                                │
│  Final call-to-action + Sign Up button      │
├─────────────────────────────────────────────┤
│  FOOTER                                     │
│  Links, copyright, legal                    │
└─────────────────────────────────────────────┘
```

#### 6.1.2 Landing Page Copy

**Hero Section:**
- **Headline**: "Your AI-Powered Meta Ads Strategist"
- **Subheadline**: "Generate complete campaign plans, get expert ad copy, and diagnose underperformance — all in minutes, not hours."
- **CTA**: "Get Started Free" → Sign Up
- **Secondary CTA**: "See How It Works" → scrolls to How It Works section

**Problem Section — "The Problem with Running Meta Ads":**

| Card | Title | Copy |
|------|-------|------|
| 1 | "Campaign Structure is Guesswork" | "Objectives, audiences, placements, budget splits — there are dozens of decisions before you even write an ad. Most get it wrong." |
| 2 | "Writing Ads is Tedious" | "You need 3-5 copy variations per ad, tested against proven frameworks. That's hours of writing for a single campaign." |
| 3 | "Diagnosing Problems is Slow" | "Your CPA is too high. Is it the audience? The creative? The landing page? Without data-driven analysis, you're guessing." |

**Features Section:**

| Feature | Title | Description |
|---------|-------|-------------|
| Campaign Builder | "Complete Campaign Plans in Minutes" | "Tell AdVize what you're promoting and who you're targeting. Get a full campaign architecture — objectives, audiences, ad sets, copy variations — ready to implement." |
| Campaign Analyzer | "AI-Powered Performance Diagnosis" | "Connect your Meta account. AdVize pulls your campaign data, identifies what's working and what isn't, and gives you specific, actionable recommendations." |
| PDF Export | "Step-by-Step Implementation Guide" | "Export your campaign plan as a detailed PDF guide. Follow the steps in Ads Manager — no confusion, no missed settings." |

**How It Works — 4 Steps:**

| Step | Title | Description |
|------|-------|-------------|
| 1 | "Describe Your Campaign" | "Tell us what you're promoting, your budget, and your ideal customer." |
| 2 | "AI Generates Your Plan" | "AdVize creates a complete campaign structure with strategy, audiences, and ad copy variations." |
| 3 | "Review & Refine" | "Approve, edit, or regenerate any section. You're always in control." |
| 4 | "Export & Implement" | "Download your PDF guide and set up the campaign in Meta Ads Manager." |

**Differentiators — "Why AdVize?":**

| Point | Title | Description |
|-------|-------|-------------|
| 1 | "You Stay in Control" | "No automation, no black boxes. You review every decision and implement it yourself. You learn by doing." |
| 2 | "Psychology-Backed Copy" | "Ad copy generated using proven frameworks — PAS, BAB, Loss Aversion, Social Proof — not generic AI text." |
| 3 | "Complete Architecture, Not Just Copy" | "Other tools write ads. AdVize plans entire campaigns — objectives, audiences, budget splits, naming conventions, and copy." |
| 4 | "Website-Aware AI" | "Connect your website and AdVize personalizes everything — copy, offers, audiences — based on your actual products and services." |

**Final CTA Section:**
- **Headline**: "Stop Guessing. Start Planning."
- **Subheadline**: "Your next high-performing campaign is one click away."
- **CTA**: "Create Your First Campaign Plan" → Sign Up

#### 6.1.3 Landing Page Interactions

- Smooth scroll navigation from navbar links
- Scroll-triggered fade-in animations for sections (subtle, 200-300ms)
- CTA buttons have hover state with slight scale (1.02) and glow
- Hero section: subtle floating animation on the app mockup/visual
- Mobile-responsive: hamburger menu, stacked sections

---

### 6.2 Authentication

#### Flow

```
Landing Page → "Get Started" / "Login"
  → Facebook OAuth (InsForge Auth)
  → Callback handler
  → IF new user → Onboarding
  → IF returning user → Dashboard
```

#### Requirements

- **Provider**: Facebook OAuth only (required for Meta API permissions)
- **Permissions requested**: `ads_read`, `pages_show_list`, `email`, `public_profile`
- **Session**: JWT managed by InsForge, httpOnly cookies
- **Token storage**: Meta access token encrypted in Postgres
- **Token refresh**: Check expiry before each Meta API call; auto-refresh if < 1 hour remaining
- **Logout**: Clear session, revoke token option

---

### 6.3 Onboarding

**Design principle**: Progressive disclosure — one question per screen.

#### Steps

| Step | Question | Input Type | Required |
|------|----------|-----------|----------|
| 1 | "What's your business name?" | Text input | Yes |
| 2 | "What industry are you in?" | Dropdown (preset categories) | Yes |
| 3 | "What's your daily ad budget?" | Slider + preset chips ($5, $10, $20, $50, $100+) | Yes |
| 4 | "Got a website?" | URL input + consent checkbox for scraping | No |
| 5 | "Connect your Meta ad account" | OAuth button (if not already connected) | No (can skip) |
| 6 | Profile summary | Review card + "Looks good!" button | - |

#### Preset Industry Categories

```
E-commerce, Local Services, SaaS/Software, Health & Wellness,
Food & Beverage, Education, Real Estate, Fashion & Beauty,
Travel & Hospitality, Finance, Entertainment, B2B Services, Other
```

#### Post-Onboarding

- If website provided + consent → trigger scraping Edge Function in background
- Redirect to Dashboard with empty state

---

### 6.4 Dashboard

#### Layout

- **Left sidebar**: Navigation (Dashboard, Builder, Analyzer, Gallery, Settings)
- **Main area**: Campaign plan cards + quick actions

#### Content

| Element | Description |
|---------|-------------|
| **Quick Actions Bar** | "New Campaign Plan" button (primary), "Analyze Campaign" button (secondary) |
| **Campaign Plans Grid** | Cards showing: title, status badge (Draft/Approved/Exported/Archived), date, objective, strategy type |
| **Recent Analyses** | List of recent campaign analyses with health scores |
| **Empty State** | First-time: illustration + "Create your first campaign plan →" CTA |

#### Card Interactions

- Click → opens plan detail / analysis detail
- Three-dot menu → Duplicate, Archive, Delete
- Status filter tabs: All, Drafts, Approved, Exported

---

### 6.5 Campaign Builder

#### 6.5.1 Brief Form (Input)

| Field | Input Type | Required | Notes |
|-------|-----------|----------|-------|
| "What are you promoting?" | Text area (2-3 sentences) | Yes | Product, service, event, or content |
| "What's the goal?" | Radio cards: Sales / Leads / Awareness / Traffic | Yes | Maps to Meta campaign objectives |
| "Who's the ideal customer?" | Text area (1-2 sentences) | Yes | Demographics + interests description |
| "Daily budget for this campaign" | Number input (pre-filled from profile) | Yes | |
| "Any special requirements?" | Text area | No | Seasonal, promo codes, specific offers |

#### 6.5.2 AI Output Structure

The AI generates a **complete campaign architecture**:

```
Campaign Plan
├── Campaign Level
│   ├── Campaign Name (META_[Objective]_[Audience]_[Offer]_[DateCode])
│   ├── Objective (Awareness / Traffic / Engagement / Leads / Sales)
│   ├── Strategy Type (Retargeting / Lookalike / Cold / Warming / Funnel)
│   ├── Budget Allocation (% of daily budget)
│   └── Optimization Event (Purchase, Lead, AddToCart, etc.)
│
├── Ad Set Level (1-3 per campaign)
│   ├── Ad Set Name
│   ├── Audience Definition
│   │   ├── Type (Interest / Lookalike / Custom / Retargeting)
│   │   ├── Demographics (age, gender, location)
│   │   ├── Interests & Behaviors
│   │   └── Exclusions (who NOT to target)
│   ├── Placements (Automatic / Manual)
│   ├── Retargeting Window (if applicable: Hot 1-7d / Warm 7-30d / Cold 30-90d)
│   └── Budget Split (70% proven / 30% testing)
│
└── Ad Level (2-3 per ad set)
    ├── Ad Name
    ├── Format (Single Image / Carousel / Video / Collection)
    ├── Primary Text (3 variations — AI ranks best one)
    ├── Headline (3 variations — AI ranks best one)
    ├── Description (3 variations — AI ranks best one)
    ├── CTA Button (Shop Now / Learn More / Sign Up / etc.)
    ├── Copy Framework Used (PAS / BAB / Social Proof / AIDA / Loss Aversion)
    └── Media Recommendation (from gallery, with reasoning)
```

#### 6.5.3 Ad Copy Frameworks

The AI MUST use and label these frameworks:

| Framework | Structure | Best For |
|-----------|----------|----------|
| **PAS** | Problem → Agitate → Solve → CTA | Pain-point products |
| **BAB** | Before → After → Bridge → CTA | Transformation offers |
| **Social Proof Lead** | Stat/Testimonial → What you do → CTA | Trust-building |
| **AIDA** | Attention → Interest → Desire → Action | Cold audiences |
| **Loss Aversion** | What they lose by NOT acting → Solution → CTA | Urgency/scarcity |

#### 6.5.4 User Actions on a Plan

| Action | Behavior |
|--------|----------|
| **Approve** | Marks section as finalized, included in PDF |
| **Edit** | Inline editing of any field |
| **Regenerate** | AI regenerates that section with optional guidance ("make it more urgent") |
| **Regenerate All** | Full plan regeneration |
| **Export PDF** | Generates implementation guide (see 6.9) |
| **Save as Draft** | Auto-saved; explicit save also available |

#### 6.5.5 UI Layout

```
Left Panel (30%):      Right Panel (70%):
┌──────────────┐       ┌─────────────────────────────┐
│ Brief Summary│       │ Campaign Plan (expandable)   │
│              │       │                              │
│ Campaign 1 ► │       │ ┌── Campaign 1 ────────────┐ │
│ Campaign 2   │       │ │  Name: META_Conv_...      │ │
│              │       │ │  Objective: Conversions    │ │
│              │       │ │  ┌── Ad Set 1 ──────────┐ │ │
│              │       │ │  │  Audience: Lookalike  │ │ │
│              │       │ │  │  ┌── Ad 1 ─────────┐ │ │ │
│              │       │ │  │  │  Primary Text    │ │ │ │
│              │       │ │  │  │  Headline        │ │ │ │
│              │       │ │  │  │  [Approve][Edit] │ │ │ │
│              │       │ │  │  └──────────────────┘ │ │ │
│              │       │ │  └──────────────────────┘ │ │
│              │       │ └──────────────────────────┘ │
│ [Export PDF] │       │                              │
└──────────────┘       └─────────────────────────────┘
```

---

### 6.6 Campaign Analyzer

#### 6.6.1 Data Pulled from Meta API

| Category | Metrics |
|----------|---------|
| **Spend** | Amount spent, daily spend, remaining budget |
| **Performance** | Impressions, Reach, Frequency |
| **Engagement** | CTR, CPC, CPM, Clicks (all, link, unique) |
| **Conversions** | CPA, ROAS, Conversions, Conversion Rate |
| **Creative** | Ad copy (headline, text, description), media URL, format |
| **Audience** | Age/gender breakdown, placement breakdown, geo breakdown |
| **Time** | Day-by-day performance |

#### 6.6.2 AI Analysis Logic (Optimization Levers)

```
IF CPA too high (> 2x target):
  1. Check landing page (post-click problem?)
  2. Tighten audience targeting
  3. Test new creative angles
  4. Check ad relevance / quality ranking

IF CTR too low (< 1%):
  1. Hooks not resonating → suggest new hooks
  2. Audience mismatch → refine targeting
  3. Ad fatigue (frequency > 3) → refresh creative

IF CPM too high (> industry average):
  1. Audience too narrow → expand targeting
  2. High competition → different placements
  3. Low relevance → improve creative-audience fit

IF ROAS below target:
  1. Check conversion funnel (CTR good but no conversions = landing page)
  2. Check audience quality
  3. Suggest retargeting warm audiences
```

#### 6.6.3 Output Format

```
📊 Campaign Health Score: [0-100]

✅ What's Working:
  - [specific metric + comparison to benchmark]

⚠️ Issues Found (ordered by impact):
  1. [Issue title]
     → Data: [specific metric]
     → Why: [root cause analysis]
     → Fix: [specific actionable recommendation]
     → Expected Impact: [estimated improvement]

📈 Quick Wins:
  - [immediate action items]
```

#### 6.6.4 UI Flow

```
1. Dashboard → "Analyze Campaign" or Analyzer page
2. Shows list of campaigns from Meta (name, status, spend, date range)
3. User selects campaign → "Analyze" button
4. Loading state with skeleton + progress text
5. Streaming AI analysis appears
6. Results in structured cards with severity badges (🟢 Good, 🟡 Warning, 🔴 Critical)
7. Each recommendation has "Mark as Applied" toggle
```

---

### 6.7 Media Gallery

#### Purpose
Store images and videos that the AI references when recommending creative assets for ads.

#### Features

| Feature | Description |
|---------|-------------|
| **Upload** | Drag-drop or click-to-upload. Max 10MB. Image (jpeg, png, webp, gif) or Video (mp4) |
| **Grid View** | Thumbnail grid with file name, dimensions, upload date |
| **Tags** | User-assigned tags for AI matching (e.g., "product", "lifestyle", "testimonial") |
| **Delete** | Remove from storage (with confirmation) |
| **Preview** | Click to enlarge / play video |

---

### 6.8 Website Scraping Module

#### When It Activates
- During onboarding (if URL provided + consent)
- Manually: "Refresh Website Data" button in Settings

#### What It Extracts

| Data Point | Source |
|-----------|--------|
| Business name & description | `<meta>` tags, `<title>`, About page |
| Products / Services | Product pages, `schema.org/Product` data |
| Pricing | Listed prices, pricing pages |
| Images (references) | Product images, hero images |
| USPs / Value props | Headlines, hero sections, feature lists |
| Testimonials | Review sections, testimonial blocks |

#### Data Flow

```
User provides URL + consent
  → InsForge Edge Function fetches HTML
  → Parse HTML → Extract structured data
  → Store in website_data table (Postgres)
  → Create embeddings → Store in pgvector
  → AI uses as RAG context for personalized suggestions
```

#### Safeguards
- Only user's own URL (explicit consent required)
- Respect `robots.txt`
- Rate-limit: 1 request per 2 seconds
- User can delete all scraped data anytime
- No scraping of third-party or competitor sites

---

### 6.9 PDF Export

#### Structure

```
Page 1: Cover
  - "Campaign Plan: [Title]"
  - Business name, date

Page 2: Strategy Overview
  - Objective, strategy type, audience summary
  - Budget allocation table
  - Timeline recommendation

Pages 3-N: Campaign Details (per campaign)
  - Campaign settings
  - Per ad set: audience settings, placements
  - Per ad: recommended copy, framework used, CTA, media reference
  - Step-by-step Ads Manager instructions

Last Page: Tips
  - Testing recommendations
  - Learning phase (wait 3-5 days)
  - Key metrics to watch
```

---

### 6.10 Settings Page

| Section | Content |
|---------|---------|
| **Business Profile** | Edit name, industry, budget, website |
| **Meta Connection** | Connection status, reconnect button, account ID |
| **Website Data** | View extracted data, "Refresh" button, "Delete All" button |
| **Data Management** | Delete all campaign plans, delete all analyses, delete account |

---

## 7. AI Pipeline Architecture

### 7.1 Model Selection per Task

| Task | Model | Why |
|------|-------|-----|
| **Strategy Planning** | `xAI/Grok-4.1-Fast` | Best reasoning for complex multi-step planning |
| **Ad Copy Generation** | `xAI/Grok-4.1-Fast` | Strong creative + instruction following |
| **Campaign Analysis** | `google/gemini-2.5-flash` | Good analytics, lower cost for data-heavy tasks |
| **Website Extraction** | `google/gemini-2.5-flash` | Fast, cheap, good at structured extraction |
| **Embeddings (RAG)** | `openai/text-embedding-3-small` via InsForge | Vector similarity for context |

### 7.2 System Prompt Layers

Every AI call includes these layers:

```
LAYER 1 — Role:
"You are AdVize, an expert Meta ads strategist specializing in
campaign architecture, ad copywriting, and performance optimization."

LAYER 2 — Marketing Psychology:
"Apply these frameworks in all suggestions:
- PAS, BAB, Social Proof Lead, AIDA, Loss Aversion for ad copy
- Paradox of Choice: recommend ONE best option among variations
- Anchoring: show benchmarks before user metrics
- Social Proof: suggest including customer numbers when available
- Loss Aversion: generate loss-framed alongside gain-framed copy"

LAYER 3 — Paid Ads Best Practices:
"Follow these Meta Ads rules:
- Naming: META_[Objective]_[Audience]_[Offer]_[DateCode]
- Budget: 70% proven / 30% testing for new campaigns
- Retargeting: Hot 1-7d, Warm 7-30d, Cold 30-90d
- Always suggest exclusion audiences
- Creative testing priority: Concept → Hook → Visual → Copy → CTA
- Include placement recommendations per ad format"

LAYER 4 — User Context (dynamic):
"Business: [name], Industry: [industry], Budget: $[X]/day
Website data: [RAG-retrieved context or 'not available']
Previous campaigns: [summary if available]"
```

### 7.3 RAG Pipeline

```
1. Website data → chunked → embedded → pgvector
2. Past campaign plans → embedded → pgvector
3. On each request:
   a. Embed user's brief/question
   b. Query pgvector for top-5 relevant chunks
   c. Inject into prompt as context
   d. LLM generates personalized response
```

### 7.4 Streaming

```
User Action → Next.js Server Action
  → InsForge AI Gateway (OpenRouter)
  → LLM processes + streams tokens
  → InsForge Realtime (WebSocket)
  → React component renders tokens as they arrive
  → Skeleton loader → progressive content fill
```

---

## 8. Database Schema

### Tables

```sql
-- Business profile
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  daily_budget DECIMAL(10,2) NOT NULL,
  website_url TEXT,
  scrape_consent BOOLEAN DEFAULT FALSE,
  meta_connected BOOLEAN DEFAULT FALSE,
  meta_access_token TEXT, -- encrypted
  meta_token_expires_at TIMESTAMPTZ,
  meta_ad_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped website data
CREATE TABLE website_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_type TEXT, -- home, product, about, pricing
  raw_content TEXT,
  extracted_data JSONB,
  embedding VECTOR(1536),
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign plans
CREATE TABLE campaign_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brief JSONB NOT NULL,
  plan_data JSONB NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, approved, exported, archived
  ai_model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns within a plan
CREATE TABLE plan_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES campaign_plans(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  strategy_type TEXT,
  budget_allocation DECIMAL(5,2),
  optimization_event TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Ad sets within a campaign
CREATE TABLE plan_adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES plan_campaigns(id) ON DELETE CASCADE,
  adset_name TEXT NOT NULL,
  audience_definition JSONB NOT NULL,
  placements JSONB,
  retargeting_window TEXT,
  budget_split DECIMAL(5,2),
  sort_order INTEGER DEFAULT 0
);

-- Ads within an ad set
CREATE TABLE plan_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adset_id UUID REFERENCES plan_adsets(id) ON DELETE CASCADE,
  ad_name TEXT NOT NULL,
  format TEXT NOT NULL,
  primary_texts JSONB NOT NULL, -- [{text, rank, is_recommended}]
  headlines JSONB NOT NULL,
  descriptions JSONB NOT NULL,
  cta_button TEXT,
  copy_framework TEXT,
  media_recommendation JSONB,
  is_recommended BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- Media gallery
CREATE TABLE media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign analyses
CREATE TABLE campaign_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  meta_campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  raw_metrics JSONB NOT NULL,
  ai_analysis JSONB NOT NULL,
  health_score INTEGER,
  recommendations JSONB,
  ai_model_used TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL, -- builder, analyzer, general
  context_id UUID,
  messages JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security

```sql
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own profile"
  ON business_profiles FOR ALL
  USING (user_id = auth.uid());

-- Same RLS pattern for ALL tables via profile_id join
```

---

## 9. Security Plan

### 9.1 Authentication & Authorization

| Concern | Implementation |
|---------|---------------|
| Login | InsForge Auth with Facebook OAuth |
| Session | JWT in httpOnly, Secure, SameSite=Strict cookies |
| Token storage | Meta access tokens encrypted at rest in Postgres |
| Token rotation | Auto-refresh when < 1 hour remaining |
| RLS | Enabled on ALL tables — user sees only own data |

### 9.2 Input Validation (Zod)

```
business_name: string, 1-100 chars, trimmed, sanitized
website_url: valid URL, starts with https://
daily_budget: number, min 1, max 10000, 2 decimal places
industry: enum from preset list only
brief fields: string, max 1000 chars, sanitized
File uploads: max 10MB, allowed types only (jpeg/png/webp/gif/mp4)
```

### 9.3 API Security

| Layer | Implementation |
|-------|---------------|
| Rate limiting | 60 req/min standard, 10 req/min AI endpoints, 200/hr Meta API |
| CSRF | SameSite=Strict cookies + CSRF tokens on mutations |
| XSS | React built-in escaping + DOMPurify for rendered HTML |
| CSP | Strict Content-Security-Policy in next.config.js |
| CORS | App domain only |
| SQL injection | Parameterized queries only (InsForge SDK) |

### 9.4 AI Safety

| Risk | Mitigation |
|------|-----------|
| AI recommends policy-violating ads | System prompt includes Meta Ad Standards; output includes disclaimer |
| AI hallucinates metrics | Analyzer always shows raw data alongside AI interpretation |
| Prompt injection | User inputs parameterized, never concatenated into system prompts |
| Cost runaway | Per-user daily AI credit cap; alert at 80% usage |

### 9.5 Data Privacy

- User can delete ALL data via cascade delete from business_profiles
- Campaign metrics cached max 24 hours, then refreshed
- No third-party analytics or tracking (internal tool)
- Meta tokens never exposed to frontend

---

## 10. UI/UX Design System

### 10.1 Design Intent

| Question | Answer |
|----------|--------|
| **Who is the user?** | A marketer planning campaigns — focused, efficient, results-driven |
| **What must they do?** | Get a campaign plan fast, review it clearly, export it confidently |
| **What should it feel like?** | A **sharp, premium command center** — like a pro trading terminal but for ads. Dark, focused, precise. |

### 10.2 Color Palette

**Direction**: Deep dark mode with emerald green (growth/ROI) and warm amber (attention/action). Avoids the overused purple/blue AI gradient. Colors drawn from the "money + growth" domain of advertising.

```css
:root {
  /* Surfaces */
  --bg-base: #0B0F14;           /* Deepest background */
  --bg-surface-1: #111820;      /* Cards, panels */
  --bg-surface-2: #1A2332;      /* Elevated surfaces, dropdowns */
  --bg-surface-3: #223044;      /* Highest elevation */

  /* Brand — Emerald (growth, ROI, success) */
  --brand-primary: #10B981;     /* Primary actions, accents */
  --brand-primary-hover: #34D399;
  --brand-primary-muted: rgba(16, 185, 129, 0.15);
  --brand-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%);

  /* Accent — Warm Amber (attention, urgency, CTAs) */
  --accent-warm: #F59E0B;
  --accent-warm-hover: #FBBF24;
  --accent-warm-muted: rgba(245, 158, 11, 0.15);

  /* Text hierarchy */
  --text-primary: #F1F5F9;      /* Headings, important text */
  --text-secondary: #94A3B8;    /* Body text, descriptions */
  --text-tertiary: #64748B;     /* Metadata, timestamps */
  --text-muted: #475569;        /* Disabled, placeholders */

  /* Borders */
  --border-default: rgba(148, 163, 184, 0.12);
  --border-subtle: rgba(148, 163, 184, 0.06);
  --border-emphasis: rgba(148, 163, 184, 0.20);
  --border-focus: rgba(16, 185, 129, 0.50);

  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;

  /* Controls */
  --control-bg: #0F1720;
  --control-border: rgba(148, 163, 184, 0.15);
  --control-focus: rgba(16, 185, 129, 0.30);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### 10.3 Typography

```css
/* Font loading via next/font */
--font-sans: 'Inter', system-ui, sans-serif;  /* UI text */
--font-mono: 'JetBrains Mono', monospace;     /* Metrics, data, code */

/* Type scale */
--text-xs: 0.75rem;    /* 12px — labels, badges */
--text-sm: 0.875rem;   /* 14px — secondary text, metadata */
--text-base: 1rem;     /* 16px — body text */
--text-lg: 1.125rem;   /* 18px — card titles */
--text-xl: 1.25rem;    /* 20px — section headings */
--text-2xl: 1.5rem;    /* 24px — page titles */
--text-3xl: 2rem;      /* 32px — hero text */
--text-4xl: 2.5rem;    /* 40px — landing hero */
--text-5xl: 3.5rem;    /* 56px — landing hero large */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 10.4 Landing Page Design (Light Mode Exception)

The landing page uses a **light mode variant** to feel welcoming and public-facing, while the app itself is dark mode. This contrast reinforces the "public marketing → private tool" distinction.

```css
/* Landing page overrides */
.landing {
  --bg-base: #FAFBFC;
  --bg-surface-1: #FFFFFF;
  --bg-surface-2: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --border-default: rgba(15, 23, 42, 0.08);
  /* Brand colors stay the same */
}
```

### 10.5 Component Patterns

| Component | Style Notes |
|-----------|------------|
| **Cards** | `bg-surface-1`, `border-default`, `radius-lg`, `space-lg` padding |
| **Buttons (primary)** | `brand-gradient` bg, white text, `radius-md`, subtle hover glow |
| **Buttons (secondary)** | Transparent bg, `border-emphasis`, `text-secondary`, hover → `surface-2` |
| **Inputs** | `control-bg` (darker than card), `control-border`, `radius-sm`, focus ring `border-focus` |
| **Sidebar** | Same `bg-base` as page, separated by `border-default` — NOT different color |
| **Status badges** | Pill shape, muted background of semantic color, bold text |
| **Skeleton loaders** | Pulsing `surface-2` rectangles matching content shape |
| **Metric cards** | Large mono number, small label below, optional sparkline |
| **Severity badges** | 🟢 `success-muted` / 🟡 `warning-muted` / 🔴 `error-muted` backgrounds |

### 10.6 Depth Strategy

**Borders-only** — no drop shadows. Clean, precise, terminal-like. Higher elevation = slightly lighter surface. Borders at low opacity define edges without demanding attention.

### 10.7 Animation

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 150ms | ease |
| Card hover | 200ms | ease |
| Section fade-in (landing) | 300ms | ease-out |
| Sidebar collapse | 200ms | ease-in-out |
| Skeleton pulse | 1.5s | ease-in-out (infinite) |
| Modal open | 200ms | ease-out |

### 10.8 Responsive Breakpoints

```css
--mobile: 375px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1440px;
```

### 10.9 Accessibility Requirements

- All text: minimum 4.5:1 contrast ratio
- All interactive elements: visible focus rings (`border-focus`)
- All images: descriptive alt text
- All icon-only buttons: `aria-label`
- Tab order matches visual order
- Minimum 44x44px touch targets on mobile
- `prefers-reduced-motion` respected (disable animations)

---

## 11. Psychology Integration

These principles are **embedded in the AI prompts and UI**, not marketing claims:

| Principle | Where Applied | Implementation |
|-----------|--------------|----------------|
| **Hick's Law** | Ad copy output | AI generates 3 variations max, ranks them, recommends one |
| **Goal-Gradient** | Campaign Builder | Progress bar: "Step 3 of 4 — Almost done!" |
| **Zeigarnik Effect** | Dashboard | Draft plans show as "Incomplete" to pull user back |
| **Loss Aversion** | Ad copy | AI generates loss-framed alongside gain-framed: "Don't miss…" vs "Save…" |
| **Anchoring** | Analyzer | Show industry benchmarks FIRST, then user's metrics |
| **Contrast Effect** | Recommendations | "Current headline → Suggested headline" side by side |
| **Commitment & Consistency** | Onboarding | Start with one easy question, progressively ask more |
| **Social Proof** | Ad copy | AI suggests customer counts/testimonials when data supports it |
| **EAST Framework** | Recommendations | Every recommendation is Easy, Attractive, Social, Timely |

---

## 12. Project Structure

```
advize/
├── PRD.md
├── RULES.md
├── public/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── builder/
│   │   │   ├── page.tsx              ← New plan
│   │   │   └── [planId]/page.tsx     ← View/edit plan
│   │   ├── analyzer/
│   │   │   ├── page.tsx              ← Campaign list
│   │   │   └── [campaignId]/page.tsx ← Analysis results
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/          (Button, Card, Input, Modal, Badge, Skeleton)
│   │   ├── landing/     (Hero, Features, HowItWorks, Footer)
│   │   ├── builder/     (BriefForm, PlanView, AdCopyCard, CampaignTree)
│   │   ├── analyzer/    (MetricCard, RecommendationCard, HealthScore)
│   │   ├── gallery/     (MediaGrid, UploadZone, TagManager)
│   │   └── shared/      (Sidebar, Navbar, ProgressBar, EmptyState)
│   ├── lib/
│   │   ├── insforge.ts
│   │   ├── meta-api.ts
│   │   ├── ai-prompts.ts
│   │   ├── validators.ts   (Zod schemas)
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAIStream.ts
│   │   ├── useMetaCampaigns.ts
│   │   └── useBusinessProfile.ts
│   └── styles/
│       ├── globals.css      (design tokens, resets, base)
│       ├── landing.css
│       └── components.css
├── insforge/
│   └── functions/
│       ├── meta-oauth-callback/
│       ├── meta-fetch-campaigns/
│       ├── meta-fetch-insights/
│       ├── meta-refresh-token/
│       ├── scrape-website/
│       ├── generate-pdf/
│       ├── ai-campaign-plan/
│       └── ai-analyze-campaign/
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 13. Edge Functions (InsForge)

| Function | Trigger | Timeout | Purpose |
|----------|---------|---------|---------|
| `meta-oauth-callback` | HTTP | 10s | Handle Facebook OAuth, exchange code for token |
| `meta-fetch-campaigns` | HTTP | 30s | Pull campaign list + metrics |
| `meta-fetch-insights` | HTTP | 30s | Pull detailed insights for a campaign |
| `meta-refresh-token` | Scheduled | 10s | Refresh expiring Meta tokens |
| `scrape-website` | HTTP | 60s | Fetch and parse user's website |
| `generate-pdf` | HTTP | 30s | Generate PDF from plan data |
| `ai-campaign-plan` | HTTP (stream) | 120s | AI campaign generation |
| `ai-analyze-campaign` | HTTP (stream) | 120s | AI campaign analysis |

---

## 14. Phased Delivery Plan

### Phase 1 — MVP: Landing + Auth + Campaign Builder (Weeks 1-3)

- [ ] Next.js project setup + InsForge integration
- [ ] Design system (globals.css with all tokens)
- [ ] Landing page (all sections from 6.1)
- [ ] Auth: Facebook OAuth via InsForge
- [ ] Onboarding wizard
- [ ] Dashboard (empty state + plan list)
- [ ] Campaign Builder: brief form + AI generation (streaming)
- [ ] Campaign Builder: plan review/edit UI
- [ ] PDF export (basic)
- [ ] Database tables + RLS

### Phase 2 — Campaign Analyzer (Weeks 4-5)

- [ ] Meta API integration (fetch campaigns, insights)
- [ ] Campaign list view
- [ ] AI analysis pipeline
- [ ] Analysis results UI (health score, recommendations)
- [ ] Recommendation tracking

### Phase 3 — Website Scraping + RAG (Weeks 6-7)

- [ ] Scraping Edge Function
- [ ] Data extraction and parsing
- [ ] pgvector embeddings
- [ ] RAG integration into AI prompts
- [ ] "Refresh website data" UI

### Phase 4 — Polish (Weeks 8-9)

- [ ] Media gallery (upload, tag, browse)
- [ ] Media recommendations in plans
- [ ] PDF export improvements
- [ ] AI conversation memory
- [ ] Settings page
- [ ] Error handling, edge cases, loading states

---

## 15. Verification Plan

| Test | Method |
|------|--------|
| Auth flow | Manual: OAuth → token storage → session persistence |
| Campaign Builder | Generate 5 plans (different industries) → verify structure completeness |
| Meta API | Connect real account → compare data to Ads Manager |
| Analyzer | Analyze known campaign → compare AI recommendations to manual diagnosis |
| PDF export | Export 3 plans → check readability and completeness |
| Scraping | Scrape own website → verify extracted data accuracy |
| Security | Test RLS, rate limits, input validation |
| Responsive | Test at 375px, 768px, 1024px, 1440px |

---

## 16. Out of Scope

The following are explicitly **NOT** included in this version:

- Write access to Meta Ads (campaigns are always created manually)
- Multi-platform support (Google Ads, LinkedIn, TikTok)
- Team collaboration / multi-user workspaces
- Billing / payments / subscription management
- A/B testing within AdVize
- Creative generation (images, videos) — only copy and media recommendations
- Mobile native app (responsive web only)
- Email notifications or scheduled reports
- Integration with analytics platforms (GA4, etc.)
- Automated campaign monitoring / alerts
