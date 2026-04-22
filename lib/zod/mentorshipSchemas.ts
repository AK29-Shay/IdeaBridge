import { z } from "zod";

export const requestMentorshipSchema = z.object({
  projectTitle: z.string().min(2, "Project Title is required."),
  goals: z.string().min(10, "Please add at least 10 characters of goals."),
  preferredStartDate: z.string().min(1, "Preferred Start Date is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type RequestMentorshipInput = z.infer<typeof requestMentorshipSchema>;

