# AdVize — Complete App Plan

> **AI-powered Meta Ads advisor.** Internal tool for planning, building, and optimizing Meta advertising campaigns with AI-generated strategies you implement yourself.

---

## 1. Product Definition

### 1.1 What It Is

AdVize is an internal web app that uses AI to generate complete Meta advertising campaign plans (strategy, structure, audiences, ad copy, media recommendations) and analyze active campaign performance. You review, refine, and manually implement every recommendation — maintaining full control while gaining expert-level guidance.

### 1.2 What It Is NOT

- **Not an automation tool** — it never writes to your Meta ad account.
- **Not a media creation tool** — it recommends media from your gallery, it doesn't generate creatives (beyond copy).
- **Not a general marketing platform** — it's laser-focused on Meta (Facebook/Instagram) paid ads.

### 1.3 Core User

**You** — a hands-on digital marketer who manages Meta ad campaigns for clients or personal projects. You know the basics of Ads Manager but want AI-powered optimization suggestions, campaign architecture planning, and performance diagnosis.

### 1.4 User Persona

| Attribute | Detail |
|---|---|
| **Name** | Oussama (you) |
| **Role** | Solo marketer / business owner |
| **Context** | Managing 3-10 active Meta campaigns at any time |
| **Pain Points** | Structuring campaigns from scratch takes hours; diagnosing underperformance is guesswork; writing 5+ ad copy variations is tedious |
| **Goal** | Get a complete campaign plan in minutes, with copy, strategy, and structure — then implement it confidently |
| **Technical Level** | Comfortable with Ads Manager, knows campaign/adset/ad hierarchy, understands basic metrics (CTR, CPC, ROAS) |
| **When Using AdVize** | Evenings/weekends planning next week's campaigns, or mid-week diagnosing a campaign that's underperforming |

---

## 2. Technical Stack

### 2.1 Frontend

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router, React Server Components) |
| **Styling** | Vanilla CSS with design tokens |
| **State Management** | React Context + Server Components (no heavy state library needed) |
| **Fonts** | Google Fonts via `next/font` (Inter for UI, mono for metrics) |
| **Icons** | Lucide React |

### 2.2 Backend — InsForge

| Service | What AdVize Uses It For |
|---|---|
| **Postgres Database** | Business profiles, campaign plans, analysis history, AI conversation logs |
| **Authentication** | OAuth login via Facebook/Meta (required for Meta API access) |
| **Cloud Storage** | Uploaded media gallery (images/videos for ad creative recommendations) |
| **Edge Functions** | Meta API data fetching, website scraping, PDF generation |
| **AI Integration (Model Gateway)** | All LLM calls routed through InsForge's OpenRouter gateway — supports GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro, DeepSeek, etc. |
| **Realtime** | Streaming AI responses to the frontend in real-time |
| **pgvector** | Storing embeddings for website content and past campaign data for RAG |

### 2.3 External APIs

| API | Access Level | Purpose |
|---|---|---|
| **Meta Marketing API** | **Read-only** | Pull campaign/adset/ad data, metrics, and breakdown reports |
| **Website Scraping** | Ethical, with user consent | Extract product/service data from the user's own website for personalized suggestions |

### 2.4 InsForge Pricing Consideration

For an internal/personal app, the **Starter plan** should suffice initially:
- $1 AI model credits/month included (then $0.10/credit)
- 2 GB database, 50 GB bandwidth, 25 GB file storage
- Upgrade to **Pro** ($10 AI credits/month) if usage grows

---

## 3. Feature Specifications

### 3.1 Onboarding Flow

**Design principle**: Progressive disclosure — one question at a time. Don't dump a 10-field form.

#### Step-by-Step Flow

```
Step 1: "What's your business?"
  → Industry dropdown (preset categories)
  → Business name (free text)

Step 2: "What's your daily ad budget?"
  → Slider or preset options ($5, $10, $20, $50, $100+)
  → This shapes all future strategy recommendations

Step 3: "Got a website?" (optional)
  → URL input
  → Option: "Scrape my website for product/service data" (with consent checkbox)
  → OR: "I'll add products manually later"

Step 4: "Connect your Meta account"
  → "Connect Meta Account" button → Facebook OAuth flow
  → Request permissions: ads_read, ads_management (read only), pages_show_list
  → Show what data will be accessed (transparency)
  → Option: "Skip for now — I'll just use Campaign Builder"

Step 5: Profile Summary
  → Show what was collected
  → "Looks good, let's go!" → Dashboard
```

