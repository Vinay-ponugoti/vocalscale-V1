# Technical Architecture: VocalScale Frontend Enhancement

**Version:** 1.0
**Date:** 2026-02-19
**Author:** Architect Agent

---

## 1. Overview

### 1.1 System Context

VocalScale is an AI-powered business communication hub that handles voice calls and SMS messages. The frontend is a React 19 application using Vite, TypeScript, and Tailwind CSS with a Supabase backend for authentication, database, storage, and real-time features. The system is evolving from voice-only to omnichannel (voice + SMS) with advanced analytics and voice cloning capabilities.

**Existing Architecture:**
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **State Management:** React Context (AuthContext, BusinessSetupContext, SetupContext, SearchContext, ToastContext)
- **API Layer:** Centralized in `/src/api/` with fetch wrapper, rate limiting, and error handling
- **Routing:** React Router v7 with lazy loading
- **Real-time:** Supabase Realtime subscriptions

**New Features to Integrate:**
1. Free trial flow (14-day, no credit card)
2. SMS channel integration
3. Real-time call transcription
4. Advanced analytics dashboard
5. Omnichannel unified dashboard
6. Voice cloning feature

### 1.2 Architecture Principles

1. **Additive over Breaking** — New features extend existing patterns without disrupting current functionality
2. **Leverage Existing Patterns** — Reuse contexts, API layer, and UI components to maintain consistency
3. **Real-time First** — All features that can benefit from real-time updates should use Supabase Realtime or WebSockets
4. **Progressive Enhancement** — Core functionality works without advanced features; enhancements add value
5. **Type Safety** — Strong TypeScript typing for all new entities, API responses, and state
6. **Performance Awareness** — Lazy loading, code splitting, and optimistic UI updates
7. **Security by Default** — Input validation, sanitization, and proper auth checks on all new endpoints

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Frontend Runtime** | React | 19.2.0 | Latest stable with concurrent features, existing codebase |
| **Build Tool** | Vite | 7.2.4 | Fast HMR, optimized builds, existing setup |
| **Language** | TypeScript | ~5.9.3 | Type safety, excellent DX, existing codebase |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first, rapid development, existing codebase |
| **UI Components** | Radix UI | ^1.2.4+ | Accessible primitives, customizable, existing patterns |
| **Animations** | Framer Motion | ^12.27.5 | Declarative animations, existing codebase |
| **Routing** | React Router | 7.11.0 | Standard routing with lazy loading, existing setup |
| **Charts** | Recharts | 3.6.0 | Declarative charts, React-native, good for analytics |
| **State Management** | React Context | — | Lightweight, existing patterns, sufficient for current needs |
| **API Client** | Native Fetch | — | Built-in, lightweight, already wrapped with rate limiting |
| **Real-time** | Supabase Realtime | ^2.89.0 | Existing integration, real-time subscriptions |
| **WebSockets** | Native WebSocket | — | For transcription streaming (alternative to Realtime) |
| **Forms** | React Hook Form | New | (Recommend adding) Better form state/validation |
| **Date Handling** | date-fns | 4.1.0 | Immutable date utilities, existing codebase |
| **Icons** | Lucide React | 0.562.0 | Consistent icon set, existing codebase |

**Libraries to Add:**
- `react-hook-form` + `zod` — Form validation and schema validation
- `react-use` — Custom hooks for WebSocket, polling, etc.

---

## 3. Architecture Decisions

### ADR-001: Use React Context for State Management

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need state management for new features (trial status, SMS conversations, voice clones, omnichannel inbox). Options include Redux, Zustand, Jotai, React Query, and React Context.

**Decision:** Continue using React Context for feature-specific state, add React Query for server state.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| React Context | Simple, no external dep, existing patterns | Prop drilling for deep nests, re-renders |
| Zustand | Lightweight, no provider needed | New learning curve, adds dependency |
| Redux Toolkit | Powerful ecosystem, great devtools | Overkill for current scale, boilerplate |
| React Query | Excellent for server state, caching, refetching | Doesn't handle client state well |

**Rationale:**
- **React Query** already exists (`@tanstack/react-query`) in the package.json — leverage it for server state (conversations, analytics, voice clones)
- **React Context** is working well for client state (auth, business setup) — extend with new contexts
- **No additional dependencies** needed for state management
- **Consistency** with existing architecture

**Consequences:**
- Server state (conversations, analytics, calls) → React Query
- Client state (UI state, modals, selections) → React Context
- May need to optimize context re-renders with memo/useMemo
- Devs need to understand distinction between server vs client state

---

### ADR-002: Use Supabase Realtime for Message/Call Updates

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need real-time updates for SMS messages, active calls, and omnichannel inbox. Options include Supabase Realtime, WebSockets, Server-Sent Events (SSE), and polling.

**Decision:** Use Supabase Realtime for most real-time features, WebSocket for transcription streaming only.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Supabase Realtime | Built-in, auth-aware, database triggers | Limited to database changes, 1MB payload limit |
| Native WebSocket | Full-duplex, arbitrary data | Need to build auth, reconnection logic |
| SSE | Simple, HTTP-based | Unidirectional (server→client), browser limitations |
| Polling | Simple, works everywhere | Latency, server load |

