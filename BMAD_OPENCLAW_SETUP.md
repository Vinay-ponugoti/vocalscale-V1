# BMAD OpenClaw Setup - VocalScale Frontend

> **Status:** ✅ Installed and configured
> **Date:** 2026-02-19

---

## What This Is

This is a **BMad Method implementation for OpenClaw** that uses `sessions_spawn` to run sub-agents. It's different from the CLI-based BMad you just installed.

### Key Differences

| Feature | Standard BMad (`_bmad/`) | OpenClaw BMad (`BMAD_Openclaw/`) |
|---------|---------------------------|----------------------------------|
| Execution | CLI tools | OpenClaw `sessions_spawn` |
| Orchestrator | Menu-driven master agent | Conversational (main session) |
| Token cost | 3x higher | 1x (direct sub-agents) |
| Crash recovery | Lost context | Orchestrator can respawn |
| Parallel work | Sequential | Multiple agents simultaneously |

---

## Structure

```
main-vocalscale-frontend/
├── BMAD_Openclaw/          ← OpenClaw BMad implementation
│   ├── config/
│   │   └── vocalscale-frontend.yaml  ← Project config (created)
│   ├── prompts/            ← Agent prompts (12 agents)
│   ├── ORCHESTRATOR.md     ← Main orchestration logic
│   └── WORKFLOW-CYCLE.md  ← Workflow reference
├── _bmad-output/          ← Artifacts and state
│   ├── planning-artifacts/
│   ├── implementation-artifacts/
│   │   ├── stories/
│   │   └── reviews/
│   └── sprint-status.yaml   ← Sprint tracking
└── frontend/              ← Your React app
```

---

## How to Use

### 1. Start Planning Phase

**From OpenClaw chat, say:**

```
Start BMAD planning for VocalScale Frontend.
The idea: An AI-powered voice assistant platform for businesses with appointment scheduling, order management, and voice agent configuration.
```

This will trigger:
1. **Product Owner** → Creates `product-brief.md`
2. **Business Analyst** → Creates `prd.md`
3. **Architect** → Creates `architecture.md`
4. **UX Designer** → Creates `ux-design-specification.md`
5. **Scrum Master** → Creates `epics.md`
6. **Readiness Check** → Creates GO/NO-GO decision

### 2. Implement Stories

After planning phase is GO:

```
Create story 1-1-login-authentication
```

This will spawn the **Create Story** agent to generate the story file.

Then:

```
Implement story 1-1-login-authentication
```

This spawns the **Dev Story** agent to implement it using red-green-refactor.

### 3. Review Code

After implementation:

```
Review story 1-1-login-authentication
```

This spawns the **Code Review** agent (adversarial review, finds 3-10 issues minimum).

### 4. Continue Work

```
Continue
```

The orchestrator will auto-determine the next step and spawn the appropriate agent.

---

## Commands Quick Reference

| Command | Action |
|---------|--------|
| `status` | Show current sprint/story status |
| `next` / `continue` | Auto-determine and run next workflow |
| `create story X-Y` | Run create-story for specific story |
| `implement X-Y` | Run dev-story for specific story |
| `review X-Y` | Run code-review for specific story |
| `ux review X-Y` | Run ux-review for specific story |
| `test X-Y` | Run qa-tester for specific story |
| `retrospective` | Run retrospective for current epic |
| `pause` | Stop spawning new work |

---

## Story Status Values (Exact)

Must use these exact values in `sprint-status.yaml`:

| Status | Meaning |
|--------|---------|
| `backlog` | Story only in epics.md |
| `ready-for-dev` | Story file created, ready to implement |
| `in-progress` | Currently being implemented |
| `review` | Awaiting code review |
| `done` | Completed and approved |

---

## The 12 Agents

### Planning Phase (6 agents)

1. **Product Owner** (`product-owner.md`)
   - Creates product brief and MVP scope

2. **Business Analyst** (`business-analyst.md`)
   - Creates PRD with requirements, user journeys, FRs

3. **Architect** (`architect.md`)
   - Creates architecture doc with stack, data model, APIs

4. **UX Designer** (`ux-designer.md`)
   - Creates UX spec with screens, flows, components

5. **Scrum Master** (`scrum-master.md`)
   - Creates epics and stories with acceptance criteria

6. **Readiness Check** (`readiness-check.md`)
   - Validates planning completeness, issues GO/NO-GO

### Execution Phase (6 agents)

7. **Create Story** (`create-story.md`)
   - Generates story files from epics

8. **Dev Story** (`dev-story.md`)
   - Implements code using red-green-refactor

9. **Code Review** (`code-review.md`)
   - Adversarial review (3-10 issues minimum)

10. **UX Review** (`ux-review.md`)
    - Validates UI/UX against spec

11. **QA Tester** (`qa-tester.md`)
    - Functional and edge case testing

12. **Retrospective** (`retrospective.md`)
    - Sprint retrospective and learnings

---

## Configuration

**Project config:** `BMAD_Openclaw/config/vocalscale-frontend.yaml`

```yaml
project:
  name: "VocalScale Frontend"
  description: "AI-powered voice assistant platform"

paths:
  root: "/home/vinay/.openclaw/workspace/main-vocalscale-frontend"
  planning: "/home/vinay/.openclaw/workspace/main-vocalscale-frontend/_bmad-output/planning-artifacts"
  implementation: "/home/vinay/.openclaw/workspace/main-vocalscale-frontend/_bmad-output/implementation-artifacts"

stack:
  frontend: "React 19, Vite, TypeScript, Tailwind, Radix UI"
  backend: "Supabase"
  language: "TypeScript"

constraints:
  max_stories_per_sprint: 5
  require_code_review: true
  require_ux_review: true
  require_qa: false
```

---

## Quality Guarantees

- ✅ Red-green-refactor methodology
- ✅ Definition of Done checklists
- ✅ Adversarial code review (3-10 issues minimum)
- ✅ Sprint status tracking
- ✅ Given/When/Then acceptance criteria
- ✅ Task completion verification

---

## HALT Protocol

When an agent can't proceed, it returns:

```
HALT: Missing database schema | Context: Need schema before implementing data layer
```

The orchestrator (you in main session) can:
1. **Resolve and respawn** — fix issue, re-run agent
2. **Ask for input** — for ambiguous decisions
3. **Mark blocked** — log it, move to next story

---

## Next Steps

1. **Start planning:** Describe your feature to begin
2. **Or continue:** If you have existing work, say "status" to see current state
3. **Or implement:** Jump straight to "implement X-Y" if you know the story

---

*For detailed docs, see:*
- `BMAD_Openclaw/README.md` - Full documentation
- `BMAD_Openclaw/ORCHESTRATOR.md` - Orchestration logic
- `BMAD_Openclaw/WORKFLOW-CYCLE.md` - Workflow reference