#### Data Collected

| Field | Type | Required |
|---|---|---|
| `business_name` | text | Yes |
| `industry` | enum | Yes |
| `daily_budget` | decimal | Yes |
| `website_url` | url | No |
| `scrape_consent` | boolean | No |
| `meta_connected` | boolean | No |
| `meta_access_token` | encrypted text | No |
| `meta_ad_account_id` | text | No |

---

### 3.2 Campaign Builder

This is the core feature. The AI generates a **complete campaign architecture** — not just ad copy.

#### What the AI Generates

```
Campaign Plan Output Structure:
├── Campaign Level
│   ├── Campaign Name (proper naming: META_Conv_Lookalike_FreeTrial_2025Q1)
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
│   │   ├── Interests/Behaviors (detailed targeting)
│   │   └── Exclusions (who NOT to target)
│   ├── Placements (Automatic / Manual: Feed, Stories, Reels, etc.)
│   ├── Schedule (always-on / date range)
│   └── Budget Split (testing: 70% proven / 30% test)
│
└── Ad Level (2-3 per ad set)
    ├── Ad Name
    ├── Format (Single Image / Carousel / Video / Collection)
    ├── Primary Text (3 variations, AI ranks best)
    ├── Headline (3 variations, AI ranks best)
    ├── Description (3 variations, AI ranks best)
    ├── CTA Button (Shop Now / Learn More / Sign Up / etc.)
    ├── Media Recommendation (from uploaded gallery)
    └── Copy Framework Used (PAS / BAB / Social Proof Lead)
```

#### Ad Copy Frameworks (embedded in AI prompts)

The AI must **use and label** these frameworks when generating copy:

| Framework | Structure | Best For |
|---|---|---|
| **PAS** (Problem-Agitate-Solve) | Problem → Agitate pain → Solution → CTA | Pain-point-driven products |
| **BAB** (Before-After-Bridge) | Current state → Desired state → Your product as bridge | Transformation-focused |
| **Social Proof Lead** | Impressive stat/testimonial → What you do → CTA | Trust-building |
| **AIDA** | Attention → Interest → Desire → Action | Cold audiences |
| **Loss Aversion** | What they lose by NOT acting → Solution → CTA | Urgency / scarcity campaigns |

#### User Actions on a Campaign Plan

- ✅ **Approve** — Mark as ready, add to PDF export
- ✏️ **Edit** — Modify any field manually, then re-confirm
- 🔄 **Regenerate** — Ask AI to try a different approach (with optional guidance: "make it more urgent", "target younger audience")
- 📄 **Export PDF** — Generate a step-by-step implementation guide with screenshots/instructions for Ads Manager

#### Campaign Builder UI Flow

```
1. User clicks "New Campaign Plan"
2. Quick brief form:
   - What are you promoting? (product/service/event/content)
   - What's the goal? (sales / leads / awareness / traffic)
   - Who's the ideal customer? (1-2 sentences)
   - Any special requirements? (optional free text)
3. AI thinks (streaming response with skeleton loader)
4. Campaign plan appears in structured card layout
5. User reviews each level (campaign → adset → ad)
6. Approve / Edit / Regenerate per-section
7. Export final plan as PDF
```

---

### 3.3 Campaign Analyzer

Pulls real campaign data via Meta API and provides AI-powered diagnosis.

#### Data Pulled from Meta API

| Category | Metrics |
|---|---|
| **Spend** | Amount spent, daily spend, remaining budget |
| **Performance** | Impressions, Reach, Frequency |
| **Engagement** | CTR, CPC, CPM, Clicks |
| **Conversions** | CPA, ROAS, Conversions, Conv Rate |
| **Creative** | Ad copy (headline, text, description), media URL, format |
| **Audience** | Age/gender breakdown, placement breakdown |
| **Time** | Performance over time (daily/weekly) |

#### AI Analysis Logic

The AI diagnoses using the **Optimization Levers** framework:

