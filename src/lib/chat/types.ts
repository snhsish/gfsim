import type { MoodState, RelationshipStatus } from "@/lib/relationship/types";

/** Streamed on assistant messages for mood-aware UI (optional on the client). */
export type GirlfriendChatMetadata = {
  relationshipHealth: number;
  moodState: MoodState;
  relationshipStatus: RelationshipStatus;
  cycleDay: number;
  cycleActive: boolean;
};
