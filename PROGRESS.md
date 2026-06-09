# gfsim — Implementation Progress

Living tracker of what is built vs planned. **Agents: treat this as ground truth for implementation status.** Last updated: 2026-06-09.

For product behavior and design intent, see [AGENT.md](./AGENT.md) and [PLAN.md](./PLAN.md).

---

## Tier 1: Foundation

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js App Router scaffold | ✅ Done | Next 16, React 19, TypeScript |
| Google OAuth (better-auth) | ✅ Done | `/login`, `/api/auth/*`, session cookies |
| Route protection | ✅ Done | `src/proxy.ts` guards `/chat`, `/memories`, `/onboarding` |
| User onboarding (user profile) | ✅ Done | DOB, MBTI, zodiac, description |
| Girlfriend onboarding (`gf_profile`) | ✅ Done | Name, DOB, language, nationality, MBTI, zodiac, maturity tier |
| Chat UI | ✅ Done | `src/app/chat/`, streaming via `@ai-sdk/react` |
| Message persistence | ✅ Done | `chat_message` table; paginated load via `GET /api/chat/messages` |
| Typing indicator | ✅ Done | Client-side while streaming |
| Multi-bubble replies | ✅ Done | `<msg>` tag parsing + staggered reveal |
| Emoji reactions | ✅ Done | User reactions + AI reaction tags |
| Daily message limit | ✅ Done | 20 messages/day per user |
| Token usage tracking | ✅ Done | `chat_usage` table + `/account/usage` chart |
| Memories CRUD | ✅ Done | Auto-extract from chat; list/delete at `/memories` |
| Personality editor | ✅ Done | `/chat/personality` — edit gf profile fields |
| Account page | ✅ Done | User profile display/edit |

---

## Tier 2: Relationship Mechanics

| Feature | Status | Notes |
|---------|--------|-------|
| Relationship health score (0–100) | 🟡 Partial | Computed per request; not persisted to DB |
| Sentiment analysis (LLM) | ✅ Done | `src/lib/relationship/sentiment.ts` — tone, health delta, jealousy, details |
| Regex health heuristics | ✅ Done | `history.ts` — scans in-context user messages |
| Mood state resolution | ✅ Done | `mood.ts` — 7 states from health + cycle + status |
| Monthly cycle (days 22–28) | ✅ Done | Based on `gf_profile.createdAt`; affects mood + prompt |
| Dynamic system prompt | ✅ Done | `src/lib/ai/system-prompt.ts` — health, mood, memories, patterns |
| Pattern notes (jealousy etc.) | 🟡 Partial | Ephemeral `patternNotes` array, last 5 entries; not persisted |
| Response tone mirroring | ✅ Done | Via mood guidance in system prompt |
| Relationship metadata in stream | ✅ Done | Health, mood, cycle sent as message metadata |
| Persisted relationship profile | ❌ Not started | No DB table; profile rebuilt each request from defaults |
| Inactivity / abandonment tracking | ❌ Not started | No `lastActiveAt`, no gap-based health penalties |
| Unprompted check-in messages | ❌ Not started | No cron; 6h/12h/24h triggers from AGENT.md |
| Mood-aware UI styling | ❌ Not started | Metadata exists but chat UI doesn't reflect mood |

---

## Tier 3: Advanced Dynamics

| Feature | Status | Notes |
|---------|--------|-------|
| Jealousy detection | 🟡 Partial | LLM extracts `jealousyNote`; fed to prompt via pattern notes |
| Jealousy escalation path | ❌ Not started | No mention counting or staged responses |
| Memory in conversation | ✅ Done | Memories loaded from DB into system prompt |
| Auto memory extraction | ✅ Done | `mentionedDetail` from sentiment → `memory` table |
| Conflict / argument tracking | ❌ Not started | `lastConflictSummary` field exists but never populated |
| Promise tracking | ❌ Not started | — |
| Pre-breakup warning phase | 🟡 Partial | `pre_breakup` mood at health ≤15; no multi-week arc |
| Breakup initiation | ❌ Not started | `relationshipStatus` never transitions to `broken_up` |
| Post-breakup locked UI | ❌ Not started | `<noreply/>` parsing exists; input never disabled |
| Reconciliation arc | ❌ Not started | `reconciling` status unused |
| Win-her-back cooldown | ❌ Not started | — |

