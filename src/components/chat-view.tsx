"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ChevronRightIcon, InfoIcon, MessageCircleHeartIcon, SunIcon } from "lucide-react"
import { PiHandWaving } from "react-icons/pi"
import { ChatComposer } from "@/components/chat-composer"
import { TypingIndicator } from "@/components/typing-indicator"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import {
  MessageActions,
  MessageReactionBadge,
} from "@/components/message-actions"
import { useGirlfriendBubbleReveal } from "@/hooks/use-girlfriend-bubble-reveal"
import { getTextFromUIMessage } from "@/lib/ai/messages"
import {
  CHAT_LOAD_OLDER_LIMIT,
  CHAT_SCROLL_LOAD_THRESHOLD,
} from "@/lib/chat/constants"
import type { DailyMessageUsage } from "@/lib/chat/daily-limit"
import { isDailyMessageLimitReached } from "@/lib/chat/daily-limit"
import { truncateUserMessage } from "@/lib/chat/message-limit"
import { parseGirlfriendReply } from "@/lib/chat/girlfriend-response"
import {
  collectReactionsByMessageId,
  formatReaction,
  isReactionOnlyMessage,
} from "@/lib/chat/reactions"
import { cn } from "@/lib/utils"

const chatQuestions = [
  {
    icon: PiHandWaving,
    title: "Hello, how are you?",
  },
  {
    icon: SunIcon,
    title: "How was your day, babe?",
  },
  {
    icon: InfoIcon,
    title: "Tell me something about yourself",
  },
]

type ChatEntry =
  | { id: string; role: "user"; bubbles: string[] }
  | {
      id: string
      role: "assistant"
      bubbles: string[]
      selfReaction: string | undefined
    }

