import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

export type UserProfileRecord = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  description: string | null;
  dateOfBirth: string | null;
  mbti: string | null;
  zodiacSign: string | null;
};

export async function getUserProfileById(
  userId: string,
): Promise<UserProfileRecord | null> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      description: user.description,
      dateOfBirth: user.dateOfBirth,
      mbti: user.mbti,
      zodiacSign: user.zodiacSign,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    dateOfBirth: row.dateOfBirth ?? null,
  };
}
