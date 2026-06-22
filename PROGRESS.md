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
| Relationship health score (0–100) | ✅ Done | Persisted to `relationship_profile` table, loaded/saved each request |
| Sentiment analysis (LLM) | ✅ Done | `src/lib/relationship/sentiment.ts` — tone, health delta, jealousy, details |
| Regex health heuristics | 🟡 Deprecated | Superseded by persisted health; `history.ts` still exists but unused |
| Mood state resolution | ✅ Done | `mood.ts` — 7 states from health + cycle + status |
| Monthly cycle (days 22–28) | ✅ Done | Based on `gf_profile.createdAt`; affects mood + prompt |
| Dynamic system prompt | ✅ Done | `src/lib/ai/system-prompt.ts` — health, mood, memories, patterns + gap hours |
| Pattern notes (jealousy etc.) | ✅ Done | Persisted in `patternNotes` array on `relationship_profile` table |
| Response tone mirroring | ✅ Done | Via mood guidance in system prompt |
| Relationship metadata in stream | ✅ Done | Health, mood, cycle sent as message metadata |
| Persisted relationship profile | ✅ Done | `relationship_profile` table; `getOrCreateProfile`/`saveProfile` in `profile-db.ts` |
| Inactivity / abandonment tracking | ✅ Done | Gap-based health decay (-1 at 6h, -3 at 12h, -5 at 24h+); `lastActiveAt` tracked |
| Unprompted check-in messages | ✅ Done | `GET /api/cron/inactivity` — 6h/12h/24h templates; requires CRON_SECRET + external cron |
| Mood-aware UI styling | ✅ Done | Bubble colors, typing indicator, avatar badge, header status — all mood-reactive |

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
| Cron / background jobs | ✅ Done | Inactivity check-in endpoint at `GET /api/cron/inactivity` |
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

1. **Breakup system is prompt-only** — mood `broken` and `<noreply/>` exist but no state machine drives breakup/recovery.
2. **`AGENT.md` "Not in scope" section is outdated** — chat UI and relationship engine are built; Socket.IO is still not.
3. **No tests** — no test suite in repo yet.
4. **Health double-counting risk (legacy)** — `history.ts` heuristics still exist but are no longer called. Remove in a future cleanup pass.

---

## Suggested next milestones

Priority order for meaningful progress toward the full vision:

1. **Breakup state machine** — transition `relationshipStatus` to `broken_up`, lock UI with desaturated styling, cooldown period, reconciliation flow.
2. **Conflict tracking** — populate `lastConflictSummary` from sentiment analysis when tone is rude/dismissive.
3. **Photo upload** — wire up the existing file picker to actually send photos in the chat API request.
4. **Update AGENT.md** — align "Tech stack" and scope sections with reality.

---

## Doc map

| File | Role |
|------|------|
| `AGENTS.md` | Coding agent instructions (OpenCode / Cursor) |
| `PROGRESS.md` | This file — implementation truth |
| `AGENT.md` | AI girlfriend behavioral specification |
| `PLAN.md` | Product vision and feature tiers |
