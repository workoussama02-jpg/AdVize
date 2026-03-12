# Product Requirements Document — Nexora (Chat Widget Builder SaaS)

---

## 1. Project Overview

### App Name
**Nexora**

### Purpose
Nexora is a web application that enables users to create, visually customize, and download a fully self-contained chat widget for their website. The widget connects to the user's own n8n webhook (or any compatible AI agent webhook) so that end-visitors can chat with an AI bot directly on the user's site.

### Target Audience
- Freelance developers and agencies building AI chatbots with n8n.
- Non-technical business owners who want to add an AI chat widget to their site without writing code.
- n8n power users who need a polished, branded chat interface for their workflows.

### Value Proposition
Nexora eliminates the gap between building an n8n chatbot and deploying it on a website. Instead of manually editing JavaScript or wrestling with unbranded default widgets, users get a visual editor with a live preview, and walk away with downloadable, production-ready files. No monthly hosting fees for the widget itself — users self-host their files.

### High-Level Summary
1. User signs up / logs in via InsForge-powered authentication.
2. User enters a visual customizer: picks colors, adds logo URL, enters webhook URL, writes welcome text.
3. A live preview updates in real time next to the form.
4. User clicks "Download Files" and receives a ZIP containing a customized `chat-widget.js` and an `embed.html` snippet.
5. User uploads the JS file to any static host (e.g., Vercel, Modal, or any other), pastes the HTML snippet into their website, and the widget is live.

