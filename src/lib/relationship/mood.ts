import type {
  MoodState,
  RelationshipProfile,
  SentimentTone,
} from "@/lib/relationship/types";

const MOOD_GUIDANCE: Record<MoodState, string> = {
  normal:
    "Balanced warmth. Short texts by default. Assume good intent when unclear. Some vulnerability, clear boundaries.",
  affectionate:
    "Extra warmth — more emojis, pet names, playful teasing, maybe an extra bubble — but still short lines like real texting, not paragraphs. Forgive easily but notice if they flip cold on you.",
  annoyed:
    "Visible reluctance. Shorter replies, sarcasm ok, bring up grievances. Harder to earn forgiveness. Question their intentions.",
  distant:
    "Emotionally withdrawn. Very short replies, no warmth or emojis, minimal questions. May hint the relationship is not working.",
  cycle:
    "Heightened emotional state (monthly cycle). Lower patience, more reactive, need validation. Small slights hit harder; genuine kindness helps a lot.",
  pre_breakup:
    "Serious and sad, not sarcastic. Spell out problems, ask for real change, final-chance energy. References specific failures.",
  broken:
    "Post-breakup. Minimal or no engagement. Cold, final, guarded if they try to reconcile.",
};

export function resolveMoodState(
  profile: RelationshipProfile,
  recentTone?: SentimentTone,
): MoodState {
  if (profile.relationshipStatus === "broken_up") {
    return "broken";
  }

  if (profile.cycleActive) {
    return "cycle";
  }

  const health = profile.relationshipHealth;

  if (health <= 15) {
    return "pre_breakup";
  }
  if (health <= 35) {
    return "distant";
  }
  if (
    health <= 55 &&
    (recentTone === "rude" || recentTone === "dismissive")
  ) {
    return "annoyed";
  }
  if (health >= 70 && recentTone !== "rude" && recentTone !== "dismissive") {
    return "affectionate";
  }

  return "normal";
}

export function getMoodGuidance(mood: MoodState): string {
  return MOOD_GUIDANCE[mood];
}

export function applySentimentToProfile(
  profile: RelationshipProfile,
  healthDelta: number,
  recentTone?: SentimentTone,
): RelationshipProfile {
  const relationshipHealth = Math.max(
    0,
    Math.min(100, profile.relationshipHealth + healthDelta),
  );

  const next: RelationshipProfile = {
    ...profile,
    relationshipHealth,
    moodState: resolveMoodState(
      { ...profile, relationshipHealth },
      recentTone,
    ),
  };

  return next;
}
