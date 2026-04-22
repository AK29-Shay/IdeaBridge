import { z } from "zod";

const urlOrEmpty = z.string().optional().or(z.literal("")).transform((v) => (v ? v : undefined));

function validateUrlsPerLine(text: string | undefined) {
  if (!text) return true;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.every((line) => z.string().url().safeParse(line).success);
}

export const studentProfileFormSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters."),
  skills: z.array(z.string()).min(1, "Please select at least one skill."),
  portfolioLinksText: z
    .string()
    .optional()
    .refine((v) => validateUrlsPerLine(v), "Each portfolio link line must be a valid URL."),
  avatarUrl: urlOrEmpty.refine((v) => (v ? z.string().url().safeParse(v).success : true), "Enter a valid avatar URL."),
});

export const mentorProfileFormSchema = studentProfileFormSchema.extend({
  availabilityStatus: z.enum(["Available Now", "Available in 1-2 days", "Busy", "On Leave"]),
  availabilityCalendarNote: z.string().optional(),
});