**Rationale:**
- **Supabase Realtime** already integrated in existing codebase (Supabase client installed)
- **Database triggers** can push updates when messages/calls change
- **Row-Level Security (RLS)** automatically applies to Realtime subscriptions
- **WebSocket** needed for transcription streaming (high-frequency text chunks) — Realtime not ideal for streaming
- **Hybrid approach**: Realtime for state changes, WebSocket for streaming data

**Consequences:**
- Need to enable Realtime on new tables (conversations, messages, calls)
- May need PostgreSQL triggers for business logic events
- WebSocket client needed for transcription streaming
- Need connection monitoring and reconnection logic

---

### ADR-003: Extend Existing API Layer Pattern

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need API calls for SMS, transcription, analytics, voice cloning. Options include existing API wrapper, Axios, React Query fetchers, or tRPC.

**Decision:** Extend existing API layer in `/src/lib/api.ts` with new endpoints, use React Query for data fetching.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Extend existing API wrapper | Rate limiting, validation, error handling built-in | More code in one file |
| Axios | Better API, interceptors | Adds dependency, duplication with existing |
| React Query fetchers | Declarative, caching, refetching | Need to re-implement validation/error handling |
| tRPC | End-to-end type safety | Backend changes needed, large migration |

**Rationale:**
- **Existing API wrapper** (`/src/lib/api.ts`) already has rate limiting, input validation, sanitization, and error handling
- **Consistent patterns** across all API calls
- **React Query** for caching, refetching, optimistic updates (wrapper calls existing API methods)
- **No breaking changes** to existing code

**Consequences:**
- API layer file will grow — may need to split by feature domain
- Need to define clear patterns for React Query vs direct API calls
- Ensure rate limiting covers new endpoints appropriately

---

### ADR-004: Create Separate Contexts for Each Feature

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need state management for trial, SMS, transcription, omnichannel, voice cloning. Options include one giant context, feature-specific contexts, or state machine.

**Decision:** Create separate contexts for each feature: TrialContext, ConversationContext (omnichannel), TranscriptContext, VoiceCloningContext.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| One giant context | Single source of truth | Re-renders entire app, unscalable |
| Feature-specific contexts | Scoped re-renders, clear boundaries | More files, context nesting |
| Zustand stores | No provider, fast | Adds dependency, loss of context benefits |

**Rationale:**
- **Feature boundaries** are clear in PRD (6 distinct features)
- **Existing pattern** uses multiple contexts (Auth, BusinessSetup, Setup, Search, Toast)
- **Scoped re-renders** — only consumers of specific context re-render
- **Clear separation of concerns** — easier testing and maintenance

**Consequences:**
- Need to manage context composition in App.tsx
- Some contexts may depend on AuthContext (trial, conversations)
- Need to consider context provider order (child contexts need parent data)

---

### ADR-005: Use Recharts for Analytics Dashboard

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need charts for analytics dashboard (sentiment trends, call metrics). Options include Recharts, Chart.js, Victory, Nivo, D3.js.

**Decision:** Use Recharts (already installed in package.json) for all analytics visualizations.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Recharts | React-native, declarative, already installed | Less flexible than D3 |
| Chart.js | Widely used, many examples | Not React-native, imperative API |
| Victory | React-native, good docs | Larger bundle size |
| Nivo | Beautiful, many chart types | Large bundle, slower updates |
| D3.js | Most flexible, powerful | Steep learning curve, imperative |

**Rationale:**
- **Already installed** in package.json (`recharts: ^3.6.0`)
- **Existing Chart.tsx component** in UI library shows pattern already established
- **Declarative API** fits React paradigm
- **Good enough** for analytics needs (line charts, bar charts, metric cards)
- **No additional bundle** impact

**Consequences:**
- Limited to chart types Recharts supports (sufficient for MVP)
- Custom styling needed to match design system
- Performance monitoring for large datasets

---

### ADR-006: Use Native WebSocket for Transcription Streaming

**Status:** Accepted
**Date:** 2026-02-19

**Context:** Need real-time transcription streaming from backend. Options include Supabase Realtime, native WebSocket, SSE, or polling.

**Decision:** Use native WebSocket for transcription streaming only; use Supabase Realtime for call state changes.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Native WebSocket | Full-duplex, low latency, any data | Need auth, reconnection, error handling |
| Supabase Realtime | Auth-aware, built-in | Not ideal for streaming, 1MB payload limit |
| SSE | Simple, HTTP-based, auto-reconnect | Unidirectional, no binary support |
| Polling | Simple, works everywhere | High latency, server load |

**Rationale:**
- **Transcription streaming** is high-frequency text chunks (~2-3 second intervals)
- **Realtime** has payload limits and is optimized for database changes, not streaming
- **WebSocket** provides full-duplex communication for call controls (mute, end, listen)
- **Hybrid**: WebSocket for streaming, Realtime for state (call started/ended)
- **Can reuse** for other streaming features in future (e.g., live analytics updates)

