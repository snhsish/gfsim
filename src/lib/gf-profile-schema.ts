import { z } from "zod";

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Her name is required")
    .max(64, "Name is too long"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .refine((value) => {
      const [y, m, d] = value.split("-").map(Number);
      const date = new Date(Date.UTC(y!, m! - 1, d));
      return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() === m! - 1 &&
        date.getUTCDate() === d
      );
    }, "Use a valid date")
    .refine((value) => {
      const date = parseDateOnly(value);
      return date <= new Date();
    }, "Birth date cannot be in the future"),
  nativeLanguage: z
    .string()
    .trim()
    .min(1, "Native language is required")
    .max(64),
  nationality: z.string().trim().min(1, "Nationality is required").max(64),
  isBisexual: z.boolean(),
  mbti: z
    .union([z.literal(""), z.enum(MBTI_TYPES)])
    .transform((value) => (value === "" ? null : value)),
  zodiacSign: z
    .union([z.literal(""), z.string().trim().min(1).max(32)])
    .transform((value) => (value === "" ? null : value)),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export function parseDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d));
}
