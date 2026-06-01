"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearOnboardingDraft,
  defaultOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding-storage";

export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultOnboardingDraft);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const saved = loadOnboardingDraft();
    if (saved) {
      skipNextSave.current = true;
      setDraft(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveOnboardingDraft(draft);
  }, [draft, hydrated]);

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    clearOnboardingDraft();
    setDraft(defaultOnboardingDraft());
  }, []);

  return { draft, setDraft, updateDraft, resetDraft, hydrated };
}