**Consequences:**
- Need to build WebSocket client with:
  - Authentication (JWT token in query params or headers)
  - Reconnection logic with exponential backoff
  - Heartbeat/ping-pong
  - Error handling and user feedback
- May need WebSocket connection pooling if multiple active calls monitored
- Need to handle browser tab visibility changes (pause/resume)

---

## 4. System Architecture

### 4.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React 19)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │   Contexts   │         │
│  │              │  │              │  │              │         │
│  │ - Landing    │  │ - UI Lib     │  │ - Auth       │         │
│  │ - Auth       │  │ - Feature    │  │ - Trial      │         │
│  │ - Dashboard  │  │ - Layout     │  │ - Conversn  │         │
│  │ - VoiceSetup │  │              │  │ - Transcr    │         │
│  │ - Business   │  │              │  │ - VoiceClone │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                   │
│                     ┌──────▼──────┐                            │
│                     │ API Layer   │                            │
│                     │ + Rate Lim  │                            │
│                     │ + Validation│                            │
│                     │ + Error Hdl │                            │
│                     └──────┬──────┘                            │
├────────────────────────────┼────────────────────────────────────┤
│  ┌──────────────┐  ┌────────▼──────────┐  ┌──────────────┐    │
│  │ Supabase     │  │ WebSocket Client  │  │ React Query  │    │
│  │ - Auth       │  │ (Transcription)  │  │ - Cache      │    │
│  │ - DB         │  │                   │  │ - Refetch    │    │
│  │ - Realtime   │  │                   │  │ - Opt Updates│    │
│  │ - Storage    │  │                   │  └──────────────┘    │
│  └──────────────┘  └───────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend APIs                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Supabase     │  │ SMS Provider │  │ Voice Clone  │         │
│  │ (PostgreSQL) │  │ (Twilio/etc) │  │ (ElevenLabs)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Transcription│  │ Analytics    │  │ Custom API   │         │
│  │ Service      │  │ Aggregation  │  │ Endpoints     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Architecture

#### Frontend Layers

```
frontend/src/
├── pages/                    # Route components
│   ├── auth/                # Login, signup, forgot password
│   ├── landing/             # Landing page, pricing, features
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── Home.tsx         # Dashboard home (NEW: omnichannel inbox)
│   │   ├── CallLogs.tsx     # Call history (NEW: active calls)
│   │   ├── Analytics.tsx    # NEW: advanced analytics
│   │   ├── VoiceCloning.tsx # NEW: voice cloning
│   │   ├── settings/        # Settings including voice config
│   │   └── components/      # Dashboard-specific components
│   ├── business-setup/      # Business setup wizard
│   └── voice-setup/         # Voice configuration
├── context/                 # React contexts
│   ├── AuthContext.tsx      # Existing
│   ├── BusinessSetupContext.tsx  # Existing
│   ├── TrialContext.tsx     # NEW: trial state
│   ├── ConversationContext.tsx  # NEW: omnichannel state
│   ├── TranscriptContext.tsx     # NEW: transcription state
│   └── VoiceCloningContext.tsx   # NEW: voice cloning state
├── api/                     # API clients
│   ├── auth.ts              # Existing auth endpoints
│   ├── calls.ts             # Call APIs (NEW: active calls, transcripts)
│   ├── sms.ts               # NEW: SMS send/receive
│   ├── analytics.ts         # Enhanced with new endpoints
│   ├── voice.ts              # Voice APIs (NEW: cloning, samples)
│   └── conversations.ts     # NEW: omnichannel APIs
├── hooks/                   # Custom React hooks
│   ├── useChat.ts           # Existing
│   ├── useTrial.ts          # NEW
│   ├── useConversations.ts  # NEW
│   ├── useTranscript.ts     # NEW
│   ├── useVoiceCloning.ts   # NEW
│   └── useWebSocket.ts      # NEW: WebSocket abstraction
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── TrialBanner.tsx  # NEW: trial countdown
│   │   ├── ConversationCard.tsx  # NEW
│   │   ├── TranscriptPanel.tsx   # NEW
│   │   ├── AnalyticsChart.tsx   # NEW
│   │   ├── VoiceUploader.tsx     # NEW
│   │   └── ...              # Existing UI components
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── OmnichannelInbox.tsx  # NEW
│   │   ├── ActiveCallsPanel.tsx  # NEW
│   │   ├── SentimentTrendChart.tsx  # NEW
│   │   ├── VoiceLibrary.tsx    # NEW
│   │   └── ...
├── lib/                     # Utilities
│   ├── api.ts               # API wrapper (enhanced)
│   ├── validators.ts        # Validation functions
│   ├── sanitizers.ts        # Input sanitization
│   ├── websocket.ts         # NEW: WebSocket client
│   └── ...
├── types/                   # TypeScript types
│   ├── auth.ts              # Existing
│   ├── trial.ts             # NEW
│   ├── conversation.ts      # NEW (extends chat.ts)
│   ├── transcript.ts        # NEW
│   ├── voice.ts             # Enhanced
│   └── analytics.ts         # Enhanced
└── config/                  # Configuration
    ├── env.ts               # Existing
    └── websocket.ts         # NEW: WebSocket config
```

