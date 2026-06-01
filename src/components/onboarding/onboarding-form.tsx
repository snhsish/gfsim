"use client";

import { completeOnboarding } from "@/app/onboarding/actions";
import { GfProfileForm } from "@/components/onboarding/gf-profile-form";

export function OnboardingForm() {
  return (
    <GfProfileForm
      mode="create"
      action={completeOnboarding}
      submitLabel="Start chatting"
      pendingLabel="Creating her…"
      footerText="Progress is saved locally until you finish setup."
    />
  );
}
