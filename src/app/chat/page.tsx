import type { Metadata } from "next"
import { ChatShell } from "@/components/chat-shell"
import { ChatView } from "@/components/chat-view"

export const metadata: Metadata = {
  title: "Chat · GFSim",
  description: "Chat with your AI girlfriend",
}

export default function ChatPage() {
  return (
    <ChatShell>
      <ChatView />
    </ChatShell>
  )
}