---

## 5. Data Architecture

### 5.1 Database Schema (Supabase PostgreSQL)

#### New Tables

**trials** (Trial management)
```sql
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_credits_used INT DEFAULT 0,
  trial_credits_limit INT DEFAULT 100,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trials_user_id ON trials(user_id);
CREATE INDEX idx_trials_expires_at ON trials(expires_at);
```

**conversations** (Omnichannel conversations)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('voice', 'sms', 'chat')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_activity ON conversations(last_activity_at DESC);
```

**messages** (Messages across channels)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'customer', 'ai')),
  content TEXT NOT NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
```

**calls** (Call records - extends existing)
```sql
-- Enhance existing calls table with new columns
ALTER TABLE calls ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS transcript_status VARCHAR(20) CHECK (transcript_status IN ('pending', 'streaming', 'completed', 'failed'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2) CHECK (sentiment_score BETWEEN -1 AND 1);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_recording_url TEXT;

CREATE INDEX idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX idx_calls_status ON calls(status);
```

**voice_clones** (Voice cloning records)
```sql
CREATE TABLE voice_clones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider_voice_id VARCHAR(255) NOT NULL,  -- e.g., ElevenLabs voice ID
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  sample_url TEXT,  -- URL to uploaded voice sample
  pitch_adjustment DECIMAL(3,2) DEFAULT 0 CHECK (pitch_adjustment BETWEEN -1 AND 1),
  speed_adjustment DECIMAL(3,2) DEFAULT 1 CHECK (speed_adjustment BETWEEN 0.5 AND 2),
  preview_url TEXT,
  assigned BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_clones_user_id ON voice_clones(user_id);
CREATE INDEX idx_voice_clones_status ON voice_clones(status);
```

**sms_messages** (SMS-specific data - optional, could use messages table)
```sql
-- Optional: if SMS needs additional metadata beyond messages table
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  provider_message_id VARCHAR(255),  -- Twilio SID
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  segments INT DEFAULT 1,
  cost_cents INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sms_messages_message_id ON sms_messages(message_id);
CREATE INDEX idx_sms_messages_provider_message_id ON sms_messages(provider_message_id);
```

**analytics_events** (Analytics aggregation)
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  call_id UUID REFERENCES calls(id),
  metric_value DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_user_created ON analytics_events(user_id, created_at DESC);

-- Materialized view for aggregated analytics (optional, for performance)
CREATE MATERIALIZED VIEW daily_analytics AS
SELECT
  user_id,
  DATE(created_at) AS date,
  COUNT(*) FILTER (WHERE event_type = 'call_start') AS calls_started,
  COUNT(*) FILTER (WHERE event_type = 'call_end') AS calls_completed,
  AVG(metric_value) FILTER (WHERE event_type = 'sentiment') AS avg_sentiment,
  SUM(metric_value) FILTER (WHERE event_type = 'call_duration') AS total_duration
FROM analytics_events
GROUP BY user_id, DATE(created_at);

CREATE INDEX idx_daily_analytics_user_date ON daily_analytics(user_id, date DESC);
```

#### Enhanced Existing Tables

**profiles** (User profiles - extends Supabase auth.users)
```sql
-- Add trial-related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_started_trial BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assigned_voice_id UUID REFERENCES voice_clones(id);

CREATE INDEX idx_profiles_trial_expires_at ON profiles(trial_expires_at);
```

### 5.2 Entity Relationships

```
auth.users
    │
    ├──► profiles (1:1)
    │       │
    │       ├──► trial_expires_at
    │       └──► assigned_voice_id ─────────┐
    │                                       │
    ├──► trials (1:N)                       │
    │                                       │
    ├──► conversations (1:N) ───────────────┘
    │       │
    │       ├──► messages (1:N) ────► sms_messages (1:1, optional)
    │       │
    │       └──► calls (1:1)
    │               │
    │               └──► analytics_events (1:N)
    │
    └──► voice_clones (1:N)
