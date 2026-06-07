export type ParsedReaction = {
  emoji: string;
  targetMessageId?: string;
};

export const NOREPLY_TAG = "<noreply/>";
const NOREPLY_TAG_RE = /<noreply\s*\/?>/i;

const REACT_TAG_RE = /<react(?:\s+id="([^"]*)")?\s*>([^<]*)<\/react>/gi;

export function parseReactionTags(text: string): ParsedReaction[] {
  const reactions: ParsedReaction[] = [];
  const pattern = new RegExp(REACT_TAG_RE.source, REACT_TAG_RE.flags);

  for (const match of text.matchAll(pattern)) {
    const targetMessageId = match[1]?.trim() || undefined;
    const emoji = match[2]?.trim() ?? "";
    if (emoji) {
      reactions.push({ emoji, targetMessageId });
    }
  }

  return reactions;
}

export function stripReactionTags(text: string): string {
  return text.replace(REACT_TAG_RE, "").trim();
}

export function formatReaction(targetMessageId: string, emoji: string): string {
  return `<react id="${targetMessageId}">${emoji}</react>`;
}

export function formatNoreply(): string {
  return NOREPLY_TAG;
}

export function stripNoreplyTags(text: string): string {
  return text.replace(new RegExp(NOREPLY_TAG_RE.source, "gi"), "").trim();
}

export function isNoreplyMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return NOREPLY_TAG_RE.test(trimmed) && stripReactionTags(stripNoreplyTags(trimmed)).length === 0;
}

export function isReactionOnlyMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  return (
    stripReactionTags(trimmed).length === 0 &&
    parseReactionTags(trimmed).length > 0
  );
}

export function collectReactionsByMessageId(
  messages: Array<{ id: string; role: string; text: string }>,
): Map<string, string> {
  const reactionsByMessageId = new Map<string, string>();
  let lastUserMessageId: string | null = null;

  for (const message of messages) {
    if (message.role === "user" && !isReactionOnlyMessage(message.text)) {
      lastUserMessageId = message.id;
    }

    const isReactionOnlyAssistantReply =
      message.role === "assistant" &&
      !/<msg>[\s\S]*?<\/msg>/i.test(message.text) &&
      stripReactionTags(stripNoreplyTags(message.text)).length === 0;

    for (const reaction of parseReactionTags(message.text)) {
      if (reaction.targetMessageId) {
        if (!reactionsByMessageId.has(reaction.targetMessageId)) {
          reactionsByMessageId.set(reaction.targetMessageId, reaction.emoji);
        }
        continue;
      }

      if (
        isReactionOnlyAssistantReply &&
        lastUserMessageId &&
        !reactionsByMessageId.has(lastUserMessageId)
      ) {
        reactionsByMessageId.set(lastUserMessageId, reaction.emoji);
      }
    }
  }

  return reactionsByMessageId;
}
