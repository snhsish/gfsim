"use client";

import { useCallback, useState } from "react";

import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import {
  defaultOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding-storage";

export function useGfProfileDraft(
  mode: "create" | "edit",
  initialDraft?: OnboardingDraft,
) {
  const onboarding = useOnboardingDraft();
  const [editDraft, setEditDraft] = useState(
    () => initialDraft ?? defaultOnboardingDraft(),
  );

  const updateDraft = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      if (mode === "edit") {
        setEditDraft((current) => ({ ...current, ...patch }));
        return;
      }
      onboarding.updateDraft(patch);
    },
    [mode, onboarding],
  );

  if (mode === "edit") {
    return {
      draft: editDraft,
      updateDraft,
      hydrated: true,
    };
  }

  return {
    draft: onboarding.draft,
    updateDraft,
    hydrated: onboarding.hydrated,
  };
}
