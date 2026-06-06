import { z } from "zod";

import { MBTI_TYPES } from "@/lib/gf-profile-schema";
import { ZODIAC_SIGNS } from "@/lib/zodiac";

export const USER_PROFILE_FIELDS = [
  "name",
  "image",
  "description",
  "dateOfBirth",
  "mbti",
  "zodiacSign",
] as const;

export type UserProfileField = (typeof USER_PROFILE_FIELDS)[number];

const optionalText = (max: number) =>
  z
    .union([z.literal(""), z.string().trim().max(max)])
    .transform((value) => (value === "" ? null : value));

export const userProfileFieldSchemas = {
  name: z.string().trim().min(1, "Name is required").max(64, "Name is too long"),
  image: z
    .union([
      z.literal(""),
      z.string().trim().url("Enter a valid image URL"),
    ])
    .transform((value) => (value === "" ? null : value)),
  description: optionalText(500),
  dateOfBirth: z
    .union([z.literal(""), z.string()])
    .transform((value) => (value === "" ? null : value))
    .pipe(
      z
        .union([
          z.null(),
          z
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
              const [y, m, d] = value.split("-").map(Number);
              const date = new Date(Date.UTC(y!, m! - 1, d));
              return date <= new Date();
            }, "Birth date cannot be in the future"),
        ]),
    ),
  mbti: z
    .union([z.literal(""), z.enum(MBTI_TYPES)])
    .transform((value) => (value === "" ? null : value)),
  zodiacSign: z
    .union([z.literal(""), z.string().trim().min(1).max(32)])
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => value === null || ZODIAC_SIGNS.includes(value),
      "Pick a valid zodiac sign",
    ),
} satisfies Record<UserProfileField, z.ZodType<string | null>>;

export type UserProfileActionState = {
  error?: string;
  fieldError?: string;
  success?: boolean;
};

export function validateUserProfileField(
  field: UserProfileField,
  value: string,
) {
  const result = userProfileFieldSchemas[field].safeParse(value);
  if (!result.success) {
    return {
      ok: false as const,
      fieldError: result.error.issues[0]?.message ?? "Invalid value",
    };
  }
  return { ok: true as const, value: result.data };
}
