# AdVize — AI Development Rules

> **Every AI agent working on this project MUST read and follow these rules before writing any code.**
> These rules are non-negotiable. If a rule conflicts with your default behavior, the rule wins.

---

## 1. Project Bible

### 1.1 Read Before Coding

Before generating ANY code, the AI MUST read and understand:
1. `PRD.md` — the complete product spec
2. This `RULES.md` file — the development rules
3. The relevant section of the PRD for the feature being built

### 1.2 Single Source of Truth

- The **PRD.md** is the single source of truth for what to build.
- Do NOT invent features, pages, components, or behaviors not described in the PRD.
- Do NOT rename, reorganize, or "improve" the project structure defined in the PRD unless explicitly asked.
- If something is ambiguous, ask the user — do NOT guess.

---

## 2. Technology Rules

### 2.1 Stack Constraints

| Technology | Rule |
|-----------|------|
| **Framework** | Next.js 15+ with App Router ONLY. No Pages Router. |
| **Styling** | Vanilla CSS ONLY. NO Tailwind, NO CSS-in-JS, NO styled-components, NO SASS/SCSS. |
| **CSS Architecture** | Use CSS design tokens defined in `globals.css`. All component styles reference these tokens. |
| **State Management** | React Context + Server Components. NO Redux, NO Zustand, NO Jotai, NO MobX. |
| **Backend** | InsForge ONLY. NO Supabase, NO Firebase, NO custom Express/Fastify servers. |
| **AI Calls** | InsForge Model Gateway ONLY. NO direct OpenAI/Anthropic SDK calls. |
| **Validation** | Zod ONLY for all input validation. NO Yup, NO Joi. |
| **Icons** | Lucide React ONLY. NO FontAwesome, NO Heroicons, NO Material Icons. |
| **Fonts** | Google Fonts via `next/font` ONLY (Inter + JetBrains Mono). NO other font loading methods. |

### 2.2 Forbidden Patterns

- ❌ Do NOT use `"use client"` unless the component genuinely needs client-side interactivity (event handlers, hooks, browser APIs).
- ❌ Do NOT use `useEffect` for data fetching. Use Server Components or Server Actions.
- ❌ Do NOT use `<img>` tags. Always use `next/image`.
- ❌ Do NOT use `<a>` tags for internal navigation. Always use `next/link`.
- ❌ Do NOT use `<script>` tags. Use `next/script` if needed.
- ❌ Do NOT install packages without explicit user approval.
- ❌ Do NOT use `any` type in TypeScript. Type everything properly.
- ❌ Do NOT use inline styles. All styles go in CSS files.
- ❌ Do NOT use `!important` in CSS.
- ❌ Do NOT hardcode colors, spacing, or font sizes. Use design tokens.
- ❌ Do NOT use `localStorage` for sensitive data (tokens, user data).
- ❌ Do NOT create API routes — use Server Actions or InsForge Edge Functions.
- ❌ Do NOT concatenate user input into AI prompts. Always parameterize.

### 2.3 Required Patterns

- ✅ Every page MUST have a `loading.tsx` with skeleton loaders.
- ✅ Every page MUST have an `error.tsx` with a user-friendly error message.
- ✅ Every form MUST validate all inputs with Zod before submission.
- ✅ Every interactive element MUST have a unique, descriptive `id` attribute.
- ✅ Every image MUST have an `alt` attribute.
- ✅ Every icon-only button MUST have an `aria-label`.
- ✅ All data tables use `<table>` with proper `<thead>`, `<tbody>`, `<th scope>`.
- ✅ All dates rendered to the user MUST be formatted with `Intl.DateTimeFormat`.
- ✅ All monetary values MUST be formatted with `Intl.NumberFormat`.
- ✅ All AI-generated content MUST be rendered with streaming (not waiting for full response).
- ✅ All meta tokens MUST be stored encrypted and NEVER exposed to the frontend.

---

## 3. Design System Rules

### 3.1 Color Rules

