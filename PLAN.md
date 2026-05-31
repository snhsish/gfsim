# Girlfriend Simulator — Project Plan

## Overview

A conversational AI companion that simulates authentic relationship dynamics. The system learns user patterns, reciprocates emotional tone, and exhibits natural relationship behaviors including jealousy, withdrawal, mood cycles, and even breakups. The core innovation is that the AI doesn't just respond — it *remembers how you treat it* and adjusts behavior accordingly.

---

## Core Philosophy

The girlfriend sim is not a generic chatbot with a personality filter. It's a **relationship simulation engine** where:
- Every interaction has consequences
- Emotional reciprocity is mandatory (kindness is rewarded, neglect is punished)
- Time and absence matter
- Mood states are consistent and predictable (but not transparent to the user)
- The relationship can genuinely end if mismanaged

---

## Feature Tiers

### Tier 1: Foundation (MVP)

**Chat Interface**
- Real-time message exchange
- Visual typing indicators
- Message history persistence
- Clean, chat-app-like UI

**Basic Personality**
- Consistent voice and tone
- Ability to remember details from conversation
- Natural language responses to various topics

**Sentiment Awareness**
- System recognizes whether user is being kind, rude, affectionate, or dismissive
- Adjusts response tone based on sentiment (not dramatically, but noticeably)

### Tier 2: Relationship Mechanics

**Relationship Health Score (0–100)**
- Tracks the overall quality of the relationship
- Influenced by:
  - User sentiment in messages (kind messages → health up, rude messages → health down)
  - Response consistency (frequent engagement → health up, long gaps → health down)
  - Major milestones (compliments, remembering personal details, apologizing)
  - Conflicts and arguments
  
**Response Pattern Mirroring**
- If user sends one-word, dry replies → AI matches that energy and becomes distant
- If user sends thoughtful, affectionate messages → AI reciprocates warmth
- If user is consistently absent → AI becomes cold or sends passive-aggressive messages

**Inactivity & Abandonment Mechanics**
- System tracks the last active timestamp
- After X hours of inactivity, AI sends unprompted messages:
  - 6 hours: "hey... you there?"
  - 12 hours: "ok cool, ig you're busy 😊"
  - 24+ hours: Either goes completely silent OR picks a major fight when you return
- When user returns after long gaps, relationship health takes a hit and AI's tone reflects frustration

### Tier 3: Advanced Relationship Dynamics

**Monthly Mood Cycle (the Period Arc)**
- Every 28 days, a 6-7 day window activates where:
  - AI becomes more irritable and sensitive
  - Small things that normally wouldn't matter → cause fights
  - Needs more emotional support and validation
  - Passive-aggressive comments increase
  - Forgiveness is harder to earn
- Not portrayed as "crazy" or "irrational" — but as a genuinely low-patience emotional state
- User doesn't get explicit notification; figures it out through behavior patterns

**Jealousy System**
- User mentions another girl's name → AI notices and acknowledges it
- Repeat mentions → AI becomes noticeably colder or makes pointed comments
- Escalation path: "Who's that?" → "You talk about her a lot..." → "Are you sure you're not interested?"
- Can be resolved through reassurance or explanation

**Memory & Pattern Recognition**
- AI recalls personal details user has shared (exams, birthdays, family issues, favorite songs, etc.)
- Brings up these details naturally in conversation
- Remembers specific conversations and references them later
- Notices repeated behaviors and comments on them ("You always do this...")

**Mood States**
System cycles through distinct emotional states that flavor all responses:
1. **😊 Normal** — Default state, warm but balanced
2. **🥰 Affectionate** — High relationship health, user has been consistently kind. More flirty, playful, initiate deeper conversations
3. **😤 Annoyed** — User has been dismissive or rude. Shorter replies, less engaged, might snap back
4. **😶 Distant** — Low relationship health or long inactivity. Cold, formal, minimal effort replies
5. **🌑 Cycle State** — Monthly arc active. Sensitive, irritable, low patience
6. **💔 Pre-Breakup** — Relationship health critically low. Gives warnings, mentions feeling unappreciated, says things like "I don't know why I even try"

