import type { UIMessage } from "ai";

import { getTextFromUIMessage } from "@/lib/ai/messages";
import { isReactionOnlyMessage } from "@/lib/chat/reactions";

/** Fast heuristic until message persistence + stored profile exist. */
export function estimateHealthDeltaFromText(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const lower = trimmed.toLowerCase();

  if (
    /\b(i love you|love you|miss you|thank you|proud of you|you mean so much|you're amazing|you're the best)\b/.test(
      lower,
    )
  ) {
    return 2;
  }
  if (
    /\b(sorry|my bad|forgive me|you're right|i was wrong|i appreciate you)\b/.test(
      lower,
    )
  ) {
    return 1;
  }
  if (
    /\b(shut up|stupid|idiot|hate you|don't care|whatever|leave me alone|you're annoying)\b/.test(
      lower,
    )
  ) {
    return -2;
  }
  if (trimmed.length <= 8 && /^(ok|k|ya|nah|lol|idk|sure|fine)\.?$/i.test(trimmed)) {
    return -1;
  }

  return 0;
}

function findLastUserMessageIndex(messages: UIMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return i;
    }
  }
  return -1;
}

export function applyConversationHealthHeuristics(
  messages: UIMessage[],
  baseHealth: number,
  options?: { skipLastUserMessage?: boolean },
): number {
  let health = baseHealth;
  const skipIndex = options?.skipLastUserMessage
    ? findLastUserMessageIndex(messages)
    : -1;

  messages.forEach((message, index) => {
    if (message.role !== "user" || index === skipIndex) return;
    const text = getTextFromUIMessage(message);
    if (isReactionOnlyMessage(text)) return;
    health += estimateHealthDeltaFromText(text);
  });

  return Math.max(0, Math.min(100, health));
}
