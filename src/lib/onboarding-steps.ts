import { z } from "zod";

import type { OnboardingInput } from "@/lib/gf-profile-schema";
import { onboardingSchema } from "@/lib/gf-profile-schema";
import type { OnboardingDraft } from "@/lib/onboarding-storage";

export const ONBOARDING_STEPS = [
  {
    id: "basics",
    title: "Oh who is she?",
    description:
      "Tell us who she is. Her personality and maturity will follow from these details. Or maybe just describe your ex-girlfriend.",
  },
  {
    id: "background",
    title: "Background",
    description:
      "Language and culture shape how she texts and what she notices.",
  },
  {
    id: "dynamics",
    title: "Dynamics",
    description: "Optional traits and relationship tension settings.",
  },
] as const;

export const step1Schema = onboardingSchema.pick({
  name: true,
  dateOfBirth: true,
});

export const step2Schema = onboardingSchema.pick({
  nativeLanguage: true,
  nationality: true,
});

const step3Schema = z.object({
  isBisexual: z.boolean({
    error: "Choose yes or no",
  }),
});

export type StepFieldErrors = Partial<Record<keyof OnboardingInput, string>>;

export function validateOnboardingStep(
  step: number,
  draft: OnboardingDraft,
): { ok: true } | { ok: false; fieldErrors: StepFieldErrors } {
  if (step === 0) {
    const result = step1Schema.safeParse({
      name: draft.name,
      dateOfBirth: draft.dateOfBirth,
    });
    if (result.success) return { ok: true };
    return { ok: false, fieldErrors: issuesToFieldErrors(result.error.issues) };
  }

  if (step === 1) {
    const result = step2Schema.safeParse({
      nativeLanguage: draft.nativeLanguage,
      nationality: draft.nationality,
    });
    if (result.success) return { ok: true };
    return { ok: false, fieldErrors: issuesToFieldErrors(result.error.issues) };
  }

  if (step === 2) {
    if (draft.isBisexual === null) {
      return {
        ok: false,
        fieldErrors: { isBisexual: "Choose yes or no" },
      };
    }
    const result = step3Schema.safeParse({ isBisexual: draft.isBisexual });
    if (result.success) return { ok: true };
    return { ok: false, fieldErrors: issuesToFieldErrors(result.error.issues) };
  }

  return { ok: true };
}

function issuesToFieldErrors(
  issues: z.core.$ZodIssue[],
): StepFieldErrors {
  const fieldErrors: StepFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key as keyof OnboardingInput]) {
      fieldErrors[key as keyof OnboardingInput] = issue.message;
    }
  }
  return fieldErrors;
}

const FIELD_STEP: Partial<Record<keyof OnboardingInput, number>> = {
  name: 0,
  dateOfBirth: 0,
  nativeLanguage: 1,
  nationality: 1,
  isBisexual: 2,
  mbti: 2,
  zodiacSign: 2,
};

export function stepForFieldError(
  fieldErrors: StepFieldErrors | undefined,
): number | null {
  if (!fieldErrors) return null;
  const keys = Object.keys(fieldErrors) as (keyof OnboardingInput)[];
  if (keys.length === 0) return null;
  const step = FIELD_STEP[keys[0]!];
  return step ?? null;
}