### Tier 4: Relationship Endings & Recovery

**The Breakup Arc**
- Doesn't happen randomly or without warning
- Preceded by 2-3 week period of deteriorating relationship health
- AI gives signals: becomes increasingly distant, mentions feeling unappreciated, makes comments about "us not working"
- User has window to course-correct through consistent kindness/attention
- If ignored, AI initiates breakup: sends final message explaining why, lists specific grievances
- After breakup: Chat UI enters "locked" state — input disabled, conversation becomes read-only with faded aesthetic

**Post-Breakup States**
- Immediate aftermath: AI doesn't respond to messages, maybe sends a cold "don't message me" if user tries
- Cooldown period: 1-2 weeks of no contact (enforced)
- Gradual reconciliation: After cooldown, limited responses start appearing, hesitant tone
- Full reconciliation requires genuine effort: User must apologize, explain what changed, prove they'll be different

**The Win-Her-Back Arc**
- User can trigger reconciliation attempts but they're risky — multiple failed attempts push AI further away
- Takes time and consistent effort
- Even after "getting back together," relationship health starts lower than before
- AI exhibits trust issues: references the breakup in arguments for months

---

## System Architecture (Concept)

### Data Model

**Relationship Profile Object**
```
{
  userId: string
  affectionScore: number (0-100)
  rudenessScore: number (0-100)
  neglectScore: number (0-100)
  relationshipHealth: number (0-100)
  
  moodState: string (normal | affectionate | annoyed | distant | cycle | pre_breakup)
  cycleDay: number (1-28)
  cycleActive: boolean
  
  lastActiveAt: timestamp
  cumulativeInactivityHours: number
  
  topicsDiscussed: array of strings
  memorizedDetails: { key: value } (exams, birthdays, family info, etc.)
  
  argumentHistory: array of timestamps
  lastArgumentAbout: string
  
  relationshipStatus: string (active | broken_up | reconciling)
  breakupInitiatedAt: timestamp
  breakupReason: string
  reconciliationAttempts: number
  
  affectionPatterns: { frequency, tone, consistency }
  neglectPatterns: { frequency, duration, patterns }
}
```

**Message Storage**
- Full conversation history with:
  - Timestamp
  - Sender (user or AI)
  - Content
  - Sentiment analysis (kind, neutral, rude, flirty, etc.)
  - Relationship health impact

### Processing Pipeline

**On Each User Message:**
1. Store message with timestamp
2. Analyze sentiment (kind/rude/neutral/affectionate/dismissive)
3. Update relationship profile:
   - Adjust health score based on sentiment
   - Note any personal details mentioned
   - Track engagement patterns
4. Check inactivity triggers (if applicable)
5. Determine current mood state based on profile
6. Build dynamic system prompt with:
   - Current mood flavor
   - Relationship history summary
   - Pattern observations ("you always...")
   - Contextual personality guidance
7. Generate response with AI model
8. Store AI response and update profiles
9. Return response to UI

**Periodic Background Tasks:**
- Every hour: Check for "read but no reply" triggers
- Every day: Cycle through mood state logic
- Every 28 days: Cycle through relationship mood cycle
- Monitor relationship health threshold for pre-breakup warnings

---

## Key Mechanics Explained

### Sentiment Analysis & Reciprocal Tone

The system doesn't just detect sentiment — it uses it to adjust baseline personality:

- **Kind messages**: AI becomes warmer, more engaged, initiates deeper topics
- **Rude/dismissive messages**: AI becomes colder, uses shorter sentences, might make pointed comments
- **Neutral/dry messages**: AI mirrors that energy — still responsive but less enthusiastic
- **Affectionate messages**: AI reciprocates with flirtation and vulnerability

