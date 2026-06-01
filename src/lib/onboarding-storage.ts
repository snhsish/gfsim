export const ONBOARDING_STORAGE_KEY = "gfsim:onboarding-draft";
export const ONBOARDING_DRAFT_VERSION = 1;

export type OnboardingDraft = {
  version: typeof ONBOARDING_DRAFT_VERSION;
  step: number;
  name: string;
  dateOfBirth: string;
  nativeLanguage: string;
  nationality: string;
  isBisexual: boolean | null;
  mbti: string;
  useCustomZodiac: boolean;
  zodiacOverride: string;
};

export const defaultOnboardingDraft = (): OnboardingDraft => ({
  version: ONBOARDING_DRAFT_VERSION,
  step: 0,
  name: "",
  dateOfBirth: "",
  nativeLanguage: "",
  nationality: "",
  isBisexual: null,
  mbti: "",
  useCustomZodiac: false,
  zodiacOverride: "",
});

function isValidDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") return false;
  const d = value as OnboardingDraft;
  return (
    d.version === ONBOARDING_DRAFT_VERSION &&
    typeof d.step === "number" &&
    d.step >= 0 &&
    d.step <= 2 &&
    typeof d.name === "string" &&
    typeof d.dateOfBirth === "string" &&
    typeof d.nativeLanguage === "string" &&
    typeof d.nationality === "string" &&
    (d.isBisexual === null || typeof d.isBisexual === "boolean") &&
    typeof d.mbti === "string" &&
    typeof d.useCustomZodiac === "boolean" &&
    typeof d.zodiacOverride === "string"
  );
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidDraft(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Quota exceeded or private mode — ignore
  }
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}