```
IF CPA too high:
  1. Check landing page (is the problem post-click?)
  2. Suggest tightening audience targeting
  3. Recommend new creative angles
  4. Check ad relevance / quality ranking

IF CTR too low:
  1. Hooks aren't resonating → suggest new hooks/angles
  2. Audience mismatch → recommend targeting changes
  3. Ad fatigue (frequency > 3) → recommend creative refresh

IF CPM too high:
  1. Audience too narrow → suggest expansion
  2. High competition → recommend different placements
  3. Low relevance score → improve creative-audience fit

IF ROAS below target:
  1. Check conversion funnel (CTR good but no conversions = landing page issue)
  2. Check audience quality (broad vs. specific)
  3. Suggest retargeting warm audiences instead
```

#### Analyzer Output Format

For each campaign analyzed, the AI produces:

```
📊 Campaign Health Score: 72/100

✅ What's Working:
  - Strong CTR on Ad Set "Interest Targeting" (2.1% vs 1.5% average)
  - Video ads outperforming image ads by 40%

⚠️ Issues Found:
  1. Frequency too high (4.2) on Ad Set "Retargeting Hot"
     → Recommendation: Refresh creative or expand audience window
  2. CPA on "Lookalike 1%" is $12.50 vs target $8.00
     → Recommendation: Test new headline. Current "Shop Now" is generic.
        Suggested: "Still thinking about it? Here's 15% off — today only."
  3. Placement waste: 23% of spend on Audience Network with 0.3% CTR
     → Recommendation: Exclude Audience Network, reallocate to Reels

📈 Quick Wins:
  - Duplicate winning ad from Ad Set 1 into Ad Set 2
  - Add price anchoring to headline ("Was $99, now $49")
  - Create a "Before/After" carousel for social proof
```

#### Analyzer UI Flow

```
1. Dashboard shows connected campaigns in a list/grid
2. User selects a campaign (or multiple)
3. "Analyze" button → Data fetch → AI processing (streamed)
4. Results appear as actionable cards with severity levels
5. User can:
   - Bookmark recommendations
   - Mark as "Applied" (manual tracking)
   - Ask follow-up questions about a specific recommendation
```

---

### 3.4 Website Scraping Module

#### When It Activates

- During onboarding (if user provides URL + consent)
- Manually triggered: "Refresh my product data"

#### What It Extracts

| Data Point | How |
|---|---|
| Business name & description | `<meta>` tags, `<title>`, About page |
| Products / Services | Product pages, structured data (`schema.org/Product`) |
| Pricing | Listed prices, pricing pages |
| Images | Product images, hero images (stored as references) |
| USPs / Value props | Headlines, hero sections, feature lists |
| Testimonials | Review sections, testimonial blocks |

#### How It Works

```
1. User provides URL + consent checkbox
2. InsForge Edge Function fetches page HTML
3. Parse HTML → Extract structured data
4. Store extracted data in Postgres (business_profile_data table)
5. Create embeddings via InsForge AI → store in pgvector
6. AI uses this data as context for personalized campaign suggestions
```

#### Ethical Safeguards

- Only scrape URLs explicitly provided by the user
- Only scrape the user's OWN website (consent checkbox)
- Respect `robots.txt` (check before scraping)
- Rate-limit to 1 request per 2 seconds
- No scraping of competitor websites
- Clear data retention policy (user can delete scraped data anytime)

---

## 4. AI Pipeline Architecture

### 4.1 Overview

All AI calls go through **InsForge's Model Gateway** (OpenRouter-based). This gives access to multiple models without managing individual API keys.

### 4.2 Model Selection (per task)

| Task | Recommended Model | Why |
|---|---|---|
| **Strategy Planning** (campaign architecture, audience strategy) | `anthropic/claude-sonnet-4.5` or `openai/gpt-5` | Best reasoning for complex multi-step planning |
| **Ad Copy Generation** | `anthropic/claude-sonnet-4.5` | Strong creative writing with instruction following |
| **Campaign Analysis** | `openai/gpt-5-mini` or `google/gemini-2.5-flash` | Good analytical capability, lower cost for data-heavy tasks |
| **Website Data Extraction** | `google/gemini-2.5-flash` | Fast, cheap, good at structured extraction |
| **Embeddings** (for RAG) | InsForge built-in or `openai/text-embedding-3-small` | Vector similarity for personalized context |

### 4.3 System Prompt Structure

Every AI call includes a layered system prompt:

