import { z } from 'zod'

export const profileSchema = z.object({
  user_id: z.string().optional(),
  full_name: z.string().min(1),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
  role: z.enum(['student', 'mentor', 'admin']).optional(),
})

export const mentorApplicationSchema = z.object({
  user_id: z.string(),
  cv_url: z.string().url().optional(),
  expertise: z.array(z.string()),
  statement: z.string().max(2000).optional(),
})

export const requestSchema = z.object({
  student_id: z.string(),
  title: z.string().min(3),
  description: z.string().min(10),
  domain: z.string().min(1),
  deadline: z.string().optional(),
  type: z.enum(['full_project', 'specific_idea']),
})

export const ratingSchema = z.object({
  request_id: z.string(),
  mentor_id: z.string(),
  student_id: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
})

export const otpSchema = z.object({
  user_id: z.string(),
  otp: z.string(),
  expires_at: z.string(),
  attempts: z.number().optional(),
})

export type Profile = z.infer<typeof profileSchema>
