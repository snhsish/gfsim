import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import { getLastUserMessageText } from "@/lib/ai/messages";
import { getChatModel, getChatProvider } from "@/lib/ai/model";
import { buildGirlfriendSystemPrompt } from "@/lib/ai/system-prompt";
import type { GirlfriendChatMetadata } from "@/lib/chat/types";
import {
  getDailyMessageUsage,
  isDailyMessageLimitReached,
  recordChatUsage,
} from "@/lib/chat/usage";
import { getServerSession } from "@/lib/auth-session";
import { createDefaultRelationshipProfile } from "@/lib/relationship/defaults";
import { applyConversationHealthHeuristics } from "@/lib/relationship/history";
import {
  applySentimentToProfile,
  resolveMoodState,
} from "@/lib/relationship/mood";
import { analyzeUserMessage } from "@/lib/relationship/sentiment";
import { enrichProfileFromSentiment } from "@/lib/relationship/update";

export const maxDuration = 30;

function buildChatMetadata(
  relationship: ReturnType<typeof createDefaultRelationshipProfile>,
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

  let body: { messages: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages)) {
    return new Response("messages must be an array", { status: 400 });
  }

  let relationship = createDefaultRelationshipProfile(gfProfile.createdAt);
  relationship.relationshipHealth = applyConversationHealthHeuristics(
    messages,
    relationship.relationshipHealth,
    { skipLastUserMessage: true },
  );

  const lastUserText = getLastUserMessageText(messages);
  let sentiment = null;

  if (lastUserText) {
    sentiment = await analyzeUserMessage(lastUserText);
    relationship = enrichProfileFromSentiment(relationship, sentiment);
    relationship = applySentimentToProfile(
      relationship,
      sentiment.healthDelta,
      sentiment.tone,
    );
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
  });

  const result = streamText({
    model: getChatModel(),
    system,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 220,
    onFinish: ({ totalUsage, response, finishReason }) => {
      const provider = getChatProvider();
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

      recordChatUsage(usage).catch((error) => {
        console.error("[chat] failed to record usage", error);
      });
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === "start" || part.type === "finish") {
        return metadata;
      }
      return undefined;
    },
  });
}