```
Layer 1: Role Definition
"You are AdVize, an expert Meta ads strategist specializing in 
campaign architecture, ad copywriting, and performance optimization 
for small businesses."

Layer 2: Marketing Psychology Knowledge
"Apply these frameworks in all suggestions:
- PAS, BAB, Social Proof Lead for ad copy
- Loss aversion for urgency-based campaigns
- Anchoring effect for pricing/offer ads
- Paradox of Choice: always recommend ONE best option among variations
- Social proof: suggest including customer numbers/testimonials when available"

Layer 3: Paid Ads Best Practices
"Follow these Meta Ads structures:
- Naming convention: META_[Objective]_[Audience]_[Offer]_[DateCode]
- Budget: 70% proven / 30% testing for new campaigns
- Retargeting windows: Hot 1-7d, Warm 7-30d, Cold 30-90d
- Always suggest exclusion audiences
- Creative testing order: Concept → Hook → Visual → Copy → CTA"

Layer 4: User Context (injected per-request)
"Business: [name], Industry: [industry], Budget: $[X]/day
Website data: [scraped summary or 'not available']
Previous campaigns: [summary of past plans if any]"
```

### 4.4 RAG Pipeline (Retrieval-Augmented Generation)

```
1. User's website data → chunked → embedded → stored in pgvector
2. Past campaign plans → embedded → stored in pgvector
3. On new request:
   a. Embed the user's brief/question
   b. Query pgvector for top-5 relevant chunks
   c. Inject retrieved context into the prompt
   d. LLM generates response with personalized knowledge
```

### 4.5 Streaming Architecture

```
Frontend (Next.js)
  ↓ Server Action call
InsForge AI Gateway
  ↓ OpenRouter → Selected LLM
  ↓ SSE stream back
InsForge Realtime
  ↓ WebSocket push to frontend
React component renders tokens as they arrive
```

---

## 5. Database Schema

### 5.1 Tables

```sql
-- User profile and business info
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  daily_budget DECIMAL(10,2) NOT NULL,
  website_url TEXT,
  scrape_consent BOOLEAN DEFAULT FALSE,
  meta_connected BOOLEAN DEFAULT FALSE,
  meta_access_token TEXT, -- encrypted via InsForge
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
  page_type TEXT, -- 'home', 'product', 'about', 'pricing'
  raw_content TEXT,
  extracted_data JSONB, -- structured extraction
  embedding VECTOR(1536), -- pgvector for RAG
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign plans generated by AI
CREATE TABLE campaign_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brief JSONB NOT NULL, -- user's input brief
  plan_data JSONB NOT NULL, -- full AI-generated plan structure
  status TEXT DEFAULT 'draft', -- draft, approved, exported, archived
  ai_model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual campaign items within a plan
CREATE TABLE plan_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES campaign_plans(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  strategy_type TEXT, -- retargeting, lookalike, cold, etc.
  budget_allocation DECIMAL(5,2), -- percentage
  optimization_event TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE plan_adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES plan_campaigns(id) ON DELETE CASCADE,
  adset_name TEXT NOT NULL,
  audience_definition JSONB NOT NULL,
  placements JSONB,
  budget_split DECIMAL(5,2),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE plan_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adset_id UUID REFERENCES plan_adsets(id) ON DELETE CASCADE,
  ad_name TEXT NOT NULL,
  format TEXT NOT NULL, -- single_image, carousel, video, collection
  primary_texts JSONB NOT NULL, -- array of variations with rankings
  headlines JSONB NOT NULL,
  descriptions JSONB NOT NULL,
  cta_button TEXT,
  copy_framework TEXT, -- PAS, BAB, SOCIAL_PROOF, AIDA, LOSS_AVERSION
  media_recommendation JSONB, -- reference to gallery items
  is_recommended BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- Media gallery
CREATE TABLE media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- InsForge Storage URL
  file_type TEXT NOT NULL, -- image/jpeg, video/mp4, etc.
  file_size INTEGER,
  tags TEXT[], -- user-assigned tags for AI matching
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign analysis results
CREATE TABLE campaign_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  meta_campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  raw_metrics JSONB NOT NULL, -- data from Meta API
  ai_analysis JSONB NOT NULL, -- AI-generated insights
  health_score INTEGER, -- 0-100
  recommendations JSONB, -- structured recommendations
  ai_model_used TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversation history (for context continuity)
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL, -- 'builder', 'analyzer', 'general'
  context_id UUID, -- FK to campaign_plans or campaign_analyses
  messages JSONB NOT NULL, -- array of {role, content, timestamp}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Row-Level Security

```sql
-- All tables: users can only access their own data
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own profile"
  ON business_profiles FOR ALL
  USING (user_id = auth.uid());

