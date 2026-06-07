import { and, desc, eq, lt } from "drizzle-orm";
import type { UIMessage } from "ai";

import { db } from "@/db";
import { chatMessage } from "@/db/schema";
import { getTextFromUIMessage } from "@/lib/ai/messages";
import {
  CHAT_INITIAL_MESSAGE_LIMIT,
  CHAT_LOAD_OLDER_LIMIT,
} from "@/lib/chat/constants";

export type ChatMessageRole = "user" | "assistant";

export type ChatMessagesPage = {
  messages: UIMessage[];
  hasMore: boolean;
};

type ChatMessageRow = typeof chatMessage.$inferSelect;

export function chatMessageRowToUIMessage(row: ChatMessageRow): UIMessage {
  return {
    id: row.id,
    role: row.role as ChatMessageRole,
    parts: [{ type: "text", text: row.content }],
  };
}

export async function saveChatMessage(input: {
  id: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  createdAt?: Date;
}) {
  const trimmed = input.content.trim();
  if (!trimmed) return;

  await db
    .insert(chatMessage)
    .values({
      id: input.id,
      userId: input.userId,
      role: input.role,
      content: trimmed,
      createdAt: input.createdAt ?? new Date(),
    })
    .onConflictDoNothing({ target: chatMessage.id });
}

export async function saveUIMessage(
  userId: string,
  message: UIMessage,
  role: ChatMessageRole,
) {
  await saveChatMessage({
    id: message.id,
    userId,
    role,
    content: getTextFromUIMessage(message),
  });
}

export async function getChatMessagesPage(
  userId: string,
  options: {
    limit?: number;
    before?: string;
  } = {},
): Promise<ChatMessagesPage> {
  const limit = options.limit ?? CHAT_INITIAL_MESSAGE_LIMIT;
  const conditions = [eq(chatMessage.userId, userId)];

  if (options.before) {
    const [cursor] = await db
      .select()
      .from(chatMessage)
      .where(
        and(
          eq(chatMessage.userId, userId),
          eq(chatMessage.id, options.before),
        ),
      )
      .limit(1);

    if (!cursor) {
      return { messages: [], hasMore: false };
    }

    conditions.push(lt(chatMessage.createdAt, cursor.createdAt));
  }

  const rows = await db
    .select()
    .from(chatMessage)
    .where(and(...conditions))
    .orderBy(desc(chatMessage.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  return {
    messages: pageRows.reverse().map(chatMessageRowToUIMessage),
    hasMore,
  };
}

export async function getInitialChatMessages(
  userId: string,
): Promise<ChatMessagesPage> {
  return getChatMessagesPage(userId, {
    limit: CHAT_INITIAL_MESSAGE_LIMIT,
  });
}

export async function getOlderChatMessages(
  userId: string,
  before: string,
): Promise<ChatMessagesPage> {
  return getChatMessagesPage(userId, {
    limit: CHAT_LOAD_OLDER_LIMIT,
    before,
  });
}

export function getLastPersistableUserMessage(
  messages: UIMessage[],
): UIMessage | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role !== "user") continue;

    const text = getTextFromUIMessage(message).trim();
    if (!text) continue;

    return message;
  }

  return null;
}

export function isPersistableAssistantMessage(message: UIMessage): boolean {
  if (message.role !== "assistant") return false;
  return getTextFromUIMessage(message).trim().length > 0;
}

