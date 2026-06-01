import type { gfProfile } from "@/db/schema";
import {
  defaultOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding-storage";
import { parseDateOnly } from "@/lib/gf-profile-schema";
import { getZodiacSign } from "@/lib/zodiac";

type GfProfileRow = typeof gfProfile.$inferSelect;

export function formatDateOfBirthForInput(
  value: string | Date,
): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

export function profileToDraft(profile: GfProfileRow): OnboardingDraft {
  const dateOfBirth = formatDateOfBirthForInput(profile.dateOfBirth);
  const inferredZodiac = getZodiacSign(parseDateOnly(dateOfBirth));
  const useCustomZodiac = profile.zodiacSign !== inferredZodiac;

  return {
    ...defaultOnboardingDraft(),
    name: profile.name,
    dateOfBirth,
    nativeLanguage: profile.nativeLanguage,
    nationality: profile.nationality,
    isBisexual: profile.isBisexual,
    mbti: profile.mbti ?? "",
    useCustomZodiac,
    zodiacOverride: useCustomZodiac ? profile.zodiacSign : "",
    step: 0,
  };
}