-- Apply similar RLS to all tables via profile_id
-- (campaign_plans, website_data, media_gallery, etc.)
```

---

## 6. Security Plan

### 6.1 Authentication & Authorization

| Concern | Implementation |
|---|---|
| **Login** | InsForge Auth with Facebook OAuth (required for Meta API) |
| **Session** | JWT tokens managed by InsForge, stored in httpOnly cookies |
| **Token storage** | Meta access tokens encrypted at rest in Postgres |
| **Token rotation** | Check `meta_token_expires_at` before each API call; refresh if < 1 hour remaining |
| **RLS** | Enabled on ALL tables — user can only access own data |

### 6.2 Input Validation

```
All user inputs validated with Zod schemas:
- business_name: string, 1-100 chars, sanitized
- website_url: valid URL format, starts with https://
- daily_budget: number, 1-10000, 2 decimal places
- industry: enum from preset list
- File uploads: max 10MB, image/jpeg|png|gif|webp or video/mp4 only
```

### 6.3 API Security

| Layer | Protection |
|---|---|
| **Rate limiting** | 60 requests/minute per user for standard endpoints |
| **AI rate limiting** | 10 AI requests/minute per user (expensive operations) |
| **Meta API calls** | 200 calls/hour per ad account (Meta's own limit) |
| **CSRF** | SameSite=Strict cookies + CSRF token on state-changing operations |
| **XSS** | React's built-in escaping + DOMPurify for any rendered HTML |
| **CSP** | Content-Security-Policy headers configured in `next.config.js` |
| **CORS** | Restricted to app domain only |

### 6.4 Data Privacy

| Concern | Policy |
|---|---|
| **What's stored** | Business profile, campaign plans, analysis results, scraped website data |
| **What's NOT stored** | Meta ad account passwords, payment info, user browsing history |
| **Data deletion** | User can delete all data (cascade delete from `business_profiles`) |
| **Meta data** | Campaign metrics fetched on-demand and cached for 24h max, then refreshed |
| **AI conversations** | Stored for context continuity, deletable by user |
| **Scraping data** | Only user's own URL, deletable anytime |

### 6.5 AI Safety

| Risk | Mitigation |
|---|---|
| **AI recommends policy-violating ads** | System prompt includes Meta Advertising Standards rules; output includes disclaimer |
| **AI hallucinates metrics** | Analyzer always shows raw data alongside AI interpretation |
| **AI generates inappropriate copy** | Content filter in system prompt; all output reviewed by user before use |
| **Prompt injection** | User inputs are parameterized, never concatenated into system prompts |
| **Cost runaway** | Per-user daily AI credit cap; alert at 80% usage |

---

## 7. UI/UX Design Direction

### 7.1 Design Intent

| Question | Answer |
|---|---|
| **Who is this human?** | A marketer at 10pm, tired from managing campaigns all day, wanting to plan tomorrow's ads efficiently |
| **What must they accomplish?** | Get a campaign plan they trust, review it quickly, and export it |
| **What should this feel like?** | A **calm, focused workspace** — like a well-organized notebook, not a chaotic analytics dashboard |

### 7.2 Visual Direction

| Element | Choice | Why |
|---|---|---|
| **Color palette** | Deep navy backgrounds, warm amber accents, soft grays | Calm but focused — not corporate blue, not startup neon |
| **Typography** | Inter (UI), JetBrains Mono (metrics/data) | Clean readability + clear data distinction |
| **Depth strategy** | Subtle borders only — no drop shadows | Technical but not cold; borders-only keeps it clean |
| **Spacing** | 8px base unit (8, 16, 24, 32, 48) | Consistent rhythm |
| **Border radius** | 8px cards, 6px buttons, 4px inputs | Approachable but professional |
| **Dark mode** | Primary mode (default) | Matches the "evening work session" context |

### 7.3 Key UI Components

| Page | Key Elements |
|---|---|
| **Dashboard** | Campaign plan cards (status: draft/approved/exported), quick "New Plan" action, connected campaigns list |
| **Campaign Builder** | Stepper form (brief input) → Streaming AI output → Structured plan view → Review/edit panels |
| **Campaign Analyzer** | Campaign selector → Metrics overview cards → AI recommendations with severity badges |
| **Media Gallery** | Grid view, drag-drop upload, tag management |
| **Settings** | Business profile, Meta connection status, data management |

### 7.4 UX Essentials

- **Skeleton loaders** during AI processing (10-30 seconds)
- **Streaming text** — render AI tokens as they arrive
- **Auto-save** everything — never lose user work
- **Progress indicators** — "Step 2 of 4" in builder, "Analyzing 3 of 5 campaigns"
- **Empty states** — meaningful first-time dashboard ("Create your first campaign plan →")
- **Educational tooltips** — explain jargon inline ("What is a lookalike audience?")
- **Mobile-responsive** — usable on tablet/phone, optimized for desktop

---

## 8. Psychology Integration (Built Into the Product)

These aren't marketing claims — they're embedded in the AI prompts and UI:

| Principle | Where It's Applied |
|---|---|
| **Paradox of Choice / Hick's Law** | AI generates 3 copy variations max, ranks them, recommends one. Not 10. |
| **Goal-Gradient Effect** | Builder shows progress: "Step 3 of 4 — Almost done!" |
| **Zeigarnik Effect** | Draft plans show as "Incomplete" on dashboard to pull user back |
| **Loss Aversion** | AI generates loss-framed copy alongside gain-framed: "Don't miss 30% savings" vs "Save 30%" |
| **Anchoring Effect** | Analyzer shows industry benchmarks FIRST, then user's metrics — so user sees the gap |
| **Contrast Effect** | Before/after framing in recommendations: "Current headline → Suggested headline" |
| **Commitment & Consistency** | Onboarding starts with one easy question, then progressively asks more |
| **Social Proof** | AI suggests including customer counts/testimonials in ad copy when business data supports it |
| **EAST Framework** | Every recommendation is **E**asy to implement, **A**ttractive in presentation, **S**ocial (benchmarked), **T**imely (prioritized) |

---

## 9. PDF Export Specification

The exported PDF serves as a **step-by-step implementation guide** for Ads Manager.

### PDF Structure

```
Page 1: Cover
  - "Campaign Plan: [Title]"
  - Business name, date, prepared by AdVize

