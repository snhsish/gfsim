"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { gfProfile } from "@/db/schema";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import {
  buildGfProfileValues,
  parseGfProfileFormData,
  validateGfProfileFormData,
  type GfProfileActionState,
} from "@/lib/gf-profile-persist";
import { auth } from "@/lib/auth";

export async function updateGfProfile(
  _prev: GfProfileActionState,
  formData: FormData,
): Promise<GfProfileActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "You need to sign in first." };
  }

  const existing = await getGfProfileByUserId(session.user.id);
  if (!existing) {
    redirect("/onboarding");
  }

  const raw = parseGfProfileFormData(formData);
  const validated = validateGfProfileFormData(raw);
  if (!validated.ok) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: validated.fieldErrors,
    };
  }

  const values = buildGfProfileValues(validated.data);

  try {
    await db
      .update(gfProfile)
      .set(values)
      .where(eq(gfProfile.userId, session.user.id));
  } catch {
    return { error: "Could not save changes. Please try again." };
  }

  return { success: true };
}
