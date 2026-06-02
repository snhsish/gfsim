import type { RelationshipProfile } from "@/lib/relationship/types";

const CYCLE_LENGTH_DAYS = 28;
const CYCLE_WINDOW_DAYS = 7;

export function getCycleDay(cycleStart: Date, now = new Date()): number {
  const msPerDay = 86_400_000;
  const daysSinceStart = Math.floor(
    (now.getTime() - cycleStart.getTime()) / msPerDay,
  );
  return (daysSinceStart % CYCLE_LENGTH_DAYS) + 1;
}

export function isCycleActive(cycleDay: number): boolean {
  return cycleDay >= 22;
}

export function createDefaultRelationshipProfile(
  cycleStart: Date,
  now = new Date(),
): RelationshipProfile {
  const cycleDay = getCycleDay(cycleStart, now);

  return {
    relationshipHealth: 70,
    moodState: "normal",
    relationshipStatus: "active",
    cycleDay,
    cycleActive: isCycleActive(cycleDay),
    memorizedDetails: {},
    patternNotes: [],
    lastConflictSummary: null,
  };
}
