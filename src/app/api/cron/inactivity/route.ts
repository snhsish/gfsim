import { eq, lt, and, gte } from "drizzle-orm";
import { db } from "@/db";
import { relationshipProfile, chatMessage } from "@/db/schema";
import { saveChatMessage } from "@/lib/chat/persistence";
import { getInactivityHours } from "@/lib/relationship/inactivity";

const CHECK_IN_MESSAGES: Record<number, string[]> = {
  6: [
    "hey you alive? 👀",
    "did you fall asleep on me lol",
    "helloo? you there?",
  ],
  12: [
    "ok so you're just gonna leave me hanging huh 😅",
    "cool cool cool, i see how it is",
    "guess you're busy or something",
  ],
  24: [
    "i can't believe i'm still here waiting for you",
    "so... are we not talking anymore or",
    "you know what, forget it",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function determineLevel(gapHours: number): number | "silent" {
  if (gapHours >= 24) {
    // Decide: confront or go silent
    return Math.random() < 0.5 ? 24 : "silent";
  }
  if (gapHours >= 12) return 12;
  if (gapHours >= 6) return 6;
  return -1;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && authHeader !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const profiles = await db
    .select()
    .from(relationshipProfile)
    .where(
      and(
        eq(relationshipProfile.relationshipStatus, "active"),
        lt(relationshipProfile.lastActiveAt, sixHoursAgo),
      ),
    );

  const results: { userId: string; action: string }[] = [];

  for (const profile of profiles) {
    const gapHours = getInactivityHours(profile.lastActiveAt, now);
    const level = determineLevel(gapHours);

    if (level === -1 || level === "silent") {
      if (level === "silent") {
        results.push({ userId: profile.userId, action: "silent" });
      }
      continue;
    }

    // Check if a check-in message was already sent during this gap
    const existingMessages = await db
      .select({ id: chatMessage.id })
      .from(chatMessage)
      .where(
        and(
          eq(chatMessage.userId, profile.userId),
          eq(chatMessage.role, "assistant"),
          gte(chatMessage.createdAt, profile.lastActiveAt),
          lt(chatMessage.createdAt, now),
        ),
      )
      .limit(1);

    if (existingMessages.length > 0) {
      // Already sent a check-in for this gap
      results.push({ userId: profile.userId, action: "already_checked_in" });
      continue;
    }

    const template = CHECK_IN_MESSAGES[level === 24 ? 24 : level === 12 ? 12 : 6];
    if (!template) continue;

    const content = `<msg>${pick(template)}</msg>`;

    await saveChatMessage({
      id: crypto.randomUUID(),
      userId: profile.userId,
      role: "assistant",
      content,
      createdAt: now,
    });

    results.push({
      userId: profile.userId,
      action: `sent_${level}h_checkin`,
    });
  }

  return Response.json({
    checked: profiles.length,
    results,
  });
}
