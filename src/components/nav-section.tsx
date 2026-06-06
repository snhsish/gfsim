"use client"

import Link from "next/link"
import { SidebarOnboardingNavItem } from "@/components/sidebar-onboarding"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSection({
  label,
  items,
}: {
  label: string
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    onboardingId?: string
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarOnboardingNavItem onboardingId={item.onboardingId}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarOnboardingNavItem>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
