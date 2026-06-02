import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { createGateway } from "ai";

const DEFAULT_CHAT_MODEL = "google/gemini-2.5-flash";

function isGoogleApiKey(key: string): boolean {
  return key.startsWith("AQ.") || key.startsWith("AIza");
}

function getGoogleApiKey(): string | undefined {
  const dedicated = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (dedicated) return dedicated;

  const gatewayEnv = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayEnv && isGoogleApiKey(gatewayEnv)) return gatewayEnv;

  return undefined;
}

function getGatewayApiKey(): string | undefined {
  const key = process.env.AI_GATEWAY_API_KEY?.trim();
  if (!key || isGoogleApiKey(key)) return undefined;
  return key;
}

export function hasChatModelCredentials(): boolean {
  return Boolean(
    getGoogleApiKey() || getGatewayApiKey() || process.env.VERCEL_OIDC_TOKEN,
  );
}

export function getChatModelId(): string {
  return process.env.AI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
}

function toGoogleModelId(modelId: string): string {
  if (modelId.startsWith("google/")) {
    return modelId.slice("google/".length);
  }
  return modelId;
}

export function getChatModel(): LanguageModel {
  const modelId = getChatModelId();
  const googleKey = getGoogleApiKey();

  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return google(toGoogleModelId(modelId));
  }

  const gatewayKey = getGatewayApiKey();
  if (gatewayKey) {
    return createGateway({ apiKey: gatewayKey })(modelId);
  }

  return modelId;
}
