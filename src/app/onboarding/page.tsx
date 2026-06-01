import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getGfProfileByUserId } from "@/lib/gf-profile";
import { getServerSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Setup · GFSim",
  description: "Create your girlfriend profile",
};

export default async function OnboardingPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await getGfProfileByUserId(session.user.id);
  if (profile) {
    redirect("/chat");
  }

  return (
    <div className="min-h-svh bg-background px-4 py-10">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            GFSim
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Set your girlfriend up
          </h1>
          <p className="text-sm text-muted-foreground">
            Answer a few questions so she feels like someone real, and close to you.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
