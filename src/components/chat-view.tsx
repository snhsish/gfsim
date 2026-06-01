"use client"

import { useRef, useState } from "react"
import { ChevronRightIcon, InfoIcon, MessageCircleHeartIcon, SunIcon } from "lucide-react"
import { PiHandWaving } from "react-icons/pi"
import { ChatComposer } from "@/components/chat-composer"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"

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

export function ChatView() {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertSuggestion(text: string) {
    setMessage(text)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(text.length, text.length)
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto p-8 text-center">
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
      <div className="shrink-0 px-4 pb-3 pt-2">
        <ChatComposer
          className="mx-auto max-w-3xl"
          value={message}
          onValueChange={setMessage}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  )
}