- Use ONLY the colors defined in `globals.css` `:root` variables.
- The app uses **dark mode** by default. The landing page uses **light mode**.
- The primary brand color is **emerald green** (`--brand-primary: #10B981`).
- The accent color is **warm amber** (`--accent-warm: #F59E0B`).
- Do NOT use purple gradients, neon blue, or any other common SaaS color schemes.
- Semantic colors: green = success, amber = warning, red = error, blue = info.
- Surface elevation: `bg-base` (lowest) → `surface-1` → `surface-2` → `surface-3` (highest).

### 3.2 Typography Rules

- UI text: `Inter` font family ONLY.
- Metrics, data, and code: `JetBrains Mono` font family ONLY.
- Use the type scale from the design system. Do NOT invent custom font sizes.
- Line height for body text: 1.6. For headings: 1.2. For compact UI: 1.4.

### 3.3 Spacing Rules

- Use ONLY the spacing tokens: `--space-xs` (4px) through `--space-3xl` (64px).
- Base spacing unit is 8px. All spacing MUST be a multiple of 4px.
- Do NOT use arbitrary px values for padding or margin.

### 3.4 Depth Rules

- Do NOT use `box-shadow` or `drop-shadow`. The app uses a **borders-only** depth strategy.
- Elevation is communicated through progressively lighter backgrounds.
- Borders use low-opacity white: `rgba(148, 163, 184, 0.06)` to `rgba(148, 163, 184, 0.20)`.

### 3.5 Animation Rules

- All transitions use CSS `transition` property, NOT JavaScript animation libraries.
- Button hover: 150ms. Card hover: 200ms. Section animations: 300ms.
- Respect `prefers-reduced-motion`: all animations MUST be disabled when user prefers reduced motion.
- Do NOT use animations just for decoration. Every animation must serve a UX purpose.

### 3.6 Component Rules

- Cards: `--bg-surface-1` background, `--border-default` border, `--radius-lg` corners.
- Primary buttons: `--brand-gradient` background, white text. NEVER flat color.
- Secondary buttons: transparent background, `--border-emphasis` border.
- Inputs: `--control-bg` background (darker than card), `--control-border` border.
- Focus rings: `--border-focus` (emerald at 50% opacity). Every interactive element MUST have one.
- Status badges: pill-shaped, muted background of semantic color, bold text.
- Skeleton loaders: pulsing `--bg-surface-2` rectangles matching content shape.

---

## 4. File & Code Organization Rules

### 4.1 Project Structure

Follow the project structure defined in PRD.md Section 12 EXACTLY. Do NOT reorganize.

### 4.2 File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BriefForm.tsx`, `MetricCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAIStream.ts` |
| Utilities/libs | camelCase | `meta-api.ts`, `validators.ts` |
| CSS files | kebab-case | `globals.css`, `components.css` |
| Route files | Next.js conventions | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |

### 4.3 Component Rules

- One component per file. No exceptions.
- Co-locate component CSS in the same directory if it's component-specific.
- Server Components by default. Only add `"use client"` when interactive.
- Props interfaces defined in the same file, named `{ComponentName}Props`.
- No default exports except for Next.js page/layout files. Use named exports for components.

### 4.4 Import Order

```tsx
// 1. React / Next.js
import { Suspense } from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { z } from 'zod';

// 3. Internal libs / utilities
import { insforge } from '@/lib/insforge';

// 4. Components
import { Button } from '@/components/ui/Button';

// 5. Hooks
import { useAIStream } from '@/hooks/useAIStream';

// 6. Types (if separate file)
import type { CampaignPlan } from '@/types';

// 7. Styles
import './styles.css';
```

---

## 5. AI Integration Rules

### 5.1 Model Usage

| Task | Model | Rule |
|------|-------|------|
| Strategy planning | `xAI/Grok-4.1-Fast` | Use for campaign architecture generation |
| Ad copy | `xAI/Grok-4.1-Fast` | Use for all copy generation tasks |
| Campaign analysis | `google/gemini-2.5-flash` | Use for performance diagnosis (cheaper) |
| Website extraction | `google/gemini-2.5-flash` | Use for HTML parsing (fast, cheap) |
| Embeddings | InsForge built-in | Use for RAG vector storage |