---

## Tier 4: Infrastructure & Realtime

| Feature | Status | Notes |
|---------|--------|-------|
| Socket.IO / WebSockets | ❌ Not started | Mentioned in AGENT.md; chat is HTTP streaming only |
| Cron / background jobs | ❌ Not started | No inactivity checks, cycle notifications, or health decay |
| Relationship health in UI | ❌ Not started | Score not shown to user (by design for now) |
| Export relationship history | ❌ Not started | — |
| Reset relationship | ❌ Not started | — |
| Difficulty modes | ❌ Not started | Maturity tier exists but no difficulty system |

---

## Database tables

| Table | Status | Purpose |
|-------|--------|---------|
| `user` | ✅ | Auth + user profile fields |
| `session`, `account`, `verification` | ✅ | better-auth |
| `gf_profile` | ✅ | Girlfriend persona |
| `chat_message` | ✅ | Message history |
| `memory` | ✅ | Persisted facts |
| `chat_usage` | ✅ | LLM token tracking |
| `relationship_profile` | ❌ Planned | Not in schema — see PLAN.md data model |

---

## API routes

| Route | Status |
|-------|--------|
| `POST /api/chat` | ✅ Streaming chat + relationship pipeline |
| `GET /api/chat/messages` | ✅ Paginated history |
| `/api/auth/[...all]` | ✅ better-auth handler |

---

## LLM providers

Configured in `src/lib/ai/model.ts` via `AI_CHAT_PROVIDER`:

| Provider | Env key | Default model |
|----------|---------|---------------|
| `together` (default) | `TOGETHER_API_KEY` | `Qwen/Qwen3.5-9B` |
| `google` | `GOOGLE_GENERATIVE_AI_API_KEY` | `google/gemini-2.5-flash` |
| `gateway` | `AI_GATEWAY_API_KEY` | `google/gemini-2.5-flash` |

Override model with `AI_CHAT_MODEL`.

---

## Known gaps & tech debt

1. **Relationship state is ephemeral** — health resets to ~70 + in-context heuristics each request; long-term relationship arc cannot work until profile is persisted.
2. **Health double-counting risk** — latest message analyzed by LLM sentiment AND prior messages scanned by regex heuristics; `skipLastUserMessage` mitigates but architecture is interim.
3. **`AGENT.md` "Not in scope" section is outdated** — chat UI and relationship engine are built; Socket.IO and cron are still not.
4. **Breakup system is prompt-only** — mood `broken` and `<noreply/>` exist but no state machine drives breakup/recovery.
5. **No tests** — no test suite in repo yet.

---

## Suggested next milestones

Priority order for meaningful progress toward the full vision:

1. **Persist relationship profile** — new `relationship_profile` table; load/save on each chat request.
2. **Inactivity tracking** — `lastActiveAt` + gap-based health penalties + unprompted messages (cron or edge function).
3. **Breakup state machine** — transition `relationshipStatus`, lock UI, cooldown, reconciliation flow.
4. **Mood-aware UI** — subtle styling from streamed metadata.
5. **Update AGENT.md** — align "Tech stack" and scope sections with reality.

---

## Doc map

| File | Role |
|------|------|
| `AGENTS.md` | Coding agent instructions (OpenCode / Cursor) |
| `PROGRESS.md` | This file — implementation truth |
| `AGENT.md` | AI girlfriend behavioral specification |
| `PLAN.md` | Product vision and feature tiers |
