import type { Metadata } from "next"
import { MessageCircleHeartIcon } from "lucide-react"
import { ChatShell } from "@/components/chat-shell"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Chat · GFSim",
  description: "Chat with your AI girlfriend",
}

export default function ChatPage() {
  return (
    <ChatShell>
      <div className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircleHeartIcon className="size-7" />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Your conversation
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            One thread, always picking up where you left off — just like texting
            her.
          </p>
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
