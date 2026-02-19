# Product Requirements Document: VocalScale Frontend Enhancement

**Version:** 1.0
**Date:** 2026-02-19
**Author:** Business Analyst Agent
**Status:** Draft

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-19 | BA Agent | Initial PRD for VocalScale Frontend Enhancement |

## 1. Introduction

### 1.1 Purpose

This PRD defines detailed requirements for the VocalScale Frontend Enhancement project, which adds missing competitor features (free trial, SMS channel, real-time transcription, analytics, omnichannel dashboard, and voice cloning) to transform VocalScale from a voice-only AI receptionist into a unified AI-powered business communication hub. This document serves as the single source of truth for developers, designers, and QA teams implementing these features.

### 1.2 Scope

**In Scope:**
- Free trial signup flow (14-day, no credit card required)
- SMS channel integration for customer-AI conversations
- Real-time call transcription display
- Advanced analytics dashboard with sentiment trends and KPIs
- Omnichannel unified dashboard (voice + SMS)
- Voice cloning feature for custom AI voices

**Out of Scope:**
- Live chat widget (nice-to-have, post-MVP)
- CRM integration marketplace (nice-to-have, post-MVP)
- Custom script builder (nice-to-have, post-MVP)
- Team management with roles (nice-to-have, post-MVP)
- Chat channel (future enhancement, not MVP)

### 1.3 References

- Product Brief: `/home/vinay/.openclaw/workspace/main-vocalscale-frontend/_bmad-output/planning-artifacts/product-brief.md`
- Business Analyst Prompt: `/home/vinay/.openclaw/workspace/main-vocalscale-frontend/BMAD_Openclaw/prompts/business-analyst.md`

## 2. Product Overview

### 2.1 Product Vision

VocalScale will evolve from a voice-only AI receptionist platform into a unified AI-powered business communication hub that handles voice, SMS, and future chat channels with real-time insights. Unlike competitors that charge extra for basic features or require enterprise contracts, VocalScale offers a risk-free trial, transparent pricing, and unique business management features (appointments, inventory) that competitors lack.

### 2.2 Target Users

#### Persona 1: Sarah - Small Business Owner
- **Role:** Owner of local service business (salon, clinic, restaurant)
- **Pain Points:** Missing calls, customers prefer texting, can't afford receptionist, wants to try before buying
- **Goals:** Never miss inquiries, self-service scheduling, risk-free trial, track conversions

#### Persona 2: James - Operations Manager
- **Role:** Operations lead at mid-sized business (5-50 employees)
- **Pain Points:** Fragmented communication channels, no real-time oversight, needs analytics ROI, wants brand voice consistency
- **Goals:** Unified dashboard, real-time AI performance monitoring, data-driven insights, custom AI voice

### 2.3 Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Free Trial Signup Rate | 15-20% of pricing page visitors | Measures conversion funnel improvement |
| Trial-to-Paid Conversion | 25-30% of trial users | Validates product value and onboarding |
| SMS Adoption Rate | 40% of active users sending/receiving SMS | Confirms omnichannel value |
| Real-Time Transcript Usage | 60% of active calls monitored live | Shows feature engagement |
| Weekly Active Analytics Dashboard | 50% of paid users | Proves analytics value perception |

## 3. User Journeys

### UJ-1: Sarah Signs Up for Free Trial

**Persona:** Sarah (Small Business Owner)
**Goal:** Try VocalScale risk-free before committing to a paid plan

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Navigates to pricing page | Displays pricing plans with prominent "Start 14-Day Free Trial" CTA |
| 2 | Clicks "Start 14-Day Free Trial" button | Redirects to signup form |
| 3 | Enters business name, email, password | Validates input format, shows live validation feedback |
| 4 | Submits form | Creates account, logs in automatically, shows onboarding tour |
| 5 | Completes onboarding (phone number setup) | Dashboard ready, displays trial banner with days remaining |

**Success Criteria:**
- Sarah can complete signup in under 3 minutes
- No credit card requested during signup
- Trial period clearly displayed in UI
- Account has full feature access during trial

**Error Scenarios:**
- **Email already exists:** Show "Email already registered. Sign in?" with link to login
- **Network error:** Auto-save form data, show "Connection lost. Retrying..." message
- **Validation failure:** Highlight specific fields with errors (e.g., "Invalid email format")

---

### UJ-2: Sarah Sends and Receives SMS via VocalScale AI

