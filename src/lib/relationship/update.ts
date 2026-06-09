import type {
  MessageSentiment,
  RelationshipProfile,
} from "@/lib/relationship/types";

export function enrichProfileFromSentiment(
  profile: RelationshipProfile,
  sentiment: MessageSentiment,
): RelationshipProfile {
  const next: RelationshipProfile = {
    ...profile,
    patternNotes: [...profile.patternNotes],
  };

  if (sentiment.jealousyNote) {
    next.patternNotes.push(`Jealousy: ${sentiment.jealousyNote}`);
    next.patternNotes = next.patternNotes.slice(-5);
  }

  return next;
}
