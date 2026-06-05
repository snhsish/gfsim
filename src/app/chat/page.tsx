import type { Metadata } from "next"
import { ChatShell } from "@/components/chat-shell"
import { ChatView } from "@/components/chat-view"
import { DAILY_MESSAGE_LIMIT, getDailyMessageUsage } from "@/lib/chat/usage"
import { getServerSession } from "@/lib/auth-session"

export const metadata: Metadata = {
  title: "Chat · GFSim",
  description: "Chat with your AI girlfriend",
}

export default async function ChatPage() {
  const session = await getServerSession()
  const dailyMessageUsage = session
    ? await getDailyMessageUsage(session.user.id)
    : { used: 0, limit: DAILY_MESSAGE_LIMIT, remaining: DAILY_MESSAGE_LIMIT }

  return (
    <ChatShell>
      <ChatView initialDailyMessageUsage={dailyMessageUsage} />
    </ChatShell>
  )
}
