# Product Brief: VocalScale Frontend Enhancement

**Date:** 2026-02-19
**Author:** Product Owner Agent

## Vision

Enhance VocalScale's AI receptionist platform with missing competitor features to improve market positioning, reduce customer acquisition friction, and deliver a more complete customer communication solution. By adding free trial, omnichannel support, real-time transcription, and advanced analytics, VocalScale will evolve from a voice-only platform to a unified AI-powered business communication hub.

## Problem Statement

VocalScale has a clean, modern UI with unique features like appointment and inventory management, but it's losing deals to competitors who offer voice cloning, omnichannel support (SMS/chat), free trials, real-time transcription, and advanced analytics. Businesses now expect AI receptionists to handle multiple channels seamlessly, and without these features, VocalScale appears outdated and less competitive despite its strong foundation. The lack of a free trial creates unnecessary friction at the top of the funnel, limiting conversion rates.

## Target Users

### Persona 1: Sarah - Small Business Owner
- **Role:** Owner of a local service business (salon, clinic, restaurant)
- **Pain Points:**
  - Missing customer calls during busy hours
  - Customers prefer texting over calling
  - Can't afford a full-time receptionist
  - Wants to try before committing to monthly fees
- **Goals:**
  - Never miss a customer inquiry
  - Offer self-service scheduling and ordering
  - Try the platform risk-free before buying
  - Track how many calls convert to bookings

### Persona 2: James - Operations Manager
- **Role:** Operations lead at a mid-sized business (5-50 employees)
- **Pain Points:**
  - Managing multiple communication channels (phone, SMS, chat) is fragmented
  - Can't see real-time what's happening during calls
  - Needs analytics to justify ROI to leadership
  - Wants consistent brand voice across AI interactions
- **Goals:**
  - Unified dashboard for all customer interactions
  - Real-time oversight of AI performance
  - Data-driven insights to optimize operations
  - Custom AI voice to match brand identity

## Value Proposition

For small and mid-sized businesses who need AI-powered customer communication, VocalScale is a unified receptionist platform that handles voice, SMS, and chat with real-time insights. Unlike competitors that nickel-and-dime for basic features or require enterprise contracts, VocalScale offers a risk-free trial, transparent pricing, and unique business management features like appointments and inventory that competitors lack.

## MVP Features

### Must-Have
1. **Free Trial Flow** — Add prominent 14-day free trial to pricing page with no credit card required. Essential to reduce conversion friction.
2. **SMS Channel** — Enable customers to text the VocalScale AI phone number and receive AI responses. Core to omnichannel expectation.
3. **Real-Time Call Transcription** — Display live transcript during active calls instead of just post-call AI summary. Critical for oversight and user confidence.

### Should-Have
4. **Advanced Analytics Dashboard** — Add sentiment trends, call metrics (duration, resolution rate), KPI tracking, and visual reports. Justifies subscription value.
5. **Omnichannel Unified Dashboard** — Single view showing voice calls, SMS conversations, and (future) chat messages together. Improves operational efficiency.
6. **Voice Cloning** — Allow businesses to upload a 60-second voice sample to create a custom AI voice. High differentiation and brand alignment.

### Nice-to-Have (Post-MVP)
7. **Team Management** — Multi-user with roles and permissions for enterprise customers.
8. **CRM Integration Marketplace** — Direct integrations with HubSpot, Salesforce, Pipedrive, and Zapier.
9. **Custom Script Builder** — Drag-and-drop interface for granular AI behavior control.
10. **Live Chat Widget** — Embeddable chat widget for business websites.

## Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Free Trial Signup Rate | 15-20% of pricing page visitors | Measures conversion funnel improvement |
| Trial-to-Paid Conversion | 25-30% of trial users | Validates product value and onboarding |
| SMS Adoption Rate | 40% of active users sending/receiving SMS | Confirms omnichannel value |
| Real-Time Transcript Usage | 60% of active calls monitored live | Shows feature engagement |
| Weekly Active Analytics Dashboard | 50% of paid users | Proves analytics value perception |

## Constraints

- **Technical Stack:** Existing Next.js/React frontend with TypeScript
- **Timeline:** 2-3 sprints for MVP (6-9 weeks)
- **Backend Dependencies:** SMS integration requires backend API development (Twilio or similar)
- **Voice Cloning:** May require third-party API (ElevenLabs, Resemble AI) or backend ML infrastructure

## Open Questions

- Which SMS provider to integrate? (Twilio, MessageBird, Bandwidth)
- Should voice cloning be built-in or use third-party API?
- How to handle SMS message limits in existing pricing tiers?
- Real-time transcription latency requirements? (acceptable delay for live display)
- Should free trial include SMS usage credits or restrict to voice only?

## Next Steps

1. Business Analyst to create detailed PRD with user stories and acceptance criteria
2. Architect to design technical architecture for SMS integration and real-time transcription
3. UX Designer to create design specifications for free trial flow and analytics dashboard
4. Engineering to implement MVP features in priority order: free trial → SMS → real-time transcription
