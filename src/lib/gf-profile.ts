import { eq } from "drizzle-orm";

import { db } from "@/db";
import { gfProfile } from "@/db/schema";

export async function getGfProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(gfProfile)
    .where(eq(gfProfile.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await getGfProfileByUserId(userId);
  return profile !== null;
}