```

### 5.3 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all new tables
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Trials: Users can only see their own trials
CREATE POLICY "Users can view own trials" ON trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trials" ON trials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations: Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Users can view messages from their conversations
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Calls: Users can view calls from their conversations
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Voice Clones: Users can only manage their own voices
CREATE POLICY "Users can view own voice clones" ON voice_clones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice clones" ON voice_clones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice clones" ON voice_clones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice clones" ON voice_clones
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics Events: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 6. API Design

### 6.1 Style

**REST API** with JSON responses. All endpoints except auth endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 6.2 Authentication

- **JWT tokens** issued by Supabase Auth
- **Access token**: 15 minute expiry
- **Refresh token**: 7 days expiry
- **Provider**: Supabase (`@supabase/supabase-js`)
- **Flow**:
  1. Client calls Supabase `auth.signUp()` or `auth.signInWithPassword()`
  2. Token stored in localStorage (existing `sessionUtils`)
  3. All API calls include `Authorization: Bearer <token>` header
  4. Token refresh handled automatically by Supabase client

### 6.3 Error Handling

**Standard Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Additional context */ }
  }
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` — Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS` — User doesn't have access
- `VALIDATION_ERROR` — Input validation failed
- `RATE_LIMITED` — Too many requests (includes `retry_after` seconds)
- `TRIAL_EXPIRED` — Trial period has ended
- `VOICE_PROCESSING_FAILED` — Voice cloning failed
- `TRANSCRIPTION_UNAVAILABLE` — Transcription service unavailable

### 6.4 New API Endpoints

#### Trial Endpoints

```
POST   /api/auth/trial/start           Start 14-day trial
GET    /api/auth/trial/status           Get trial status (days remaining)
POST   /api/auth/trial/upgrade          Upgrade trial to paid plan
```

#### Conversation Endpoints (Omnichannel)

```
GET    /api/conversations              List all conversations (voice + SMS)
GET    /api/conversations/:id          Get conversation details
GET    /api/conversations/:id/messages Get conversation messages
POST   /api/conversations/:id/messages Send message (SMS or AI response)
PATCH  /api/conversations/:id/status  Update conversation status
GET    /api/conversations/unread       Get unread count
```

#### SMS Endpoints

```
POST   /api/sms/send                   Send SMS message
GET    /api/sms/usage                  Get SMS usage stats
```

#### Call & Transcription Endpoints

```
GET    /api/calls/active               List active calls
GET    /api/calls/:id                  Get call details
GET    /api/calls/:id/transcript       Get call transcript
POST   /api/calls/:id/end              End active call
WS     /api/calls/:id/transcript/stream WebSocket for live transcription
```

#### Analytics Endpoints

```
GET    /api/analytics/overview         Get analytics overview (key metrics)
GET    /api/analytics/sentiment        Get sentiment trends
GET    /api/analytics/calls            Get call metrics (duration, volume)
GET    /api/analytics/export           Export analytics data (CSV/PDF)
```

#### Voice Cloning Endpoints

```
GET    /api/voices                     List custom voices
POST   /api/voices/upload              Upload voice sample for cloning
GET    /api/voices/:id                 Get voice details
PATCH  /api/voices/:id/assign          Assign voice to AI
DELETE /api/voices/:id                 Delete custom voice
```

### 6.5 WebSocket Protocol (Transcription)

**Connection URL:**
```
wss://api.vocalscale.com/api/calls/:callId/transcript/stream?token=<jwt>
```

**Messages (Client → Server):**
```json
{
  "type": "subscribe" | "unsubscribe",
  "callId": "uuid"
}
```

**Messages (Server → Client):**
```json
// Transcription chunk
{
  "type": "chunk",
  "data": {
    "text": "transcribed text",
    "speaker": "customer" | "ai",
    "timestamp": "2024-02-19T12:00:00Z",
    "isFinal": false
  }
}

// Transcription complete
{
  "type": "complete",
  "data": {
    "transcript": "full transcript",
    "summary": "AI summary",
    "sentiment": 0.75
  }
}

// Error
{
  "type": "error",
  "data": {
    "code": "TRANSCRIPTION_FAILED",
    "message": "Transcription service unavailable"
  }
}
```

---

## 7. Project Structure

```
frontend/src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx                   # Existing
│   │   ├── Signup.tsx                  # ENHANCE: Add trial start
│   │   └── ForgotPassword.tsx          # Existing
│   ├── landing/
│   │   ├── index.tsx                   # Existing
│   │   └── components/
│   │       └── Pricing.tsx             # ENHANCE: Add trial CTA
│   ├── dashboard/
│   │   ├── Home.tsx                   # RENAME: OmnichannelInbox.tsx
│   │   ├── CallLogs.tsx               # ENHANCE: Active calls, transcripts
│   │   ├── Analytics.tsx               # NEW: Advanced analytics
│   │   ├── VoiceCloning.tsx           # NEW: Voice cloning UI
│   │   └── components/
│   │       ├── TrialBanner.tsx         # NEW
│   │       ├── ConversationCard.tsx    # NEW
│   │       ├── TranscriptPanel.tsx     # NEW
│   │       ├── SentimentChart.tsx      # NEW
│   │       ├── VoiceUploader.tsx       # NEW
│   │       └── VoiceLibrary.tsx        # NEW
│   └── ...
├── context/
│   ├── AuthContext.tsx                # Existing (unchanged)
│   ├── TrialContext.tsx                # NEW
│   ├── ConversationContext.tsx         # NEW
│   ├── TranscriptContext.tsx          # NEW
│   └── VoiceCloningContext.tsx        # NEW
├── api/
│   ├── calls.ts                       # ENHANCE: Add transcript endpoints
│   ├── sms.ts                          # NEW
│   ├── conversations.ts               # NEW
│   ├── analytics.ts                    # ENHANCE: Add new endpoints
│   └── voice.ts                        # ENHANCE: Add cloning endpoints
├── hooks/
│   ├── useChat.ts                      # Existing (unchanged)
│   ├── useTrial.ts                     # NEW
│   ├── useConversations.ts             # NEW
│   ├── useTranscript.ts                # NEW
│   ├── useVoiceCloning.ts              # NEW
│   └── useWebSocket.ts                 # NEW
├── components/
│   ├── ui/
│   │   ├── Button.tsx                  # Existing
│   │   ├── Card.tsx                    # Existing
│   │   ├── Chart.tsx                   # Existing (Recharts wrapper)
│   │   └── ...                         # Other UI components
│   └── dashboard/
│       └── ...                         # Dashboard-specific components
├── lib/
│   ├── api.ts                          # ENHANCE: Add new API methods
│   ├── websocket.ts                    # NEW: WebSocket client
│   └── ...
└── types/
    ├── trial.ts                        # NEW
    ├── conversation.ts                 # NEW
    ├── transcript.ts                   # NEW
    └── ...
