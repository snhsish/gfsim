import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { memory } from "@/db/schema";

export type MemoryRow = typeof memory.$inferSelect;

function normalizeMemoryContent(content: string): string {
  return content.trim().replace(/\s+/g, " ");
}

export function memoriesToRecord(rows: MemoryRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.id, row.content]));
}

export async function getMemoriesForUser(userId: string): Promise<MemoryRow[]> {
  return db
    .select()
    .from(memory)
    .where(eq(memory.userId, userId))
    .orderBy(desc(memory.createdAt));
}

export async function loadMemorizedDetails(
  userId: string,
): Promise<Record<string, string>> {
  const rows = await getMemoriesForUser(userId);
  return memoriesToRecord(rows);
}

export async function saveMemoryIfNew(
  userId: string,
  content: string,
): Promise<MemoryRow | null> {
  const normalized = normalizeMemoryContent(content);
  if (!normalized) return null;

  const existing = await db
    .select({ content: memory.content })
    .from(memory)
    .where(eq(memory.userId, userId));

  const normalizedLower = normalized.toLowerCase();
  const isDuplicate = existing.some(
    (row) => normalizeMemoryContent(row.content).toLowerCase() === normalizedLower,
  );
  if (isDuplicate) return null;

  const [saved] = await db
    .insert(memory)
    .values({
      id: crypto.randomUUID(),
      userId,
      content: normalized,
      createdAt: new Date(),
    })
    .returning();

  return saved ?? null;
}

export async function deleteMemoryForUser(
  userId: string,
  memoryId: string,
): Promise<boolean> {
  const [deleted] = await db
    .delete(memory)
    .where(and(eq(memory.id, memoryId), eq(memory.userId, userId)))
    .returning({ id: memory.id });

  return Boolean(deleted);
}