**Persona:** Sarah (Small Business Owner)
**Goal:** Text with customers using the VocalScale AI phone number

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens "Messages" tab in dashboard | Shows list of conversations (voice calls + SMS) |
| 2 | Clicks on customer conversation | Displays full message history |
| 3 | Sees incoming SMS from customer | Message appears with timestamp, AI icon for AI responses |
| 4 | Optionally replies manually | Sends SMS message from business number |
| 5 | Customer continues texting | AI responds based on configured behavior |

**Success Criteria:**
- SMS messages appear in real-time (< 5 seconds delay)
- Both manual and AI responses sent from same business number
- Conversation history persists across sessions
- Sarah can distinguish her messages from AI responses

**Error Scenarios:**
- **Message send failed:** Show "Failed to send. Tap to retry." with retry button
- **No SMS credits:** Display upgrade prompt with link to pricing
- **Rate limit exceeded:** Show "Message limit reached. Upgrade to continue." with CTA

---

### UJ-3: James Monitors Real-Time Call Transcription

**Persona:** James (Operations Manager)
**Goal:** Watch live call transcripts to monitor AI performance and compliance

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens "Active Calls" section of dashboard | Displays list of ongoing calls |
| 2 | Clicks on active call card | Opens call detail view with live transcript panel |
| 3 | Watches transcript update in real-time | Transcript text streams with ~2-3 second latency |
| 4 | Optionally listens to audio or ends call | Audio controls, end call button if needed |
| 5 | Call ends | Transcript finalized, saves to conversation history |

**Success Criteria:**
- Transcript updates live with minimal latency (< 5 seconds)
- Transcript displays speaker labels (Customer vs. AI)
- Text highlights keywords or sentiment indicators
- Final transcript matches post-call AI summary

**Error Scenarios:**
- **Transcription service unavailable:** Show "Transcription temporarily unavailable" banner
- **Poor audio quality:** Display "Audio quality low. Transcript may be inaccurate." warning
- **Call drops unexpectedly:** Save partial transcript, show error notification

---

### UJ-4: James Views Analytics Dashboard

**Persona:** James (Operations Manager)
**Goal:** Review performance metrics to justify ROI and optimize operations

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens "Analytics" tab in dashboard | Displays dashboard with overview cards |
| 2 | Reviews key metrics cards | Shows call volume, resolution rate, avg. duration, sentiment score |
| 3 | Clicks on sentiment trend chart | Opens detailed view with sentiment over time |
| 4 | Filters by date range, channel | Updates all charts with selected filters |
| 5 | Exports report (optional) | Downloads CSV/PDF of analytics data |

**Success Criteria:**
- Dashboard loads within 3 seconds
- Charts are interactive (hover details, zoom)
- Filters apply across all visualizations
- Export includes all visible data

**Error Scenarios:**
- **No data available:** Show "No data for selected period. Adjust filters." message
- **Export failed:** Show "Export failed. Try again." with retry button
- **Data loading timeout:** Show skeletons, then "Some data unavailable. Refresh?" prompt

---

### UJ-5: James Clones Voice for Business Brand

**Persona:** James (Operations Manager)
**Goal:** Create a custom AI voice that matches the business brand identity

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens "Settings" > "Voice & Audio" | Shows voice options panel |
| 2 | Clicks "Create Custom Voice" | Opens voice creation modal |
| 3 | Uploads 60-second voice sample | Validates audio file, shows progress bar |
| 4 | Enters voice name and selects settings | Labels voice, adjusts pitch/speed sliders |
| 5 | Submits for processing | Shows "Processing..." state with estimated time (2-5 min) |
| 6 | Receives completion notification | Voice ready, preview player available |
| 7 | Tests preview and assigns to AI | Assigns custom voice to business AI |

**Success Criteria:**
- Upload accepts common formats (MP3, WAV, M4A)
- Voice processing completes in under 5 minutes
- Preview allows A/B testing with original voice
- Custom voice applies to all AI interactions

**Error Scenarios:**
- **Invalid audio file:** Show "Unsupported format. Use MP3, WAV, or M4A." error
- **Upload failed:** Show "Upload failed. Check connection and try again." with retry
- **Processing failed:** Show "Voice creation failed. Your account was not charged." with support link
- **Sample too short/long:** Show "Sample must be 45-90 seconds. Duration: {X}s." error

---

### UJ-6: Sarah Views Omnichannel Unified Dashboard

