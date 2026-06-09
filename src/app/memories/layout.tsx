import { redirect } from "next/navigation";

import { getGfProfileByUserId } from "@/lib/gf-profile";
import { getServerSession } from "@/lib/auth-session";

export default async function MemoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await getGfProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  return children;
}
