import { z } from "zod";

export function passwordStrengthSchema() {
  return z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long.")
    .refine((v) => /[a-z]/.test(v), "Password must include at least one lowercase letter.")
    .refine((v) => /[A-Z]/.test(v), "Password must include at least one uppercase letter.")
    .refine((v) => /[0-9]/.test(v), "Password must include at least one number.")
    .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must include at least one symbol.");
}

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full Name is required."),
    email: z.string().email("Enter a valid email address."),
    password: passwordStrengthSchema(),
    confirmPassword: z.string(),
    role: z.enum(["student", "mentor"]),
    // mentor-only (conditionally validated in the form)
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    mentorAvailability: z.enum(["Full-time", "Part-time", "Evenings"]).optional(),
    yearsExperience: z.number().int().min(0).max(60).optional(),
    linkedIn: z.string().url("Enter a valid LinkedIn URL.").optional().or(z.literal("")),
    github: z.string().url("Enter a valid GitHub URL.").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    if (data.role === "mentor") {
      if (!data.bio || data.bio.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bio"],
          message: "Bio must be at least 20 characters.",
        });
      }
      if (!data.skills || data.skills.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["skills"],
          message: "Please select at least one skill.",
        });
      }
      if (!data.mentorAvailability) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mentorAvailability"],
          message: "Mentor availability is required.",
        });
      }
      if (typeof data.yearsExperience !== "number" || Number.isNaN(data.yearsExperience)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["yearsExperience"],
          message: "Years of Experience is required.",
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: passwordStrengthSchema(),
    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, "Enter the 6-digit verification code.")
    .max(10, "Enter the 6-digit verification code."),
});

