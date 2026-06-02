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
    memorizedDetails: { ...profile.memorizedDetails },
    patternNotes: [...profile.patternNotes],
  };

  if (sentiment.mentionedDetail) {
    const key = `detail_${Object.keys(next.memorizedDetails).length + 1}`;
    next.memorizedDetails[key] = sentiment.mentionedDetail;
  }

  if (sentiment.jealousyNote) {
    next.patternNotes.push(`Jealousy: ${sentiment.jealousyNote}`);
    next.patternNotes = next.patternNotes.slice(-5);
  }

  return next;
}
