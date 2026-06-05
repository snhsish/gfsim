import type { Metadata } from "next";
import {
  ActivityIcon,
  CalendarClockIcon,
  CoinsIcon,
  MessageSquareIcon,
  ZapIcon,
} from "lucide-react";

import { DailyUsageChart } from "@/components/usage/daily-usage-chart";
import { StatCard } from "@/components/usage/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/lib/auth-session";
import { getChatModelId } from "@/lib/ai/model";
import {
  DAILY_MESSAGE_LIMIT,
  getDailyMessageUsage,
  getUsageSummary,
} from "@/lib/chat/usage";
import { formatCompactNumber, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Usage · GFSim",
  description: "Track your chat token usage on GFSim",
};

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export default async function UsagePage() {
  const session = await getServerSession();
  const [summary, dailyMessageUsage] = session
    ? await Promise.all([
        getUsageSummary(session.user.id, 14),
        getDailyMessageUsage(session.user.id),
      ])
    : [
        {
          totals: {
            totalMessages: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalTokens: 0,
            totalCachedTokens: 0,
            totalReasoningTokens: 0,
            firstUsedAt: null,
            lastUsedAt: null,
          },
          last14Days: [],
          byModel: [],
        },
        {
          used: 0,
          limit: DAILY_MESSAGE_LIMIT,
          remaining: DAILY_MESSAGE_LIMIT,
        },
      ];

  const { totals, last14Days, byModel } = summary;
  const peakDay =
    last14Days.length > 0
      ? last14Days.reduce((best, point) =>
          point.totalTokens > best.totalTokens ? point : best,
        )
      : null;
  const averageTokensPerMessage =
    totals.totalMessages > 0
      ? Math.round(totals.totalTokens / totals.totalMessages)
      : 0;
  const totalModelCount = byModel.length;
  const activeModelId = getChatModelId();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Usage
          </h1>
          <p className="text-sm text-muted-foreground">
            Token consumption and usage statistics for your chat sessions with your girlfriend.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Messages today"
              value={`${formatNumber(dailyMessageUsage.used)} / ${formatNumber(dailyMessageUsage.limit)}`}
              hint={
                dailyMessageUsage.remaining > 0
                  ? `${formatNumber(dailyMessageUsage.remaining)} remaining · resets midnight UTC`
                  : "Daily limit reached · resets midnight UTC"
              }
              icon={<CalendarClockIcon />}
            />
            <StatCard
              label="Total messages"
              value={formatNumber(totals.totalMessages)}
              hint={
                totals.lastUsedAt
                  ? `Last used ${formatDate(totals.lastUsedAt)}`
                  : "No chats yet"
              }
              icon={<MessageSquareIcon />}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total tokens"
              value={formatCompactNumber(totals.totalTokens)}
              hint={`${formatNumber(totals.totalInputTokens)} in : ${formatNumber(totals.totalOutputTokens)} out`}
              icon={<CoinsIcon />}
            />
            <StatCard
              label="Avg tokens / message"
              value={
                totals.totalMessages > 0
                  ? formatNumber(averageTokensPerMessage)
                  : "—"
              }
              hint={
                totals.totalCachedTokens > 0
                  ? `${formatCompactNumber(
                      totals.totalCachedTokens,
                    )} cached tokens reused`
                  : "Prompt cache not used"
              }
              icon={<ZapIcon />}
            />
            <StatCard
              label="Peak day"
              value={
                peakDay && peakDay.totalTokens > 0
                  ? formatCompactNumber(peakDay.totalTokens)
                  : "—"
              }
              hint={
                peakDay && peakDay.totalTokens > 0
                  ? `${formatDate(peakDay.date)} : ${peakDay.messageCount} msg`
                  : "Send a message to see trends"
              }
              icon={<ActivityIcon />}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily token usage</CardTitle>
            <CardDescription>
              Showing data for the last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totals.totalMessages === 0 ? (
              <EmptyChart />
            ) : (
              <DailyUsageChart data={last14Days} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By model</CardTitle>
            <CardDescription>
              Token totals grouped by the model that generated each response.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {byModel.length === 0 ? (
              <p className="px-6 text-sm text-muted-foreground">
                No usage recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-2 font-medium">Model</th>
                      <th className="px-6 py-2 font-medium">Provider</th>
                      <th className="px-6 py-2 text-right font-medium">
                        Messages
                      </th>
                      <th className="px-6 py-2 text-right font-medium">
                        Input
                      </th>
                      <th className="px-6 py-2 text-right font-medium">
                        Output
                      </th>
                      <th className="px-6 py-2 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {byModel.map((row) => (
                      <tr
                        key={`${row.provider}:${row.modelId}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{row.modelId}</span>
                            {row.modelId === activeModelId ? (
                              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-500">
                                Active
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-3 capitalize text-muted-foreground">
                          {row.provider}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          {formatNumber(row.messageCount)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          {formatNumber(row.inputTokens)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          {formatNumber(row.outputTokens)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums font-medium">
                          {formatCompactNumber(row.totalTokens)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Tracking {totalModelCount} model
          {totalModelCount === 1 ? "" : "s"} · currently using{" "}
          <span className="font-medium text-foreground">{activeModelId}</span>
        </p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
      <ActivityIcon className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Once you start chatting, your daily token usage will appear here.
      </p>
    </div>
  );
}
