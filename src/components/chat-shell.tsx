import { ChatShellClient } from "@/components/chat-shell-client"
import type { NavUserInfo } from "@/components/nav-user"
import { getServerSession } from "@/lib/auth-session"

export async function ChatShell({
  children,
  breadcrumb = "Chat",
}: {
  children: React.ReactNode
  breadcrumb?: string
}) {
  const session = await getServerSession()

  const user: NavUserInfo = session
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      }

  return (
    <ChatShellClient breadcrumb={breadcrumb} user={user}>
      {children}
    </ChatShellClient>
  )
}
