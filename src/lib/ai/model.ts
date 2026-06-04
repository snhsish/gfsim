import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { createGateway } from "ai";

const TOGETHER_API_BASE = "https://api.together.xyz/v1";

/** Active chat provider. Set to `google` or `gateway` in env to switch back. */
type ChatProvider = "together" | "google" | "gateway";

const DEFAULT_TOGETHER_MODEL = "Qwen/Qwen3.5-9B";
const DEFAULT_GOOGLE_MODEL = "google/gemini-2.5-flash";

function getChatProvider(): ChatProvider {
  const raw = process.env.AI_CHAT_PROVIDER?.trim().toLowerCase();
  if (raw === "google" || raw === "gateway") return raw;
  return "together";
}

export { getChatProvider };

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

function getTogetherApiKey(): string | undefined {
  return process.env.TOGETHER_API_KEY?.trim() || undefined;
}

function defaultModelForProvider(provider: ChatProvider): string {
  switch (provider) {
    case "together":
      return DEFAULT_TOGETHER_MODEL;
    case "google":
    case "gateway":
      return DEFAULT_GOOGLE_MODEL;
  }
}

function resolveModelId(provider: ChatProvider): string {
  const explicit = process.env.AI_CHAT_MODEL?.trim();
  if (!explicit) return defaultModelForProvider(provider);

  // Legacy .env may still point at the other provider's default model id.
  if (provider === "together" && explicit.startsWith("google/")) {
    return DEFAULT_TOGETHER_MODEL;
  }
  if (
    (provider === "google" || provider === "gateway") &&
    (explicit === DEFAULT_TOGETHER_MODEL || explicit.startsWith("together/"))
  ) {
    return DEFAULT_GOOGLE_MODEL;
  }

  return explicit;
}

export function hasChatModelCredentials(): boolean {
  const provider = getChatProvider();

  if (provider === "together") {
    return Boolean(getTogetherApiKey());
  }

  if (provider === "google") {
    return Boolean(getGoogleApiKey());
  }

  return Boolean(
    getGoogleApiKey() || getGatewayApiKey() || process.env.VERCEL_OIDC_TOKEN,
  );
}

export function getChatModelId(): string {
  return resolveModelId(getChatProvider());
}

function toGoogleModelId(modelId: string): string {
  if (modelId.startsWith("google/")) {
    return modelId.slice("google/".length);
  }
  return modelId;
}

function toTogetherModelId(modelId: string): string {
  if (modelId.startsWith("together/")) {
    return modelId.slice("together/".length);
  }
  return modelId;
}

function createTogetherChatModel(modelId: string): LanguageModel {
  const apiKey = getTogetherApiKey();
  if (!apiKey) {
    throw new Error(
      "TOGETHER_API_KEY is required when AI_CHAT_PROVIDER=together",
    );
  }

  return new OpenAICompatibleChatLanguageModel(toTogetherModelId(modelId), {
    provider: "togetherai.chat",
    url: ({ path }) => `${TOGETHER_API_BASE}${path}`,
    headers: () => ({ Authorization: `Bearer ${apiKey}` }),
    // Required for Output.object / json_schema (e.g. sentiment analysis).
    supportsStructuredOutputs: true,
    // Qwen3.5 defaults to thinking mode; without this, only reasoning tokens
    // stream and UIMessage text parts stay empty in the chat UI.
    transformRequestBody: (body) => ({
      ...body,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });
}

export function getChatModel(): LanguageModel {
  const provider = getChatProvider();
  const modelId = getChatModelId();

  if (provider === "together") {
    return createTogetherChatModel(modelId);
  }

  if (provider === "google") {
    const googleKey = getGoogleApiKey();
    if (!googleKey) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is required when AI_CHAT_PROVIDER=google",
      );
    }
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return google(toGoogleModelId(modelId));
  }

  const gatewayKey = getGatewayApiKey();
  if (gatewayKey) {
    return createGateway({ apiKey: gatewayKey })(modelId);
  }

  return modelId;
}
