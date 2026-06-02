import { generateText, Output } from "ai";
import { z } from "zod";

import { getChatModel } from "@/lib/ai/model";
import type { MessageSentiment } from "@/lib/relationship/types";

const sentimentSchema = z.object({
  tone: z.enum([
    "affectionate",
    "positive",
    "neutral",
    "dismissive",
    "rude",
  ]),
  healthDelta: z.number().int().min(-2).max(2),
  engagement: z.enum(["high", "medium", "low"]),
  mentionedDetail: z.string().nullable(),
  jealousyNote: z.string().nullable(),
});

const TONE_HEALTH: Record<MessageSentiment["tone"], number> = {
  affectionate: 2,
  positive: 1,
  neutral: 0,
  dismissive: -1,
  rude: -2,
};

export async function analyzeUserMessage(
  message: string,
): Promise<MessageSentiment> {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      tone: "neutral",
      healthDelta: 0,
      engagement: "low",
      mentionedDetail: null,
      jealousyNote: null,
    };
  }

  const { output } = await generateText({
    model: getChatModel(),
    output: Output.object({ schema: sentimentSchema }),
    system: `You analyze a romantic partner's text message for a relationship simulator.
Classify tone and how it should affect relationship health (-2 to +2).
Note any personal detail they share (exam, job, family, etc.) in one short phrase or null.
Note jealousy triggers (another woman mentioned by name) in one short phrase or null.
Be fair: busy/stressed explanations are not rude; insults and dismissiveness are.`,
    prompt: trimmed,
  });

  const healthDelta =
    output.healthDelta !== 0
      ? output.healthDelta
      : TONE_HEALTH[output.tone];

  return {
    tone: output.tone,
    healthDelta,
    engagement: output.engagement,
    mentionedDetail: output.mentionedDetail,
    jealousyNote: output.jealousyNote,
  };
}