```

---

## 8. Coding Standards

### 8.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ConversationCard.tsx`, `TranscriptPanel.tsx` |
| Files (hooks) | camelCase with `use` prefix | `useTranscript.ts`, `useVoiceCloning.ts` |
| Contexts | PascalCase with `Context` suffix | `TrialContext.tsx` |
| Types/Interfaces | PascalCase | `Conversation`, `Message`, `TranscriptChunk` |
| Functions | camelCase | `fetchTranscript`, `uploadVoiceSample` |
| Constants | UPPER_SNAKE_CASE | `MAX_SMS_CREDITS`, `TRIAL_DURATION_DAYS` |
| CSS Classes | Tailwind utility classes | `flex`, `items-center`, `bg-blue-500` |

### 8.2 Error Handling Pattern

```typescript
// API calls
try {
  const result = await api.sendSMS({ to, message });
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return { success: false, error: 'Please wait before sending another message' };
    }
    if (error.code === 'INSUFFICIENT_CREDITS') {
      return { success: false, error: 'Upgrade to send more messages' };
    }
  }
  return { success: false, error: 'Failed to send message. Please try again.' };
}

// WebSocket errors
websocket.addEventListener('error', () => {
  setTranscriptStatus('error');
  showToast('Transcription connection lost. Reconnecting...', 'error');
  // Auto-reconnect logic in useWebSocket hook
});
```

### 8.3 TypeScript Best Practices

```typescript
// Define strict types for all entities
export interface Conversation {
  id: string;
  userId: string;
  customerPhone: string;
  customerName?: string;
  channel: 'voice' | 'sms' | 'chat';
  status: 'active' | 'completed' | 'archived';
  lastActivityAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Use discriminated unions
export type MessageSender = 'user' | 'customer' | 'ai';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSender;
  content: string;
  direction: MessageDirection;
  sentAt: string;
}

// Use generic types with constraints
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Use utility types
export type ConversationUpdate = Partial<Omit<Conversation, 'id' | 'userId' | 'createdAt'>>;
```

### 8.4 Component Patterns

```typescript
// Use compound components for complex UI
<ConversationCard>
  <ConversationCard.Header>
    <ConversationCard.Avatar src="..." />
    <ConversationCard.Info name="John Doe" phone="+15551234567" />
  </ConversationCard.Header>
  <ConversationCard.Preview>
    Last message...
  </ConversationCard.Preview>
  <ConversationCard.Meta>
    <ConversationCard.Channel type="sms" />
    <ConversationCard.Timestamp time="2m ago" />
  </ConversationCard.Meta>
</ConversationCard>

// Use render props for flexible composition
<TranscriptPanel>
  {({ transcript, isLive, speaker }) => (
    <TranscriptMessage speaker={speaker}>{transcript}</TranscriptMessage>
  )}
</TranscriptPanel>
```

---

## 9. Testing Strategy

| Type | Tool | Target | Coverage Goal |
|------|------|--------|---------------|
| Unit | Vitest | Utils, hooks, API client functions | 80% |
| Component | Vitest + @testing-library/react | React components | 60% |
| Integration | Vitest | API + Context integration | 40% |
| E2E | Playwright (future) | Critical user flows | N/A |
| Visual | Storybook (future) | UI component documentation | N/A |

### 9.1 Key Test Scenarios

**Trial Flow:**
- User can start trial on signup
- Trial countdown displays correctly
- Trial expired shows upgrade prompt
- Existing users with trial can upgrade

**SMS Channel:**
- SMS messages send successfully
- Inbound SMS appears in real-time
- SMS usage updates correctly
- Rate limiting enforced

**Real-time Transcription:**
- WebSocket connects with auth token
- Transcript chunks stream in real-time
- Reconnection works on disconnect
- Final transcript saves to call record

**Analytics Dashboard:**
- Metrics load within SLA (< 3s)
- Charts render correctly with data
- Filters work across all visualizations
- Export produces valid CSV/PDF