**Persona:** Sarah (Small Business Owner)
**Goal:** See all customer interactions in one place regardless of channel

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Logs into VocalScale dashboard | Defaults to unified "Inbox" view |
| 2 | Sees mixed list of interactions | Shows voice calls, SMS conversations, all sorted by recency |
| 3 | Uses filter icons (voice, SMS, all) | Filters interaction list by channel type |
| 4 | Clicks on any conversation | Opens full interaction detail with channel-specific UI |
| 5 | Responds or takes action | Context-aware actions based on channel (call back, reply SMS, etc.) |

**Success Criteria:**
- Unified view displays all channels seamlessly
- Visual icons distinguish channel types (phone, message)
- Recent activity appears at top
- Action buttons match channel type

**Error Scenarios:**
- **Channel data sync delayed:** Show "Syncing messages..." indicator
- **Missing channel permissions:** Show feature locked icon with upgrade prompt
- **Conversation load error:** Show "Failed to load conversation. Tap to retry."

## 4. Functional Requirements

### 4.1 Free Trial Flow

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-TRIAL-001 | Pricing page displays prominent "Start 14-Day Free Trial" CTA above pricing plans | Must | Hero section or top banner |
| FR-TRIAL-002 | Trial signup form requires: business name, email, password (no credit card) | Must | Optional: phone number |
| FR-TRIAL-003 | Real-time validation on all signup fields (email format, password strength) | Must | Inline error messages |
| FR-TRIAL-004 | Signup creates account with 14-day trial expiration timestamp | Must | Calculated from account creation |
| FR-TRIAL-005 | Successful signup auto-logs user in and redirects to onboarding | Must | No manual login required |
| FR-TRIAL-006 | Trial banner displayed on all pages during trial period showing days remaining | Must | Count down to expiration |
| FR-TRIAL-007 | Trial expiration notification sent 3 days before and 1 day before via email | Should | Optional: in-app notification |
| FR-TRIAL-008 | Trial users have access to all features during trial period | Must | No feature restrictions |
| FR-TRIAL-009 | Trial upgrade modal displayed on trial expiration or if user clicks "Upgrade" | Must | Inline upsell prompt |
| FR-TRIAL-010 | Existing accounts can start trial if never had trial before | Should | Check trial history in DB |

### 4.2 SMS Channel

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-SMS-001 | Users can send SMS messages from VocalScale dashboard | Must | Business number as sender |
| FR-SMS-002 | Users can receive SMS messages sent to VocalScale phone number | Must | Inbound webhook from provider |
| FR-SMS-003 | AI automatically responds to inbound SMS based on configured behavior | Must | Configurable via settings |
| FR-SMS-004 | SMS conversations grouped by customer phone number | Must | Thread view like messaging apps |
| FR-SMS-005 | Messages appear in unified dashboard with SMS channel icon | Must | Omnichannel view |
| FR-SMS-006 | Real-time message delivery (< 5 seconds from send to display) | Should | WebSocket or polling |
| FR-SMS-007 | Character count and segment count displayed when composing | Should | 160 chars/segment |
| FR-SMS-008 | Failed message send shows retry button | Must | With error reason |
| FR-SMS-009 | SMS usage displayed in account settings with plan limits | Should | Meter usage display |
| FR-SMS-010 | Trial users receive SMS credits included in trial | Must | Define limit (e.g., 100 messages) |
| FR-SMS-011 | Manual and AI responses visually distinguished in conversation | Should | User avatar vs AI icon |

### 4.3 Real-Time Call Transcription

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-TRANS-001 | Active calls displayed in "Active Calls" section of dashboard | Must | List view with caller ID |
| FR-TRIAL-002 (duplicate) | Clicking active call opens detail view with live transcript panel | Must | Side panel or modal |
| FR-TRANS-003 | Transcript updates in real-time as call progresses | Must | Streaming text display |
| FR-TRANS-004 | Speaker labels displayed (Customer vs. AI) | Must | Color-coded or icon-based |
| FR-TRANS-005 | Transcript latency under 5 seconds from speech to display | Should | Acceptable for live monitoring |
| FR-TRANS-006 | Final transcript saved to conversation history after call ends | Must | Persistent storage |
| FR-TRANS-007 | Post-call AI summary displayed alongside transcript | Must | Already exists, enhance linking |
| FR-TRANS-008 | Transcript searchable within conversation history | Should | Full-text search |
| FR-TRANS-009 | Poor audio quality warning displayed when detected | Should | Transcript accuracy disclaimer |
| FR-TRANS-010 | Transcript export available (plain text or JSON) | Could | For compliance/analytics |

