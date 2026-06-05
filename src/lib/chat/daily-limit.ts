export const DAILY_MESSAGE_LIMIT = 20;

export type DailyMessageUsage = {
  used: number;
  limit: number;
  remaining: number;
};

export function isDailyMessageLimitReached(usage: DailyMessageUsage): boolean {
  return usage.used >= usage.limit;
}