**Voice Cloning:**
- File upload validates format/size
- Processing status updates correctly
- Preview plays before assignment
- Voice assigned to AI successfully

---

## 10. Security Considerations

### 10.1 Authentication & Authorization

- **JWT validation** on all protected endpoints
- **Row-Level Security (RLS)** on all Supabase tables
- **Trial status checks** before allowing feature access
- **SMS credit checks** before sending messages

### 10.2 Input Validation & Sanitization

- **Client-side validation** with Zod schemas
- **Server-side validation** (never trust client)
- **Sanitize all user input** (phone numbers, message content, voice sample filenames)
- **Prevent XSS** with Content Security Policy and DOMPurify (already installed)

### 10.3 Rate Limiting

- **API rate limiting** implemented in `/src/lib/api.ts`
- **Endpoint-specific limits**: 5/min for uploads, 10/min for voice processing, 100/min for general
- **Trial abuse prevention**: 3 signup attempts per IP per hour

### 10.4 Data Encryption

- **HTTPS enforced** for all connections
- **Sensitive data encrypted at rest**: Phone numbers, transcripts, voice samples
- **Voice samples stored securely**: Access-controlled storage buckets

### 10.5 Audit Logging

- **Audit sensitive actions**: Voice cloning, SMS configuration changes, trial upgrades
- **Log format**: `{ userId, action, timestamp, ipAddress, details }`

---

## 11. Performance Considerations

### 11.1 Client-Side Optimization

- **Lazy loading** for dashboard routes (already implemented)
- **Code splitting** by feature (trial, conversations, analytics, voice)
- **Image optimization**: Compress voice thumbnails, use WebP where supported
- **Chart optimization**: Debounce filter changes, limit data points

### 11.2 API Optimization

- **Pagination** for conversation/message lists (default 20, max 100)
- **Caching** with React Query (staleTime: 5min, cacheTime: 10min)
- **Optimistic updates** for message sends, status changes
- **Materialized views** for analytics aggregation

### 11.3 Real-Time Optimization

- **WebSocket connection pooling**: Reuse connections for multiple active calls
- **Debounce transcript rendering**: Update UI every 2-3 chunks, not every chunk
- **Supabase Realtime filters**: Subscribe only to user's data

### 11.4 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard load | < 3s | Lighthouse Performance score |
| API response (95th percentile) | < 500ms | API monitoring |
| Real-time message latency | < 5s | End-to-end timing |
| Transcript latency | < 5s | Speech to display |
| WebSocket reconnection | < 3s | Reconnect event timing |

---

## 12. Deployment

### 12.1 Environment Variables

```bash
# Existing
VITE_API_URL=https://api.vocalscale.com/api
VITE_PAYMENT_API_URL=https://billing.vocalscale.com/api
VITE_KNOWLEDGE_API_URL=https://api.vocalscale.com/knowledge

# New
VITE_WEBSOCKET_URL=wss://api.vocalscale.com
VITE_SMS_PROVIDER=twilio  # or messagebird, bandwidth
VITE_VOICE_CLONE_PROVIDER=elevenlabs  # or resemble
VITE_TRANSCRIPTION_PROVIDER=google  # or aws
```

### 12.2 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### 12.3 CI/CD Pipeline (Recommended)