Page 2: Strategy Overview
  - Campaign objective and strategy type
  - Target audience summary
  - Budget allocation table
  - Timeline recommendation

Pages 3-N: Campaign Details (one section per campaign)
  For each campaign:
    - Campaign settings (objective, budget, schedule)
    - For each ad set:
      - Audience settings (copy-paste ready targeting)
      - Placement settings
    - For each ad:
      - Recommended copy (primary text, headline, description)
      - Copy framework used & why
      - CTA button selection
      - Media recommendation with reference image
      
  Implementation instructions:
    - "Step 1: Go to Ads Manager → Create Campaign"
    - "Step 2: Select [Objective] as your campaign objective"
    - "Step 3: ..." (screenshot-ready instructions)

Last Page: Tips & Notes
  - Testing recommendations
  - When to check back (3-5 days for learning phase)
  - Key metrics to watch
```

---

## 10. Edge Functions (InsForge)

### 10.1 Function Inventory

| Function | Trigger | Timeout | Purpose |
|---|---|---|---|
| `meta-oauth-callback` | HTTP (OAuth redirect) | 10s | Handle Facebook OAuth, exchange code for token |
| `meta-fetch-campaigns` | HTTP (user action) | 30s | Pull campaign list + metrics from Meta API |
| `meta-fetch-insights` | HTTP (user action) | 30s | Pull detailed insights for a specific campaign |
| `meta-refresh-token` | Scheduled (daily) | 10s | Check and refresh expiring Meta tokens |
| `scrape-website` | HTTP (user action) | 60s | Fetch and parse user's website |
| `generate-pdf` | HTTP (user action) | 30s | Generate PDF from campaign plan data |
| `ai-campaign-plan` | HTTP (streaming) | 120s | AI campaign generation (streaming response) |
| `ai-analyze-campaign` | HTTP (streaming) | 120s | AI campaign analysis (streaming response) |

---

## 11. Project Structure

```
advize/
├── public/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx              (root layout, fonts, providers)
│   │   ├── page.tsx                (landing / redirect to dashboard)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx   (OAuth callback)
│   │   ├── onboarding/
│   │   │   └── page.tsx            (step-by-step wizard)
│   │   ├── dashboard/
│   │   │   └── page.tsx            (campaign plans list, quick actions)
│   │   ├── builder/
│   │   │   ├── page.tsx            (new campaign plan)
│   │   │   └── [planId]/page.tsx   (view/edit existing plan)
│   │   ├── analyzer/
│   │   │   ├── page.tsx            (campaign list from Meta)
│   │   │   └── [campaignId]/page.tsx (analysis results)
│   │   ├── gallery/
│   │   │   └── page.tsx            (media management)
│   │   └── settings/
│   │       └── page.tsx            (profile, connections, data)
│   ├── components/
│   │   ├── ui/                     (buttons, cards, inputs, modals)
│   │   ├── builder/                (campaign plan components)
│   │   ├── analyzer/               (metrics cards, recommendation cards)
│   │   ├── gallery/                (media grid, upload)
│   │   └── shared/                 (nav, sidebar, skeleton loaders)
│   ├── lib/
│   │   ├── insforge.ts             (InsForge client init)
│   │   ├── meta-api.ts             (Meta Marketing API helpers)
│   │   ├── ai-prompts.ts           (system prompts, prompt builders)
│   │   ├── validators.ts           (Zod schemas)
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAIStream.ts          (streaming AI response hook)
│   │   ├── useMetaCampaigns.ts
│   │   └── useBusinessProfile.ts
│   └── styles/
│       ├── globals.css             (design tokens, base styles)
│       └── components.css          (component-specific styles)
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

