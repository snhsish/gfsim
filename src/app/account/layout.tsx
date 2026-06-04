import { redirect } from "next/navigation";

import { ChatShell } from "@/components/chat-shell";
import { getServerSession } from "@/lib/auth-session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  return <ChatShell breadcrumb="Account">{children}</ChatShell>;
}
