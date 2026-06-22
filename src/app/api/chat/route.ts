import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  type UIMessage,
} from "ai";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import { getLastUserMessageText, getTextFromUIMessage, withMessageIdsForModel } from "@/lib/ai/messages";
import { getChatModel, getChatProvider } from "@/lib/ai/model";
import { buildGirlfriendSystemPrompt } from "@/lib/ai/system-prompt";
import { CHAT_LLM_CONTEXT_LIMIT } from "@/lib/chat/constants";
import type { GirlfriendChatMetadata } from "@/lib/chat/types";
import {
  getDailyMessageUsage,
  isDailyMessageLimitReached,
  recordChatUsage,
} from "@/lib/chat/usage";
import {
  isUserMessageTooLong,
  MAX_USER_MESSAGE_LENGTH,
} from "@/lib/chat/message-limit";
import {
  isReactionOnlyMessage,
} from "@/lib/chat/reactions";
import {
  getLastPersistableUserMessage,
  isPersistableAssistantMessage,
  saveChatMessage,
  saveUIMessage,
} from "@/lib/chat/persistence";
import { getServerSession } from "@/lib/auth-session";
import { getOrCreateProfile, saveProfile } from "@/lib/relationship/profile-db";
import { getInactivityHours, applyInactivityDecay } from "@/lib/relationship/inactivity";
import {
  applySentimentToProfile,
  resolveMoodState,
} from "@/lib/relationship/mood";
import { analyzeUserMessage } from "@/lib/relationship/sentiment";
import {
  loadMemorizedDetails,
  saveMemoryIfNew,
} from "@/lib/relationship/memories";
import { enrichProfileFromSentiment } from "@/lib/relationship/update";
import type { MoodState, RelationshipStatus } from "@/lib/relationship/types";

export const maxDuration = 30;

function buildChatMetadata(
  relationship: {
    relationshipHealth: number;
    moodState: MoodState;
    relationshipStatus: RelationshipStatus;
    cycleDay: number;
    cycleActive: boolean;
  },
): GirlfriendChatMetadata {
  return {
    relationshipHealth: relationship.relationshipHealth,
    moodState: relationship.moodState,
    relationshipStatus: relationship.relationshipStatus,
    cycleDay: relationship.cycleDay,
    cycleActive: relationship.cycleActive,
  };
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }


  const gfProfile
    = await getGfProfileByUserId(session.user.id);
  if (!gfProfile) {
    return new Response("Complete onboarding before chatting.", {
      status: 403,
    });
  }

  let body: { messages: UIMessage[]; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { messages, apiKey } = body;

  if (!apiKey) {
    const dailyUsage = await getDailyMessageUsage(session.user.id);
    if (isDailyMessageLimitReached(dailyUsage)) {
      return Response.json(
        {
          error: `Daily message limit reached (${dailyUsage.limit} per day). Try again after midnight UTC.`,
          code: "daily_message_limit",
          dailyUsage,
        },
        { status: 429 },
      );
    }
  }
  if (!Array.isArray(messages)) {
    return new Response("messages must be an array", { status: 400 });
  }

  const lastUserMessage = getLastPersistableUserMessage(messages);
  if (lastUserMessage) {
    saveUIMessage(session.user.id, lastUserMessage, "user").catch((error) => {
      console.error("[chat] failed to save user message", error);
    });
  }

  const now = new Date();
  const contextMessages = messages.slice(-CHAT_LLM_CONTEXT_LIMIT);

  const persisted = await getOrCreateProfile(
    session.user.id,
    gfProfile.createdAt,
  );
  let relationship: typeof persisted = { ...persisted };
  relationship.memorizedDetails = await loadMemorizedDetails(session.user.id);

  const gapHours = getInactivityHours(relationship.lastActiveAt, now);
  if (gapHours > 6) {
    const decayed = applyInactivityDecay(relationship, gapHours);
    relationship.relationshipHealth = decayed.relationshipHealth;
    relationship.moodState = decayed.moodState;
  }

  const lastUserText = getLastUserMessageText(contextMessages);
  if (lastUserText && isUserMessageTooLong(lastUserText)) {
    return Response.json(
      {
        error: `Message must be at most ${MAX_USER_MESSAGE_LENGTH} characters.`,
        code: "message_too_long",
        maxLength: MAX_USER_MESSAGE_LENGTH,
      },
      { status: 400 },
    );
  }

  let sentiment = null;

  if (lastUserText) {
    if (!isReactionOnlyMessage(lastUserText)) {
      sentiment = await analyzeUserMessage(lastUserText);
      const enriched = enrichProfileFromSentiment(relationship, sentiment);
      relationship = { ...relationship, ...enriched, memorizedDetails: relationship.memorizedDetails };
      if (sentiment.mentionedDetail) {
        const saved = await saveMemoryIfNew(
          session.user.id,
          sentiment.mentionedDetail,
        );
        if (saved) {
          relationship = {
            ...relationship,
            memorizedDetails: {
              ...relationship.memorizedDetails,
              [saved.id]: saved.content,
            },
          };
        }
      }
      const updated = applySentimentToProfile(
        relationship,
        sentiment.healthDelta,
        sentiment.tone,
      );
      relationship = { ...relationship, ...updated };
    }
  } else {
    relationship = {
      ...relationship,
      moodState: resolveMoodState(relationship),
    };
  }

  const mood = relationship.moodState;
  const metadata = buildChatMetadata(relationship);

  const system = buildGirlfriendSystemPrompt({
    profile: gfProfile,
    relationship,
    mood,
    userName: session.user.name,
    sentiment,
    gapHours,
  });

  relationship.lastActiveAt = now;
  await saveProfile(session.user.id, relationship);

  const result = streamText({
    model: getChatModel(apiKey),
    system,
    messages: await convertToModelMessages(
      withMessageIdsForModel(contextMessages),
    ),
    maxOutputTokens: 220,
    onFinish: async ({ totalUsage, response, finishReason }) => {
      const provider = apiKey ? "google" : getChatProvider();
      const modelId = response.modelId ?? "unknown";
      const usage = {
        userId: session.user.id,
        provider,
        modelId,
        inputTokens: totalUsage.inputTokens ?? 0,
        outputTokens: totalUsage.outputTokens ?? 0,
        totalTokens: totalUsage.totalTokens ?? 0,
        cacheReadTokens: totalUsage.inputTokenDetails?.cacheReadTokens ?? 0,
        cacheWriteTokens: totalUsage.inputTokenDetails?.cacheWriteTokens ?? 0,
        reasoningTokens: totalUsage.outputTokenDetails?.reasoningTokens ?? 0,
        finishReason: finishReason ?? null,
      };

      try {
        await recordChatUsage(usage);
      } catch (error) {
        console.error("[chat] failed to record usage", error);
      }
    },
  });

  // Keep generating on the server so onFinish runs even if the client disconnects.
  result.consumeStream();

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    messageMetadata: ({ part }) => {
      if (part.type === "start" || part.type === "finish") {
        return metadata;
      }
      return undefined;
    },
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted || !isPersistableAssistantMessage(responseMessage)) {
        return;
      }

      try {
        await saveChatMessage({
          id: responseMessage.id,
          userId: session.user.id,
          role: "assistant",
          content: getTextFromUIMessage(responseMessage),
        });
      } catch (error) {
        console.error("[chat] failed to save assistant message", error);
      }
    },
  });
}
