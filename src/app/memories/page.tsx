import type { Metadata } from "next";

import { MemoryList } from "@/components/memories/memory-list";
import { ChatShell } from "@/components/chat-shell";
import { getServerSession } from "@/lib/auth-session";
import { getMemoriesForUser } from "@/lib/relationship/memories";

export const metadata: Metadata = {
  title: "Memories · GFSim",
  description: "Things she remembers about you",
};

export default async function MemoriesPage() {
  const session = await getServerSession();
  const memories = session
    ? await getMemoriesForUser(session.user.id)
    : [];

  return (
    <ChatShell breadcrumb="Memories">
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-6 md:p-10">
        <div className="mb-8 w-full max-w-2xl space-y-2 text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Memories
          </h1>
          <p className="text-sm text-muted-foreground">
            Every sweet moment and personal detail you&apos;ve shared — saved so
            she can bring them up naturally in conversation.
          </p>
        </div>
        <MemoryList memories={memories} />
      </div>
    </ChatShell>
  );
}
