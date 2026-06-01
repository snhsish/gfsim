"use client";

import { updateGfProfile } from "@/app/chat/personality/actions";
import { GfProfileForm } from "@/components/onboarding/gf-profile-form";
import type { OnboardingDraft } from "@/lib/onboarding-storage";

export function PersonalityEditor({
  initialDraft,
}: {
  initialDraft: OnboardingDraft;
}) {
  return (
    <GfProfileForm
      mode="edit"
      initialDraft={initialDraft}
      action={updateGfProfile}
      submitLabel="Save personality"
      pendingLabel="Saving…"
      footerText={null}
    />
  );
}