Do NOT change models without explicit user approval.

### 5.2 Prompt Engineering Rules

- NEVER concatenate user input directly into system prompts. Use structured message arrays.
- ALWAYS include all 4 system prompt layers (Role, Psychology, Best Practices, User Context).
- ALWAYS request structured JSON output from the LLM for campaign plans and analysis.
- NEVER trust AI output blindly. Always validate the structure matches the expected schema with Zod before rendering.
- The system prompt is defined in `lib/ai-prompts.ts`. Do NOT scatter prompts across multiple files.

### 5.3 Streaming Rules

- ALL AI responses MUST be streamed to the user via InsForge Realtime.
- Show skeleton loaders immediately when AI processing starts.
- Show a "Thinking..." indicator with elapsed time during generation.
- If streaming fails, show a clear error message with retry option.
- NEVER block the UI waiting for a full AI response.

### 5.4 AI Output Rules

- Campaign plans MUST follow the exact structure defined in PRD Section 6.5.2.
- Ad copy MUST label which framework was used (PAS, BAB, etc.).
- Analyzer output MUST include raw metrics alongside AI interpretation.
- AI MUST generate exactly 3 copy variations per field (primary text, headline, description) and rank them.
- AI MUST suggest exactly 1 recommended option among variations.

---

## 6. Database Rules

### 6.1 Schema

Follow the schema defined in PRD Section 8 EXACTLY. Do NOT add, remove, or rename tables or columns.

### 6.2 Security

- Row-Level Security (RLS) MUST be enabled on ALL tables.
- Every query MUST go through the InsForge SDK (which enforces RLS).
- NEVER write raw SQL queries that bypass RLS.
- All foreign keys MUST have `ON DELETE CASCADE` where appropriate.

### 6.3 Data Handling

- Store Meta access tokens encrypted. NEVER log them.
- Store campaign plan data as JSONB for flexibility.
- Use pgvector for all embedding storage.
- All timestamps MUST use `TIMESTAMPTZ` (timezone-aware).

---

## 7. Security Rules

### 7.1 Authentication

- Facebook OAuth via InsForge Auth is the ONLY authentication method.
- JWT tokens in httpOnly, Secure, SameSite=Strict cookies ONLY.
- Check token expiry before every Meta API call.
- Auto-refresh tokens when < 1 hour remaining.
- On logout: clear session, offer token revocation.

### 7.2 Input Validation

- Validate ALL user inputs with Zod schemas on BOTH client and server.
- The schemas are defined in `lib/validators.ts`. Do NOT create validation logic elsewhere.
- Reject invalid data BEFORE it reaches any database query or AI prompt.
- Sanitize text inputs (trim whitespace, strip HTML) before storage.

### 7.3 Rate Limiting

| Endpoint Type | Limit |
|--------------|-------|
| Standard API | 60 requests/minute |
| AI endpoints | 10 requests/minute |
| Meta API | 200 calls/hour |
| File uploads | 10 uploads/minute |

### 7.4 Frontend Security

- NEVER expose Meta access tokens to the frontend.
- NEVER store sensitive data in localStorage or sessionStorage.
- Use CSRF tokens on all state-changing operations.
- Set Content-Security-Policy headers in `next.config.js`.
- CORS restricted to app domain only.

---

## 8. Meta API Rules

### 8.1 Access

- READ-ONLY access. NEVER write to the Meta Ads account.
- Request ONLY these permissions: `ads_read`, `pages_show_list`, `email`, `public_profile`.
- Do NOT request `ads_management` write scopes.

### 8.2 Data Handling

- Cache campaign metrics for max 24 hours. Then re-fetch.
- Always show data freshness timestamp ("Data from: 2 hours ago").
- Handle API errors gracefully: show user-friendly messages.
- Handle rate limits: implement exponential backoff with max 3 retries.
- Handle token expiry: auto-refresh or prompt re-authentication.

---

## 9. Website Scraping Rules

