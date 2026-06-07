import type { UIMessage } from "ai";

export function getTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** Prefix ids so the model can target messages in <react id="..."> tags. */
export function withMessageIdsForModel(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map((part) => {
      if (part.type !== "text") return part;

      const text = part.text.trim();
      if (!text || text.startsWith("[id:")) return part;

      return {
        ...part,
        text: `[id:${message.id}] ${text}`,
      };
    }),
  }));
}

export function getLastUserMessageText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "user") {
      const text = getTextFromUIMessage(message);
      return text.trim() || null;
    }
  }
  return null;
}