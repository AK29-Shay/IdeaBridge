import { z } from "zod";

export const profileBaseSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters."),
  skills: z.array(z.string()).min(1, "Please select at least one skill."),
  portfolioLinks: z.array(z.string()).optional(),
  avatarUrl: z.string().url("Enter a valid avatar image URL.").optional().or(z.literal("")),
});

const availabilityStatusValues = ["Available Now", "Available in 1-2 days", "Busy", "On Leave"] as const;

export const mentorProfileExtensionSchema = z.object({
  availabilityStatus: z.enum(availabilityStatusValues),
  availabilityCalendarNote: z.string().optional(),
});

export const studentProfileSchema = profileBaseSchema;

export const mentorProfileSchema = profileBaseSchema.merge(mentorProfileExtensionSchema);