- ONLY scrape URLs explicitly provided by the user.
- ONLY scrape the user's OWN website (consent checkbox required).
- Respect `robots.txt` — check before scraping.
- Rate-limit: 1 request per 2 seconds max.
- Do NOT scrape competitor websites or any third-party sites.
- Store scraped data in `website_data` table with clear retention.
- Allow user to delete all scraped data at any time.

---

## 10. UI/UX Rules

### 10.1 Loading States

- EVERY page that loads data MUST have a skeleton loader (not a spinner).
- Skeleton shapes MUST match the content they replace.
- AI processing states MUST show elapsed time.
- NEVER show a blank page. Always show something.

### 10.2 Empty States

- Dashboard with no plans: illustration + "Create your first campaign plan" CTA.
- Analyzer with no analyses: "Connect Meta and analyze your first campaign."
- Gallery with no media: "Upload images and videos for your ads."
- NEVER show empty tables or grids with no guidance.

### 10.3 Error States

- All errors MUST be user-friendly. No technical jargon.
- All errors MUST include a recovery action ("Retry", "Go back", "Contact support").
- Network errors: "Connection lost. Check your internet and try again."
- AI errors: "We couldn't generate your plan. Please try again."
- Meta API errors: "We couldn't reach your Meta account. Please reconnect."

### 10.4 Responsive Design

- Mobile-first CSS. Base styles for 375px, then use `min-width` media queries.
- Sidebar collapses on tablet and below.
- Campaign plan tree view becomes accordion on mobile.
- Minimum touch target: 44x44px.
- Test at: 375px, 768px, 1024px, 1440px.

### 10.5 Landing Page Rules

- The landing page is the ROOT route (`/`).
- It uses **light mode** colors (see PRD Section 10.4).
- It MUST include all sections defined in PRD Section 6.1.
- Smooth scroll for anchor navigation.
- Scroll-triggered fade-in animations (subtle, 200-300ms).
- CTA buttons link to sign-up/login.
- Fully responsive.

---

## 11. Content Rules

### 11.1 Tone of Voice

- Professional but approachable.
- Confident but not arrogant. ("We suggest..." not "You must...")
- Clear and direct. No marketing fluff in the app UI.
- Educational where appropriate (tooltips explain jargon).

### 11.2 Terminology

Use these terms consistently throughout the app:

| Term | Meaning | DO NOT Use |
|------|---------|-----------|
| Campaign Plan | AI-generated campaign architecture | Blueprint, Recipe, Template |
| Brief | User's input for campaign generation | Prompt, Request, Query |
| Recommendation | AI suggestion from analyzer | Tip, Hint, Advice |
| Health Score | 0-100 campaign performance score | Grade, Rating, Score |
| Export | Generate PDF | Download, Save |
| Gallery | Media library | Library, Assets, Media Center |

---

## 12. Testing & Quality Rules

### 12.1 Before Delivering Any Feature

- Verify it matches the PRD spec EXACTLY.
- Test on all breakpoints (375px, 768px, 1024px, 1440px).
- Verify all interactive elements have focus states.
- Verify no console errors or warnings.
- Verify loading and error states work.
- Verify empty states display correctly.

### 12.2 Code Quality

- No unused imports.
- No unused variables.
- No commented-out code in delivered files.
- No `console.log` in production code (use a logger utility if needed).
- No TypeScript `any` types.
- All functions must have JSDoc comments explaining purpose and parameters.

---

## 13. Communication Rules

### 13.1 When Uncertain

- ASK the user. Do NOT make assumptions about features, behavior, or design.
- Reference the PRD section number when discussing a feature.
- If the PRD doesn't cover something, flag it and propose a solution for approval.

### 13.2 When Reporting Progress

- State which PRD section / phase you're working on.
- Show what was completed and what's next.
- Flag any deviations from the PRD with reasoning.

### 13.3 Scope Discipline

- Do NOT implement features from later phases unless asked.
- Do NOT add "nice-to-have" features on your own.
- Do NOT refactor code unless there's a clear problem.
- Do NOT change the design system without approval.
- Stick to the current phase's deliverables as listed in PRD Section 14.