import { z } from "zod";
import type { ProjectProgressStatus } from "@/types/auth";

export const updateProgressSchema = z.object({
  progressPercent: z.coerce
    .number({ invalid_type_error: "Progress must be a number." })
    .int({ message: "Progress must be an integer." })
    .min(0, { message: "Progress must be at least 0." })
    .max(100, { message: "Progress cannot exceed 100." }),
  status: z.enum(["Not Started", "In Progress", "On Track", "Delayed", "Completed"]),
  milestoneNotes: z.string().min(5, "Milestone notes must be at least 5 characters.").max(500, "Milestone notes cannot exceed 500 characters."),
  dateUpdated: z.string().min(1, "Date updated is required.")
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Date updated must be a valid date." })
    .refine((s) => {
      const d = new Date(s);
      const now = new Date();
      // allow same-day updates but not future dates
      return d.getTime() <= now.getTime();
    }, { message: "Date updated cannot be in the future." }),
});

// Ensure status and progressPercent are consistent
export const updateProgressSchemaWithConsistency = updateProgressSchema.superRefine((data, ctx) => {
  const { progressPercent, status } = data as { progressPercent: number; status: ProjectProgressStatus };
  if (progressPercent === 100 && status !== "Completed") {
    ctx.addIssue({ path: ["status"], code: z.ZodIssueCode.custom, message: "If progress is 100%, status must be 'Completed'." });
  }
  if (progressPercent === 0 && status !== "Not Started") {
    ctx.addIssue({ path: ["status"], code: z.ZodIssueCode.custom, message: "If progress is 0%, status should be 'Not Started'." });
  }
  if (progressPercent > 0 && progressPercent < 100 && status === "Not Started") {
    ctx.addIssue({ path: ["status"], code: z.ZodIssueCode.custom, message: "Status cannot be 'Not Started' when progress is greater than 0%." });
  }
  if (progressPercent < 100 && status === "Completed") {
    ctx.addIssue({ path: ["status"], code: z.ZodIssueCode.custom, message: "Status cannot be 'Completed' unless progress is 100%." });
  }
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