## 12. Phased Delivery Plan

### Phase 1 — MVP: Campaign Builder (Weeks 1-3)

```
[ ] Project setup (Next.js + InsForge)
[ ] Design system / CSS tokens
[ ] InsForge Auth + Facebook OAuth
[ ] Onboarding flow (business profile)
[ ] Dashboard (empty state → plan list)
[ ] Campaign Builder: brief form
[ ] Campaign Builder: AI plan generation (streaming)
[ ] Campaign Builder: plan review/edit UI
[ ] Campaign Builder: approve/archive actions
[ ] PDF export (basic)
```

**Deliverable**: You can generate a full campaign plan and export it as PDF.

---

### Phase 2 — Campaign Analyzer (Weeks 4-5)

```
[ ] Meta API integration (fetch campaigns, insights)
[ ] Campaign list view (from Meta)
[ ] AI analysis pipeline
[ ] Analysis results UI (health score, recommendations)
[ ] Recommendation tracking (applied/bookmarked)
```

**Deliverable**: You can pull live campaign data and get AI-powered optimization recommendations.

---

### Phase 3 — Website Scraping + RAG (Weeks 6-7)

```
[ ] Website scraping Edge Function
[ ] Data extraction and parsing
[ ] pgvector embeddings storage
[ ] RAG integration into AI prompts
[ ] "Refresh website data" UI
```

**Deliverable**: AI suggestions are personalized based on your actual website/product data.

---

### Phase 4 — Polish & Media (Weeks 8-9)

```
[ ] Media gallery (upload, tag, browse)
[ ] Media recommendations in campaign plans
[ ] PDF export improvements (richer formatting, implementation steps)
[ ] AI conversation memory (follow-up questions)
[ ] Settings page (profile edit, data management, connection status)
[ ] Error handling, edge cases, loading states polish
```

**Deliverable**: Complete, polished internal tool ready for daily use.

---

## 13. Verification Plan

Since this is an internal tool, verification focuses on functional testing:

| What to Test | How |
|---|---|
| **Auth flow** | Manually test Facebook OAuth login → token storage → session persistence |
| **Campaign Builder output** | Generate 5 plans for different industries/goals — verify structure completeness and copy quality |
| **Meta API integration** | Connect real ad account → verify campaigns list matches Ads Manager → verify metrics accuracy |
| **Analyzer accuracy** | Run analyzer on a known campaign → compare AI recommendations against your own diagnosis |
| **PDF export** | Export 3 different plans → verify readability, completeness, no broken formatting |
| **Website scraping** | Scrape your own website → verify extracted data accuracy |
| **Security** | Attempt to access another user's data (if multiple users later) → verify RLS blocks it |
| **AI rate limiting** | Send 15 rapid AI requests → verify rate limit kicks in at 10 |
| **Error states** | Disconnect Meta → verify graceful error handling; invalid URL scraping → verify error message |
