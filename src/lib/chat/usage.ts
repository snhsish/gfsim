import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { chatUsage } from "@/db/schema";

export type ChatUsageRecordInput = {
  userId: string;
  provider: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
  finishReason: string | null;
};

export async function recordChatUsage(input: ChatUsageRecordInput) {
  await db.insert(chatUsage).values({
    id: crypto.randomUUID(),
    userId: input.userId,
    provider: input.provider,
    modelId: input.modelId,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    cacheReadTokens: input.cacheReadTokens,
    cacheWriteTokens: input.cacheWriteTokens,
    reasoningTokens: input.reasoningTokens,
    finishReason: input.finishReason,
    createdAt: new Date(),
  });
}

export type UsageTotals = {
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  firstUsedAt: Date | null;
  lastUsedAt: Date | null;
};

export type DailyUsagePoint = {
  date: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  messageCount: number;
};

export type ModelUsageBreakdown = {
  modelId: string;
  provider: string;
  messageCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
};

export type UsageSummary = {
  totals: UsageTotals;
  last14Days: DailyUsagePoint[];
  byModel: ModelUsageBreakdown[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getUsageSummary(
  userId: string,
  days = 14,
): Promise<UsageSummary> {
  const now = new Date();
  const since = new Date(now.getTime() - (days - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);

  const [totalsRow] = await db
    .select({
      totalMessages: sql<number>`count(*)::int`,
      totalInputTokens: sql<number>`coalesce(sum(${chatUsage.inputTokens}), 0)::int`,
      totalOutputTokens: sql<number>`coalesce(sum(${chatUsage.outputTokens}), 0)::int`,
      totalTokens: sql<number>`coalesce(sum(${chatUsage.totalTokens}), 0)::int`,
      totalCachedTokens: sql<number>`coalesce(sum(${chatUsage.cacheReadTokens}), 0)::int`,
      totalReasoningTokens: sql<number>`coalesce(sum(${chatUsage.reasoningTokens}), 0)::int`,
      firstUsedAt: sql<Date | null>`min(${chatUsage.createdAt})`,
      lastUsedAt: sql<Date | null>`max(${chatUsage.createdAt})`,
    })
    .from(chatUsage)
    .where(eq(chatUsage.userId, userId));

  const dailyRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${chatUsage.createdAt}), 'YYYY-MM-DD')`,
      totalTokens: sql<number>`coalesce(sum(${chatUsage.totalTokens}), 0)::int`,
      inputTokens: sql<number>`coalesce(sum(${chatUsage.inputTokens}), 0)::int`,
      outputTokens: sql<number>`coalesce(sum(${chatUsage.outputTokens}), 0)::int`,
      messageCount: sql<number>`count(*)::int`,
    })
    .from(chatUsage)
    .where(
      and(
        eq(chatUsage.userId, userId),
        gte(chatUsage.createdAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${chatUsage.createdAt})`);

  const dailyMap = new Map<string, DailyUsagePoint>();
  for (const row of dailyRows) {
    dailyMap.set(row.day, {
      date: row.day,
      totalTokens: row.totalTokens,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      messageCount: row.messageCount,
    });
  }

  const last14Days: DailyUsagePoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * DAY_MS);
    const key = formatDayKey(day);
    last14Days.push(
      dailyMap.get(key) ?? {
        date: key,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        messageCount: 0,
      },
    );
  }

  const byModelRows = await db
    .select({
      modelId: chatUsage.modelId,
      provider: chatUsage.provider,
      messageCount: sql<number>`count(*)::int`,
      totalTokens: sql<number>`coalesce(sum(${chatUsage.totalTokens}), 0)::int`,
      inputTokens: sql<number>`coalesce(sum(${chatUsage.inputTokens}), 0)::int`,
      outputTokens: sql<number>`coalesce(sum(${chatUsage.outputTokens}), 0)::int`,
    })
    .from(chatUsage)
    .where(eq(chatUsage.userId, userId))
    .groupBy(chatUsage.modelId, chatUsage.provider)
    .orderBy(sql`count(*) desc`);

  return {
    totals: {
      totalMessages: totalsRow?.totalMessages ?? 0,
      totalInputTokens: totalsRow?.totalInputTokens ?? 0,
      totalOutputTokens: totalsRow?.totalOutputTokens ?? 0,
      totalTokens: totalsRow?.totalTokens ?? 0,
      totalCachedTokens: totalsRow?.totalCachedTokens ?? 0,
      totalReasoningTokens: totalsRow?.totalReasoningTokens ?? 0,
      firstUsedAt: totalsRow?.firstUsedAt ?? null,
      lastUsedAt: totalsRow?.lastUsedAt ?? null,
    },
    last14Days,
    byModel: byModelRows,
  };
}
