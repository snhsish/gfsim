import {
  onboardingSchema,
  parseDateOnly,
  type OnboardingInput,
} from "@/lib/gf-profile-schema";
import { getMaturityTier } from "@/lib/maturity";
import { getZodiacSign } from "@/lib/zodiac";

export type GfProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof OnboardingInput, string>>;
};

export function parseGfProfileFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    dateOfBirth: formData.get("dateOfBirth"),
    nativeLanguage: formData.get("nativeLanguage"),
    nationality: formData.get("nationality"),
    isBisexual: formData.get("isBisexual") === "true",
    mbti: formData.get("mbti") ?? "",
    zodiacSign: formData.get("zodiacSign") ?? "",
  };
}

export function validateGfProfileFormData(
  raw: ReturnType<typeof parseGfProfileFormData>,
) {
  const parsed = onboardingSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true as const, data: parsed.data };
  }

  const fieldErrors: GfProfileActionState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key as keyof OnboardingInput]) {
      fieldErrors[key as keyof OnboardingInput] = issue.message;
    }
  }
  return { ok: false as const, fieldErrors };
}

export function buildGfProfileValues(data: OnboardingInput) {
  const dateOfBirth = parseDateOnly(data.dateOfBirth);
  const zodiacSign = data.zodiacSign ?? getZodiacSign(dateOfBirth);
  const maturityTier = getMaturityTier(dateOfBirth);

  return {
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    nativeLanguage: data.nativeLanguage,
    nationality: data.nationality,
    isBisexual: data.isBisexual,
    mbti: data.mbti,
    zodiacSign,
    maturityTier,
    updatedAt: new Date(),
  };
}