export function ChatView({
  initialDailyMessageUsage,
  initialMessages = [],
  initialHasMoreOlder = false,
}: {
  initialDailyMessageUsage: DailyMessageUsage
  initialMessages?: UIMessage[]
  initialHasMoreOlder?: boolean
}) {
  const [message, setMessage] = useState("")
  const [dailyMessageUsage, setDailyMessageUsage] = useState(
    initialDailyMessageUsage,
  )
  const [hasMoreOlder, setHasMoreOlder] = useState(initialHasMoreOlder)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const isLoadingOlderRef = useRef(false)
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => {
        const key = typeof window !== "undefined" ? localStorage.getItem("gemini-api-key") : null;
        return key ? { apiKey: key } : {};
      },
    }),
    messages: initialMessages,
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      if (
        message.includes("429") ||
        message.toLowerCase().includes("daily message limit")
      ) {
        setDailyMessageUsage((current) => ({
          ...current,
          used: current.limit,
          remaining: 0,
        }))
      }
    },
  })
  const isLoading = status === "submitted" || status === "streaming"
  const dailyLimitReached = isDailyMessageLimitReached(dailyMessageUsage)

  const { chatEntries, reactionsByMessageId } = useMemo(() => {
    const last = messages.at(-1)
    const hideStreamingAssistant =
      isLoading && last?.role === "assistant"

    const reactionsByMessageId = collectReactionsByMessageId(
      messages.map((chatMessage) => ({
        id: chatMessage.id,
        role: chatMessage.role,
        text: getTextFromUIMessage(chatMessage),
      })),
    )

    const chatEntries = messages.flatMap((chatMessage): ChatEntry[] => {
      if (
        hideStreamingAssistant &&
        chatMessage.id === last?.id
      ) {
        return []
      }

      const text = getTextFromUIMessage(chatMessage)
      if (!text.trim()) return []

      if (chatMessage.role === "user") {
        if (isReactionOnlyMessage(text)) return []
        return [{ id: chatMessage.id, role: "user" as const, bubbles: [text] }]
      }

      const parsed = parseGirlfriendReply(text)
      if (parsed.kind === "noreply") return []

      const bubbles = parsed.messages
      if (bubbles.length === 0) return []

      return [
        {
          id: chatMessage.id,
          role: "assistant" as const,
          bubbles,
          selfReaction: parsed.reaction,
        },
      ]
    })

    return { chatEntries, reactionsByMessageId }
  }, [messages, isLoading])

  const wasLoadingRef = useRef(false)
  const loadStartedAssistantCountRef = useRef(0)
  const [justFinishedAssistantId, setJustFinishedAssistantId] = useState<
    string | null
  >(null)

  useEffect(() => {
    const wasLoading = wasLoadingRef.current

    if (!wasLoading && isLoading) {
      loadStartedAssistantCountRef.current = messages.filter(
        (m) => m.role === "assistant",
      ).length
    }

    if (wasLoading && !isLoading) {
      const assistantCount = messages.filter(
        (m) => m.role === "assistant",
      ).length

      if (assistantCount > loadStartedAssistantCountRef.current) {
        setDailyMessageUsage((current) => ({
          ...current,
          used: Math.min(current.limit, current.used + 1),
          remaining: Math.max(0, current.remaining - 1),
        }))
      }

      const finished = [...messages]
        .reverse()
        .find((m) => m.role === "assistant")
      setJustFinishedAssistantId(finished?.id ?? null)
    }

    wasLoadingRef.current = isLoading
  }, [isLoading, messages])

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")
  const lastAssistantText = lastAssistant
    ? getTextFromUIMessage(lastAssistant)
    : ""
  const lastAssistantParsed = lastAssistantText
    ? parseGirlfriendReply(lastAssistantText)
    : null
  const shouldAnimateReveal =
    !isLoading &&
    lastAssistant?.id === justFinishedAssistantId &&
    lastAssistantParsed?.kind === "messages" &&
    lastAssistantParsed.messages.length > 0

  const reveal = useGirlfriendBubbleReveal(
    lastAssistant?.id ?? null,
    lastAssistantParsed,
    shouldAnimateReveal,
  )

  const showTypingIndicator =
    isLoading ||
    (reveal?.isTyping && !reveal.done)

  const hasMessages = messages.length > 0

  const loadOlderMessages = useCallback(async () => {
    if (
      isLoadingOlderRef.current ||
      !hasMoreOlder ||
      messages.length === 0
    ) {
      return
    }

    const oldestMessageId = messages[0]?.id
    if (!oldestMessageId) return

    isLoadingOlderRef.current = true
    setIsLoadingOlder(true)
    shouldAutoScrollRef.current = false

    const container = scrollContainerRef.current
    const previousScrollHeight = container?.scrollHeight ?? 0
    const previousScrollTop = container?.scrollTop ?? 0

    try {
      const response = await fetch(
        `/api/chat/messages?before=${encodeURIComponent(oldestMessageId)}&limit=${CHAT_LOAD_OLDER_LIMIT}`,
      )

      if (!response.ok) {
        throw new Error("Failed to load older messages")
      }

      const data = (await response.json()) as {
        messages: UIMessage[]
        hasMore: boolean
      }

      if (data.messages.length > 0) {
        setMessages((current) => {
          const existingIds = new Set(current.map((entry) => entry.id))
          const olderMessages = data.messages.filter(
            (entry) => !existingIds.has(entry.id),
          )
          return [...olderMessages, ...current]
        })
      }

      setHasMoreOlder(data.hasMore)
    } catch (error) {
      console.error("[chat] failed to load older messages", error)
    } finally {
      isLoadingOlderRef.current = false
      setIsLoadingOlder(false)

      requestAnimationFrame(() => {
        if (!container) return
        container.scrollTop =
          previousScrollTop + (container.scrollHeight - previousScrollHeight)
      })
    }
  }, [hasMoreOlder, messages, setMessages])

  function handleScroll() {
    const container = scrollContainerRef.current
    if (!container || !hasMoreOlder || isLoadingOlderRef.current) return

    const maxScrollTop = container.scrollHeight - container.clientHeight
    if (maxScrollTop <= 0) return

    const scrollRatio = container.scrollTop / maxScrollTop
    if (scrollRatio <= CHAT_SCROLL_LOAD_THRESHOLD) {
      void loadOlderMessages()
    }

    shouldAutoScrollRef.current =
      maxScrollTop - container.scrollTop < 120
  }

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatEntries.length, showTypingIndicator, reveal?.visibleCount])

  function insertSuggestion(text: string) {
    setMessage(text)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(text.length, text.length)
    })
  }

  async function handleSend(payload: { text: string; photos: File[] }) {
    const text = truncateUserMessage(payload.text.trim())
    if (!text || dailyLimitReached) return
    shouldAutoScrollRef.current = true
    await sendMessage({
      text,
    })
    setMessage("")
  }

  async function handleReactToMessage(messageId: string, emoji: string) {
    if (
      dailyLimitReached ||
      isLoading ||
      reactionsByMessageId.has(messageId)
    ) {
      return
    }
    shouldAutoScrollRef.current = true
    await sendMessage({
      text: formatReaction(messageId, emoji),
    })
  }

  const limitHint = dailyLimitReached
    ? `You've used all ${dailyMessageUsage.limit} messages for today. Resets at midnight UTC.`
    : `${dailyMessageUsage.remaining} of ${dailyMessageUsage.limit} messages left today`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-8"
      >
        {hasMessages ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {isLoadingOlder ? (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Loading earlier messages…
              </p>
            ) : null}
            {chatEntries.map((entry) => {
              const isSender = entry.role === "user"
              const isRevealing =
                !isSender &&
                reveal &&
                reveal.messageId === entry.id &&
                !reveal.done
              const visibleBubbles = isRevealing
                ? entry.bubbles.slice(0, reveal.visibleCount)
                : entry.bubbles
              const messageReaction = reactionsByMessageId.get(entry.id)
              const canReactToMessage =
                !isSender && !dailyLimitReached && !isLoading
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "group flex w-full gap-1.5",
                    isSender ? "justify-end" : "justify-start",
                  )}
                >
                  {isSender ? (
                    <MessageActions
                      side="left"
                      canReact={false}
                      hasReaction={Boolean(messageReaction)}
                    />
                  ) : null}

                  <div
                    className={cn(
                      "flex max-w-[80%] flex-col gap-1",
                      isSender ? "items-end" : "items-start",
                      messageReaction && "pb-0.5",
                    )}
                  >
                    {!isSender && entry.selfReaction ? (
                      <span
                        className="px-1 text-lg"
                        aria-label={`Reacted with ${entry.selfReaction}`}
                      >
                        {entry.selfReaction}
                      </span>
                    ) : null}
                    {visibleBubbles.map((bubble, index) => (
                      <div
                        key={`${entry.id}-${index}`}
                        className={cn(
                          "rounded-3xl px-4 py-2 text-sm leading-6 shadow-sm",
                          isSender
                            ? "rounded-br-md bg-secondary text-secondary-foreground"
                            : "rounded-bl-md bg-primary text-primary-foreground",
                        )}
                      >
                        {bubble}
                      </div>
                    ))}
                    {messageReaction ? (
                      <MessageReactionBadge
                        emoji={messageReaction}
                        align={isSender ? "right" : "left"}
                      />
                    ) : null}
                  </div>

                  {!isSender ? (
                    <MessageActions
                      side="right"
                      canReact={canReactToMessage}
                      hasReaction={Boolean(messageReaction)}
                      onReact={(emoji) =>
                        void handleReactToMessage(entry.id, emoji)
                      }
                    />
                  ) : null}
                </div>
              )
            })}
            {showTypingIndicator && (
              <div className="flex w-full justify-start">
                <div className="rounded-3xl rounded-bl-md bg-primary px-4 py-3 text-primary-foreground">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircleHeartIcon className="size-7" />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Start your conversation
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Maybe send her a {'"hi"'} or {'"how are you?"'} to start the conversation.
            </p>

            <div className="flex w-full max-w-md flex-col gap-2 py-5">
              {chatQuestions.map((q, i) => (
                <Item
                  key={i}
                  variant="outline"
                  className="w-full border-primary/20 bg-primary/5 p-4 hover:bg-primary/10!"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 text-left"
                    onClick={() => insertSuggestion(q.title)}
                  >
                    <ItemMedia variant="icon">
                      <q.icon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{q.title}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRightIcon className="size-4" />
                    </ItemActions>
                  </button>
                </Item>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="shrink-0 px-4 pb-3 pt-2">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <p className="px-1 text-center text-xs text-muted-foreground">
            {dailyLimitReached ? (
              <>
                {limitHint}{" "}
                <Link href="/account/usage" className="underline underline-offset-2">
                  View usage
                </Link>
              </>
            ) : (
              limitHint
            )}
          </p>
          <ChatComposer
            value={message}
            onValueChange={setMessage}
            textareaRef={textareaRef}
            onSend={handleSend}
            disabled={dailyLimitReached || isLoading}
          />
        </div>
      </div>
    </div>
  )
}

