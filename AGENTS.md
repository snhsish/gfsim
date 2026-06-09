# gfsim — Agent Guide

Relationship dynamics simulator: a Next.js chat app where an AI girlfriend remembers how you treat her and adjusts mood, tone, and engagement accordingly.

**Before changing behavior or architecture, read [PROGRESS.md](./PROGRESS.md) for what is implemented vs planned.** Do not assume features from [AGENT.md](./AGENT.md) or [PLAN.md](./PLAN.md) exist unless you verify them in `src/`.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | better-auth — Google OAuth only |
| AI | Vercel AI SDK — streaming chat, structured sentiment |
| UI | shadcn/ui + Tailwind CSS 4 |
| Package manager | pnpm |

**Not implemented:** Socket.IO, cron/inactivity jobs, persisted relationship profile table.

---

## Commands

```bash
pnpm dev              # local dev server
pnpm build            # production build
pnpm lint             # eslint
pnpm db:generate      # drizzle migrations from schema
pnpm db:push          # push schema to DB
pnpm db:studio        # drizzle studio
```

Copy `.env.example` → `.env.local`. Required: `DATABASE_URL`, `BETTER_AUTH_*`, `GOOGLE_CLIENT_*`, and an LLM key (`TOGETHER_API_KEY` by default).

---

## Project layout

```
src/
  app/                    # routes & API
    api/chat/route.ts     # chat pipeline (start here)
    api/chat/messages/    # message history pagination
    api/auth/[...all]/    # better-auth handler
    chat/                 # main chat UI
    memories/             # user memory list
    onboarding/           # gf profile setup
    login/                # Google sign-in
    account/              # user profile & usage stats
  components/             # React UI (chat-shell, chat-view, memories, etc.)
  db/
    schema.ts             # source of truth for persisted tables
    index.ts              # drizzle client
  lib/
    ai/                   # model config, system prompt, message helpers
    relationship/         # mood, sentiment, health, memories
    chat/                 # persistence, limits, reactions, parsing
    auth*.ts              # better-auth client/server
    gf-profile*.ts        # girlfriend profile CRUD
  proxy.ts                # auth route protection (Next middleware)
drizzle/                  # SQL migrations
```

Path alias: `@/` → `src/`.

---

## Chat message pipeline

Each `POST /api/chat` request:

1. Auth session + `gf_profile` required (onboarding gate).
2. Daily message limit check (20/day).
3. Persist latest user message to `chat_message`.
4. Build ephemeral `RelationshipProfile` from defaults + in-context heuristics.
5. Load persisted memories from `memory` table.
6. Analyze latest user message sentiment (LLM structured output).
7. Update health/mood; auto-save new personal details as memories.
8. Build dynamic system prompt → stream model reply.
9. Persist assistant message; attach relationship metadata to stream.

**Key files:** `src/app/api/chat/route.ts`, `src/lib/relationship/*`, `src/lib/ai/system-prompt.ts`.

---

## Data model (persisted)

See `src/db/schema.ts`. Tables:

- `user`, `session`, `account`, `verification` — better-auth
- `gf_profile` — girlfriend persona (name, DOB, MBTI, zodiac, maturity tier, etc.)
- `chat_message` — conversation history (`role`, `content`)
- `memory` — free-text facts the AI should remember
- `chat_usage` — token usage per request

**Ephemeral per request (not in DB):** `relationshipHealth`, `moodState`, `patternNotes`, `lastConflictSummary`. Health is partly reconstructed from recent in-context messages via regex heuristics in `src/lib/relationship/history.ts`.

---

## Relationship engine

Types and mood logic: `src/lib/relationship/types.ts`, `mood.ts`.

Mood states: `normal`, `affectionate`, `annoyed`, `distant`, `cycle`, `pre_breakup`, `broken`.

- Cycle: 28-day calendar from `gf_profile.createdAt`; days 22–28 are `cycleActive`.
- Sentiment: LLM extraction in `sentiment.ts` (tone, health delta, jealousy, personal details).
- Jealousy notes go into ephemeral `patternNotes` (last 5), not a separate table.

`relationshipStatus` (`active` | `broken_up` | `reconciling`) exists in types/prompt but **nothing in code transitions to `broken_up` yet**.

---

## AI response format

The model is instructed to reply with `<msg>...</msg>` bubbles (and optionally `<noreply/>`, reaction tags). Client parsing: `src/lib/chat/girlfriend-response.ts`. Bubble reveal animation: `src/hooks/use-girlfriend-bubble-reveal.ts`.

---

## Coding conventions

- Use existing patterns in neighboring files; minimal diffs.
- Zod for API/env validation (`src/lib/env.ts`, schemas in `*-schema.ts` files).
- Server actions live next to pages (`actions.ts`); API routes for streaming chat.
- shadcn components in `src/components/ui/` — match existing Tailwind/shadcn style.
- Do not add Socket.IO, new auth providers, or email signup unless explicitly requested.
- Run `pnpm lint` after substantive changes.

---

## Domain docs (reference only)

| File | Purpose |
|------|---------|
| [PROGRESS.md](./PROGRESS.md) | **Implementation status** — trust this over other docs |
| [AGENT.md](./AGENT.md) | Full behavioral spec (moods, breakup arc, jealousy, inactivity) |
| [PLAN.md](./PLAN.md) | Product vision, tiers, aspirational architecture |
| [README.md](./README.md) | Marketing blurb only |

When `AGENT.md` / `PLAN.md` conflict with `src/`, **`src/` wins**.

---

## Common pitfalls (avoid hallucinating)

1. **No Socket.IO** — chat uses HTTP streaming via Vercel AI SDK, not WebSockets.
2. **No persisted relationship profile** — health/mood reset toward defaults each request; only memories and message history persist.
3. **No inactivity cron** — unprompted check-in messages are not implemented.
4. **No breakup UI lock** — `broken` mood is prompt-only; chat input is never disabled.
5. **No mood-aware UI styling** — metadata is streamed but components don't style by mood yet.
6. **`AGENT.md` is stale** — its "Not in scope yet" section predates chat UI and relationship engine; see PROGRESS.md instead.
