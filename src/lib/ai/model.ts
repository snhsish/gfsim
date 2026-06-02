import type { LanguageModel } from "ai";

const DEFAULT_CHAT_MODEL = "google/gemini-2.5-flash";

export function getChatModelId(): string {
  return process.env.AI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
}

export function getChatModel(): LanguageModel {
  return getChatModelId();
}