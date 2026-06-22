import { eq } from "drizzle-orm";

import { db } from "@/db";
import { relationshipProfile } from "@/db/schema";
import { createDefaultRelationshipProfile } from "@/lib/relationship/defaults";
import type { RelationshipStatus } from "@/lib/relationship/types";

export type PersistedProfile = {
  id: string;
  userId: string;
  relationshipHealth: number;
  relationshipStatus: string;
  lastActiveAt: Date;
  patternNotes: string[];
  lastConflictSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toRelationshipProfile(
  row: PersistedProfile,
  gfProfileCreatedAt: Date,
  now?: Date,
) {
  const base = createDefaultRelationshipProfile(gfProfileCreatedAt, now);
  return {
    ...base,
    relationshipHealth: row.relationshipHealth,
    relationshipStatus: row.relationshipStatus as RelationshipStatus,
    patternNotes: row.patternNotes,
    lastConflictSummary: row.lastConflictSummary,
  };
}

export async function getOrCreateProfile(
  userId: string,
  gfProfileCreatedAt: Date,
): Promise<
  ReturnType<typeof toRelationshipProfile> & { lastActiveAt: Date }
> {
  const existing = await db
    .select()
    .from(relationshipProfile)
    .where(eq(relationshipProfile.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    const row = existing[0];
    const profile = toRelationshipProfile(row, gfProfileCreatedAt);
    return { ...profile, lastActiveAt: row.lastActiveAt };
  }

  const now = new Date();
  const base = createDefaultRelationshipProfile(gfProfileCreatedAt, now);

  const row = {
    id: crypto.randomUUID(),
    userId,
    relationshipHealth: base.relationshipHealth,
    relationshipStatus: base.relationshipStatus,
    lastActiveAt: now,
    patternNotes: base.patternNotes,
    lastConflictSummary: base.lastConflictSummary,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(relationshipProfile).values(row);

  return {
    ...base,
    lastActiveAt: now,
  };
}

export async function saveProfile(
  userId: string,
  profile: {
    relationshipHealth: number;
    relationshipStatus: RelationshipStatus;
    patternNotes: string[];
    lastConflictSummary: string | null;
    lastActiveAt: Date;
  },
): Promise<void> {
  await db
    .update(relationshipProfile)
    .set({
      relationshipHealth: profile.relationshipHealth,
      relationshipStatus: profile.relationshipStatus,
      patternNotes: profile.patternNotes,
      lastConflictSummary: profile.lastConflictSummary,
      lastActiveAt: profile.lastActiveAt,
      updatedAt: new Date(),
    })
    .where(eq(relationshipProfile.userId, userId));
}


