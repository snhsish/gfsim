import type { RelationshipProfile } from "@/lib/relationship/types";
import { applySentimentToProfile } from "@/lib/relationship/mood";

export function getInactivityHours(
  lastActiveAt: Date,
  now: Date = new Date(),
): number {
  const ms = now.getTime() - lastActiveAt.getTime();
  return ms / (1000 * 60 * 60);
}

const INACTIVITY_DECAY_THRESHOLDS = [
  { minHours: 24, decay: -5 },
  { minHours: 12, decay: -3 },
  { minHours: 6, decay: -1 },
] as const;

export function applyInactivityDecay(
  profile: RelationshipProfile,
  gapHours: number,
): RelationshipProfile {
  const threshold = INACTIVITY_DECAY_THRESHOLDS.find(
    (t) => gapHours >= t.minHours,
  );
  if (!threshold) return profile;
  return applySentimentToProfile(profile, threshold.decay);
}
