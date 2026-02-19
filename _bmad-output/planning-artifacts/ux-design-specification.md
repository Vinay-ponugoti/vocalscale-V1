# UX Design Specification: VocalScale Frontend Enhancement

**Version:** 1.0
**Date:** 2026-02-19
**Author:** UX Designer Agent

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Component Library](#3-component-library)
4. [Page Layouts](#4-page-layouts)
5. [Screen Flows](#5-screen-flows)
6. [Component Inventory](#6-component-inventory)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)
10. [Dark Mode](#10-dark-mode)
11. [Backend Integration Notes](#11-backend-integration-notes)

---

## 1. Design Principles

### 1.1 Core Principles

**1. Clarity Over Cleverness**
VocalScale serves busy business owners and operations managers who need clear, unambiguous information at a glance. Never sacrifice clarity for visual flair. When in doubt, make it simple.

**2. Trust Through Transparency**
Users are entrusting VocalScale with their customer communications. Be transparent about trial expiration, usage limits, costs, and AI actions. Never hide important information behind multiple clicks.

**3. Omnichannel First**
Voice and SMS are equal citizens in the same conversation. Design interfaces that handle both channels seamlessly without forcing users to switch contexts.

**4. Progressive Disclosure**
Show what matters most first (active calls, unread messages). Reveal complexity (transcripts, analytics) on demand. Power users get depth; casual users get simplicity.

**5. Reduce Friction, Not Value**
The free trial removes signup friction. Similarly, design flows that remove barriers to value (auto-login after signup, one-click actions, smart defaults).

### 1.2 Brand Personality

**Professional yet Approachable**
- Tone: Confident, helpful, human
- Voice: Clear, direct, slightly conversational
- Feeling: Reliable, efficient, modern

**Rational + Emotional**
- Rational: Data-driven insights, clear metrics
- Emotional: Trust-building through transparency, helpful guidance

---

## 2. Design Tokens

### 2.1 Color Palette

#### Primary Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `primary` | `#3B82F6` (Blue 500) | `#3B82F6` | Primary CTAs, active states |
| `primary-hover` | `#2563EB` (Blue 600) | `#60A5FA` | Primary button hover |
| `primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary buttons |

#### Secondary Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `secondary` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Secondary backgrounds |
| `secondary-foreground` | `#0F172A` (Slate 900) | `#F1F5F9` | Text on secondary backgrounds |

#### Semantic Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `success` | `#22C55E` (Green 500) | `#22C55E` | Success states, resolved calls |
| `warning` | `#F59E0B` (Amber 500) | `#F59E0B` | Warnings, trial expiring |
| `danger` | `#EF4444` (Red 500) | `#EF4444` | Errors, failed states |
| `info` | `#3B82F6` (Blue 500) | `#3B82F6` | Informational messages |

#### Sentiment Colors (Analytics)

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `sentiment-positive` | `#22C55E` | `#22C55E` | Positive sentiment |
| `sentiment-neutral` | `#94A3B8` | `#64748B` | Neutral sentiment |
| `sentiment-negative` | `#EF4444` | `#EF4444` | Negative sentiment |

#### Channel Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `channel-voice` | `#8B5CF6` (Purple 500) | `#8B5CF6` | Voice calls |
| `channel-sms` | `#06B6D4` (Cyan 500) | `#06B6D4` | SMS messages |
| `channel-chat` | `#F59E0B` (Amber 500) | `#F59E0B` | Chat (future) |

#### Neutral Scale

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| `background` | `#FFFFFF` | `#0F172A` (Slate 900) | Page background |
| `foreground` | `#0F172A` (Slate 900) | `#F1F5F9` | Primary text |
| `muted` | `#64748B` (Slate 500) | `#94A3B8` | Secondary text |
| `border` | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Borders, dividers |
| `card` | `#FFFFFF` | `#1E293B` (Slate 800) | Card backgrounds |

### 2.2 Typography

**Font Family:** System sans-serif (SF Pro, Inter, Segoe UI, Roboto)

#### Text Scale

| Name | Size (rem) | Size (px) | Weight | Line Height | Usage |
|------|------------|-----------|--------|-------------|-------|
| `display-lg` | 3.75 | 60 | 700 | 1.1 | Landing page hero |
| `display-md` | 3 | 48 | 700 | 1.1 | Major page titles |
| `display-sm` | 2.25 | 36 | 600 | 1.2 | Section headers |
| `h1` | 1.875 | 30 | 600 | 1.2 | Page titles |
| `h2` | 1.5 | 24 | 600 | 1.3 | Section headings |
| `h3` | 1.25 | 20 | 600 | 1.4 | Card titles |
| `h4` | 1.125 | 18 | 500 | 1.5 | Subsection titles |
| `body-lg` | 1.125 | 18 | 400 | 1.5 | Emphasized body text |
| `body` | 1 | 16 | 400 | 1.6 | Body text |
| `body-sm` | 0.875 | 14 | 400 | 1.5 | Secondary text |
| `caption` | 0.75 | 12 | 400 | 1.4 | Labels, timestamps |

### 2.3 Spacing Scale

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|-------|
| `space-0` | 0 | 0 | No spacing |
| `space-1` | 0.25 | 4 | Tight gaps, icons |
| `space-2` | 0.5 | 8 | Small spacing |
| `space-3` | 0.75 | 12 | Compact spacing |
| `space-4` | 1 | 16 | Default spacing |
| `space-5` | 1.25 | 20 | Medium spacing |
| `space-6` | 1.5 | 24 | Section spacing |
| `space-8` | 2 | 32 | Large spacing |
| `space-10` | 2.5 | 40 | Section gaps |
| `space-12` | 3 | 48 | Page sections |
| `space-16` | 4 | 64 | Major sections |

### 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Full-width elements |
| `radius-sm` | 2px | Small badges, tags |
| `radius-md` | 6px | Buttons, inputs |
| `radius-lg` | 8px | Cards, modals |
| `radius-xl` | 12px | Large cards, panels |
| `radius-full` | 9999px | Avatars, pills |

### 2.5 Shadows

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | `0 1px 2px 0 rgba(0,0,0,0.3)` | Subtle depth |
| `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1)` | `0 1px 3px 0 rgba(0,0,0,0.4)` | Cards |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | `0 4px 6px -1px rgba(0,0,0,0.5)` | Elevation |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | `0 10px 15px -3px rgba(0,0,0,0.6)` | Modals, dropdowns |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | `0 20px 25px -5px rgba(0,0,0,0.7)` | Popovers |

### 2.6 Animation

| Property | Value | Usage |
|----------|-------|-------|
| `duration-fast` | 150ms | Micro-interactions (hover, focus) |
| `duration-normal` | 200ms | Default transitions |
| `duration-slow` | 300ms | Modal open/close |
| `duration-slower` | 500ms | Page transitions |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Enter animations |
| `easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| `easing-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Spring physics |

### 2.7 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Default |
| `z-10` | 10 | Dropdowns |
| `z-20` | 20 | Sticky headers |
| `z-30` | 30 | Modals |
| `z-40` | 40 | Popovers |
| `z-50` | 50 | Toasts |

---

## 3. Component Library

### 3.1 TrialBanner

**Purpose:** Display trial countdown and upgrade CTA

**Visual Appearance:**
- Full-width banner at top of dashboard
- Background: `warning` color (`#F59E0B`)
- Text: White with `warning-foreground`
- Countdown timer prominently displayed
- "Upgrade Now" CTA button on the right

**States:**
- **Active:** Trial running, countdown showing
- **Expiring (≤3 days):** Same visual, more urgent copy
- **Expired:** Red background, "Trial expired" message

**Accessibility:**
- `role="status"` for live regions
- Countdown updates announce to screen readers
- Keyboard-navigable upgrade button

**Usage:**
```tsx
<TrialBanner
  daysRemaining={12}
  onUpgrade={() => navigate('/pricing')}
/>
```

### 3.2 ConversationCard

**Purpose:** Display conversation summary in unified inbox

**Visual Appearance:**
- Card with avatar (left), info (middle), metadata (right)
- Avatar: Circle with initials or customer photo
- Customer name and phone number
- Preview of last message (truncated)
- Channel icon (phone/message)
- Timestamp relative to now
- Unread indicator (blue dot)
- Hover: Light shadow, card lifts slightly

**Variants:**
- **Voice:** Phone icon, purple badge
- **SMS:** Message icon, cyan badge
- **Active:** Green pulsing indicator for ongoing calls
- **Unread:** Blue dot, bold text

**States:**
- **Default:** Normal card
- **Hover:** Shadow increases, card lifts
- **Selected:** Primary border, background tint
- **Unread:** Blue dot, bold preview text

**Accessibility:**
- `role="button"` for clickable cards
- Full card focusable with Tab
- Screen reader announces: "{name}, {channel}, {preview}, {time ago}"

**Usage:**
```tsx
<ConversationCard
  id="conv-123"
  customerName="John Doe"
  customerPhone="+15551234567"
  lastMessage="Can you reschedule my appointment?"
  channel="sms"
  timestamp={Date.now()}
  unread={true}
  active={false}
  onClick={() => openConversation('conv-123')}
/>
```

### 3.3 TranscriptPanel

**Purpose:** Display live call transcription

**Visual Appearance:**
- Side panel (right side of call detail)
- Split into sections: status, transcript, actions
- Status bar at top: "Live" indicator with pulsing dot
- Transcript: Chat-like interface with speaker labels
- Speaker labels: Color-coded (Customer: blue, AI: green)
- Messages: Bubbles with timestamp
- Actions: End call, mute, download transcript

**States:**
- **Connecting:** Spinner, "Connecting..."
- **Live:** "Live" badge, messages streaming
- **Paused:** "Paused" badge, no new messages
- **Complete:** "Completed" badge, all messages shown

**Accessibility:**
- `aria-live="polite"` for transcript updates
- Messages announce as they arrive (debounced)
- Keyboard shortcuts: `E` to end call, `M` to mute

**Usage:**
```tsx
<TranscriptPanel
  callId="call-456"
  status="live"
  transcript={transcriptData}
  onEndCall={() => endCall('call-456')}
  onMute={() => toggleMute('call-456')}
/>
```

### 3.4 SMSComposer

**Purpose:** Compose and send SMS messages

**Visual Appearance:**
- Textarea at bottom of conversation view
- Character count and segment count (e.g., "142/160 • 1 segment")
- Send button (right-aligned)
- Attachments button (future enhancement)
- Emoji picker button (future enhancement)

**States:**
- **Empty:** Placeholder text "Type a message..."
- **Typing:** Character count updates
- **Over limit:** Character count turns red, send button disabled
- **Sending:** Button shows spinner
- **Failed:** Error message inline, retry button

**Accessibility:**
- `aria-label` for character count
- Error messages associated with textarea via `aria-describedby`
- Send button has keyboard shortcut: `Cmd+Enter` / `Ctrl+Enter`

**Usage:**
```tsx
<SMSComposer
  conversationId="conv-123"
  recipientPhone="+15551234567"
  onSend={(message) => sendSMS(message)}
  maxLength={1600}
/>
```

### 3.5 SentimentChart

**Purpose:** Display sentiment trends over time

**Visual Appearance:**
- Line chart using Recharts
- X-axis: Time (daily/weekly)
- Y-axis: Sentiment score (-1 to +1)
- Zero line at center (neutral)
- Positive sentiment: Green area above zero
- Negative sentiment: Red area below zero
- Hover tooltips with details
- Date range selector above chart

**Variants:**
- **Daily:** Show daily sentiment
- **Weekly:** Aggregate weekly sentiment
- **By Channel:** Separate lines for voice vs. SMS

**States:**
- **Loading:** Skeleton chart
- **Empty:** "No data for selected period"
- **Error:** Error message with retry button

**Accessibility:**
- Chart data available in table format (screen reader)
- Keyboard-navigable chart points (optional enhancement)
- Color contrast meets WCAG AA

**Usage:**
```tsx
<SentimentChart
  data={sentimentData}
  period="7d"
  granularity="daily"
  onPeriodChange={(period) => fetchSentiment(period)}
/>
```

### 3.6 VoiceUploader

**Purpose:** Upload audio sample for voice cloning

**Visual Appearance:**
- Drag-and-drop zone (dashed border)
- Upload icon in center
- Text: "Drop audio file here or click to upload"
- Supported formats listed (MP3, WAV, M4A)
- File info after selection: name, size, duration
- Progress bar during upload
- Processing status after upload

**States:**
- **Idle:** Drag zone visible
- **Dragging:** Border color changes to primary
- **Selected:** File info shown, upload button enabled
- **Uploading:** Progress bar animating
- **Processing:** "Processing..." with estimated time
- **Complete:** "Voice ready!", preview player appears
- **Error:** Error message with retry

**Accessibility:**
- File input visible to screen readers
- Drag zone announces drop events
- Error messages associated with uploader
- Keyboard-accessible upload button

**Usage:**
```tsx
<VoiceUploader
  acceptedFormats={['audio/mpeg', 'audio/wav', 'audio/mp4']}
  maxFileSizeMB={10}
  minDuration={45}
  maxDuration={90}
  onUpload={(file) => uploadVoiceSample(file)}
/>
```

### 3.7 VoiceLibrary

**Purpose:** Display and manage custom voices

**Visual Appearance:**
- Grid/list of voice cards
- Each card: Voice name, status icon, preview button, assign button, delete button
- Status indicators:
  - "Processing" (spinner)
  - "Ready" (checkmark)
  - "Failed" (error icon)
- Default voices shown first
- Custom voices below

**States:**
- **Loading:** Skeleton cards
- **Empty:** "No custom voices yet" + CTA to create one
- **Selected:** Primary border on selected card

**Accessibility:**
- Grid navigation with arrow keys
- Each card focusable
- Status announced to screen readers
- Preview button has play/pause toggle

**Usage:**
```tsx
<VoiceLibrary
  voices={customVoices}
  defaultVoices={defaultVoices}
  assignedVoiceId={currentVoiceId}
  onAssign={(voiceId) => assignVoice(voiceId)}
  onDelete={(voiceId) => deleteVoice(voiceId)}
  onCreateNew={() => navigate('/voice-cloning')}
/>
```

### 3.8 ActiveCallsPanel

**Purpose:** Display list of currently active calls

**Visual Appearance:**
- List of call cards
- Each card: Caller info, duration (live timer), channel, "Monitor" button
- Duration animates (mm:ss)
- "Monitor" button opens transcript panel
- Green pulsing dot for each active call

**States:**
- **Empty:** "No active calls"
- **Loading:** Skeleton list
- **Error:** Error message with retry

**Accessibility:**
- `aria-live="polite"` for new calls
- Duration updates don't spam screen readers (debounced)
- Monitor button keyboard-accessible

**Usage:**
```tsx
<ActiveCallsPanel
  calls={activeCalls}
  onMonitor={(callId) => openTranscript(callId)}
/>
```

### 3.9 ChannelFilter

**Purpose:** Filter conversations by channel type

**Visual Appearance:**
- Segmented control (pill-shaped buttons)
- Three options: All, Voice, SMS
- Icons: Combined, Phone, Message
- Selected option: Primary background, white text
- Unselected: Gray background, primary text

**States:**
- **All:** Combined icon, selected
- **Voice:** Phone icon, selected/unselected
- **SMS:** Message icon, selected/unselected

**Accessibility:**
- `role="tablist"`
- Each button `role="tab"`
- Keyboard navigation (arrow keys)
- Selected tab `aria-selected="true"`

**Usage:**
```tsx
<ChannelFilter
  value="all"
  onChange={(channel) => filterConversations(channel)}
/>
```

### 3.10 AnalyticsDashboard

**Purpose:** Display performance metrics and charts

**Visual Appearance:**
- Metric cards row at top (4 cards)
- Charts below (2 columns)
- Filters: Date range, channel, metrics

**Metric Cards:**
- Title, value, change indicator (green up arrow / red down arrow)
- Hover: Slight lift, shadow

**Charts:**
- Sentiment trend (line chart)
- Call volume (bar chart)
- Resolution rate (pie chart)
- Peak hours (heatmap, optional)

**States:**
- **Loading:** Skeleton cards and charts
- **Empty:** "No data for selected period"
- **Error:** Error message with retry

**Accessibility:**
- Metric cards have `role="figure"`
- Charts have accessible descriptions
- Keyboard-navigable filters

**Usage:**
```tsx
<AnalyticsDashboard
  metrics={metricsData}
  charts={chartData}
  period="7d"
  onPeriodChange={(period) => fetchAnalytics(period)}
/>
```

### 3.11 UpgradeModal

**Purpose:** Prompt trial users to upgrade to paid plan

**Visual Appearance:**
- Centered modal
- Title: "Your trial has expired" or "Upgrade to continue"
- Body: Benefits of upgrading
- Plan selection: 2-3 pricing cards
- Primary CTA: "Upgrade Now"
- Secondary: "Start new trial" (if allowed)

**States:**
- **Trial Ending:** Warning icon, "3 days left"
- **Trial Expired:** Error icon, "Trial expired"
- **Limit Reached:** Info icon, "Upgrade to unlock features"

**Accessibility:**
- `role="dialog"` with `aria-modal="true"`
- Focus trapped in modal
- Escape key closes modal
- Screen reader announces modal on open

**Usage:**
```tsx
<UpgradeModal
  isOpen={showUpgrade}
  trialDaysRemaining={0}
  plan="pro"
  onUpgrade={(plan) => subscribeToPlan(plan)}
  onClose={() => setShowUpgrade(false)}
/>
```

### 3.12 MessageBubble

**Purpose:** Display single message in conversation

**Visual Appearance:**
- Bubble with rounded corners
- Left-aligned: Customer messages (gray background)
- Right-aligned: User/AI messages (primary background)
- Avatar (sender type)
- Text content
- Timestamp (small, below bubble)
- Delivery status for user messages (check marks)

**Variants:**
- **Customer:** Gray, left-aligned
- **User:** Primary, right-aligned, blue check marks
- **AI:** Primary, right-aligned, AI icon

**States:**
- **Delivered:** Single check mark
- **Read:** Double check marks
- **Failed:** Red exclamation mark

**Accessibility:**
- `aria-label` with sender name and message
- Timestamp visible to screen readers
- Delivery status announced

**Usage:**
```tsx
<MessageBubble
  id="msg-789"
  sender="customer"
  content="Can you reschedule my appointment?"
  timestamp={Date.now()}
  deliveryStatus="read"
/>
```

---

## 4. Page Layouts

### 4.1 Breakpoints

| Name | Width | Columns | Gutter | Usage |
|------|-------|---------|--------|-------|
| `xs` | 0px | 1 | 16px | Mobile phones |
| `sm` | 640px | 1-2 | 16px | Landscape phones |
| `md` | 768px | 2 | 24px | Tablets |
| `lg` | 1024px | 2-3 | 24px | Small laptops |
| `xl` | 1280px | 3 | 24px | Desktops |
| `2xl` | 1536px | 3-4 | 24px | Large desktops |

### 4.2 Dashboard Layout (Protected Routes)

```
┌─────────────────────────────────────────────────────────────┐
│ Header (64px)                                                 │
│ Logo • Navigation • User Menu                               │
├─────────────────────────────────────────────────────────────┤
│ Sidebar (240px) │  Main Content (auto)                      │
│                 │                                           │
│ - Dashboard     │                                           │
│ - Calls        │  ┌─────────────────────────────────────┐ │
│ - Messages     │  │ Trial Banner (optional, 48px)       │ │
│ - Analytics    │  ├─────────────────────────────────────┤ │
│ - Settings     │  │                                     │ │
│                 │  │  Page Content                      │ │
│                 │  │                                     │ │
└─────────────────┴──┴─────────────────────────────────────┘ │
```

**Behavior:**
- Sidebar: Collapsible on mobile (hamburger menu)
- Header: Fixed height, sticky on scroll
- Main content: Scrollable, full height

### 4.3 Pricing Page Layout (Public)

```
┌─────────────────────────────────────────────────────────────┐
│ Hero Section                                                  │
│ Headline: Scale Your Customer Communication                  │
│ Subhead: AI-powered voice and SMS in one platform            │
│ Primary CTA: Start 14-Day Free Trial (prominent)             │
├─────────────────────────────────────────────────────────────┤
│ Features Section                                              │
│ Grid of feature cards (3 columns)                            │
├─────────────────────────────────────────────────────────────┤
│ Pricing Section                                                │
│ 3 pricing cards (Starter, Pro, Enterprise)                   │
│ Each: Plan name, price, features, CTA button                 │
├─────────────────────────────────────────────────────────────┤
│ FAQ Section                                                   │
│ Accordion-style FAQ items                                     │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                        │
│ Links, social, copyright                                      │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Hero: Full width, centered content
- Cards: Responsive grid (1 → 2 → 3 columns)
- CTA: Sticky or repeated at scroll positions

### 4.4 Signup Flow Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Signup Container (centered, max-width: 480px)               │
│                                                               │
│  Logo                                                         │
│  Heading: Start your 14-day free trial                       │
│  Subheading: No credit card required                        │
│                                                               │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Business Name  [_______________]                  │       │
│  │                                                   │       │
│  │ Email          [_______________]                  │       │
│  │                                                   │       │
│  │ Password       [_______________]                  │       │
│  │                                                   │       │
│  │ Confirm Pass   [_______________]                  │       │
│  │                                                   │       │
│  │ Terms checkbox [ ] I agree to terms & conditions │       │
│  │                                                   │       │
│  │        [Start Free Trial] (primary, full width)  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                               │
│  Already have an account? [Sign in]                          │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Progress steps: 1. Account → 2. Business Setup → 3. Complete
- Inline validation (real-time feedback)
- Auto-login on success
- Redirect to dashboard with onboarding

### 4.5 Omnichannel Inbox Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Channel Filter: [All] [Voice] [SMS]   Search: [_________]    │
├───────────────┬───────────────────────────────────────────────┤
│               │ Conversation Detail                           │
│ Conversations │                                               │
│ List (320px)  │ ┌─────────────────────────────────────────┐  │
│               │ │ Customer Name            Phone         │  │
│ ┌───────────┐ │ └─────────────────────────────────────────┘  │
│ │ John Doe  │ │                                               │
│ │ (SMS)     │ │ Messages                                     │
│ │ Last: Can │ │ ┌─────────────────────────────────────────┐  │
│ │ you...    │ │ │ Customer: Can you reschedule?            │  │
│ └───────────┘ │ │ 10:23 AM                                   │  │
│               │ │                                             │  │
│ ┌───────────┐ │ │ You: Sure! How's tomorrow at 2pm?         │  │
│ │ Jane Smith│ │ │ 10:24 AM ✓✓                                │  │
│ │ (Voice)   │ │ │                                             │  │
│ │ Last: Thank│ │ AI: That works! I'll add it to your calendar│  │
│ │ you...    │ │ │ 10:24 AM                                    │  │
│ └───────────┘ │ │                                             │  │
│               │ │ [Type a message...] [Send]                 │  │
│               │ └─────────────────────────────────────────┘  │
└───────────────┴───────────────────────────────────────────────┘
```

**Behavior:**
- Conversations list: Scrollable, click to select
- Conversation detail: Full message history
- Context-aware input (SMS composer for SMS, note for voice)
- Real-time message updates

### 4.6 Analytics Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Date Filter: [7d ▼]   Channel: [All ▼]   [Export]            │
├─────────────────────────────────────────────────────────────┤
│ Metric Cards (4 columns)                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Calls    │ │ Resolved │ │ Duration │ │Sentiment │         │
│ │ 1,234    │ │ 95.2%    │ │ 4:32 avg │ │  +0.45   │         │
│ │ ↑ 12%    │ │ ↑ 3.1%   │ │ ↓ 5%     │ │ ↑ 0.08   │         │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────────────────┤
│ Charts (2 columns)                                          │
│ ┌──────────────────────────┐ ┌──────────────────────────┐   │
│ │ Sentiment Trend          │ │ Call Volume by Hour     │   │
│ │ [Line Chart]             │ │ [Bar Chart]             │   │
│ └──────────────────────────┘ └──────────────────────────┘   │
│ ┌──────────────────────────┐ ┌──────────────────────────┐   │
│ │ Resolution Rate          │ │ Peak Days               │   │
│ │ [Pie Chart]              │ │ [Bar Chart]             │   │
│ └──────────────────────────┘ └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Metric cards: Click to drill down
- Charts: Hover for details, zoom on click
- Filters: Apply to all charts
- Export: Download CSV/PDF

### 4.7 Voice Cloning Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Heading: Create Custom Voice                                │
│ Description: Upload a 60-second sample to clone your voice   │
├─────────────────────────────────────────────────────────────┤
│ Step 1: Upload Sample    Step 2: Adjust    Step 3: Assign   │
│ ●────────────○──────────○────────────────○─────────────●   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐    │
│ │                                                       │    │
│ │           [Upload Audio File]                         │    │
│ │           Drop file here or click to browse           │    │
│ │                                                       │    │
│ │           Supported: MP3, WAV, M4A                   │    │
│ │           Duration: 45-90 seconds                    │    │
│ │                                                       │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                               │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Voice Name: [My Business Voice____________]          │    │
│ │                                                       │    │
│ │ Pitch Adjustment:   ◄━━━●━━━►  0                     │    │
│ │ Speed Adjustment:   ◄━━━●━━━►  1.0x                  │    │
│ │                                                       │    │
│ │              [Create Voice] [Preview]                │    │
│ └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Steps: Progress indicator at top
- Upload: Drag-and-drop or click
- Processing: Progress bar with estimated time
- Preview: Audio player before finalizing
- Success: Voice added to library

### 4.8 Page Specifications

#### Dashboard Home (Omnichannel Inbox)

**Purpose:** Unified view of all customer interactions

**Components:**
- TrialBanner (conditional)
- ChannelFilter
- SearchInput
- ConversationList (left sidebar)
- ConversationDetail (main area)
- SMSComposer (conditional on SMS channel)

**Responsive Behavior:**
- Mobile: Conversation list full-width, detail opens as modal
- Tablet: Split view (list 30%, detail 70%)
- Desktop: Split view (list 25%, detail 75%)

#### Call Logs with Active Calls

**Purpose:** View call history and monitor active calls

**Components:**
- ActiveCallsPanel (top)
- CallLogsTable (below)
- TranscriptPanel (side panel when monitoring)

**Responsive Behavior:**
- Mobile: Active calls carousel, transcript as modal
- Tablet: Active calls above logs
- Desktop: Active calls fixed sidebar

#### Analytics Dashboard

**Purpose:** Monitor performance metrics and trends

**Components:**
- DateRangeFilter
- ChannelFilter
- MetricCards (4)
- SentimentChart
- CallVolumeChart
- ResolutionChart
- ExportButton

**Responsive Behavior:**
- Mobile: Stacked metric cards (1 column), stacked charts
- Tablet: Metric cards (2 columns), charts (1 column)
- Desktop: Metric cards (4 columns), charts (2 columns)

#### Voice Cloning Page

**Purpose:** Create and manage custom AI voices

**Components:**
- VoiceUploader
- VoiceForm (name, pitch, speed)
- ProcessingProgress
- VoiceLibrary
- PreviewPlayer

**Responsive Behavior:**
- All: Centered single-column layout (max-width 800px)

---

## 5. Screen Flows

### 5.1 Free Trial Flow

**Entry Point:** Pricing page → "Start 14-Day Free Trial" button

**Flow:**

```
[1] Pricing Page
    ↓ (Click "Start Free Trial")
[2] Signup Form
    ↓ (Valid form submit)
[3] Account Created + Auto-login
    ↓ (Redirect)
[4] Onboarding Tour
    ↓ (Complete tour)
[5] Dashboard (with trial banner)
```

**Detailed Flow:**

**Step 1: Pricing Page**
- Hero section with prominent "Start 14-Day Free Trial" CTA
- Below pricing cards, each has trial button
- No credit card messaging clearly visible

**Step 2: Signup Form**
- Fields: Business name, email, password, confirm password
- Real-time validation (email format, password strength)
- Terms checkbox
- Primary button: "Start Free Trial"
- Link: "Already have an account? Sign in"

**Step 3: Account Created**
- Loading state (2-3 seconds)
- Success toast: "Welcome! Your trial has started"
- Auto-login (no manual login required)
- Redirect to onboarding

**Step 4: Onboarding Tour**
- Modal overlay
- 3-4 step tour (dashboard, messages, settings)
- "Skip tour" option
- Completion: "Let's get started!"

**Step 5: Dashboard**
- Trial banner at top: "12 days remaining in your trial"
- Full feature access
- No restrictions during trial

**Edge Cases:**

- **Email already exists:** "Email already registered. Sign in?" with link
- **Network error:** Auto-save form, "Connection lost. Retrying..."
- **Trial already used:** "You've already used a trial. Sign up for a plan."
- **Limit reached:** "Trial limit reached for this IP. Please try again later."

### 5.2 SMS Channel Flow

**Entry Point:** Dashboard → "Messages" tab

**Flow:**

```
[1] Omnichannel Inbox
    ↓ (Select SMS conversation)
[2] SMS Conversation Detail
    ↓ (Type message + Send)
[3] Message Sent
    ↓ (Customer replies)
[4] Incoming Message (real-time)
    ↓ (AI responds automatically)
[5] Updated Conversation
```

**Detailed Flow:**

**Step 1: Omnichannel Inbox**
- Channel filter: Select "SMS" or "All"
- List shows SMS conversations with message icon
- Unread indicator on new conversations

**Step 2: SMS Conversation Detail**
- Message history (oldest at top, newest at bottom)
- Customer messages: Left-aligned (gray)
- User messages: Right-aligned (blue)
- AI messages: Right-aligned (blue with AI icon)
- SMS composer at bottom with character count

**Step 3: Sending Message**
- Type in composer
- Character count: "142/160 • 1 segment"
- Click "Send" or press `Cmd+Enter`
- Button shows spinner briefly
- Message appears immediately (optimistic update)
- Delivery status: Single check (sent), double check (delivered)

**Step 4: Incoming Message**
- Real-time update via Supabase Realtime
- Message appears at bottom (left-aligned)
- Unread badge updates
- Optional: In-app notification

**Step 5: AI Response**
- Configured AI behavior triggers
- AI message appears after delay (1-2 seconds)
- AI icon identifies automated response

**Edge Cases:**

- **No SMS credits:** "Upgrade to send more messages" + CTA
- **Message failed:** Red exclamation mark + "Tap to retry"
- **Over character limit:** Character count turns red, button disabled
- **Rate limited:** "Too many messages. Wait 30 seconds."
- **Customer opted out:** "Customer has opted out of messages"

### 5.3 Real-Time Transcription Flow

**Entry Point:** Dashboard → "Calls" tab → "Active Calls"

**Flow:**

```
[1] Dashboard (Calls tab)
    ↓ (Click "Monitor" on active call)
[2] Call Detail View
    ↓ (TranscriptPanel opens)
[3] Live Transcription Streaming
    ↓ (New transcript chunks arrive)
[4:5) Transcript Updates in Real-Time
    ↓ (Call ends)
[5] Transcript Complete
    ↓ (Saved to history)
[6] Call Detail (saved)
```

**Detailed Flow:**

**Step 1: Dashboard (Calls tab)**
- ActiveCallsPanel shows ongoing calls
- Each call: Caller, duration, channel, "Monitor" button
- Duration animates (mm:ss)

**Step 2: Call Detail View**
- Opens modal or side panel
- TranscriptPanel appears on right
- Status bar: "Live" with pulsing green dot
- Empty transcript at first

**Step 3: Live Transcription Streaming**
- WebSocket connects to transcription stream
- Transcript chunks arrive every 2-3 seconds
- Messages appear with speaker labels:
  - Customer: Left-aligned, blue
  - AI: Right-aligned, green
- Timestamps appear below each message

**Step 4: Transcript Updates**
- New messages append to bottom
- Auto-scroll to latest message
- Indentation for turn-taking

**Step 5: Call Ends**
- Status changes to "Completed"
- Transcript finalized
- AI summary appears below transcript
- Save button: "Save to Conversation"

**Step 6: Call Detail (saved)**
- Full transcript available in call history
- Searchable text
- Downloadable (plain text or JSON)

**Edge Cases:**

- **Transcription unavailable:** "Transcription temporarily unavailable" banner
- **Poor audio quality:** "Audio quality low. Transcript may be inaccurate."
- **Connection lost:** "Reconnecting..." + retry button
- **Call drops:** Save partial transcript, show error notification

### 5.4 Analytics Dashboard Flow

**Entry Point:** Dashboard → "Analytics" tab

**Flow:**

```
[1] Analytics Dashboard (load)
    ↓ (Select date range)
[2] Fetch Analytics Data
    ↓ (Display charts)
[3] Explore Charts
    ↓ (Hover/click for details)
[4] Filter Data
    ↓ (Update charts)
[5] Export Data
```

**Detailed Flow:**

**Step 1: Analytics Dashboard (load)**
- Loading skeleton for metric cards and charts
- Default view: Last 7 days, all channels
- Empty state if no data

**Step 2: Fetch Analytics Data**
- API call to `/api/analytics/overview`
- Metric cards populate with data
- Charts render with animations

**Step 3: Explore Charts**
- Hover over data points: Tooltip with details
- Click on chart segment: Drill down view
- Metric cards: Click to view details

**Step 4: Filter Data**
- Date range dropdown: 7d, 30d, 90d, custom
- Channel filter: All, Voice, SMS
- Charts update with animation
- No page reload needed

**Step 5: Export Data**
- Click "Export" button
- Choose format: CSV or PDF
- Download starts automatically
- Success toast: "Report downloaded"

**Edge Cases:**

- **No data available:** "No data for selected period. Adjust filters."
- **Export failed:** "Export failed. Try again." + retry button
- **Loading timeout:** Skeleton → "Some data unavailable. Refresh?"

### 5.5 Omnichannel Unified Dashboard Flow

**Entry Point:** Dashboard (default landing)

**Flow:**

```
[1] Dashboard Load
    ↓ (Display omnichannel inbox)
[2] View All Interactions
    ↓ (Filter by channel)
[3] Select Conversation
    ↓ (Open detail view)
[4] Respond (channel-specific)
    ↓ (Update list)
[5] Real-time Updates
```

**Detailed Flow:**

**Step 1: Dashboard Load**
- Unified inbox shows all conversations
- Sorted by last activity (newest first)
- Mixed list: Voice calls + SMS conversations
- Unread indicators

**Step 2: View All Interactions**
- Channel filter: All (default), Voice, SMS
- Search: By customer name, phone, message content
- Scrollable list

**Step 3: Select Conversation**
- Click conversation card
- Detail view opens
- Voice call: Call transcript, summary, recording
- SMS: Message thread, composer

**Step 4: Respond (channel-specific)**
- Voice: Call back button, notes, call customer
- SMS: Type message, send button
- AI: Automatic response based on configuration

**Step 5: Real-time Updates**
- New messages/calls appear automatically
- List re-sorts by activity
- Unread count updates
- Optional: In-app notification

**Edge Cases:**

- **Sync delayed:** "Syncing messages..." spinner
- **Missing permissions:** Feature locked icon + upgrade prompt
- **Load error:** "Failed to load. Tap to retry."

### 5.6 Voice Cloning Flow

**Entry Point:** Settings → "Voice & Audio" → "Create Custom Voice"

**Flow:**

```
[1] Voice Cloning Page
    ↓ (Upload sample)
[2] File Upload & Validation
    ↓ (Configure voice)
[3] Voice Processing
    ↓ (Processing complete)
[4] Preview Voice
    ↓ (Assign to AI)
[5] Voice Assigned
```

**Detailed Flow:**

**Step 1: Voice Cloning Page**
- Upload zone prominent
- Instructions: "60-second sample, clear speech"
- Supported formats listed

**Step 2: File Upload & Validation**
- Drag file or click to browse
- Validation checks:
  - File format (MP3, WAV, M4A)
  - File size (max 10MB)
  - Duration (45-90 seconds)
- Success: File info displayed

**Step 3: Configure Voice**
- Voice name field
- Pitch slider (-1 to +1)
- Speed slider (0.5x to 2x)
- "Create Voice" button

**Step 4: Voice Processing**
- Progress bar animates
- "Processing..." status
- Estimated time: 2-5 minutes
- Background processing (can navigate away)

**Step 5: Preview Voice**
- Completion notification
- Preview player appears
- Test phrase input: "Type text to preview"
- Play button with original voice for comparison

**Step 6: Assign to AI**
- "Assign to AI" button
- Confirmation modal
- Voice applied to all AI interactions

**Edge Cases:**

- **Invalid format:** "Unsupported format. Use MP3, WAV, or M4A."
- **Wrong duration:** "Sample must be 45-90 seconds. Duration: {X}s."
- **Upload failed:** "Upload failed. Check connection."
- **Processing failed:** "Voice creation failed. Your account was not charged."

---

## 6. Component Inventory

### 6.1 New UI Components to Build

| Component | Priority | Complexity | Description |
|-----------|----------|------------|-------------|
| **TrialBanner** | P0 | Low | Trial countdown with upgrade CTA |
| **ConversationCard** | P0 | Medium | Omnichannel conversation summary card |
| **TranscriptPanel** | P0 | High | Live transcription display with streaming |
| **SMSComposer** | P0 | Medium | SMS message input with character count |
| **ActiveCallsPanel** | P0 | Medium | List of active calls with monitor buttons |
| **ChannelFilter** | P0 | Low | Segmented control for channel filtering |
| **SentimentChart** | P1 | Medium | Line chart for sentiment trends |
| **VoiceUploader** | P1 | Medium | Drag-and-drop voice sample upload |
| **VoiceLibrary** | P1 | Medium | Grid of custom voices with actions |
| **MessageBubble** | P1 | Low | Single message display in conversation |
| **AnalyticsDashboard** | P1 | High | Full analytics dashboard with charts |
| **UpgradeModal** | P1 | Medium | Trial upgrade prompt with plan selection |
| **MetricCard** | P1 | Low | Single metric display with change indicator |
| **ProcessingProgress** | P1 | Low | Progress bar for voice processing |
| **PreviewPlayer** | P1 | Medium | Audio player for voice preview |

### 6.2 Component Dependencies

```
TrialBanner
  └─> UpgradeModal

ConversationCard
  └─> MessageBubble (preview)

TranscriptPanel
  ├─> MessageBubble
  └─> ActiveCallsPanel (context)

SMSComposer
  └─> MessageBubble (optimistic update)

OmnichannelInbox
  ├─> TrialBanner
  ├─> ChannelFilter
  ├─> ConversationCard
  ├─> MessageBubble
  └─> SMSComposer

AnalyticsDashboard
  ├─> MetricCard
  ├─> SentimentChart
  └─> DateRangeFilter

VoiceCloningPage
  ├─> VoiceUploader
  ├─> ProcessingProgress
  ├─> VoiceLibrary
  └─> PreviewPlayer

VoiceLibrary
  └─> PreviewPlayer
```

### 6.3 Component Reuse from Existing UI Library

| Existing Component | New Feature Usage |
|--------------------|------------------|
| Button | All CTAs, submit buttons |
| Input | Form inputs (signup, voice config) |
| Card | ConversationCard, MetricCard |
| Modal | UpgradeModal, call detail modals |
| Dropdown | Date range filter, channel filter |
| Toast | Success/error notifications |
| Spinner | Loading states |
| Skeleton | Loading skeletons |
| Chart | Base for SentimentChart (Recharts) |

---

## 7. Interaction Patterns

### 7.1 Form Submission

**Pattern:**

1. **Fill Form:** User enters data
2. **Validate on Blur:** Inline validation feedback per field
3. **Validate on Submit:** Check all fields before submission
4. **Show Loading State:** Button shows spinner, disabled
5. **Success:** Toast notification + redirect/refresh
6. **Error:** Inline error message + retry button

**Example (Signup Flow):**

```tsx
// 1. Fill form
<Input
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  onBlur={() => validateEmail(email)}
/>

// 2. Validate
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    setErrors({ ...errors, email: 'Invalid email format' });
    return false;
  }
  return true;
};

// 3. Submit
const handleSubmit = async () => {
  if (!validateAll()) return;

  // 4. Loading
  setSubmitting(true);

  try {
    // 5. Success
    await api.signup({ email, password });
    toast.success('Account created!');
    navigate('/dashboard');
  } catch (error) {
    // 6. Error
    toast.error(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

### 7.2 Data Loading

**Pattern:**

1. **Initial State:** Show loading skeleton
2. **Fetch Data:** API call in background
3. **Replace Skeleton:** Swap skeleton with content (fade-in animation)
4. **Empty State:** Show empty state message if no data
5. **Error State:** Show error with retry button

**Example (Analytics Dashboard):**

```tsx
const { data, isLoading, error, refetch } = useAnalytics(period);

if (isLoading) {
  return <AnalyticsSkeleton />;
}

if (error) {
  return (
    <ErrorState
      message="Failed to load analytics"
      onRetry={() => refetch()}
    />
  );
}

if (!data || data.length === 0) {
  return (
    <EmptyState
      icon={ChartIcon}
      title="No analytics data"
      description="Try adjusting your filters"
      action="Change filters"
    />
  );
}

return <AnalyticsDashboard data={data} />;
```

### 7.3 Real-Time Updates

**Pattern:**

1. **Subscribe:** Connect to Supabase Realtime or WebSocket
2. **Receive Event:** Handle incoming data
3. **Optimistic Update:** Update UI immediately
4. **Confirm Update:** Verify with server response
5. **Revert if Failed:** Roll back optimistic update

**Example (SMS Messaging):**

```tsx
// 1. Subscribe
useEffect(() => {
  const subscription = supabase
    .channel(`conversations:${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload) => {
      // 2. Receive event
      const newMessage = payload.new;
      setMessages((prev) => [...prev, newMessage]);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [conversationId]);

// 3. Optimistic update
const sendMessage = async (content: string) => {
  const tempId = `temp-${Date.now()}`;

  // Optimistically add message
  const tempMessage = {
    id: tempId,
    content,
    senderType: 'user',
    sentAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);

  try {
    // 4. Confirm with server
    const realMessage = await api.sendMessage(conversationId, content);
    setMessages((prev) => prev.map((m) => m.id === tempId ? realMessage : m));
  } catch (error) {
    // 5. Revert on failure
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
    toast.error('Failed to send message');
  }
};
```

### 7.4 Error Handling

**Pattern:**

1. **Prevent Errors:** Client-side validation, sanitization
2. **Catch Errors:** Try-catch blocks, error boundaries
3. **Display Errors:** Inline errors, toasts, error states
4. **Recover:** Retry buttons, alternative actions
5. **Log Errors:** Send to error tracking (Sentry)

**Error Hierarchy:**

| Severity | Display | Action |
|----------|---------|--------|
| **Critical** | Page-level error | Refresh page, contact support |
| **Major** | Modal or toast | Retry button, fallback UI |
| **Minor** | Inline error | Fix input, try again |
| **Info** | Toast notification | No action needed |

**Example (API Error):**

```tsx
try {
  await api.sendSMS({ to, message });
  toast.success('Message sent!');
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Minor: Inline error
    setError('Please wait before sending another message');
  } else if (error.code === 'INSUFFICIENT_CREDITS') {
    // Major: Modal
    showUpgradeModal();
  } else {
    // Info: Toast
    toast.error('Failed to send. Please try again.');
  }
}
```

### 7.5 Modal Interactions

**Pattern:**

1. **Open Modal:** Triggered by button/action
2. **Focus Management:** Trap focus within modal
3. **Close on Escape:** Press Escape to close
4. **Close on Overlay:** Click outside to close
5. **Confirm/Cancel:** Primary and secondary actions
6. **Restore Focus:** Return focus to trigger element

**Example (Upgrade Modal):**

```tsx
<UpgradeModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={(plan) => {
    subscribeToPlan(plan);
    setIsOpen(false);
  }}
  initialFocusRef={confirmButtonRef}
/>
```

### 7.6 Search & Filtering

**Pattern:**

1. **Debounce Input:** Wait 300ms after typing before searching
2. **Show Results:** Display filtered list
3. **Clear Filters:** Reset button to clear all filters
4. **Empty Results:** "No results found for '{query}'"
5. **Keyboard Navigation:** Arrow keys to navigate results

**Example (Conversation Search):**

```tsx
const debouncedQuery = useDebounce(searchQuery, 300);

const filteredConversations = conversations.filter((c) =>
  c.customerName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
  c.customerPhone.includes(debouncedQuery)
);

return (
  <SearchInput
    value={searchQuery}
    onChange={setSearchQuery}
    placeholder="Search conversations..."
    onClear={() => setSearchQuery('')}
  />
);
```

---

## 8. Responsive Design

### 8.1 Mobile-First Approach

**Design from mobile up:**

1. **Base Styles (xs):** Default mobile styles
2. **sm (640px):** Adjust for landscape phones
3. **md (768px):** Tablet layouts
4. **lg (1024px):** Desktop layouts
5. **xl (1280px):** Large desktops

### 8.2 Responsive Patterns

#### Omnichannel Inbox

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| xs-sm | List view | Full-width list, detail as modal |
| md | Split view | List 30%, detail 70% |
| lg-xl | Split view | List 25%, detail 75% |

#### Analytics Dashboard

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| xs-sm | Stacked | Metric cards (1 col), charts (1 col) |
| md | Stacked | Metric cards (2 cols), charts (1 col) |
| lg-xl | Grid | Metric cards (4 cols), charts (2 cols) |

#### Voice Cloning

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| All | Centered | Single column, max-width 800px |

### 8.3 Mobile Optimizations

**Touch Targets:**
- Minimum 44x44px for buttons/links
- Increased padding on mobile

**Navigation:**
- Bottom tab bar (optional) or hamburger menu
- Swipe gestures (optional enhancement)

**Input:**
- Larger input fields (48px height)
- Numeric keyboard for phone numbers
- Auto-capitalization off for passwords

**Modals:**
- Full-screen modals on mobile
- Bottom sheet style for actions

**Performance:**
- Lazy load images below fold
- Reduce animation complexity
- Optimize font loading

### 8.4 Tablet Optimizations

**Layout:**
- Two-column layouts
- Larger touch targets
- Expanded sidebars

**Navigation:**
- Persistent sidebar navigation
- Expanded menus

**Content:**
- More data visible (larger screens)
- Hover states work (touch + mouse)

### 8.5 Desktop Optimizations

**Layout:**
- Three-column layouts
- Fixed sidebars
- Larger content areas

**Interactions:**
- Rich hover states
- Tooltips on hover
- Keyboard shortcuts visible

**Data Density:**
- More rows per table
- Larger charts
- More metrics per row

---

## 9. Accessibility

### 9.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text (below 18px): 4.5:1 minimum
- Large text (18px+ or bold 14px+): 3:1 minimum
- UI components (borders, focus): 3:1 minimum

**Focus Indicators:**
- Visible focus ring on all interactive elements
- Focus color: Primary blue (`#3B82F6`) with 2px border
- No focus outline removal unless custom indicator provided

**Keyboard Navigation:**
- All interactive elements focusable via Tab
- Logical tab order (top to bottom, left to right)
- Escape: Close modals, dropdowns, panels
- Enter/Space: Activate buttons, links, checkboxes
- Arrow keys: Navigate within components (lists, grids)

### 9.2 Screen Reader Support

**Semantic HTML:**
- Use native HTML elements (`<button>`, `<input>`, `<nav>`)
- `role` attributes only when necessary
- `aria-label` for icon-only buttons

**Landmarks:**
- `role="banner"` for header
- `role="navigation"` for nav
- `role="main"` for main content
- `role="contentinfo"` for footer
- `role="complementary"` for sidebars

**Live Regions:**
- `aria-live="polite"` for non-urgent updates (transcripts, messages)
- `aria-live="assertive"` for urgent updates (errors)
- `aria-atomic="true"` for complete updates (trial countdown)

**Dynamic Content:**
- Announce state changes (loading, success, error)
- Provide text alternatives for visual indicators

### 9.3 ARIA Labels

**Icon Buttons:**
```tsx
<Button aria-label="Send message">
  <SendIcon />
</Button>

<Button aria-label="Delete conversation">
  <TrashIcon />
</Button>
```

**Form Inputs:**
```tsx
<Input
  id="email"
  label="Email address"
  required
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}
```

**Status Indicators:**
```tsx
<div role="status" aria-live="polite">
  Trial expires in 12 days
</div>
```

### 9.4 Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Next element | Everywhere |
| `Shift+Tab` | Previous element | Everywhere |
| `Enter` | Activate | Buttons, links |
| `Escape` | Close | Modals, dropdowns |
| `/` | Focus search | Dashboard |
| `C` | Open conversations | Dashboard |
| `A` | Open analytics | Dashboard |
| `M` | Toggle mute | Call monitoring |
| `E` | End call | Call monitoring |
| `Cmd/Ctrl+Enter` | Send message | SMS composer |

### 9.5 Reduced Motion Support

**CSS Media Query:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**JS Detection:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Respect user preference
const animationDuration = prefersReducedMotion ? 0 : 300;
```

### 9.6 Form Accessibility

**Labels:**
- All form inputs have associated labels (`<label for="id">` or `aria-label`)
- Placeholder text not used as label (placeholder disappears)

**Error Messages:**
- Associated with inputs via `aria-describedby`
- `role="alert"` for inline errors
- Clear, actionable error text

**Validation:**
- Real-time validation with clear feedback
- Error messages announce on field blur
- Success state: "Email address is valid"

**Required Fields:**
- Marked with `required` attribute
- Visual indicator (asterisk or "required" text)
- Form submission fails if required fields empty

### 9.7 Color Blindness Support

**Don't rely on color alone:**
- Use icons + color for status (green checkmark + green background)
- Use patterns for charts (stripes, dots) in addition to color
- Provide text labels for all data visualizations

**Color Combinations to Avoid:**
- Red/green (most common form of color blindness)
- Blue/purple (blue-yellow color blindness)
- Use blue/orange or green/orange alternatives

### 9.8 Accessibility Testing Checklist

- [ ] Keyboard navigation works throughout app
- [ ] All interactive elements have focus indicators
- [ ] Screen reader announces all dynamic content
- [ ] Forms have proper labels and error messages
- [ ] Color contrast meets WCAG AA standards
- [ ] No keyboard traps (can tab out of all components)
- [ ] Focus returns to trigger after modal close
- [ ] Skip navigation link available
- [ ] ARIA landmarks present
- [ ] Live regions used appropriately
- [ ] Reduced motion respected
- [ ] Text alternatives for images
- [ ] Icons have aria-labels

---

## 10. Dark Mode

### 10.1 Color Palette (Dark Mode)

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#FFFFFF` | `#0F172A` (Slate 900) |
| `foreground` | `#0F172A` | `#F1F5F9` |
| `card` | `#FFFFFF` | `#1E293B` (Slate 800) |
| `border` | `#E2E8F0` | `#334155` (Slate 700) |
| `muted` | `#64748B` | `#94A3B8` |
| `primary` | `#3B82F6` | `#3B82F6` (unchanged) |
| `success` | `#22C55E` | `#22C55E` (unchanged) |
| `warning` | `#F59E0B` | `#F59E0B` (unchanged) |
| `danger` | `#EF4444` | `#EF4444` (unchanged) |

### 10.2 Implementation

**CSS Variables:**
```css
:root {
  --background: 255 255 255;
  --foreground: 15 23 42;
  --card: 255 255 255;
  --border: 226 232 240;
}

.dark {
  --background: 15 23 42;
  --foreground: 241 245 249;
  --card: 30 41 59;
  --border: 51 65 85;
}
```

**Tailwind CSS:**
```tsx
<div className="bg-background text-foreground border-border">
  Content
</div>
```

**Dark Mode Toggle:**
- User preference detected (`prefers-color-scheme`)
- Manual toggle in settings
- Persisted in localStorage

### 10.3 Dark Mode Considerations

**Charts & Visualizations:**
- Chart lines lighter in dark mode
- Grid lines subtle
- Text contrast maintained

**Images & Icons:**
- SVG icons use `currentColor`
- Images may need opacity adjustment

**Transparency:**
- Use opacity instead of light colors for overlays
- `bg-black/50` instead of `bg-gray-100/80`

**Shadows:**
- Darker shadows in dark mode
- Less contrast needed (already dark background)

---

## 11. Backend Integration Notes

### 11.1 API Integration Strategy

**Authentication:**
- Use Supabase Auth for JWT tokens
- Tokens stored in localStorage
- Auto-refresh handled by Supabase client
- All API calls include `Authorization: Bearer <token>` header

**API Layer Pattern:**
```typescript
// src/lib/api.ts - Extend existing API wrapper
export const api = {
  // Existing methods...
  auth: {
    trial: {
      start: () => post('/api/auth/trial/start'),
      status: () => get('/api/auth/trial/status'),
      upgrade: (plan) => post('/api/auth/trial/upgrade', { plan }),
    },
  },
  conversations: {
    list: (filter) => get('/api/conversations', { filter }),
    get: (id) => get(`/api/conversations/${id}`),
    messages: (id) => get(`/api/conversations/${id}/messages`),
    sendMessage: (id, content) => post(`/api/conversations/${id}/messages`, { content }),
  },
  sms: {
    send: (to, message) => post('/api/sms/send', { to, message }),
    usage: () => get('/api/sms/usage'),
  },
  calls: {
    active: () => get('/api/calls/active'),
    get: (id) => get(`/api/calls/${id}`),
    transcript: (id) => get(`/api/calls/${id}/transcript`),
    end: (id) => post(`/api/calls/${id}/end`),
  },
  analytics: {
    overview: (params) => get('/api/analytics/overview', params),
    sentiment: (params) => get('/api/analytics/sentiment', params),
    calls: (params) => get('/api/analytics/calls', params),
    export: (params) => get('/api/analytics/export', params),
  },
  voices: {
    list: () => get('/api/voices'),
    upload: (file) => post('/api/voices/upload', file),
    get: (id) => get(`/api/voices/${id}`),
    assign: (id) => patch(`/api/voices/${id}/assign`),
    delete: (id) => delete(`/api/voices/${id}`),
  },
};
```

### 11.2 Real-Time Data Integration

**Supabase Realtime (Conversations, Messages):**
```typescript
// Subscribe to conversation updates
const subscription = supabase
  .channel('conversations')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'conversations',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        addConversation(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        updateConversation(payload.new);
      }
    }
  )
  .subscribe();

// Subscribe to new messages
const messageSubscription = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      addMessage(payload.new);
    }
  )
  .subscribe();
```

**WebSocket (Transcription Streaming):**
```typescript
// src/hooks/useWebSocket.ts
export const useTranscriptWebSocket = (callId: string) => {
  const [transcript, setTranscript] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.VITE_WEBSOCKET_URL}/api/calls/${callId}/transcript/stream?token=${getToken()}`
    );

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = (error) => console.error('WebSocket error:', error);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chunk') {
        setTranscript((prev) => [...prev, data.data]);
      } else if (data.type === 'complete') {
        setTranscript((prev) => [...prev, data.data]);
        setIsConnected(false);
      }
    };

    return () => ws.close();
  }, [callId]);

  return { transcript, isConnected };
};
```

### 11.3 Data Fetching Strategy

**React Query for Server State:**
```typescript
// src/hooks/useAnalytics.ts
export const useAnalytics = (period: string) => {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => api.analytics.overview({ period }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// src/hooks/useConversations.ts
export const useConversations = (filter: ChannelFilter) => {
  return useQuery({
    queryKey: ['conversations', filter],
    queryFn: () => api.conversations.list(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

**React Context for Client State:**
```typescript
// src/context/TrialContext.tsx
export const TrialProvider = ({ children }) => {
  const [trialStatus, setTrialStatus] = useState(null);

  useEffect(() => {
    api.auth.trial.status().then(setTrialStatus);
  }, []);

  return (
    <TrialContext.Provider value={{ trialStatus }}>
      {children}
    </TrialContext.Provider>
  );
};
```

### 11.4 Error Handling Integration

**API Error Interceptor:**
```typescript
// src/lib/api.ts - Extend existing wrapper
const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'TRIAL_EXPIRED':
      // Show upgrade modal
      showUpgradeModal();
      break;
    case 'RATE_LIMITED':
      // Show toast with retry time
      toast.error(`Rate limited. Wait ${error.retryAfter} seconds.`);
      break;
    default:
      // Generic error
      toast.error(error.message);
  }
};
```

### 11.5 File Upload Integration

**Voice Sample Upload:**
```typescript
// src/api/voice.ts
export const uploadVoiceSample = async (file: File) => {
  // 1. Get presigned URL from backend
  const { uploadUrl, key } = await api.voices.getUploadUrl({
    filename: file.name,
    contentType: file.type,
  });

  // 2. Upload to storage (direct to S3/Supabase Storage)
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. Notify backend to start processing
  return api.voices.process({ key, filename: file.name });
};
```

### 11.6 Integration Testing Notes

**Mock API Responses:**
```typescript
// src/__mocks__/api.ts
export const mockApi = {
  auth: {
    trial: {
      start: () => ({ trialId: 'mock-trial', expiresAt: '2024-03-05' }),
      status: () => ({ daysRemaining: 12, expired: false }),
    },
  },
  conversations: {
    list: () => mockConversations,
    get: (id) => mockConversations.find(c => c.id === id),
  },
  // ... other endpoints
};
```

**E2E Testing Considerations:**
- Test real API calls (not mocks)
- Test WebSocket connection for transcription
- Test Supabase Realtime subscriptions
- Test file upload for voice cloning

---

## Appendix

### A. Component Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Components | PascalCase | `TrialBanner`, `ConversationCard`, `TranscriptPanel` |
| Hooks | camelCase with `use` prefix | `useTranscript`, `useConversations`, `useAnalytics` |
| Contexts | PascalCase with `Context` suffix | `TrialContext`, `ConversationContext` |
| Types/Interfaces | PascalCase | `Conversation`, `Message`, `TranscriptChunk` |
| Constants | UPPER_SNAKE_CASE | `MAX_SMS_CREDITS`, `TRIAL_DURATION_DAYS` |
| CSS Classes | Tailwind utilities | `flex`, `items-center`, `bg-primary` |

### B. Icon Library

**Using Lucide React (already installed):**
- `phone` - Voice calls
- `message-square` - SMS messages
- `mic` - Voice cloning
- `activity` - Analytics
- `trending-up` - Positive trend
- `trending-down` - Negative trend
- `check-circle` - Success
- `alert-circle` - Warning
- `x-circle` - Error
- `upload-cloud` - Upload
- `play` - Play audio
- `pause` - Pause audio
- `filter` - Filter
- `search` - Search

### C. References

- **Radix UI:** https://www.radix-ui.com/
- **Recharts:** https://recharts.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **Lucide Icons:** https://lucide.dev/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime

---

**End of UX Design Specification**

This document serves as the single source of truth for VocalScale Frontend Enhancement UX design. All design decisions should align with the principles and patterns defined herein.
