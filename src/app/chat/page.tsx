import type { Metadata } from "next"
import { BadgeCheckIcon, ChevronRightIcon, HeartIcon, InboxIcon, InfoIcon, MessageCircleHeartIcon, SunIcon } from "lucide-react"
import { ChatShell } from "@/components/chat-shell"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import Link from "next/link"
import { PiHandWaving } from "react-icons/pi"

export const metadata: Metadata = {
  title: "Chat · GFSim",
  description: "Chat with your AI girlfriend",
}

export const chatQuestions = [
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

export default function ChatPage() {
  return (
    <ChatShell>
      <div className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircleHeartIcon className="size-7" />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Start your conversation
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Maybe send her a {'"hi"'} or {'"how are you?"'} to start the conversation.
          </p>

          <div className="py-5 flex flex-col gap-2 max-w-md w-full">
            {
              chatQuestions.map((q, i) => (

                <Item
                  key={i}
                  variant="outline" className="w-full bg-primary/5 hover:bg-primary/10! border-primary/20 p-4" asChild>
                  <Link href="#">
                    <ItemMedia variant="icon">
                      <q.icon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{q.title}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRightIcon className="size-4" />
                    </ItemActions>
                  </Link>
                </Item>
              ))
            }
          </div>

        </div>
        <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Input
              placeholder="Type a message..."
              className="flex-1"
              disabled
              aria-label="Message input"
            />
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
            Messaging coming soon
          </p>
        </div>
      </div>
    </ChatShell>
  )
}