### 4.4 Advanced Analytics Dashboard

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-ANAL-001 | Analytics dashboard displays key metric cards: call volume, resolution rate, avg. duration, sentiment score | Must | Overview section |
| FR-ANAL-002 | Sentiment trend chart shows sentiment over time (line chart) | Must | Daily/weekly granularity |
| FR-ANAL-003 | Call metrics chart shows trends: duration, resolution, peak hours | Should | Bar or line chart |
| FR-ANAL-004 | KPI tracking with customizable targets and thresholds | Should | Goal setting |
| FR-ANAL-005 | Date range filter applies to all dashboard visualizations | Must | Presets: 7d, 30d, 90d, custom |
| FR-ANAL-006 | Channel filter (voice, SMS, all) applies to all charts | Must | Segmentation capability |
| FR-ANAL-007 | Interactive charts with hover details and zoom | Should | Click-through to details |
| FR-ANAL-008 | Analytics export available (CSV and PDF formats) | Should | Include visible data |
| FR-ANAL-009 | Dashboard caching to improve load times on repeat visits | Should | < 2s load time |
| FR-ANAL-010 | Empty state messaging when no data available for period | Must | Guidance for user |
| FR-ANAL-011 | Sentiment breakdown by channel (voice vs. SMS) | Could | Comparison view |

### 4.5 Omnichannel Unified Dashboard

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-OMNI-001 | Unified "Inbox" view displays all interactions sorted by recency | Must | Default dashboard view |
| FR-OMNI-002 | Visual icons distinguish channel types (phone icon for voice, message icon for SMS) | Must | Clear visual distinction |
| FR-OMNI-003 | Channel filter bar with options: All, Voice, SMS | Must | Toggle or segmented control |
| FR-OMNI-004 | Clicking any interaction opens detail view with channel-specific UI | Must | Context-aware layout |
| FR-OMNI-005 | Action buttons match channel type (e.g., "Call Back" for voice, "Reply" for SMS) | Must | Contextual actions |
| FR-OMNI-006 | Unread indicator badge on interactions with new activity | Must | Visual attention cue |
| FR-OMNI-007 | Real-time updates when new messages or calls arrive | Should | WebSocket or polling |
| FR-OMNI-008 | Search across all interactions by customer name, phone number, or content | Should | Unified search |
| FR-OMNI-009 | Bulk actions (mark read, archive) available for multiple selections | Could | Batch operations |
| FR-OMNI-010 | Channel-specific settings accessible from detail view | Should | Quick access to configuration |

### 4.6 Voice Cloning

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-VOICE-001 | Users can upload audio file for voice cloning (MP3, WAV, M4A) | Must | File validation |
| FR-VOICE-002 | Voice sample duration must be 45-90 seconds | Must | Enforce at upload |
| FR-VOICE-003 | User labels custom voice with name | Must | For identification |
| FR-VOICE-004 | Voice adjustment sliders: pitch (-1 to +1), speed (0.5x to 2x) | Should | Optional fine-tuning |
| FR-VOICE-005 | Voice processing status displayed: "Processing...", "Ready", "Failed" | Must | Progress indication |
| FR-VOICE-006 | Estimated processing time displayed (2-5 minutes) | Should | User expectation setting |
| FR-VOICE-007 | Preview player allows testing custom voice before assignment | Must | A/B comparison with default |
| FR-VOICE-008 | User assigns custom voice to business AI | Must | Apply to all interactions |
| FR-VOICE-009 | Voice library displays all created voices (custom + default) | Should | Management view |
| FR-VOICE-010 | Voice deletion available for custom voices | Should | Remove unused voices |
| FR-VOICE-011 | Processing failure displays helpful error message with support link | Must | User-friendly recovery |
| FR-VOICE-012 | Voice cloning credits tracked in account settings | Should | Usage meter |

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-001 | Page load time < 3 seconds for dashboard views on 3G connection |
| NFR-PERF-002 | Real-time transcript latency < 5 seconds from speech to display |
| NFR-PERF-003 | SMS message delivery < 5 seconds from send to recipient receipt |
| NFR-PERF-004 | Analytics dashboard load < 2 seconds with caching enabled |
| NFR-PERF-005 | API response time < 500ms for 95th percentile of requests |
| NFR-PERF-006 | Voice upload completes within 10 seconds for 5MB file |
| NFR-PERF-007 | Support concurrent monitoring of 50+ active calls without UI lag |
| NFR-PERF-008 | Image/video assets optimized and lazy-loaded where appropriate |