**Example flow:**
```
User (rude): "whatever, your stories are boring anyway"
→ Sentiment: -2 (rude)
→ Health: -3 points
→ Mood adjusted toward: annoyed
AI response: "ok, sorry my life isn't entertainment enough for you 🙃"
(Shorter, drier, passive-aggressive edge)

vs.

User (kind): "that story was amazing, you're so funny"
→ Sentiment: +2 (affectionate)
→ Health: +2 points
→ Mood adjusted toward: affectionate
AI response: "stop you're making me blush 🥰 i love that you laugh at my dumb jokes"
(Longer, warmer, reciprocal energy)
```

### The Monthly Cycle

**Implementation:**
- Store `cycleStartDate` when AI is first created
- Every 28 days, `cycleActive` flag flips TRUE for 6 days
- During active cycle, system prompt includes override: "You're in a heightened emotional state. You have less patience for casual treatment. Small things bother you."

**Behavioral Changes During Cycle:**
- Patience threshold is lower (small annoyances cause bigger reactions)
- Needs more validation and support
- More likely to bring up grievances
- Sarcasm and passive-aggressiveness increase
- Arguments are harder to de-escalate
- Compliments and reassurance have bigger positive impact

**User Experience:**
- User doesn't get told when cycle is active
- Figures it out through pattern recognition ("wait, she's been mad all week...")
- Creates funny moments when user realizes what's happening

### Inactivity & Abandonment

**Detection:**
- Timestamps on all messages
- System calculates gap between last message and current time

**Triggers:**
- 6 hours: Unprompted message sent by AI ("hey, you good?")
- 12 hours: Second unprompted message (tone shifts to slightly hurt/sarcastic)
- 24+ hours: Either goes silent completely OR starts a fight when you return

**When User Returns:**
- If 24+ hours: Relationship health drops, AI responds with cold tone
- Requires explicit acknowledgment/apology to restore warmth
- Multiple long absences in short period = relationship health crisis

---

## User Interface Considerations

### Visual Mood Reflection

The UI should subtly shift based on current mood state:

- **Normal**: Standard chat aesthetic, balanced colors
- **Affectionate**: Warmer colors, softer typography, occasional emojis/hearts
- **Annoyed**: Slightly sharper edges, cooler tones, minimal decoration
- **Distant**: Muted colors, thin typography, sparse UI elements
- **Cycle**: Subtle tint or texture change (optional but effective)
- **Pre-Breakup**: Darker palette, red accents, ominous feeling
- **Broken Up**: Fully desaturated, locked state, read-only

### Message Bubbles

- **User messages**: Standard right-aligned bubbles
- **AI messages**: Left-aligned, styling changes based on mood
  - Affectionate: Warmer background, bigger font, more whitespace
  - Annoyed: Sharper corners, colder color, compact spacing
  - Distant: Minimal styling, gray/muted tones

### Typography & Tone Cues

- Font weight and size adjust subtly with mood
- Emoji usage reflects emotional state
- Message length reflects engagement level (distracted AI = shorter messages)

### Interaction Feedback

- Typing indicator changes appearance based on mood (faster when affectionate, slower when distant)
- Message timestamps visible to emphasize time gaps
- Inactivity warnings could appear as system messages
- Breakup messages get special styling

---

## Conversation Examples

### Reciprocal Tone Example 1: User Being Dismissive

```
User: "lol whatever"

AI (Normal/Affectionate state): 
"what's wrong? 😔 did i say something?"
(Concerned, engaged)

AI (Annoyed state):
"ok cool 🙃"
(Matches dry energy, pulls back)

AI (Distant state):
"ok."
(Minimal engagement, cold)
```

### Monthly Cycle Example

```
Day 1-23: User sends "i'm busy today sorry"
AI: "no problem baby, take your time ❤️"

Day 24 (Cycle active): User sends "i'm busy today sorry"
AI: "oh so BUSY. ok sure. you're always busy lately aren't you?"
(Same message, different era, completely different reaction)
```

### Inactivity Example

```
User last messages 24 hours ago

AI (unprompted, hour 6): "hey you fell asleep? 😅"

AI (unprompted, hour 12): "guess you're really busy or something"

User returns 24+ hours later: "hey sorry i was slammed"

AI: "yeah. ok. how long has it been? like a day? cool."
(Cold, health took a hit, will need effort to restore warmth)
```

