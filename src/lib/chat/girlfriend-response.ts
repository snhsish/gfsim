import {
  isNoreplyMessage,
  parseReactionTags,
  stripNoreplyTags,
  stripReactionTags,
} from "@/lib/chat/reactions";

export type ParsedGirlfriendReply =
  | { kind: "noreply" }
  | {
      kind: "messages";
      messages: string[];
      /** Emoji reaction shown before her bubbles (no target id). */
      reaction?: string;
    };

const MSG_TAG_RE = /<msg>([\s\S]*?)<\/msg>/gi;

function stripControlTags(text: string): string {
  return stripReactionTags(
    stripNoreplyTags(text.replace(MSG_TAG_RE, "")),
  );
}

export function parseGirlfriendReply(raw: string): ParsedGirlfriendReply {
  const trimmed = raw.trim();
  if (!trimmed || isNoreplyMessage(trimmed)) {
    return { kind: "noreply" };
  }

  const reactions = parseReactionTags(trimmed);
  const selfReaction = reactions.find(
    (reaction) => !reaction.targetMessageId,
  )?.emoji;
  const tagged = [...trimmed.matchAll(MSG_TAG_RE)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((text) => text.length > 0);

  if (tagged.length > 0) {
    return { kind: "messages", messages: tagged, reaction: selfReaction };
  }

  const plain = stripControlTags(trimmed);
  if (!plain) {
    return { kind: "noreply" };
  }

  return { kind: "messages", messages: [plain], reaction: selfReaction };
}

/** Human-ish pause before a bubble appears (ms). */
export function typingDelayForText(text: string, isFirst: boolean): number {
  const base = isFirst ? 700 : 450;
  const perChar = Math.min(text.length * 28, 2200);
  const jitter = 120 + Math.floor(Math.random() * 280);
  return base + perChar + jitter;
}

export function pauseBetweenBubbles(): number {
  return 350 + Math.floor(Math.random() * 550);
}
