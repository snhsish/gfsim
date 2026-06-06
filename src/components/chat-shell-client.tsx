"use client"

import { AppSidebar } from "@/components/app-sidebar"
import type { NavUserInfo } from "@/components/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar"

export type GirlfriendHeaderInfo = {
  name: string
  avatar?: string | null
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ChatShellClient({
  children,
  breadcrumb = "Chat",
  user,
  girlfriend = null,
}: {
  children: React.ReactNode
  breadcrumb?: string
  user: NavUserInfo
  girlfriend?: GirlfriendHeaderInfo | null
}) {
  const girlfriendInitials = girlfriend ? getInitials(girlfriend.name) : ""

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            {breadcrumb !== "Chat" && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
            {breadcrumb === "Chat" && girlfriend && (
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  {girlfriend.avatar ? (
                    <AvatarImage
                      src={girlfriend.avatar}
                      alt={girlfriend.name}
                    />
                  ) : null}
                  <AvatarFallback>{girlfriendInitials}</AvatarFallback>
                  <AvatarBadge className="bg-green-600 dark:bg-green-400" />
                </Avatar>

                <div className="flex flex-col justify-center">
                  <h1 className="font-medium">{girlfriend.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    Last online 12 hrs ago
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
