"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  USER_PROFILE_FIELDS,
  validateUserProfileField,
  type UserProfileActionState,
  type UserProfileField,
} from "@/lib/user-profile-schema";

function isUserProfileField(value: string): value is UserProfileField {
  return USER_PROFILE_FIELDS.includes(value as UserProfileField);
}

export async function updateUserProfileField(
  _prev: UserProfileActionState,
  formData: FormData,
): Promise<UserProfileActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "You need to sign in first." };
  }

  const field = formData.get("field");
  const value = formData.get("value");

  if (typeof field !== "string" || !isUserProfileField(field)) {
    return { error: "Invalid field." };
  }

  if (typeof value !== "string") {
    return { error: "Invalid value." };
  }

  const validated = validateUserProfileField(field, value);
  if (!validated.ok) {
    return { fieldError: validated.fieldError };
  }

  try {
    await db
      .update(user)
      .set({
        [field]: validated.value,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));
  } catch {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/account");
  revalidatePath("/chat", "layout");

  return { success: true };
}