The app does **not** host the widget files, does **not** process chat messages, and does **not** provide analytics. It is purely a configuration tool and file generator.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend Framework** | React + Next.js (App Router) | All pages — landing, auth, dashboard, customizer — are built in Next.js. Use the App Router (`/app` directory). |
| **Styling** | Tailwind CSS | For the app's own UI only. The widget's CSS is embedded inside `chat-widget.js` and is separate. |
| **Backend-as-a-Service** | InsForge (https://insforge.dev/) | Handles authentication (signup, login, password reset, sessions), the Postgres database, and all server-side data persistence. **The builder MUST use the InsForge MCP to create and manage the backend.** |
| **File Generation** | Next.js API Route (Node.js) | A server-side route at `/api/generate-widget` performs string replacements on the master template, packages two files into a ZIP, and streams the ZIP to the client. |
| **ZIP Library** | `jszip` (npm) | Used server-side to create the ZIP archive containing `chat-widget.js` and `embed.html`. |
| **Deployment (App)** | Vercel | The Next.js app itself is deployed to Vercel. This does NOT host user widget files. |
| **Font** | Geist Sans (via `next/font`) | Primary font for the app UI. The widget internally loads Geist Sans from a CDN for itself. |
| **Icons** | Lucide React | Consistent SVG icon set. No emoji icons. |

### Third-Party Dependencies
| Package | Purpose |
|---|---|
| `jszip` | ZIP file generation on the server |
| `next` | Framework |
| `react`, `react-dom` | UI library |
| `tailwindcss` | Styling |
| `lucide-react` | Icons |
| InsForge SDK | Auth + Database client |

---

## 3. User Roles & Personas

### 3.1 Visitor (Unauthenticated)
- **Can**: View the landing page, pricing section, navigate to signup/login.
- **Cannot**: Access the dashboard, customizer, or any protected route.

### 3.2 Free User (Authenticated, Free Tier)
- **Can**: Create up to **1 widget**, customize it, save it, download files, edit it, delete it.
- **Cannot**: Create more than 1 widget. Cannot modify the "Powered By" text or link — these fields are visible but locked/disabled on the Free plan.
- **Behavior**: If the user tries to create a second widget, show a message: "You've reached the limit for the Free plan. Upgrade to Pro for unlimited widgets." with a link/button to the pricing section.

### 3.3 Pro User (Authenticated, Pro Tier) — Future
- **Can**: Create **unlimited** widgets. Can fully customize or remove the "Powered By" footer branding (blank out text and link). Access to any future premium features.
- **Status at launch**: The Pro tier is marked **"Coming Soon"** on the pricing page. All users operate on the Free tier at launch. Payment integration (Stripe) is out of scope for MVP.

### 3.4 Admin — Not Applicable
There is no admin panel or admin user role. This is a single-tenant, individual-account product.

---

## 4. Feature Breakdown (by Module/Epic)

---

### Module A: Landing Page

#### A1. Hero Section
**Description**: The first thing visitors see. A headline, subheadline, and CTA button.

**User Story**:
> As a visitor, I want to immediately understand what this product does when I land on the page, so that I can decide if it's relevant to me.

**Acceptance Criteria**:
- Headline text is prominent (e.g., "Build & Customize Your AI Chat Widget in Minutes").
- Subheadline explains the concept in one sentence (e.g., "Download the files, host them yourself, embed anywhere — no monthly fees").
- A single primary CTA button links to `/signup`.
- A visual mockup or screenshot of the widget is displayed alongside the hero text to immediately communicate the product.

**Edge Cases**:
- The hero must look polished on screens from 375px to 1440px+.
- CTA button must be visible without scrolling on mobile (above the fold).

---

#### A2. How It Works Section
**Description**: A 3-step visual guide.

**User Story**:
> As a visitor, I want to see how simple the setup process is, so that I feel confident signing up.

**Acceptance Criteria**:
- 3 steps displayed as numbered cards or an illustrated flow:
  1. "Create an account & log in"
  2. "Customize your widget — colors, logo, text, webhook URL — with a live preview"
  3. "Download your files, upload the JS to Vercel, paste the HTML into your site"
- Each step has an icon and short description.
- Steps are arranged horizontally on desktop, stacked vertically on mobile.

---

#### A3. Features Section
**Description**: Key selling points of the product.

**Acceptance Criteria**:
- Display at least 6 feature cards:
  1. Live preview as you customize
  2. Download-ready files (ZIP with JS + HTML)
  3. Self-hosted — you own your files
  4. Works with any n8n webhook or AI agent
  5. No monthly fees for widget hosting
  6. Easy setup with step-by-step instructions
- Each card has an SVG icon (Lucide), a title, and a 1–2 line description.

---

#### A4. Pricing Section
**Description**: Side-by-side pricing cards for Free and Pro tiers.

**User Story**:
> As a visitor, I want to see what I get for free vs. paid, so that I can decide whether to sign up.

**Acceptance Criteria**:
- Two pricing cards displayed side by side.
- **Free card**: "Free", features list: "1 widget", "All customization options", "Download ZIP files", "Powered By branding included (cannot be removed)".
- **Pro card**: Price TBD, "Coming Soon" badge, features list: "Unlimited widgets", "Remove or customize Powered By branding", "Priority support", "Future premium features".
- "Get Started" button under Free card → links to `/signup`.
- Pro card button is disabled or shows "Coming Soon".

**Edge Cases**:
- Cards stack vertically on mobile.
- "Coming Soon" badge must be clearly visible.

---

#### A5. Footer
**Acceptance Criteria**:
- Links to: Signup, Login, Terms of Service (placeholder/static page), Privacy Policy (placeholder/static page).
- App name/logo on the left.
- Clean, minimal design.

---

### Module B: Authentication

#### B1. Signup Page (`/signup`)
**Description**: Registration form powered by InsForge auth.

**User Story**:
> As a new user, I want to create an account with my email and password, so that I can start building my widget.

**Acceptance Criteria**:
- Form fields: Email (required, validated), Password (required, minimum 8 characters).
- "Create Account" button submits the form.
- On success: redirect to `/dashboard`.
- On error (e.g., email already taken, weak password, network error): display an inline error message below the form.
- Link: "Already have an account? Log in" → links to `/login`.
- Centered layout, consistent styling with the rest of the app.

**Edge Cases**:
- Empty email or password → inline validation error before submission.
- Invalid email format → inline validation error.
- Server error → display generic error: "Something went wrong. Please try again."
- Double-click prevention: disable the button and show a spinner during the API call.

---

#### B2. Login Page (`/login`)
**Description**: Login form powered by InsForge auth.

**User Story**:
> As a returning user, I want to log in with my email and password, so that I can access my dashboard.

**Acceptance Criteria**:
- Form fields: Email (required), Password (required).
- "Log In" button.
- On success: redirect to `/dashboard`.
- On error: display "Invalid email or password."
- Link: "Don't have an account? Sign up" → links to `/signup`.
- Link: "Forgot password?" → triggers InsForge password reset flow.

**Edge Cases**:
- Same empty-field, double-click, and server-error handling as Signup.

---

#### B3. Password Reset
**Description**: Forgot password flow via InsForge.

**Acceptance Criteria**:
- Clicking "Forgot password?" on the login page opens a modal or navigates to a simple page with an email input.
- User enters their email and clicks "Send Reset Link".
- InsForge sends a password reset email.
- Success message: "If this email is registered, you'll receive a reset link shortly."
- The message does not reveal whether the email exists in the system (security best practice).

---

#### B4. Session Persistence
**Description**: Users remain logged in across browser sessions.

**Acceptance Criteria**:
- Closing and reopening the browser does not log the user out.
- InsForge session management must be configured for persistent sessions (not session-only cookies).
- If the session expires or is invalidated, redirect to `/login` automatically.

---

### Module C: Dashboard (`/dashboard`)

#### C1. Widget List
**Description**: Displays all widgets created by the logged-in user.

**User Story**:
> As a logged-in user, I want to see all my widgets in one place, so that I can manage them easily.

**Acceptance Criteria**:
- Each widget is displayed as a card showing:
  - Widget name (the user's internal label).
  - Created date (formatted, e.g., "Feb 15, 2026").
  - Three action buttons: **Edit**, **Download**, **Delete**.
- Cards are arranged in a responsive grid: multiple columns on desktop, single column on mobile.
- Sorted by most recently created/updated first.

---

#### C2. Empty State
**Description**: What the user sees when they have no widgets.

**Acceptance Criteria**:
- Display a centered illustration or icon.
- Text: "You haven't created any widgets yet."
- "Create New Widget" button → navigates to `/dashboard/new`.

---

#### C3. Create New Widget Button
**Description**: Prominent button at the top of the dashboard.

**Acceptance Criteria**:
- Label: "Create New Widget" or "+ New Widget".
- Located at the top of the page above the widget list.
- Navigates to `/dashboard/new`.
- **Free tier enforcement**: If the user already has 1 widget, clicking this button shows a message/modal: "You've reached the widget limit for the Free plan. Upgrade to Pro for unlimited widgets." and does NOT navigate to the customizer.

---

#### C4. Edit Action
**Description**: Opens the customizer with pre-filled data for an existing widget.

**Acceptance Criteria**:
- Navigates to `/dashboard/edit/[id]`.
- All form fields are populated with the saved configuration from the database.

---

#### C5. Download Action
**Description**: Triggers file generation and ZIP download directly from the dashboard.

**Acceptance Criteria**:
- Clicking "Download" on a widget card triggers the same file generation flow as clicking "Download Files" in the customizer (Section 5).
- No need to open the customizer — downloads using the saved configuration.
- Show a loading spinner on the button during generation.
- On success: browser downloads the ZIP.
- On error: show a toast/notification: "Download failed. Please try again."

---

#### C6. Delete Action
**Description**: Deletes a widget after confirmation.

**Acceptance Criteria**:
- Clicking "Delete" shows a confirmation dialog/modal: "Are you sure you want to delete this widget? This action cannot be undone."
- "Cancel" dismisses the dialog. "Delete" deletes the widget from the database.
- On success: the widget card is removed from the list immediately (optimistic UI or refetch).
- On error: show an error notification.

---

#### C7. Navigation Bar (Dashboard Layout)
**Description**: Top navigation bar on all dashboard pages.

**Acceptance Criteria**:
- Left side: App logo/name ("Nexora"), clickable, links to `/dashboard`.
- Right side: User's email address displayed, with a dropdown menu containing "Log Out".
- "Log Out" clears the session (via InsForge) and redirects to `/login`.
- The navbar is present on `/dashboard`, `/dashboard/new`, and `/dashboard/edit/[id]`.

---

### Module D: Widget Customizer (`/dashboard/new` and `/dashboard/edit/[id]`)

This is the most complex and critical page of the entire application.

#### D1. Page Layout
**Description**: Two-column layout — form on the left, live preview on the right.

**Acceptance Criteria**:
- Left column: ~40% width, scrollable form.
- Right column: ~60% width, sticky live preview.
- On screens < 768px: single column, form on top, preview below.
- Both columns have appropriate padding and spacing.

---

#### D2. Create Mode vs. Edit Mode
**Description**: The same page serves both creating a new widget and editing an existing one.

**Acceptance Criteria**:
- **Create mode** (`/dashboard/new`): All fields start empty or with these defaults:
  | Field | Default Value |
  |---|---|
  | Widget Name | (empty) |
  | Webhook URL | (empty) |
  | Route | `general` |
  | Logo URL | (empty) |
  | Company Name | (empty) |
  | Welcome Text | (empty) |
  | Response Time Text | (empty) |
  | Powered By Text | `Powered by Nexora` |
  | Powered By Link | `https://nexora.app` (or app's URL) |
  | Primary Color | `#854fff` |
  | Secondary Color | `#6b3fd4` |
  | Background Color | `#ffffff` |
  | Font Color | `#333333` |
  | Position | `right` |

- **Edit mode** (`/dashboard/edit/[id]`): Load saved config from InsForge DB and populate all fields. Show a loading skeleton while fetching data.
- If the widget ID doesn't exist or belongs to another user: redirect to `/dashboard` with an error notification.

---

#### D3. Form Section 1 — Widget Settings
**Description**: Basic metadata for the widget.

**Fields**:
| Field | Type | Required | Maps to Config | Notes |
|---|---|---|---|---|
| Widget Name | Text input | Yes | N/A (internal label only) | Not included in the exported files; used only as a label on the dashboard. Max 100 characters. |

---

#### D4. Form Section 2 — Webhook
**Description**: The n8n webhook connection details.

**Fields**:
| Field | Type | Required | Maps to Config | Notes |
|---|---|---|---|---|
| Webhook URL | Text input (URL) | Yes | `webhook.url` | Must start with `http://` or `https://`. Show inline validation error if format is invalid. |
| Route | Text input | No | `webhook.route` | Defaults to `general` if left empty. |

---

#### D5. Form Section 3 — Branding
**Description**: Visual branding elements shown in the widget.

**Fields**:
| Field | Type | Required | Maps to Config | Notes |
|---|---|---|---|---|
| Logo URL | Text input (URL) | No | `branding.logo` | Helper text: "Paste a URL to your logo image (hosted on Imgur, your website, etc.)". The app does NOT handle file uploads. Preview attempts to load the image; on failure, shows a placeholder. |
| Company / Bot Name | Text input | Yes | `branding.name` | Shown in the widget header. Max 50 characters. |
| Welcome Text | Text input | Yes | `branding.welcomeText` | Large greeting on the welcome screen. Max 200 characters. |
| Response Time Text | Text input | No | `branding.responseTimeText` | Subtext below the "Send us a message" button. Max 100 characters. |
| Powered By Text | Text input | Locked on Free | `branding.poweredBy.text` | **Free tier**: Field is visible but disabled (read-only), value locked to "Powered by Nexora". **Pro tier (future)**: Editable, can be blanked out. |
| Powered By Link | Text input (URL) | Locked on Free | `branding.poweredBy.link` | **Free tier**: Disabled, locked to the app's URL. **Pro tier (future)**: Editable, can be blanked out. |

---

#### D6. Form Section 4 — Style
**Description**: Visual customization of the widget's appearance.

**Fields**:
| Field | Type | Required | Maps to Config | Notes |
|---|---|---|---|---|
| Primary Color | Color picker + hex text input | Yes | `style.primaryColor` | Default: `#854fff`. Both inputs must stay in sync. |
| Secondary Color | Color picker + hex text input | Yes | `style.secondaryColor` | Default: `#6b3fd4`. |
| Background Color | Color picker + hex text input | Yes | `style.backgroundColor` | Default: `#ffffff`. |
| Font Color | Color picker + hex text input | Yes | `style.fontColor` | Default: `#333333`. |
| Widget Position | Toggle/Radio (Right \| Left) | Yes | `style.position` | Default: `right`. |

**Color Picker Behavior**:
- Each color field renders as a side-by-side `<input type="color">` (swatch) and a text `<input>` showing the hex value (e.g., `#854fff`).
- Changing the swatch updates the text input. Changing the text input updates the swatch.
- Invalid hex input (e.g., less than 6 characters, non-hex chars) → do not update the swatch; revert to last valid value on blur.

---

#### D7. Real-Time Live Preview
**Description**: The right column displays an interactive preview of the widget that updates instantly as the user modifies any form field.

**User Story**:
> As a user customizing my widget, I want to see exactly how it will look in real time, so that I can make informed design decisions without trial and error.

**Acceptance Criteria**:
- The preview renders an actual instance of the widget (not a screenshot) inside a sandboxed container (iframe or isolated div).
- The preview is displayed inside a simplified browser-window or device mockup frame for realism.
- The following changes update the preview instantly (no delay, no refresh button):
  - Primary color → gradient on toggle button, "Send us a message" button, user message bubbles.
  - Secondary color → second gradient stop on the above elements.
  - Background color → chat container and message area background.
  - Font color → all text in the widget.
  - Logo URL → logo image in the header (shows placeholder on broken URL).
  - Company name → header text.
  - Welcome text → large greeting text.
  - Response time text → subtext.
  - Position toggle → widget appears in bottom-left or bottom-right of the preview area.
  - Powered By text → footer link text.
- The preview does NOT make real webhook calls. It is visual-only.
- The widget's toggle button (floating circle) is clickable in the preview to open/close the chat container.

**Edge Cases**:
- If Logo URL is broken or empty: show a generic placeholder icon in the header (e.g., a chat bubble icon), no broken `<img>` tag.
- If text fields are empty: show the default placeholder values in the preview in a lighter/italic style.

---

#### D8. Save Widget
**Description**: Persists the current configuration to the database.

**User Story**:
> As a user, I want to save my widget configuration so I can come back to it later.

**Acceptance Criteria**:
- "Save Widget" button at the bottom of the form.
- On click: validate all required fields. If any fail, show inline errors and abort.
- Send a POST (create) or PUT (update) request to save the configuration in InsForge DB.
- On success: show a toast notification "Widget saved!".
- **Create mode behavior**: After the first successful save, redirect from `/dashboard/new` to `/dashboard/edit/[new-widget-id]` so subsequent saves update the same record.
- Button shows a spinner and is disabled during the save operation.
- On error: show "Something went wrong. Please try again."

---

#### D9. Download Files
**Description**: Generates and downloads the ZIP file.

**Acceptance Criteria**:
- "Download Files" button at the bottom of the form, next to "Save Widget".
- On click: first runs the Save flow (D8), then triggers the file generation and download (Module E).
- Button shows a spinner and is disabled during the entire operation.
- If save fails: abort, show error, do not proceed to download.
- If generation fails: show error.

---

#### D10. Unsaved Changes Warning
**Description**: Prevents accidental data loss.

**Acceptance Criteria**:
- If the user has modified any form field since the last save (or since page load in create mode) and attempts to navigate away (browser back, clicking navbar links, closing tab), show a browser-native `beforeunload` confirmation dialog.
- After a successful save, reset the dirty state.

---

### Module E: File Generation & Download

#### E1. API Route (`/api/generate-widget`)
**Description**: Server-side endpoint that generates the customized files.

**User Story**:
> As a user, I want to download a ZIP containing my customized widget files, so that I can host and embed them on my website.

**Acceptance Criteria**:
- **Method**: POST
- **Authentication**: Required — verify the user's session/token. Reject with 401 if unauthenticated.
- **Request Body**: JSON object containing all widget configuration fields (see Data Model, Section 5).
- **Process**:
  1. Read the master template file from `templates/chat-widget.js` (stored in the project repo, never modified on disk).
  2. Perform the following string replacements on an in-memory copy:
     - **RGBA Color Replacement**: Convert the user's `primaryColor` hex to RGB. Replace all 8 occurrences of `rgba(133, 79, 255, X)` in the CSS string with `rgba(R, G, B, X)` where R, G, B are the user's primary color components and X is the original opacity. The 8 opacity values are: `0.15`, `0.2`, `0.1`, `0.2`, `0.2`, `0.3`, `0.1`, `0.2`.
     - **Powered By Replacement**: Replace the default `poweredBy` text (`'Powered by Mad'`) and link (`'https://n8n.partnerlinks.io/...'`) in the `defaultConfig` object with the user's values.
  3. Build the HTML snippet string with all user values interpolated (see template below). The `src` attribute of the script tag is set to the literal string `YOUR_CHAT_WIDGET_JS_URL_HERE`.
  4. Package both files into a ZIP using `jszip`:
     - `chat-widget.js` — the modified JS content.
     - `embed.html` — the generated HTML snippet.
  5. Send the ZIP as a binary response.
- **Response Headers**:
  - `Content-Type: application/zip`
  - `Content-Disposition: attachment; filename="chat-widget-[slugified-widget-name].zip"`
- **Error Response**: `{ "error": "message" }` with appropriate HTTP status code.

#### E2. HTML Snippet Template
The generated `embed.html` must contain exactly this structure:
```html
<!-- Widget Configuration -->
<script>
    window.ChatWidgetConfig = {
        webhook: {
            url: '[USER_WEBHOOK_URL]',
            route: '[USER_ROUTE]'
        },
        branding: {
            logo: '[USER_LOGO_URL]',
            name: '[USER_COMPANY_NAME]',
            welcomeText: '[USER_WELCOME_TEXT]',
            responseTimeText: '[USER_RESPONSE_TIME_TEXT]',
            poweredBy: {
                text: '[USER_POWERED_BY_TEXT]',
                link: '[USER_POWERED_BY_LINK]'
            }
        },
        style: {
            primaryColor: '[USER_PRIMARY_COLOR]',
            secondaryColor: '[USER_SECONDARY_COLOR]',
            position: '[USER_POSITION]',
            backgroundColor: '[USER_BACKGROUND_COLOR]',
            fontColor: '[USER_FONT_COLOR]'
        }
    };
</script>

<!-- Widget Script -->
<script src="YOUR_CHAT_WIDGET_JS_URL_HERE"></script>
```

Every `[PLACEHOLDER]` is replaced with the user's actual values. The HTML comments are preserved.

#### E3. Hex-to-RGB Utility
**Location**: `lib/colorUtils.ts`

**Function**: `hexToRgb(hex: string): { r: number; g: number; b: number }`

**Logic**:
1. Strip the `#` prefix.
2. Parse the hex string into three 2-character segments.
3. Convert each segment from base-16 to decimal.
4. Return `{ r, g, b }`.

**Edge Cases**:
- If hex is 3 characters (shorthand like `#f0a`), expand to 6 characters (`#ff00aa`).
- If invalid: return `{ r: 133, g: 79, b: 255 }` (the original purple fallback).

---

### Module F: In-App Deployment Instructions

#### F1. Post-Download Instructions
**Description**: After a successful download, display deployment instructions either as a modal, a slide-out panel, or a dedicated info section.

**Acceptance Criteria**:
- Display 3 clear steps:
  1. **Upload `chat-widget.js` to Vercel**: Create a free Vercel account → create a new project → upload the JS file → copy the deployed URL (e.g., `https://your-project.vercel.app/chat-widget.js`).
  2. **Update the HTML snippet**: Open `embed.html` → find `YOUR_CHAT_WIDGET_JS_URL_HERE` → replace it with the Vercel URL → save.
  3. **Paste into your website**: Open your site's HTML → paste the full contents of `embed.html` before the closing `</body>` tag → save and publish.
- Include a placeholder link for a tutorial video (label: "Watch tutorial video").
- Instructions must be clearly formatted with step numbers, code blocks for file/URL references, and be easy to follow for non-technical users.

---

## 5. Database Schema / Data Model

### InsForge Database

#### Table: `widgets`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key, auto-generated | Unique widget identifier. |
| `user_id` | UUID | Foreign Key → InsForge auth users, NOT NULL | Owner of the widget. |
| `name` | VARCHAR(100) | NOT NULL | Internal label (e.g., "Support Bot"). |
| `webhook_url` | TEXT | NOT NULL | The user's n8n webhook URL. |
| `webhook_route` | VARCHAR(50) | NOT NULL, DEFAULT `'general'` | Route identifier. |
| `logo_url` | TEXT | NULLABLE | URL to the logo image. |
| `company_name` | VARCHAR(50) | NOT NULL | Name displayed in widget header. |
| `welcome_text` | VARCHAR(200) | NOT NULL | Greeting text on welcome screen. |
| `response_time_text` | VARCHAR(100) | NULLABLE | Subtext below "Send us a message". |
| `powered_by_text` | VARCHAR(100) | NOT NULL, DEFAULT `'Powered by Nexora'` | Footer link text. |
| `powered_by_link` | TEXT | NOT NULL, DEFAULT `'https://nexora.app'` | Footer link URL. |
| `primary_color` | CHAR(7) | NOT NULL, DEFAULT `'#854fff'` | Hex color code. |
| `secondary_color` | CHAR(7) | NOT NULL, DEFAULT `'#6b3fd4'` | Hex color code. |
| `background_color` | CHAR(7) | NOT NULL, DEFAULT `'#ffffff'` | Hex color code. |
| `font_color` | CHAR(7) | NOT NULL, DEFAULT `'#333333'` | Hex color code. |
| `position` | VARCHAR(5) | NOT NULL, DEFAULT `'right'`, CHECK IN (`'left'`, `'right'`) | Widget screen position. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Record creation time. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Auto-updated on modification. |

**Indexes**:
- Index on `user_id` for fast dashboard queries.

**Row-Level Security (RLS)**:
- Every query MUST be scoped to `user_id = authenticated_user_id`.
- A user must NEVER be able to read, update, or delete another user's widgets.
- InsForge RLS policies must enforce this at the database level, not just in application code.

---

## 6. API Endpoints

### 6.1 Authentication (InsForge SDK — client-side)

These are handled via the InsForge client SDK, not custom API routes:

| Action | InsForge SDK Method | Notes |
|---|---|---|
| Sign up | `insforge.auth.signUp({ email, password })` | Returns user object or error. |
| Log in | `insforge.auth.signIn({ email, password })` | Returns session or error. |
| Log out | `insforge.auth.signOut()` | Clears session. |
| Password reset | `insforge.auth.resetPassword({ email })` | Sends reset email. |
| Get session | `insforge.auth.getSession()` | Returns current session or null. |
| On auth change | `insforge.auth.onAuthStateChange(callback)` | Listener for session changes. |

### 6.2 Widget CRUD (InsForge Database — client-side)

| Action | Method | Path/Table | Auth Required | Request | Response |
|---|---|---|---|---|---|
| List user widgets | SELECT | `widgets` | Yes | Filter: `user_id = currentUser.id`, order by `created_at DESC` | Array of widget objects. |
| Get single widget | SELECT | `widgets` | Yes | Filter: `id = widgetId AND user_id = currentUser.id` | Single widget object or null. |
| Create widget | INSERT | `widgets` | Yes | All fields except `id`, `created_at`, `updated_at` (auto-set). Also auto-set `user_id` to current user. | Created widget object with `id`. |
| Update widget | UPDATE | `widgets` | Yes | Filter: `id = widgetId AND user_id = currentUser.id`. Body: updated fields. | Updated widget object. |
| Delete widget | DELETE | `widgets` | Yes | Filter: `id = widgetId AND user_id = currentUser.id` | Success/error. |
| Count user widgets | SELECT COUNT | `widgets` | Yes | Filter: `user_id = currentUser.id` | Integer count (used for Free tier enforcement). |

### 6.3 File Generation (Custom Next.js API Route)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/generate-widget` | Yes (verify session) | `{ webhookUrl, webhookRoute, logoUrl, companyName, welcomeText, responseTimeText, poweredByText, poweredByLink, primaryColor, secondaryColor, backgroundColor, fontColor, position, widgetName }` | Binary ZIP file (`application/zip`). On error: `{ error: "message" }` with 400/401/500 status. |

**Server-side validation on `/api/generate-widget`**:
- `webhookUrl`: Must be a valid URL starting with `http://` or `https://`.
- `primaryColor`, `secondaryColor`, `backgroundColor`, `fontColor`: Must be valid 7-character hex codes starting with `#`.
- `position`: Must be `"left"` or `"right"`.
- `companyName`, `welcomeText`: Must not be empty strings.
- If validation fails: return 400 with `{ error: "Invalid configuration: [details]" }`.

---

## 7. UI/UX Specifications

### Reference: [n8nchatui.com](https://n8nchatui.com/)
Use this site as a primary visual and UX reference for the landing page layout, the overall modern/dark aesthetic, and how a chat widget configuration tool should feel. Key patterns to adopt:
- Dark background with gradient accents.
- Clean card-based feature display.
- Social proof elements (user count badge).
- Clear CTAs with contrast.

### 7.1 Landing Page (`/`)

| Element | Details |
|---|---|
| Background | Dark theme (e.g., near-black `#0a0a0f` with subtle gradient or mesh overlay). |
| Navbar | Floating/glassmorphism style. Logo left, links right (Pricing, FAQs, Login, "Get Started" CTA button). |
| Hero | Left: headline + subheadline + CTA button. Right: widget mockup/screenshot. |
| How It Works | 3-step horizontal cards with numbered badges and icons. |
| Features | Grid of feature cards (2-3 columns on desktop, 1 column mobile). |
| Pricing | Two cards side by side, Free and Pro. Subtle highlight/border on the Pro card. |
| Footer | Links, logo, legal links. |
| Font | Geist Sans. Body size 16px minimum. Clean headings with good hierarchy. |

**Responsive Breakpoints**:
- `< 640px` (mobile): Single column everything, stacked hero, stacked pricing cards.
- `640px – 1024px` (tablet): 2-column grid where appropriate.
- `> 1024px` (desktop): Full multi-column layouts.

---

### 7.2 Auth Pages (`/signup`, `/login`)

| Element | Details |
|---|---|
| Layout | Centered card on a dark/neutral background. Max width ~400px. |
| Form | Stacked fields: Email, Password. Inline error messages below each field in red text. |
| Button | Full-width primary button. Shows spinner during submission. |
| Links | Below the form: "Already have an account? Log in" or "Don't have an account? Sign up". |

---

### 7.3 Dashboard (`/dashboard`)

| Element | Details |
|---|---|
| Navbar | Top bar with logo (left), user email + logout dropdown (right). |
| "Create New Widget" Button | Prominent, top of the page, primary color. |
| Widget Cards | Grid layout. Each card shows: widget name (bold), created date (muted text), and a row of icon buttons (Edit, Download, Delete) at the bottom. Card has subtle border and hover effect. |
| Empty State | Centered icon + text + "Create" button. |
| Delete Confirmation | Modal dialog with "Cancel"/"Delete" buttons. Delete button is red/destructive color. |

---

### 7.4 Customizer (`/dashboard/new`, `/dashboard/edit/[id]`)

| Element | Details |
|---|---|
| Layout | Two-column: left form (~40%), right preview (~60%). Form is scrollable. Preview is sticky (stays in viewport as user scrolls the form). |
| Form Sections | Clearly labeled with section headings: "Widget Settings", "Webhook", "Branding", "Style". Each section has visual separation (heading + divider or background change). |
| Color Pickers | Side-by-side: `<input type="color">` swatch (small square) + text input showing hex. |
| Position Toggle | Two visually styled radio buttons or segmented control: "Left" \| "Right". |
| Powered By Fields | On Free tier: fields are visible but grayed out with a lock icon and tooltip: "Upgrade to Pro to customize." |
| Save/Download Buttons | Bottom of the form. Side by side. "Save Widget" (secondary style), "Download Files" (primary style). Both show spinners during async operations. |
| Preview Area | Widget preview inside a browser mockup frame (gray browser chrome with dots). The widget's toggle button is visible and clickable. |
| Mobile (< 768px) | Single column: form first, preview below. |

---

### 7.5 Notification System

| Type | Trigger | Style |
|---|---|---|
| Success toast | Widget saved, download complete | Green accent, top-right, auto-dismiss after 4s. |
| Error toast | Save/download failed, network error | Red accent, top-right, auto-dismiss after 6s. |
| Info/Warning | Free tier limit reached | Yellow accent or modal dialog. |

---

## 8. User Flows

### Flow 1: First-Time User (Signup → Create Widget → Download)
1. User visits `/` (landing page).
2. Clicks "Get Started" CTA → navigates to `/signup`.
3. Enters email and password → clicks "Create Account".
4. InsForge creates the account → user is redirected to `/dashboard`.
5. Dashboard shows empty state with "Create New Widget" button.
6. User clicks "Create New Widget" → navigates to `/dashboard/new`.
7. User fills in: Widget Name, Webhook URL, Company Name, Welcome Text.
8. User picks colors, adds logo URL, adjusts position.
9. Preview updates in real time with every change.
10. User clicks "Save Widget" → config is saved to DB → toast "Widget saved!" → URL changes to `/dashboard/edit/[id]`.
11. User clicks "Download Files" → save runs first → API generates ZIP → browser downloads `chat-widget-[name].zip`.
12. Post-download instructions are shown (how to deploy to Vercel).

### Flow 2: Returning User (Login → Edit Widget)
1. User visits `/login`.
2. Enters credentials → clicks "Log In".
3. Redirected to `/dashboard` which shows their existing widget(s).
4. Clicks "Edit" on a widget → navigates to `/dashboard/edit/[id]`.
5. Customizer loads with all saved fields pre-filled.
6. User modifies fields → preview updates live.
7. User clicks "Save Widget" → updated config is saved.

### Flow 3: Dashboard Download
1. User is on `/dashboard`.
2. Clicks "Download" on a widget card.
3. Loading spinner appears on the button.
4. Server generates the ZIP using the saved config.
5. Browser downloads the ZIP. Spinner stops.

### Flow 4: Delete Widget
1. User is on `/dashboard`.
2. Clicks "Delete" on a widget card.
3. Confirmation modal appears: "Are you sure? This cannot be undone."
4. User clicks "Delete" → widget is deleted from DB → card is removed from the list.
5. If the user had only 1 widget, the dashboard now shows the empty state.

### Flow 5: Password Reset
1. User is on `/login`.
2. Clicks "Forgot password?".
3. Enters their email → clicks "Send Reset Link".
4. Success message shown. InsForge sends the email.
5. User clicks the link in the email → sets a new password → redirected to `/login`.

### Flow 6: Free Tier Limit Hit
1. User already has 1 widget on the Free tier.
2. Clicks "Create New Widget" on the dashboard.
3. A message/modal appears: "You've reached the widget limit on the Free plan. Upgrade to Pro for unlimited widgets."
4. User is NOT navigated to the customizer.

---

## 9. Authentication & Authorization

### Authentication Provider
**InsForge** (https://insforge.dev/)

### Implementation Requirements
1. **Signup**: Use InsForge's `auth.signUp()` with email + password.
2. **Login**: Use InsForge's `auth.signIn()` with email + password.
3. **Session Management**: Configure InsForge for persistent sessions (session token stored in a secure cookie or local storage per InsForge defaults). The user must remain logged in across browser restarts.
4. **Auth State Listener**: Set up `auth.onAuthStateChange()` at the app root to track auth state globally (e.g., in a React context or a top-level layout component).
5. **Route Protection**: All `/dashboard/*` routes must be protected:
   - If no active session: redirect to `/login`.
   - Implement this in a layout component wrapping all dashboard pages.
6. **Password Reset**: Use InsForge's built-in `auth.resetPassword()` → sends an email → user clicks the link → sets new password.
7. **Logout**: Call `auth.signOut()` → clear client state → redirect to `/login`.

### Authorization (Data-Level)
- All database queries MUST include `user_id = currentUser.id` as a filter. A user must NEVER see, edit, or delete another user's data.
- InsForge Row-Level Security (RLS) policies must be configured on the `widgets` table to enforce this at the database level.
- The `/api/generate-widget` API route must verify the user's session before proceeding. If no valid session, return `401 Unauthorized`.

---

## 10. Third-Party Integrations

| Service | Purpose | How It's Used |
|---|---|---|
| **InsForge** | Authentication, database, RLS | Used via the InsForge MCP and SDK. Handles all user auth and data storage. The builder MUST use the InsForge MCP to create the project, set up tables, configure RLS, and integrate the SDK. |
| **Vercel** | App deployment | The Next.js app is deployed to Vercel. Standard Next.js deployment process. |
| **jszip** | ZIP file creation | Used server-side in the `/api/generate-widget` route to package both generated files into a downloadable ZIP. |
| **Geist Sans Font CDN (jsDelivr)** | Widget font loading | The widget's internal JS loads this font via a dynamically created `<link>` tag. The app itself uses `next/font` for Geist Sans. |
| **Stripe** (Future — NOT in MVP) | Payment processing | Will be used for Pro tier subscriptions. Out of scope for launch. |

---

## 11. Non-Functional Requirements

### Performance
- **Page Load**: All pages must achieve a Lighthouse Performance score of ≥ 85.
- **Time to Interactive (TTI)**: Landing page < 3 seconds on a 3G connection.
- **API Response**: `/api/generate-widget` must respond in < 3 seconds for a single widget generation.
- **Live Preview**: Preview must update within 100ms of a form field change (no perceptible lag).

### Security
- All pages served over HTTPS (enforced by Vercel).
- Auth tokens/sessions managed by InsForge — do not store raw passwords or sensitive tokens in local storage.
- Server-side validation on all API inputs (the `/api/generate-widget` route).
- Row-Level Security on the database — enforced by InsForge RLS policies.
- CORS: Only allow requests from the app's own domain.
- Rate limiting on the `/api/generate-widget` endpoint: max 10 requests per user per minute.
- No sensitive data exposed in error messages (e.g., do not reveal whether an email exists during password reset).

### Scalability
- The app is lightweight (no chat processing, no real-time connections from widgets). Standard Vercel serverless scaling is sufficient.
- Database is InsForge-managed Postgres — scales with InsForge's infrastructure.

### Accessibility
- All pages must meet WCAG 2.1 Level AA.
- Minimum 4.5:1 color contrast ratio for all text.
- All form inputs must have associated `<label>` elements.
- All images/icons must have `alt` text.
- All interactive elements must be keyboard-navigable with visible focus states.
- Color must not be the only means of conveying information (e.g., errors must also include text/icons, not just red highlighting).

### SEO
- Landing page must have a proper `<title>` tag, `<meta description>`, and Open Graph tags.
- Proper heading hierarchy: single `<h1>` per page.
- Semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`).
- Dashboard pages do not need SEO optimization (they are behind auth).

---

## 12. Phasing / MVP Plan

### Phase 1 — MVP (Build This First)

| Feature | Priority |
|---|---|
| Landing page (Hero, How It Works, Features, Pricing, Footer) | Critical |
| Authentication (Signup, Login, Logout, Password Reset) | Critical |
| Dashboard (Widget list, empty state, CRUD actions) | Critical |
| Customizer (Full form, live preview, save, download) | Critical |
| File generation API (string replacement, ZIP creation) | Critical |
| Free tier enforcement (1 widget limit, locked Powered By) | Critical |
| Responsive design (mobile and desktop) | Critical |
| Post-download deployment instructions | High |
| Toast notification system | High |
| Unsaved changes warning | Medium |
| Loading states and spinners | High |
| Form validation (client-side + server-side) | Critical |

### Phase 2 — Post-MVP Enhancements

| Feature | Priority |
|---|---|
| Stripe payment integration for Pro tier | High |
| Pro tier activation: unlimited widgets + unlocked Powered By | High |
| Logo file upload (instead of paste-a-URL) | Medium |
| Tutorial video integration (embed in instructions) | Medium |
| Dark/light mode toggle for the app itself | Low |
| Widget templates (pre-built color/design presets) | Low |
| Analytics: track how many times a widget ZIP has been downloaded | Low |

### Future Considerations (Not Planned)
- Team/multi-user accounts.
- Widget hosting by the app (serving the JS from Nexora's CDN).
- Chat history/analytics from deployed widgets.
- White-labeling the entire app for agencies.

---

## 13. Project File & Folder Structure

```
/app                                  — Next.js App Router pages
  /layout.tsx                         — Root layout (global providers, Geist font, Tailwind)
  /page.tsx                           — Landing page (/)
  /login/
    /page.tsx                         — Login page
  /signup/
    /page.tsx                         — Signup page
  /dashboard/
    /layout.tsx                       — Dashboard layout (auth guard, navbar)
    /page.tsx                         — Dashboard page (widget list)
    /new/
      /page.tsx                       — Create new widget (customizer, create mode)
    /edit/
      /[id]/
        /page.tsx                     — Edit widget (customizer, edit mode)
  /api/
    /generate-widget/
      /route.ts                       — File generation API route

/components/
  /ui/                                — Shared/reusable UI primitives
    /Button.tsx                       — Button component (variants: primary, secondary, destructive, ghost)
    /Input.tsx                        — Text input with label and error state
    /Modal.tsx                        — Confirmation dialog/modal
    /Toast.tsx                        — Toast notification component
    /Spinner.tsx                      — Loading spinner
  /landing/                           — Landing page section components
    /Hero.tsx
    /HowItWorks.tsx
    /Features.tsx
    /Pricing.tsx
    /Footer.tsx
    /LandingNavbar.tsx
  /dashboard/                         — Dashboard components
    /DashboardNavbar.tsx              — Auth navbar with user menu
    /WidgetCard.tsx                   — Card for each widget in the list
    /EmptyState.tsx                   — Empty dashboard state
    /DeleteConfirmModal.tsx           — Delete confirmation dialog
  /customizer/                        — Customizer components
    /CustomizerForm.tsx               — The full form (all 4 sections)
    /FormSection.tsx                  — Section wrapper with heading
    /ColorPicker.tsx                  — Color swatch + hex input component
    /PositionToggle.tsx               — Left/Right toggle
    /PreviewPane.tsx                  — Live preview with device mockup
    /DeployInstructions.tsx           — Post-download instructions

/lib/
  /insforge.ts                        — InsForge client initialization
  /auth.ts                            — Auth helper functions (session check, sign out, etc.)
  /widgets.ts                         — Widget CRUD functions (list, get, create, update, delete, count)
  /widgetGenerator.ts                 — File generation logic (string replacement, ZIP packaging)
  /colorUtils.ts                      — hexToRgb() and related color utilities
  /validators.ts                      — Form and API input validation functions
  /constants.ts                       — Default values, tier limits, and shared constants

/templates/
  /chat-widget.js                     — Master template JS file (READ-ONLY, never modified on disk)

/public/
  /images/                            — Static assets (landing page illustrations, OG image)
  /favicon.ico

/styles/
  /globals.css                        — Tailwind base + global styles

/.env.local                           — Environment variables (InsForge keys, app URL)
/next.config.js                       — Next.js configuration
/tailwind.config.ts                   — Tailwind configuration
/tsconfig.json                        — TypeScript configuration
/package.json                         — Dependencies and scripts
```

---

## 14. Error Handling Strategy

### Global Error Handling
- Use Next.js `error.tsx` at the app root for uncaught page-level errors. Display a friendly error page: "Something went wrong" with a "Go to Dashboard" button.
- Use `not-found.tsx` for 404 pages — display "Page not found" with a link to the landing page.

### Form Validation Errors (Client-Side)
- Validate all required fields before submission.
- Display inline error messages directly below the offending field in red text.
- Errors: "Widget name is required", "Enter a valid webhook URL", "Company name is required", "Welcome text is required".
- Hex color fields: validate format `#XXXXXX`. On invalid: "Enter a valid hex color (e.g., #854fff)".

### API Errors (Server-Side)
- **400 Bad Request**: Invalid input (e.g., missing fields, invalid hex). Response: `{ error: "Invalid configuration: [details]" }`.
- **401 Unauthorized**: No valid session. Response: `{ error: "Authentication required" }`.
- **404 Not Found**: Widget not found or not owned by user. Response: `{ error: "Widget not found" }`.
- **500 Internal Server Error**: Unexpected failure. Response: `{ error: "An unexpected error occurred" }`. Log the actual error server-side.

### Network Errors (Client-Side)
- If any API call fails due to a network issue (fetch throws): show a toast: "Network error. Please check your connection and try again."
- Never fail silently. Every error state must have a visible notification.

### InsForge Auth Errors
| Error | User-Facing Message |
|---|---|
| Email already registered | "An account with this email already exists." |
| Invalid credentials | "Invalid email or password." |
| Weak password | "Password must be at least 8 characters." |
| Rate limited | "Too many attempts. Please try again later." |
| Network failure | "Connection error. Please try again." |

---

## 15. Testing Strategy

### Unit Tests
**Tool**: Jest + React Testing Library

| What to Test | Details |
|---|---|
| `hexToRgb()` | Test valid hex (6-char, 3-char shorthand), invalid hex (returns fallback), edge cases (lowercase, uppercase, with/without `#`). |
| `widgetGenerator.ts` | Test that RGBA replacement correctly swaps all 8 occurrences. Test that Powered By values are replaced correctly. Test that the HTML snippet is assembled with all user values. |
| `validators.ts` | Test all validation functions: required field checks, URL format, hex format, position value. |
| Form components | Test that `ColorPicker` syncs swatch and text input. Test that `PositionToggle` toggles correctly. |

### Integration Tests
**Tool**: Jest or Playwright

| What to Test | Details |
|---|---|
| `/api/generate-widget` | Send a valid config → verify ZIP is returned with correct content. Send invalid config → verify 400 error. Send without auth → verify 401. |
| Widget CRUD | Create a widget → verify it appears in list. Update → verify changes persist. Delete → verify it's gone. |
| Auth flow | Sign up → verify redirect to dashboard. Log in → verify session. Log out → verify redirect to login. |

### End-to-End (E2E) Tests
**Tool**: Playwright (via the `webapp-testing` skill)

| Flow | Steps |
|---|---|
| Full signup → create → download | Visit signup → create account → land on dashboard → create widget → fill form → save → download → verify ZIP downloads. |
| Edit widget flow | Log in → go to dashboard → click Edit → modify fields → save → verify changes persist. |
| Delete widget flow | Log in → create widget → delete it → verify empty state. |
| Free tier limit | Create 1 widget → try to create another → verify limit message appears. |
| Login with invalid credentials | Enter wrong password → verify error message. |

### Critical Test Cases (Must Not Fail)
1. RGBA color replacement produces exactly 8 correct replacements with the user's RGB values.
2. Generated HTML snippet contains all user values and no `[PLACEHOLDER]` text.
3. ZIP file contains exactly 2 files: `chat-widget.js` and `embed.html`.
4. A user cannot access another user's widget (RLS enforcement).
5. Free tier user cannot create more than 1 widget.
6. Powered By fields are locked (disabled) on the Free tier.
7. Live preview updates instantly when any form field changes.
8. Unsaved changes warning fires when navigating away with dirty form.
9. Auth redirect: unauthenticated user visiting `/dashboard` is redirected to `/login`.
10. Password reset flow does not reveal whether an email exists in the system.

---

## Appendix A: Master Template File (`templates/chat-widget.js`)

The original `chat-widget.js` file (~503 lines) must be sourced from the open-source repository: [https://github.com/juansebsol/n8n-chatbot-template](https://github.com/juansebsol/n8n-chatbot-template).

**Before using this file**, the builder must:
1. Verify the repository's license permits commercial use.
2. Download the file and place it at `templates/chat-widget.js`.
3. Do NOT modify this file on disk — all modifications happen in-memory during generation.

### Key details about the file:
- It is an IIFE (Immediately Invoked Function Expression).
- It creates its own CSS, injects it, and builds DOM elements dynamically.
- It reads `window.ChatWidgetConfig` for configuration.
- It checks `window.N8NChatWidgetInitialized` to prevent double-loading.
- It loads Geist Sans from jsDelivr CDN.
- It communicates via `fetch()` POST to the webhook URL with actions: `loadPreviousSession` and `sendMessage`.
- It manages session IDs via `crypto.randomUUID()`.
- It has two visual states: welcome screen → chat interface.
- The 8 hardcoded RGBA purple values that MUST be replaced are:
  1. `box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15)` — chat container
  2. `border: 1px solid rgba(133, 79, 255, 0.2)` — chat container
  3. `border-bottom: 1px solid rgba(133, 79, 255, 0.1)` — brand header
  4. `box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2)` — user message bubbles
  5. `border: 1px solid rgba(133, 79, 255, 0.2)` — bot message bubbles
  6. `box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3)` — toggle button
  7. `border-top: 1px solid rgba(133, 79, 255, 0.1)` — chat input area
  8. `border: 1px solid rgba(133, 79, 255, 0.2)` — textarea

---

## Appendix B: What the App Does NOT Do

To prevent scope creep and over-engineering, explicitly **do not build**:
1. ❌ Widget file hosting — users self-host their JS file.
2. ❌ Logo file uploads — users paste a URL to an externally hosted image.
3. ❌ n8n/AI integration — the webhook URL is passed through; no AI logic lives in this app.
4. ❌ Chat history or analytics — the app has no visibility into deployed widget conversations.
5. ❌ Payment processing — Pro tier is "Coming Soon" at launch.
6. ❌ Team/multi-user accounts — each account is individual.
7. ❌ Widget versioning — there is no version history for widget configurations.
8. ❌ Custom domain support — widgets are embedded via a script tag, no custom domain needed.

---

## Appendix C: Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project URL. |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous/public API key. |
| `INSFORGE_SERVICE_ROLE_KEY` | InsForge service role key (server-side only, for admin operations if needed). |
| `NEXT_PUBLIC_APP_URL` | The app's own URL (e.g., `https://nexora.app`). Used as default Powered By link. |

---
