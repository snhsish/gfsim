export type ParsedGirlfriendReply =
  | { kind: "noreply" }
  | {
      kind: "messages";
      messages: string[];
      reaction?: string;
    };

const MSG_TAG_RE = /<msg>([\s\S]*?)<\/msg>/gi;
const NOREPLY_RE = /<noreply\s*\/?>/i;
const REACT_RE = /<react>([^<]*)<\/react>/i;

function stripControlTags(text: string): string {
  return text
    .replace(MSG_TAG_RE, "")
    .replace(REACT_RE, "")
    .replace(NOREPLY_RE, "")
    .trim();
}

export function parseGirlfriendReply(raw: string): ParsedGirlfriendReply {
  const trimmed = raw.trim();
  if (!trimmed || NOREPLY_RE.test(trimmed)) {
    return { kind: "noreply" };
  }

  const reaction = trimmed.match(REACT_RE)?.[1]?.trim();
  const tagged = [...trimmed.matchAll(MSG_TAG_RE)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((text) => text.length > 0);

  if (tagged.length > 0) {
    return { kind: "messages", messages: tagged, reaction };
  }

  const plain = stripControlTags(trimmed);
  if (!plain) {
    return { kind: "noreply" };
  }

  return { kind: "messages", messages: [plain], reaction };
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
