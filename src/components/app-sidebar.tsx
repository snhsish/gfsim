"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  HeartIcon,
  KeyIcon,
  LifeBuoyIcon,
  MessageCircleIcon,
  Settings2Icon,
  SparklesIcon,
  UserCircleIcon,
} from "lucide-react"

import { NavSection } from "@/components/nav-section"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const girlfriendNav = [
  {
    title: "Chat",
    url: "/chat",
    icon: <MessageCircleIcon />,
  },
  {
    title: "Memories",
    url: "/memories",
    icon: <SparklesIcon />,
  },
  {
    title: "Personality",
    url: "/chat/personality",
    icon: <HeartIcon />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2Icon />,
  },
]

const accountNav = [
  {
    title: "Account",
    url: "/account",
    icon: <UserCircleIcon />,
  },
  {
    title: "Usage",
    url: "/account/usage",
    icon: <BarChart3Icon />,
  },
  {
    title: "Configure",
    url: "/account/config",
    icon: <KeyIcon />,
  },
]

const user = {
  name: "You",
  email: "signed in",
  avatar: "",
}

function isNavItemActive(pathname: string, url: string) {
  if (url === "#") return false
  if (url === "/chat") return pathname === "/chat"
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const girlfriendItems = girlfriendNav.map((item) => ({
    ...item,
    isActive: isNavItemActive(pathname, item.url),
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="flex justify-center items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/chat" className="flex justify-center items-center rounded-full">
                <div className="flex aspect-3/1 h-8 w-24 items-center justify-center rounded-none text-sidebar-primary-foreground">
                  <Image
                    src="/gfsim.png"
                    alt="GFSim"
                    height={125}
                    width={375}
                    className="size-full rounded-none"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Your Girlfriend" items={girlfriendItems} />
        <NavSection label="Your Account" items={accountNav} />
        <NavSecondary
          items={[
            {
              title: "Help",
              url: "mailto:mail@snehasish.xyz",
              icon: <LifeBuoyIcon />,
            },
          ]}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
