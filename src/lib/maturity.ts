export type MaturityTier = "playful" | "balanced" | "grounded" | "wise";

const TIER_LABELS: Record<MaturityTier, string> = {
  playful: "Playful & spontaneous",
  balanced: "Warm & balanced",
  grounded: "Grounded & emotionally steady",
  wise: "Mature & wise",
};

export function getAgeFromBirthDate(dateOfBirth: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  const dayDiff = now.getUTCDate() - dateOfBirth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function getMaturityTier(dateOfBirth: Date, now = new Date()): MaturityTier {
  const age = getAgeFromBirthDate(dateOfBirth, now);

  if (age < 20) return "playful";
  if (age < 26) return "balanced";
  if (age < 32) return "grounded";
  return "wise";
}

export function getMaturityLabel(tier: MaturityTier): string {
  return TIER_LABELS[tier];
}