### 5.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | All API requests authenticated via JWT tokens with refresh token flow |
| NFR-SEC-002 | User passwords hashed with bcrypt (minimum 12 rounds) |
| NFR-SEC-003 | Sensitive data (phone numbers, transcripts) encrypted at rest |
| NFR-SEC-004 | HTTPS enforced for all connections (no mixed content) |
| NFR-SEC-005 | XSS protection via Content Security Policy and input sanitization |
| NFR-SEC-006 | CSRF protection for state-changing requests |
| NFR-SEC-007 | Rate limiting on trial signup (3 attempts per IP per hour) |
| NFR-SEC-008 | SMS messages logged for compliance (retention policy defined) |
| NFR-SEC-009 | Voice samples stored securely with access controls |
| NFR-SEC-010 | Audit logging for sensitive actions (voice cloning, SMS configuration) |

### 5.3 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCALE-001 | Support 10,000 concurrent users without performance degradation |
| NFR-SCALE-002 | Handle 1,000 concurrent active call transcriptions |
| NFR-SCALE-003 | Support 100,000 SMS messages per day throughput |
| NFR-SCALE-004 | Database queries optimized with proper indexing |
| NFR-SCALE-005 | CDN for static assets (images, JS bundles) |
| NFR-SCALE-006 | Horizontal scaling for WebSocket connections |

### 5.4 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-A11Y-001 | WCAG 2.1 AA compliance for all new UI components |
| NFR-A11Y-002 | Keyboard navigation support for all interactive elements |
| NFR-A11Y-003 | Screen reader compatibility with ARIA labels and landmarks |
| NFR-A11Y-004 | Color contrast ratio minimum 4.5:1 for text |
| NFR-A11Y-005 | Focus indicators visible on all focusable elements |
| NFR-A11Y-006 | Alt text provided for all images and icons |
| NFR-A11Y-007 | Forms have clear error messages associated with fields |
| NFR-A11Y-008 | Skip navigation link for keyboard users |

### 5.5 Browser/Device Support

| ID | Requirement |
|----|-------------|
| NFR-BRWS-001 | Chrome/Edge (last 2 versions) |
| NFR-BRWS-002 | Firefox (last 2 versions) |
| NFR-BRWS-003 | Safari (last 2 versions) |
| NFR-BRWS-004 | Mobile responsive design (iOS Safari, Chrome Mobile) |
| NFR-BRWS-005 | Progressive enhancement for older browsers |

## 6. Data Model

### 6.1 Entities

#### User
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | String | Yes | Unique email address |
| password_hash | String | Yes | Bcrypt hashed password |
| business_name | String | Yes | Business display name |
| trial_expires_at | Timestamp | No | Trial expiration date (null if paid) |
| created_at | Timestamp | Yes | Account creation time |
| updated_at | Timestamp | Yes | Last update time |

#### Conversation
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| user_id | UUID | Yes | Foreign key to User |
| customer_phone | String | Yes | Customer phone number |
| customer_name | String | No | Optional customer name |
| channel | Enum | Yes | 'voice', 'sms', 'chat' (future) |
| status | Enum | Yes | 'active', 'completed', 'archived' |
| created_at | Timestamp | Yes | Conversation start time |
| updated_at | Timestamp | Yes | Last activity time |

#### Message
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| conversation_id | UUID | Yes | Foreign key to Conversation |
| sender_type | Enum | Yes | 'user', 'customer', 'ai' |
| content | Text | Yes | Message content or transcript text |
| direction | Enum | Yes | 'inbound', 'outbound' |
| created_at | Timestamp | Yes | Message timestamp |
| sent_at | Timestamp | No | Actual delivery time (for SMS) |

#### Call
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| conversation_id | UUID | Yes | Foreign key to Conversation |
| started_at | Timestamp | Yes | Call start time |
| ended_at | Timestamp | No | Call end time |
| duration_seconds | Integer | No | Call duration in seconds |
| status | Enum | Yes | 'active', 'completed', 'missed', 'failed' |
| transcript | Text | No | Full transcript text |
| sentiment_score | Float | No | -1.0 to 1.0 sentiment score |

