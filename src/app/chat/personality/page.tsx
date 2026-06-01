import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PersonalityEditor } from "@/components/personality/personality-editor";
import { ChatShell } from "@/components/chat-shell";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import { profileToDraft } from "@/lib/gf-profile-map";
import { getServerSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Personality · GFSim",
  description: "Edit your girlfriend's personality and background",
};

export default async function PersonalityPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getGfProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  const initialDraft = profileToDraft(profile);

  return (
    <ChatShell breadcrumb="Personality">
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-6 md:p-10">
        <div className="mb-8 w-full max-w-lg space-y-2 text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Personality
          </h1>
          <p className="text-sm text-muted-foreground">
            Update her personality, name, background, and how she shows up in your
            relationship.
          </p>
        </div>
        <PersonalityEditor initialDraft={initialDraft} />
      </div>
    </ChatShell>
  );
}
