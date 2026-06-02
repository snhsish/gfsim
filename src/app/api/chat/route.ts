import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import { getLastUserMessageText } from "@/lib/ai/messages";
import { getChatModel } from "@/lib/ai/model";
import { buildGirlfriendSystemPrompt } from "@/lib/ai/system-prompt";
import type { GirlfriendChatMetadata } from "@/lib/chat/types";
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