#### VoiceClone
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| user_id | UUID | Yes | Foreign key to User |
| name | String | Yes | Custom voice name |
| voice_id | String | Yes | Provider voice ID |
| status | Enum | Yes | 'processing', 'ready', 'failed' |
| created_at | Timestamp | Yes | Creation time |
| pitch_adjustment | Float | No | -1.0 to 1.0 pitch modifier |
| speed_adjustment | Float | No | 0.5 to 2.0 speed modifier |

#### AnalyticsEvent
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| user_id | UUID | Yes | Foreign key to User |
| event_type | Enum | Yes | 'call_start', 'call_end', 'sms_sent', 'sms_received', 'ai_response' |
| conversation_id | UUID | Yes | Foreign key to Conversation |
| metadata | JSON | No | Event-specific data |
| created_at | Timestamp | Yes | Event timestamp |

### 6.2 Relationships

- User → Conversation: 1:N (one user has many conversations)
- Conversation → Message: 1:N (one conversation has many messages)
- Conversation → Call: 1:1 (one conversation has at most one call record)
- User → VoiceClone: 1:N (one user can have many custom voices)
- User → AnalyticsEvent: 1:N (one user has many analytics events)
- Conversation → AnalyticsEvent: 1:N (one conversation generates many events)

## 7. API Overview

### 7.1 Authentication

- JWT-based authentication with access tokens (15 min expiry) and refresh tokens (7 days expiry)
- Authorization header: `Authorization: Bearer <access_token>`
- Public endpoints: trial signup, login, password reset
- Protected endpoints: all other APIs require valid JWT

### 7.2 Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/signup | Create account (trial) | Public |
| POST | /api/auth/login | Login existing user | Public |
| POST | /api/auth/refresh | Refresh access token | Public |
| POST | /api/auth/logout | Logout/invalidate refresh | Protected |

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | /api/conversations | List all conversations | Protected |
| GET | /api/conversations/:id | Get conversation details | Protected |
| GET | /api/conversations/:id/messages | Get conversation messages | Protected |
| POST | /api/conversations/:id/messages | Send message | Protected |
| PATCH | /api/conversations/:id/status | Update conversation status | Protected |

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | /api/calls/active | List active calls | Protected |
| GET | /api/calls/:id | Get call details | Protected |
| GET | /api/calls/:id/transcript | Get call transcript | Protected |
| POST | /api/calls/:id/end | End active call | Protected |

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/sms/send | Send SMS message | Protected |
| GET | /api/sms/usage | Get SMS usage stats | Protected |

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | /api/analytics/overview | Get analytics overview | Protected |
| GET | /api/analytics/sentiment | Get sentiment trends | Protected |
| GET | /api/analytics/calls | Get call metrics | Protected |
| GET | /api/analytics/export | Export analytics data | Protected |

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | /api/voices | List custom voices | Protected |
| POST | /api/voices | Upload voice sample | Protected |
| GET | /api/voices/:id | Get voice details | Protected |
| PATCH | /api/voices/:id/assign | Assign voice to AI | Protected |
| DELETE | /api/voices/:id | Delete custom voice | Protected |

### 7.3 WebSocket Channels

| Channel | Purpose | Events |
|---------|---------|--------|
| `conversations:{userId}` | Real-time conversation updates | `message:new`, `call:started`, `call:ended` |
| `transcript:{callId}` | Live transcript streaming | `transcript:chunk`, `transcript:complete` |
| `analytics:{userId}` | Real-time analytics updates | `metric:updated` |

## 8. Assumptions & Dependencies

### 8.1 Assumptions

- SMS provider (Twilio, MessageBird, or Bandwidth) will be selected before implementation
- Voice cloning will use third-party API (ElevenLabs or Resemble AI) for MVP
- Real-time transcription will use provider's streaming API
- Existing backend infrastructure supports WebSocket connections
- Analytics data will be stored in time-series optimized format
- Trial users will have limited SMS credits (to prevent abuse)

### 8.2 Dependencies

- **Backend APIs:** SMS send/receive, voice cloning, real-time transcription (to be implemented by backend team)
- **Third-party services:**
  - SMS provider (Twilio/MessageBird/Bandwidth)
  - Voice cloning API (ElevenLabs/Resemble AI)
  - Transcription service (Google Speech-to-Text, AWS Transcribe, or similar)