```yaml
# GitHub Actions example
name: Deploy Frontend

on:
  push:
    branches: [main, dev]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel/Netlify
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 13. Integration Strategy

### 13.1 Phased Implementation

**Phase 1: Foundation (Week 1-2)**
- Database schema migrations
- API endpoints stubs
- Context setup
- Type definitions

**Phase 2: Trial Flow (Week 2-3)**
- Trial signup flow
- Trial banner component
- Trial status API
- Upgrade modal

**Phase 3: SMS Channel (Week 3-4)**
- SMS send/receive APIs
- Conversation list UI
- Message thread UI
- SMS usage tracking

**Phase 4: Real-Time Transcription (Week 4-5)**
- WebSocket client
- Active calls panel
- Transcript streaming UI
- Transcription save logic

**Phase 5: Analytics Dashboard (Week 5-6)**
- Analytics aggregation
- Chart components
- Dashboard layout
- Export functionality

**Phase 6: Omnichannel Unified (Week 6-7)**
- Merge voice + SMS into unified inbox
- Channel filters
- Search across conversations
- Real-time updates

**Phase 7: Voice Cloning (Week 7-8)**
- Voice upload UI
- Processing status tracking
- Voice library
- Preview and assignment

**Phase 8: Polish & QA (Week 8-9)**
- End-to-end testing
- Performance optimization
- Bug fixes
- Documentation

### 13.2 Migration Strategy

**Breaking Changes:** None — all new features are additive

**Existing Users:** No migration needed — existing data remains valid

**New Users:** Automatically get trial flow on signup

**Database Changes:** Use Supabase migrations, run during deployment

**API Changes:** New endpoints only, no existing endpoints modified

---

## 14. Monitoring & Observability

### 14.1 Client-Side Metrics

- **Web Vitals tracking** (already implemented: WebVitalsTracking component)
- **API latency tracking** (already implemented: metrics in /src/lib/api.ts)
- **Error tracking** (placeholder for Sentry integration)

### 14.2 Key Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Dashboard load time | Performance | > 5s for 95th percentile |
| API error rate | API health | > 5% error rate |
| WebSocket disconnections | Real-time reliability | > 10% disconnect rate |
| Trial signup rate | Business | < 10% conversion |
| SMS delivery failure | SMS reliability | > 5% failure rate |
| Transcription latency | Feature quality | > 10s latency |

---

## 15. Future Considerations

### 15.1 Scalability

- **Server-sent events** for analytics updates (alternative to polling)
- **GraphQL** for complex queries (if analytics queries become complex)
- **Micro-frontends** if dashboard grows beyond single-app scope
- **CDN caching** for static assets and analytics reports

### 15.2 Features Out of Scope (Post-MVP)

- Live chat widget embedding
- CRM integrations (HubSpot, Salesforce, Pipedrive)
- Zapier integration
- Team management with roles and permissions
- Custom script builder with drag-and-drop
- In-app chat support
- Video call support
- International SMS
- Multi-language support for AI

---

## 16. Open Questions

| # | Question | Impact | Decision Owner |
|---|----------|--------|----------------|
| 1 | SMS provider selection? (Twilio, MessageBird, Bandwidth) | API implementation, pricing | Engineering/Product |
| 2 | Voice cloning provider? (ElevenLabs, Resemble AI) | API implementation, cost, voice quality | Engineering/Product |
| 3 | Transcription provider? (Google, AWS, Deepgram) | Cost, latency, accuracy | Engineering/Product |
| 4 | Trial SMS credit limit? (proposed: 100 messages) | Abuse prevention, cost | Product |
| 5 | Data retention policy for transcripts? | Compliance, storage costs | Legal/Engineering |
| 6 | WebSocket authentication method? (query param vs header) | Security, compatibility | Engineering |
| 7 | Should analytics use materialized views? | Performance vs complexity | Engineering |
| 8 | Voice sample storage location? (Supabase Storage vs S3) | Cost, performance | Engineering |
| 9 | Should we add React Hook Form? | DX, bundle size | Engineering |
| 10 | Browser support for WebSocket transcription? | Feature availability | Engineering/Product |

---

## 17. Appendix

### 17.1 Sequence Diagram: SMS Message Flow

```
User          Frontend      Supabase      SMS Provider    Customer
  │               │              │               │               │
  │─ Send SMS ───▶│              │               │               │
  │               │─ API Call ──▶│               │               │
  │               │              │─ Webhook ──▶  │               │
  │               │              │               │─ SMS ────────▶│
  │               │              │               │◀─ Delivered ──│
  │               │◀─ Response ──│               │               │
  │◀─ UI Update ──│              │               │               │
  │               │              │               │               │
  │◀─ Incoming SMS ──────────────────────────────│               │
  │               │              │               │               │
  │               │◀─ Realtime ──│               │               │
  │◀─ UI Update ──│              │               │               │
```

### 17.2 Sequence Diagram: Real-Time Transcription

```
User          Frontend      WebSocket      Transcription Service
  │               │              │                    │
  │─ Start Call ──▶│              │                    │
  │               │─ Subscribe ──▶│                    │
  │               │              │─ Start ───────────▶│
  │               │              │                    │
  │               │              │◀─ Chunk 1 ────────│
  │◀─ "Hello" ─────│              │                    │
  │               │              │◀─ Chunk 2 ────────│
  │◀─ " how are ───│              │                    │
  │               │              │◀─ Chunk 3 ────────│
  │◀─ " you?" ─────│              │                    │
  │               │              │                    │
  │─ End Call ─────│              │                    │
  │               │─ End ────────▶│                    │
  │               │              │◀─ Complete ───────│
  │◀─ Final ───────│              │                    │
  │   Transcript   │              │                    │
```

### 17.3 Glossary

| Term | Definition |
|------|------------|
| **Omnichannel** | Multi-channel approach providing seamless customer experience across voice, SMS, chat |
| **WebSocket** | Full-duplex communication protocol for real-time data transfer |
| **Supabase Realtime** | Real-time subscription system for PostgreSQL changes |
| **Row-Level Security (RLS)** | Database security feature restricting row access based on user identity |
| **Materialized View** | Pre-computed database view for query performance optimization |
| **Rate Limiting** | API protection technique limiting request rate per client |
| **Token Bucket Algorithm** | Rate limiting algorithm using refilling token bucket |
| **Exponential Backoff** | Retry strategy with increasing delay between attempts |
| **Optimistic Update** | UI update pattern assuming success before server confirmation |
| **Compound Components** | React pattern for complex UIs with shared state |

---

**End of Architecture Document**

This document provides the technical foundation for implementing the VocalScale Frontend Enhancement. All decisions prioritize maintaining existing patterns while adding new capabilities in a scalable, maintainable manner.
