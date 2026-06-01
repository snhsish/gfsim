import { AppSidebar } from "@/components/app-sidebar"
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

export function ChatShell({
  children,
  breadcrumb = "Chat",
}: {
  children: React.ReactNode
  breadcrumb?: string
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            {
              breadcrumb !== "Chat" && (
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              )
            }
            {
              breadcrumb == "Chat" && (
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    <AvatarImage
                      src="https://github.com/snhsish.png"
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      E
                    </AvatarFallback>
                    <AvatarBadge
                      className="bg-green-600 dark:bg-green-400"
                    />
                  </Avatar>

                  <div className="flex flex-col justify-center">
                    <h1 className="font-medium">
                      Emma
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Last online 12 hrs ago
                    </p>
                  </div>
                </div>
              )
            }
          </div>


        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
