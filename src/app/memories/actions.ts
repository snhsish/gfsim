"use server";

import { revalidatePath } from "next/cache";

import { getServerSession } from "@/lib/auth-session";
import { deleteMemoryForUser } from "@/lib/relationship/memories";

export type DeleteMemoryActionState = {
  error?: string;
  success?: boolean;
};

export async function deleteMemory(
  _prev: DeleteMemoryActionState,
  formData: FormData,
): Promise<DeleteMemoryActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You need to sign in first." };
  }

  const memoryId = formData.get("memoryId");
  if (typeof memoryId !== "string" || !memoryId.trim()) {
    return { error: "Invalid memory." };
  }

  const deleted = await deleteMemoryForUser(session.user.id, memoryId);
  if (!deleted) {
    return { error: "Memory not found." };
  }

  revalidatePath("/memories");

  return { success: true };
}
