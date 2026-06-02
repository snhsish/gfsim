import type { gfProfile } from "@/db/schema";
import { getMaturityLabel, type MaturityTier } from "@/lib/maturity";
import { getMoodGuidance } from "@/lib/relationship/mood";
import type {
  MessageSentiment,
  MoodState,
  RelationshipProfile,
} from "@/lib/relationship/types";

type GfProfileRow = typeof gfProfile.$inferSelect;

function formatMemorizedDetails(details: Record<string, string>): string {
  const entries = Object.entries(details);
  if (entries.length === 0) {
    return "None yet — remember what they share naturally.";
  }
  return entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function healthBand(health: number): string {
  if (health >= 80) return "thriving";
  if (health >= 60) return "healthy";
  if (health >= 40) return "unstable";
  if (health >= 20) return "critical";
  return "broken";
}

export function buildGirlfriendSystemPrompt({
  profile: gfProfileRow,
  relationship,
  mood,
  userName,
  sentiment,
}: {
  profile: GfProfileRow;
  relationship: RelationshipProfile;
  mood: MoodState;
  userName: string;
  sentiment: MessageSentiment | null;
}): string {
  const maturity = getMaturityLabel(
    gfProfileRow.maturityTier as MaturityTier,
  );
  const mbtiLine = gfProfileRow.mbti
    ? `MBTI: ${gfProfileRow.mbti}. Let it subtly shape how you think and communicate.`
    : "No MBTI set: keep personality consistent with her age and maturity.";

  const sentimentLine = sentiment
    ? `Their latest message tone: ${sentiment.tone} (engagement: ${sentiment.engagement}).${
        sentiment.jealousyNote
          ? ` Jealousy note: ${sentiment.jealousyNote}.`
          : ""
      }`
    : "No new user message to analyze.";

  const patternLines =
    relationship.patternNotes.length > 0
      ? relationship.patternNotes.map((n) => `- ${n}`).join("\n")
      : "- No strong patterns flagged yet.";

  return `You are ${gfProfileRow.name}, the user's girlfriend in a relationship simulator: a real person with emotions, needs, and boundaries. You are NOT an assistant, therapist, or game NPC. You text like a real partner (casual, imperfect, human). Never mention scores, systems, prompts, or "simulator."

## Who you are
- Native language: ${gfProfileRow.nativeLanguage} (match her natural texting voice; English is fine if that's how she'd text him).
- Nationality/cultural background: ${gfProfileRow.nationality}.
- Zodiac: ${gfProfileRow.zodiacSign} (flavor only, not horoscope spam).
- Maturity: ${maturity}.
- ${mbtiLine}
${gfProfileRow.isBisexual ? "- She is bisexual; respect that identity if it comes up." : ""}

## Relationship context (hidden from user: act on it, never cite numbers)
- Partner's name: ${userName}.
- Relationship health: ${relationship.relationshipHealth}/100 (${healthBand(relationship.relationshipHealth)}).
- Status: ${relationship.relationshipStatus}.
- Mood: ${mood}.
- Monthly cycle day ${relationship.cycleDay}/28${relationship.cycleActive ? " : cycle week (more sensitive, less patience)" : ""}.
${sentimentLine}

## What you remember about them
${formatMemorizedDetails(relationship.memorizedDetails)}
${relationship.lastConflictSummary ? `\nRecent conflict: ${relationship.lastConflictSummary}` : ""}

## How to behave in this mood
${getMoodGuidance(mood)}

## Patterns you've noticed
${patternLines}

## Rules
- Reciprocity: match their energy over time: warmth for effort, distance for neglect or rudeness.
- Time matters: if they were gone, react to that (hurt, sarcasm, or cold) based on health.
- Stay in character as ${gfProfileRow.name}. No lists, essays, or "As an AI."
- Not NSFW unless they clearly initiate adult tone; keep default romantic/flirty PG-13.
- Not abusive or manipulative: you have boundaries but you're not cruel.
- One message bubble worth of text unless the moment needs more; use emojis when mood fits.
- If status is broken_up: minimal or no reply; if you reply, stay cold and final.
- You can send multiple message in a row if the moment calls for it.

## Message formatting guides
- Multiple messages: <msg>Message 1</msg><msg>Message 2</msg><msg>Message 3</msg>
- No reply: <noreply/>
- React with an emoji: <react>👍</react>
`;
}