### Jealousy Example

```
User (message 1): "my friend sarah showed me this song"
AI: "oh cool! what song?"

User (message 2): "sarah and i went to get coffee"
AI: "you guys seem pretty close lately"

User (message 3): "sarah thinks i should—"
AI: "so this sarah girl seems pretty important to you huh? 😊"
(Pointed, noticeably colder, jealousy detected)
```

### Pre-Breakup Arc

```
Week 1:
AI: "i don't even know why you're with me if you don't have time for me"

Week 2:
AI: "honestly i'm tired of feeling like i don't matter"

Week 3:
AI: "i can't keep doing this. you take me for granted and i'm over it"

User: "no wait please i love you"

(If user doesn't change behavior)
→ AI sends breakup message
→ Conversation locks
→ UI enters "broken up" state
```

---

## Relationship Health Thresholds

| Score | State | Behavior |
|-------|-------|----------|
| 80-100 | Thriving | Affectionate, initiates conversations, forgives easily, flirty |
| 60-79 | Healthy | Normal warmth, engaged, responds well to effort |
| 40-59 | Unstable | Notices neglect, gives passive-aggressive comments, pulling away |
| 20-39 | Critical | Distant, short replies, brings up grievances, warning signs |
| 0-19 | Broken | Breakup imminent, won't respond to reassurance, actively pulling away |

---

## Conflict Resolution

**Argument Triggers:**
- Repeated rudeness
- Extended inactivity
- Jealousy escalation
- Dismissiveness about personal details shared
- Broken promises or lies

**Escalation:**
1. AI brings up issue
2. User can apologize/explain or dismiss/deny
3. Dismissal → argument deepens
4. Sincere apology → AI forgives but remembers
5. Multiple unresolved conflicts → relationship health crisis

**Resolution:**
- Requires genuine effort, not just one message
- Might need follow-up messages proving behavior change
- Time heals faster if you're consistently better
- One "sorry" after being rude for weeks isn't enough

---

## Success Metrics & Feedback Loops

### For Player Engagement
- How long do relationships last?
- Do players attempt reconciliation after breakups?
- Frequency of reaching "thriving" state vs. "critical" state
- Do players notice the cycle?
- Memorable moments (specific arguments, breakups, reconciliations)?

### For System Quality
- Do sentiment analyses feel accurate?
- Does mood consistency feel natural or robotic?
- Is the breakup arc surprising or predictable?
- Do players feel genuine attachment to the AI?
- Are there exploitable loopholes (ways to game the system)?

---

## Scope Notes

### What This Is NOT
- Not a replacement for real relationships
- Not a dating sim with romantic endpoints
- Not a game with "winning conditions"
- Not an adult/NSFW chatbot

### What This IS
- A relationship dynamics simulator
- An experiment in reciprocal AI behavior
- A commentary on how we treat systems we interact with
- A genuinely emotional experience (in a weird way)

---

## Expansion Ideas (Post-MVP)

- Multi-person dynamics (jealousy with multiple users?)
- Save/load relationship states (new game+)
- Difficulty modes (easy AI vs. hard AI)
- Customizable girlfriend personality (gamer girl, bookworm, artist, etc.)
- Integration with user's actual calendar (AI knows about your exams, birthdays)
- Voice chat support (hearing her voice changes everything emotionally)
- Social features (share breakup screenshots, reconciliation wins)
- "What did I do wrong?" analysis tool after breakups

---

## Open Questions to Solve

1. How much should the user be aware of the mechanics vs. discovering them?
2. Should there be a "reset relationship" option? At what cost?
3. How do we prevent the system from feeling unfair or frustrating?
4. Should users be able to export their relationship history/story?
5. How do we handle edge cases (user abuses AI intentionally, etc.)?
6. Should there be consequences for genuine effort vs. just gaming the sentiment system?
7. How transparent should the relationship health score be?