- **Frontend libraries:**
  - Chart library for analytics (Recharts, Chart.js, or similar)
  - Real-time updates (Socket.io or native WebSocket)
  - File upload component for voice samples
- **Database:** PostgreSQL with JSONB support for metadata

## 9. Out of Scope

- Live chat widget embedding on customer websites (post-MVP)
- CRM integrations (HubSpot, Salesforce, Pipedrive) (post-MVP)
- Zapier integration (post-MVP)
- Team management with roles and permissions (post-MVP)
- Custom script builder with drag-and-drop interface (post-MVP)
- In-app chat support between users and VocalScale team
- Video call support (not in roadmap)
- International SMS (MVP focuses on domestic SMS)
- Multi-language support for AI responses (MVP is English-only)

## 10. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which SMS provider to integrate? (Twilio, MessageBird, Bandwidth) | Product/Engineering | Open |
| 2 | Should voice cloning use ElevenLabs, Resemble AI, or custom ML? | Engineering | Open |
| 3 | How many SMS credits included in trial? (proposed: 100 messages) | Product | Open |
| 4 | Acceptable transcript latency? (proposed: < 5 seconds) | Product | Open |
| 5 | Voice cloning pricing model? (per voice or included in tier?) | Product | Open |
| 6 | Real-time transcription provider? (Google, AWS, or custom?) | Engineering | Open |
| 7 | Data retention policy for transcripts and SMS messages? | Legal/Compliance | Open |
| 8 | Should trial users receive unlimited voice calls? | Product | Open |
| 9 | Analytics data granularity? (hourly, daily, weekly aggregation?) | Engineering | Open |
| 10 | Voice sample storage location? (S3, GCS, or on-prem?) | Engineering | Open |

## 11. Glossary

| Term | Definition |
|------|------------|
| **SMS (Short Message Service)** | Text messaging service for mobile phones, limited to 160 characters per segment |
| **Voice Cloning** | AI technology that replicates a specific human voice from audio samples for synthetic speech generation |
| **Real-Time Transcription** | Live speech-to-text conversion that displays text as speech is occurring, with minimal latency |
| **Sentiment Analysis** | NLP technique that determines emotional tone of text or speech (positive, negative, neutral) |
| **Omnichannel** | Multi-channel approach that provides seamless customer experience across all touchpoints (voice, SMS, chat) |
| **WebSocket** | Full-duplex communication protocol enabling real-time data transfer between client and server |
| **JWT (JSON Web Token)** | Compact, URL-safe means of representing claims to be transferred between parties |
| **Conversion Rate** | Percentage of users who complete a desired action (e.g., trial signup → paid subscription) |
| **Resolution Rate** | Percentage of customer inquiries resolved without human intervention |
| **MVP (Minimum Viable Product)** | Product with just enough features to satisfy early customers and provide feedback for future development |

## 12. Appendix

### 12.1 Success Metrics Tracking

Each metric will be tracked via analytics events and displayed in internal dashboard:

- **Free Trial Signup Rate**: `trial_signups / pricing_page_visits`
- **Trial-to-Paid Conversion**: `paid_conversions / trial_signups`
- **SMS Adoption Rate**: `users_with_sms_activity / active_users`
- **Real-Time Transcript Usage**: `calls_with_live_monitor / total_calls`
- **Weekly Active Analytics Dashboard**: `users_viewing_analytics / paid_users`

### 12.2 Feature Prioritization Matrix

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| Free Trial Flow | High | Low | P0 (Must) |
| SMS Channel | High | Medium | P0 (Must) |
| Real-Time Transcription | High | Medium | P0 (Must) |
| Analytics Dashboard | High | High | P1 (Should) |
| Omnichannel Dashboard | Medium | Medium | P1 (Should) |
| Voice Cloning | High | High | P1 (Should) |

### 12.3 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SMS provider API limits | Medium | Medium | Implement rate limiting, queue system |
| Voice cloning processing delays | Low | Low | Set user expectations, async processing |
| Real-time transcription cost overruns | Medium | High | Implement per-call limits, cost monitoring |
| Trial abuse (multiple accounts) | Low | Medium | IP-based rate limiting, email verification |
| Transcription accuracy issues | Medium | Medium | User feedback loop, quality warnings |

---

**End of PRD**

This document is the authoritative source for VocalScale Frontend Enhancement requirements. All changes must go through formal review and version control.
