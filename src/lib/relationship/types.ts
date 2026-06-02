export const MOOD_STATES = [
  "normal",
  "affectionate",
  "annoyed",
  "distant",
  "cycle",
  "pre_breakup",
  "broken",
] as const;

export type MoodState = (typeof MOOD_STATES)[number];

export const RELATIONSHIP_STATUSES = [
  "active",
  "broken_up",
  "reconciling",
] as const;

export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];

export const SENTIMENT_TONES = [
  "affectionate",
  "positive",
  "neutral",
  "dismissive",
  "rude",
] as const;

export type SentimentTone = (typeof SENTIMENT_TONES)[number];

export type MessageSentiment = {
  tone: SentimentTone;
  healthDelta: number;
  engagement: "high" | "medium" | "low";
  mentionedDetail: string | null;
  jealousyNote: string | null;
};

export type RelationshipProfile = {
  relationshipHealth: number;
  moodState: MoodState;
  relationshipStatus: RelationshipStatus;
  cycleDay: number;
  cycleActive: boolean;
  memorizedDetails: Record<string, string>;
  patternNotes: string[];
  lastConflictSummary: string | null;
};
