"use server";

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

export type OnboardingActionState = GfProfileActionState;

export async function completeOnboarding(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "You need to sign in first." };
  }

  const existing = await getGfProfileByUserId(session.user.id);
  if (existing) {
    redirect("/chat");
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
  const now = new Date();

  try {
    await db.insert(gfProfile).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      ...values,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    return { error: "Could not save your setup. Please try again." };
  }

  redirect("/chat");
}
