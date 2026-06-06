import { ChatShellClient } from "@/components/chat-shell-client"
import type { GirlfriendHeaderInfo } from "@/components/chat-shell-client"
import type { NavUserInfo } from "@/components/nav-user"
import { getServerSession } from "@/lib/auth-session"
import { getGfProfileByUserId } from "@/lib/gf-profile"

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

  const profile = session ? await getGfProfileByUserId(session.user.id) : null
  const girlfriend: GirlfriendHeaderInfo | null = profile
    ? { name: profile.name }
    : null

  return (
    <ChatShellClient breadcrumb={breadcrumb} user={user} girlfriend={girlfriend}>
      {children}
    </ChatShellClient>
  )
}
